import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { addDoc, collection, deleteDoc, doc, getFirestore, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCMRd-sHY6cdYdhxTiSydFYnNtNiwpntXo",
    authDomain: "sydney-bush-dances.firebaseapp.com",
    projectId: "sydney-bush-dances",
    storageBucket: "sydney-bush-dances.firebasestorage.app",
    messagingSenderId: "88990952307",
    appId: "1:88990952307:web:ec772751a9f939ccb5f306"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const loginPanel = document.getElementById("login-panel");
const managerPanel = document.getElementById("manager-panel");
const loginForm = document.getElementById("login-form");
const eventForm = document.getElementById("event-form");
const eventList = document.getElementById("event-list");
const signOutButton = document.getElementById("sign-out");
const deleteButton = document.getElementById("delete-event");
let events = [];
let stopListening;

onAuthStateChanged(auth, user => {
    const isManager = user?.email === "caleb-sbd@sydney-bush-dances.firebaseapp.com";
    loginPanel.hidden = Boolean(isManager);
    managerPanel.hidden = !isManager;
    signOutButton.hidden = !isManager;

    if (stopListening) stopListening();
    if (isManager) startEventsListener();
    if (user && !isManager) showLoginError("This account is not authorised to manage Sydney Bush Dances.");
});

loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    showLoginError("");
    try {
        await signInWithEmailAndPassword(auth, document.getElementById("email").value.trim(), document.getElementById("password").value);
    } catch (error) {
        showLoginError("Unable to sign in. Check the email and password, then try again.");
    }
});

signOutButton.addEventListener("click", () => signOut(auth));
document.getElementById("new-event").addEventListener("click", resetForm);

eventForm.addEventListener("submit", async event => {
    event.preventDefault();
    const data = getFormData();
    const error = validateEvent(data);
    if (error) return showEventMessage(error, "error");

    try {
        const id = document.getElementById("event-id").value;
        if (id) {
            await updateDoc(doc(db, "events", id), { ...data, updatedAt: serverTimestamp() });
        } else {
            await addDoc(collection(db, "events"), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }
        showEventMessage("Event saved.", "success");
        resetForm();
    } catch (error) {
        console.error("Unable to save event:", error);
        showEventMessage("The event could not be saved. Please try again.", "error");
    }
});

deleteButton.addEventListener("click", async () => {
    const id = document.getElementById("event-id").value;
    if (!id || !window.confirm("Delete this event? This cannot be undone.")) return;
    try {
        await deleteDoc(doc(db, "events", id));
        resetForm();
    } catch (error) {
        console.error("Unable to delete event:", error);
        showEventMessage("The event could not be deleted. Please try again.", "error");
    }
});

function startEventsListener() {
    stopListening = onSnapshot(query(collection(db, "events"), orderBy("startsAt", "asc")), snapshot => {
        events = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
        renderEvents();
    }, error => {
        console.error("Unable to load events:", error);
        eventList.textContent = "Events could not be loaded.";
    });
}

function renderEvents() {
    eventList.replaceChildren();
    if (!events.length) {
        eventList.textContent = "No events yet. Add the first event using the form.";
        return;
    }
    events.forEach(event => {
        const button = document.createElement("button");
        button.className = "event-item";
        button.type = "button";
        const location = document.createElement("strong");
        location.textContent = event.location;
        const date = document.createElement("span");
        date.textContent = event.dateLabel;
        const status = document.createElement("span");
        status.className = "status";
        status.textContent = event.status;
        button.append(location, date, status);
        button.addEventListener("click", () => editEvent(event));
        eventList.append(button);
    });
}

function editEvent(event) {
    document.getElementById("form-title").textContent = "Edit event";
    document.getElementById("event-id").value = event.id;
    document.getElementById("location").value = event.location || "";
    document.getElementById("date-label").value = event.dateLabel || "";
    document.getElementById("starts-at").value = event.startsAt || "";
    document.getElementById("ends-at").value = event.endsAt || "";
    document.getElementById("status").value = event.status || "draft";
    document.getElementById("venue-name").value = event.venueName || "";
    document.getElementById("address").value = event.address || "";
    document.getElementById("ticket-summary").value = event.ticketSummary || "";
    document.getElementById("availability").value = event.availability || "available";
    document.getElementById("square-url").value = event.squareUrl || "";
    document.getElementById("family-ticket").value = event.familyTicket || "";
    document.getElementById("accessibility").value = event.accessibility || "";
    document.getElementById("transport").value = event.transport || "";
    document.getElementById("refund-policy").value = event.refundPolicy || "";
    deleteButton.hidden = false;
    showEventMessage("", "");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
    eventForm.reset();
    document.getElementById("event-id").value = "";
    document.getElementById("form-title").textContent = "Add event";
    deleteButton.hidden = true;
    showEventMessage("", "");
}

function getFormData() {
    return {
        location: document.getElementById("location").value.trim(),
        dateLabel: document.getElementById("date-label").value.trim(),
        startsAt: document.getElementById("starts-at").value,
        endsAt: document.getElementById("ends-at").value,
        status: document.getElementById("status").value,
        venueName: document.getElementById("venue-name").value.trim(),
        address: document.getElementById("address").value.trim(),
        ticketSummary: document.getElementById("ticket-summary").value.trim(),
        availability: document.getElementById("availability").value,
        squareUrl: document.getElementById("square-url").value.trim(),
        familyTicket: document.getElementById("family-ticket").value.trim(),
        accessibility: document.getElementById("accessibility").value.trim(),
        transport: document.getElementById("transport").value.trim(),
        refundPolicy: document.getElementById("refund-policy").value.trim()
    };
}

function validateEvent(event) {
    let checkoutUrl;
    try {
        checkoutUrl = new URL(event.squareUrl);
    } catch {
        return "Enter a valid HTTPS Square checkout URL before saving.";
    }
    if (checkoutUrl.protocol !== "https:" || checkoutUrl.hostname.includes("placeholder")) {
        return "Enter a real HTTPS checkout URL before saving.";
    }
    return "";
}

function showLoginError(message) {
    const element = document.getElementById("login-error");
    element.textContent = message;
    element.hidden = !message;
}

function showEventMessage(message, type) {
    const error = document.getElementById("event-error");
    const success = document.getElementById("event-success");
    error.hidden = true;
    success.hidden = true;
    if (!message) return;
    const element = type === "error" ? error : success;
    element.textContent = message;
    element.hidden = false;
}
