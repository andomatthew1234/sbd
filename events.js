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
    const link = document.createElement("a");
    link.className = "btn btn-primary cta-btn";
    link.href = event.squareUrl;
    link.textContent = "Buy Tickets";

    body.append(venue, tickets, link);
    card.append(header, body);
    eventsList.append(card);
}

function showMessage(message) {
    const paragraph = document.createElement("p");
    paragraph.className = "events-message";
    paragraph.textContent = message;
    eventsList.replaceChildren(paragraph);
}
