import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { addDoc, collection, getFirestore, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const form = document.getElementById("contact-form");
const status = document.getElementById("contact-form-status");

if (form) {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async event => {
        event.preventDefault();
        status.hidden = true;

        if (form.website.value) {
            showStatus("Thanks for getting in touch. We will respond as soon as we can.", "success");
            form.reset();
            return;
        }

        const submission = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            subject: form.subject.value,
            message: form.message.value.trim(),
            status: "new",
            submittedAt: serverTimestamp()
        };

        if (submission.name.length < 2 || submission.message.length < 10) {
            showStatus("Please enter your name and a message of at least 10 characters.", "error");
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        try {
            await addDoc(collection(db, "contactSubmissions"), submission);
            form.reset();
            document.dispatchEvent(new CustomEvent("sbd:conversion", { detail: "contact_form_submit" }));
            showStatus("Thanks for getting in touch. We will respond as soon as we can.", "success");
        } catch (error) {
            console.error("Unable to submit contact form:", error);
            showStatus("Your message could not be sent. Please email us directly or try again shortly.", "error");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Send Message";
        }
    });
}

function showStatus(message, type) {
    status.textContent = message;
    status.className = `form-status ${type}`;
    status.hidden = false;
}
