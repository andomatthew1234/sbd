import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const eventsList = document.getElementById("events-list");

if (eventsList) {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    loadEvents(db);
}

async function loadEvents(db) {
    try {
        const eventsQuery = query(
            collection(db, "events"),
            where("status", "==", "published")
        );
        const snapshot = await getDocs(eventsQuery);
        const events = snapshot.docs
            .map(document => ({ id: document.id, ...document.data() }))
            .sort((first, second) => first.startsAt.localeCompare(second.startsAt));

        eventsList.replaceChildren();

        if (events.length === 0) {
            showMessage("No upcoming dances are currently available. Please check back soon.");
            return;
        }

        events.forEach(renderEvent);
        addEventStructuredData(events);
    } catch (error) {
        console.error("Unable to load events:", error);
        showMessage("Upcoming dance details are temporarily unavailable. Please try again soon.");
    }
}

function renderEvent(event) {
    const card = document.createElement("article");
    card.className = "gig-card";

    const header = document.createElement("div");
    header.className = "gig-header";
    const location = document.createElement("h2");
    location.textContent = event.location;
    const date = document.createElement("p");
    date.className = "gig-date";
    date.textContent = event.dateLabel;
    header.append(location, date);

    const body = document.createElement("div");
    body.className = "gig-body";
    const venue = document.createElement("p");
    const venueLabel = document.createElement("strong");
    venueLabel.textContent = "Location:";
    venue.append(venueLabel, document.createElement("br"));
    venue.append(event.venueName, document.createElement("br"), event.address);
    const tickets = document.createElement("p");
    const ticketsLabel = document.createElement("strong");
    ticketsLabel.textContent = "Tickets:";
    tickets.append(ticketsLabel, ` ${event.ticketSummary}`);
    const details = document.createElement("dl");
    details.className = "event-details";
    addDetail(details, "Time", formatTime(event.startsAt, event.endsAt));
    addDetail(details, "Availability", formatAvailability(event.availability));
    addDetail(details, "Family ticket", event.familyTicket);
    addDetail(details, "Accessibility", event.accessibility);
    addDetail(details, "Transport & parking", event.transport);
    addDetail(details, "Refunds", event.refundPolicy);
    const link = document.createElement("a");
    link.className = "btn btn-primary cta-btn";
    link.href = event.squareUrl;
    link.textContent = "Buy Tickets";

    body.append(venue, tickets);
    if (details.children.length) body.append(details);
    body.append(link);
    card.append(header, body);
    eventsList.append(card);
}

function addDetail(container, label, value) {
    if (!value) return;
    const term = document.createElement("dt");
    term.textContent = `${label}:`;
    const description = document.createElement("dd");
    description.textContent = value;
    container.append(term, description);
}

function formatTime(startsAt, endsAt) {
    if (!startsAt) return "";
    const start = new Date(startsAt);
    if (Number.isNaN(start.getTime())) return "";
    const time = new Intl.DateTimeFormat("en-AU", { hour: "numeric", minute: "2-digit" }).format(start);
    return endsAt ? `${time} to ${formatEndTime(endsAt)}` : time;
}

function formatEndTime(time) {
    const [hour, minute] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return new Intl.DateTimeFormat("en-AU", { hour: "numeric", minute: "2-digit" }).format(date);
}

function formatAvailability(availability) {
    return {
        "selling-fast": "Selling fast",
        "sold-out": "Sold out",
        available: "Tickets available"
    }[availability] || "";
}

function addEventStructuredData(events) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(events.map(event => ({
        "@context": "https://schema.org",
        "@type": "Event",
        name: `Sydney Bush Dance - ${event.location}`,
        startDate: event.startsAt,
        endDate: event.endsAt ? `${event.startsAt.slice(0, 10)}T${event.endsAt}` : undefined,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
            "@type": "Place",
            name: event.venueName,
            address: event.address
        },
        offers: {
            "@type": "Offer",
            url: event.squareUrl,
            availability: event.availability === "sold-out" ? "https://schema.org/SoldOut" : "https://schema.org/InStock"
        },
        organizer: {
            "@type": "Organization",
            name: "Sydney Bush Dances",
            url: "https://andomatthew1234.github.io/sbd/"
        }
    })));
    document.head.append(script);
}

function showMessage(message) {
    const paragraph = document.createElement("p");
    paragraph.className = "events-message";
    paragraph.textContent = message;
    eventsList.replaceChildren(paragraph);
}
