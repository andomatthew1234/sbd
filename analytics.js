import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { addDoc, collection, getFirestore, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig, "public-analytics");
const db = getFirestore(app);
const page = window.location.pathname.split("/").pop() || "index.html";
const sessionId = getSessionId();

trackPageView();

document.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link) return;
    if (link.matches('a[href^="mailto:"]')) trackAction("email_link_click");
    if (link.matches('a[href^="tel:"]')) trackAction("phone_link_click");
    if (link.href.includes("square")) trackAction("square_checkout_click");
});

document.addEventListener("sbd:conversion", event => {
    trackAction(event.detail);
});

export function trackAction(action) {
    const key = `sbd-action-${action}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    record("action", action);
}

function trackPageView() {
    const key = `sbd-page-${page}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    record("page_view", "viewing_page");
}

function record(type, action) {
    addDoc(collection(db, "analyticsEvents"), { type, page, action, sessionId, recordedAt: serverTimestamp() })
        .catch(error => console.info("Analytics could not be recorded.", error.code));
}

function getSessionId() {
    const key = "sbd-analytics-session";
    let id = sessionStorage.getItem(key);
    if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem(key, id);
    }
    return id;
}
