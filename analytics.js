import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getDatabase, onDisconnect, ref, runTransaction, serverTimestamp, set, update } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig, "public-analytics");
const auth = getAuth(app);
const db = getDatabase(app);
const page = window.location.pathname.split("/").pop() || "index.html";
let presenceRef;

startAnalytics();

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
    if (!presenceRef) return;
    update(presenceRef, { action, lastSeen: serverTimestamp() });
    const key = `sbd-action-${action}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    increment(`analytics/allTime/actions/${action}`);
}

async function startAnalytics() {
    try {
        const credential = await signInAnonymously(auth);
        presenceRef = ref(db, `presence/${credential.user.uid}`);
        startPresence();
        trackPageView();
    } catch (error) {
        // Analytics is optional: an unavailable service must never affect the public site.
        console.info("Anonymous analytics is unavailable.", error.code);
    }
}

function startPresence() {
    set(presenceRef, { page, action: "viewing_page", lastSeen: serverTimestamp() });
    onDisconnect(presenceRef).remove();

    // A light heartbeat makes stale mobile connections disappear without constant writes.
    window.setInterval(() => {
        update(presenceRef, { lastSeen: serverTimestamp() });
    }, 120000);
}

function trackPageView() {
    const key = `sbd-page-${page}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    increment(`analytics/allTime/pages/${page}`);
}

function increment(path) {
    runTransaction(ref(db, path), currentValue => (currentValue || 0) + 1);
}
