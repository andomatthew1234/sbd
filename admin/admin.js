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
const analyticsTab = document.getElementById("analytics-tab");
const mailingListTab = document.getElementById("mailing-list-tab");
const eventsTab = document.getElementById("events-tab");
const submissionsTab = document.getElementById("submissions-tab");
const analyticsPanel = document.getElementById("analytics-panel");
const mailingListPanel = document.getElementById("mailing-list-panel");
const eventsPanel = document.getElementById("events-panel");
const submissionsPanel = document.getElementById("submissions-panel");
const submissionsList = document.getElementById("submissions-list");
const submissionDetail = document.getElementById("submission-detail");
const submissionFilter = document.getElementById("submission-filter");
const newSubmissionsCount = document.getElementById("new-submissions-count");
let events = [];
let submissions = [];
let selectedSubmissionId = "";
let stopListening;
let stopSubmissionListener;
let stopAnalyticsListener;

onAuthStateChanged(auth, user => {
    const isManager = user?.email === "caleb-sbd@sydney-bush-dances.firebaseapp.com";
    loginPanel.hidden = Boolean(isManager);
    managerPanel.hidden = !isManager;
    signOutButton.hidden = !isManager;

    if (stopListening) stopListening();
    if (stopSubmissionListener) stopSubmissionListener();
    if (stopAnalyticsListener) stopAnalyticsListener();
    if (isManager) {
        startEventsListener();
        startSubmissionListener();
        startAnalyticsListeners();
    }
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
analyticsTab.addEventListener("click", () => showAdminPanel("analytics"));
mailingListTab.addEventListener("click", () => showAdminPanel("mailing-list"));
eventsTab.addEventListener("click", () => showAdminPanel("events"));
submissionsTab.addEventListener("click", () => showAdminPanel("submissions"));
submissionFilter.addEventListener("change", renderSubmissions);

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

function startSubmissionListener() {
    stopSubmissionListener = onSnapshot(query(collection(db, "contactSubmissions"), orderBy("submittedAt", "desc")), snapshot => {
        submissions = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
        renderSubmissions();
        updateNewSubmissionCount();
    }, error => {
        console.error("Unable to load submissions:", error);
        submissionsList.textContent = "Contact submissions could not be loaded.";
    });
}

function renderEvents() {
    eventList.replaceChildren();
    if (!events.length) {
        const message = document.createElement("p");
        message.textContent = "No events yet.";
        const recovery = document.createElement("button");
        recovery.className = "button";
        recovery.type = "button";
        recovery.textContent = "Restore the two deleted events";
        recovery.addEventListener("click", restoreDeletedEvents);
        eventList.append(message, recovery);
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

async function restoreDeletedEvents() {
    const recoveryButton = eventList.querySelector("button");
    if (recoveryButton) {
        recoveryButton.disabled = true;
        recoveryButton.textContent = "Restoring events...";
    }

    const recoveredEvents = [
        {
            location: "Lidcombe",
            dateLabel: "4 November 2026",
            startsAt: "2026-11-04T18:00",
            endsAt: "22:00",
            status: "published",
            venueName: "Lidcombe Parish Hall",
            address: "57 Church St, Lidcombe NSW 2141",
            ticketSummary: "Ticket details coming soon",
            availability: "available",
            squareUrl: "",
            familyTicket: "",
            accessibility: "",
            transport: "",
            refundPolicy: ""
        },
        {
            location: "Robertson",
            dateLabel: "28 November 2026",
            startsAt: "2026-11-28T18:00",
            endsAt: "22:00",
            status: "published",
            venueName: "Robertson",
            address: "55 Hoddle St, Robertson NSW 2577",
            ticketSummary: "Ticket details coming soon",
            availability: "available",
            squareUrl: "",
            familyTicket: "",
            accessibility: "",
            transport: "",
            refundPolicy: ""
        }
    ];

    try {
        await Promise.all(recoveredEvents.map(event => addDoc(collection(db, "events"), {
            ...event,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        })));
        showEventMessage("The two deleted events have been restored. Add the verified Square links before selling tickets.", "success");
    } catch (error) {
        console.error("Unable to restore events:", error);
        showEventMessage("The events could not be restored. Please try again.", "error");
        if (recoveryButton) {
            recoveryButton.disabled = false;
            recoveryButton.textContent = "Restore the two deleted events";
        }
    }
}

function showAdminPanel(panel) {
    const activePanels = { analytics: analyticsPanel, "mailing-list": mailingListPanel, events: eventsPanel, submissions: submissionsPanel };
    Object.entries(activePanels).forEach(([name, element]) => { element.hidden = name !== panel; });
    [analyticsTab, mailingListTab, eventsTab, submissionsTab].forEach(tab => {
        const isActive = tab.id === `${panel}-tab`;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-current", isActive ? "page" : "false");
    });
}

function startAnalyticsListeners() {
    stopAnalyticsListener = onSnapshot(query(collection(db, "analyticsEvents"), orderBy("recordedAt", "desc")), snapshot => {
        const analyticsEvents = snapshot.docs.map(item => item.data());
        renderAnalytics(analyticsEvents);
    }, error => {
        console.error("Unable to load analytics:", error);
        document.getElementById("live-visitor-note").textContent = "Analytics could not be loaded.";
        document.getElementById("live-visitors-list").textContent = "Analytics could not be loaded.";
    });
}

function renderAnalytics(analyticsEvents) {
    const cutoff = Date.now() - 300000;
    const recentVisitors = new Map();
    const pages = {};
    const actions = {};
    analyticsEvents.forEach(event => {
        if (event.type === "page_view") pages[event.page] = (pages[event.page] || 0) + 1;
        if (event.type === "action") actions[event.action] = (actions[event.action] || 0) + 1;
        if (event.recordedAt?.toMillis?.() >= cutoff && !recentVisitors.has(event.sessionId)) recentVisitors.set(event.sessionId, event);
    });
    renderLiveVisitors([...recentVisitors.values()]);
    renderAnalyticsTotals(pages, "page-views-list", "all-time-page-views", "No page views have been recorded yet.");
    renderAnalyticsTotals(actions, "conversions-list", "all-time-conversions", "No conversions have been recorded yet.");
}

function renderLiveVisitors(visitors) {
    document.getElementById("live-visitor-count").textContent = visitors.length;
    document.getElementById("live-visitor-note").textContent = visitors.length ? "Active in the last five minutes." : "No recent activity.";
    const list = document.getElementById("live-visitors-list");
    list.replaceChildren();
    if (!visitors.length) {
        list.textContent = "No recent activity.";
        return;
    }
    visitors.sort((a, b) => b.recordedAt.toMillis() - a.recordedAt.toMillis()).forEach(visitor => {
        const item = document.createElement("div");
        item.className = "analytics-item";
        const page = document.createElement("strong");
        page.textContent = formatAnalyticsName(visitor.page);
        const action = document.createElement("span");
        action.textContent = formatAnalyticsName(visitor.action || "viewing_page");
        item.append(page, action);
        list.append(item);
    });
}

function renderAnalyticsTotals(values, listId, totalId, emptyMessage) {
    const entries = Object.entries(values).sort(([, first], [, second]) => second - first);
    document.getElementById(totalId).textContent = entries.reduce((total, [, value]) => total + value, 0).toLocaleString("en-AU");
    const list = document.getElementById(listId);
    list.replaceChildren();
    if (!entries.length) {
        list.textContent = emptyMessage;
        return;
    }
    entries.forEach(([name, value]) => {
        const item = document.createElement("div");
        item.className = "analytics-item";
        const label = document.createElement("strong");
        label.textContent = formatAnalyticsName(name);
        const count = document.createElement("span");
        count.textContent = Number(value).toLocaleString("en-AU");
        item.append(label, count);
        list.append(item);
    });
}

function formatAnalyticsName(value) {
    return String(value).replace(/\.html$/, "").replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function renderSubmissions() {
    submissionsList.replaceChildren();
    const filter = submissionFilter.value;
    const visibleSubmissions = filter === "all" ? submissions : submissions.filter(submission => submission.status === filter);

    if (!visibleSubmissions.length) {
        submissionsList.textContent = "No contact submissions match this filter.";
        return;
    }

    visibleSubmissions.forEach(submission => {
        const button = document.createElement("button");
        button.className = "submission-item";
        button.classList.toggle("active", submission.id === selectedSubmissionId);
        button.type = "button";
        const name = document.createElement("strong");
        name.textContent = submission.name;
        const subject = document.createElement("span");
        subject.textContent = `${formatSubject(submission.subject)} | ${formatSubmittedAt(submission.submittedAt)}`;
        const state = document.createElement("span");
        state.className = "status";
        state.textContent = submission.status;
        button.append(name, subject, state);
        button.addEventListener("click", () => showSubmission(submission));
        submissionsList.append(button);
    });
}

function showSubmission(submission) {
    selectedSubmissionId = submission.id;
    renderSubmissions();
    submissionDetail.replaceChildren();
    const heading = document.createElement("h2");
    heading.textContent = submission.name;
    const metadata = document.createElement("p");
    metadata.className = "submission-meta";
    metadata.textContent = `${formatSubject(submission.subject)} | ${formatSubmittedAt(submission.submittedAt)}`;
    const email = document.createElement("a");
    email.href = `mailto:${submission.email}`;
    email.textContent = submission.email;
    const message = document.createElement("p");
    message.className = "submission-message";
    message.textContent = submission.message;
    const actions = document.createElement("div");
    actions.className = "submission-actions";
    ["new", "in-progress", "archived"].forEach(status => {
        const button = document.createElement("button");
        button.className = "button button-small";
        button.type = "button";
        button.textContent = status === "in-progress" ? "Mark in progress" : `Mark ${status}`;
        button.disabled = submission.status === status;
        button.addEventListener("click", () => updateSubmissionStatus(submission.id, status));
        actions.append(button);
    });
    const remove = document.createElement("button");
    remove.className = "button button-danger button-small";
    remove.type = "button";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => deleteSubmission(submission.id));
    actions.append(remove);
    submissionDetail.append(heading, metadata, email, message, actions);
}

async function updateSubmissionStatus(id, status) {
    await updateDoc(doc(db, "contactSubmissions", id), { status, updatedAt: serverTimestamp() });
}

async function deleteSubmission(id) {
    if (!window.confirm("Delete this contact submission? This cannot be undone.")) return;
    await deleteDoc(doc(db, "contactSubmissions", id));
    selectedSubmissionId = "";
    submissionDetail.textContent = "Select a submission to view it.";
}

function updateNewSubmissionCount() {
    const count = submissions.filter(submission => submission.status === "new").length;
    newSubmissionsCount.textContent = count;
    newSubmissionsCount.hidden = count === 0;
}

function formatSubject(subject) {
    return {
        general: "General enquiry",
        school: "School workshop booking",
        private: "Private event / wedding"
    }[subject] || "General enquiry";
}

function formatSubmittedAt(timestamp) {
    if (!timestamp?.toDate) return "Just received";
    return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" }).format(timestamp.toDate());
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
