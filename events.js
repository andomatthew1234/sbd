import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getDoc, getFirestore, collection, doc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const eventsList = document.getElementById("events-list");
const defaultTicketing = {
    standardUrl: "https://square.link/u/q9M27Sd5",
    familyUrl: "https://square.link/u/biMNCMCt"
};
const lidcombeWhatsAppGroups = [
    {
        label: "Lidcombe bush dance info",
        url: "https://chat.whatsapp.com/K1TOwc6OHtPArjnFBLNxpD?mode=gi_t"
    },
    {
        label: "Lidcombe Bush dance (regular joiners group)",
        url: "https://chat.whatsapp.com/IVJM6F5nq0IGKKl01FnIWj?mode=gi_t"
    }
];

if (eventsList) {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    loadEvents(db);
}

async function loadEvents(db) {
    try {
        const [eventsSnapshot, ticketingSnapshot] = await Promise.all([
            getDocs(query(
            collection(db, "events"),
            where("status", "==", "published")
            )),
            getDoc(doc(db, "siteSettings", "ticketing"))
        ]);
        const ticketing = { ...defaultTicketing, ...(ticketingSnapshot.exists() ? ticketingSnapshot.data() : {}) };
        const events = eventsSnapshot.docs
            .map(document => ({ id: document.id, ...document.data() }))
            .sort((first, second) => first.startsAt.localeCompare(second.startsAt));

        eventsList.replaceChildren();

        if (events.length === 0) {
            showMessage("No upcoming dances are currently available. Please check back soon.");
            return;
        }

        events.forEach(event => renderEvent(event, ticketing));
        addEventStructuredData(events, ticketing);
    } catch (error) {
        console.error("Unable to load events:", error);
        showMessage("Upcoming dance details are temporarily unavailable. Please try again soon.");
    }
}

function renderEvent(event, ticketing) {
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
    tickets.append(ticketsLabel, " Choose Standard or Family tickets below.");
    const details = document.createElement("dl");
    details.className = "event-details";
    addDetail(details, "Time", formatTime(event.startsAt, event.endsAt));
    addDetail(details, "Availability", formatAvailability(event.availability));
    addDetail(details, "Family ticket", event.familyTicket);
    addDetail(details, "Accessibility", event.accessibility);
    addDetail(details, "Transport & parking", event.transport);
    addDetail(details, "Refunds", event.refundPolicy);
    const isLidcombe = event.location?.trim().toLowerCase().includes("lidcombe");
    const ticketActions = document.createElement("div");
    ticketActions.className = "ticket-actions";
    addActionLink(ticketActions, "Family tickets", ticketing.familyUrl, "ticket");
    addActionLink(ticketActions, "Standard tickets", ticketing.standardUrl, "ticket");
    if (isLidcombe) {
        lidcombeWhatsAppGroups.forEach(group => {
            addActionLink(ticketActions, group.label, group.url, "whatsapp");
        });
    }
    if (!ticketActions.children.length) {
        const pending = document.createElement("p");
        pending.className = "ticket-link-pending";
        pending.textContent = "Online ticket links coming soon.";
        ticketActions.append(pending);
    }

    body.append(venue, tickets);
    if (details.children.length) body.append(details);
    if (isLidcombe) {
        const communityJoin = document.createElement("div");
        communityJoin.className = "community-join";
        const communityJoinTitle = document.createElement("h3");
        communityJoinTitle.textContent = "Join the Lidcombe WhatsApp groups";
        const communityJoinCopy = document.createElement("p");
        communityJoinCopy.textContent = "Get dance information and stay connected with other regular joiners.";
        communityJoin.append(communityJoinTitle, communityJoinCopy);
        body.append(communityJoin);
    }
    body.append(ticketActions);
    card.append(header, body);
    eventsList.append(card);
}

function addActionLink(container, label, url, type) {
    if (!url) return;
    const link = document.createElement("a");
    link.className = `event-action event-action-${type}`;
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.append(createActionIcon(type));
    const text = document.createElement("span");
    text.textContent = label;
    link.append(text);
    container.append(link);
}

function createActionIcon(type) {
    const namespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(namespace, "svg");
    svg.classList.add("event-action-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    const paths = type === "whatsapp"
        ? [
            "M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.7Z",
            "M8.1 7.6c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.5.7c-.2.2-.1.4 0 .6.7 1.2 1.7 2.1 3 2.7.2.1.4.1.6-.1l.8-1c.2-.2.4-.3.7-.2l1.7.8c.3.1.5.2.5.4 0 .2-.1 1.2-.7 1.8-.6.6-1.4.8-2.3.6-1-.2-2.4-.8-4.1-2.3-1.4-1.2-2.4-2.7-2.7-3.7-.3-1-.1-2 .3-2.7Z"
        ]
        : [
            "M4 6.5h16v3a2.5 2.5 0 0 0 0 5v3H4v-3a2.5 2.5 0 0 0 0-5v-3Z",
            "M12 7.5v1.5M12 11.2v1.6M12 15v1.5"
        ];

    paths.forEach(pathData => {
        const path = document.createElementNS(namespace, "path");
        path.setAttribute("d", pathData);
        svg.append(path);
    });

    return svg;
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

function addEventStructuredData(events, ticketing) {
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
            url: ticketing.standardUrl,
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
