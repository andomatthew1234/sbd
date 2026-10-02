document.addEventListener("DOMContentLoaded", () => {
    // Inject Header
    fetch("header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-placeholder").innerHTML = data;
            highlightActiveNav();
            initMobileNav();
        })
        .catch(err => console.error("Error loading header:", err));

    // Inject Footer
    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;
        })
        .catch(err => console.error("Error loading footer:", err));

    initAccordions();
});

// Highlights current menu item
function highlightActiveNav() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".site-nav a");

    navLinks.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}

function initMobileNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");
    const label = toggle?.querySelector(".nav-toggle-label");
    if (!toggle || !nav) return;

    const setMenuState = (isOpen, returnFocus = false) => {
        toggle.setAttribute("aria-expanded", String(isOpen));
        nav.classList.toggle("is-open", isOpen);
        if (label) label.textContent = isOpen ? "Close" : "Menu";
        if (returnFocus) toggle.focus();
    };

    toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        setMenuState(!isOpen);
    });

    nav.addEventListener("click", event => {
        if (event.target.closest("a")) setMenuState(false);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
            setMenuState(false, true);
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1050 && toggle.getAttribute("aria-expanded") === "true") {
            setMenuState(false);
        }
    });
}

// Handles FAQ Accordions
function initAccordions() {
    const acc = document.querySelectorAll(".faq-question");
    acc.forEach((button, index) => {
        const panel = button.nextElementSibling;
        const panelId = `faq-answer-${index + 1}`;
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", panelId);
        panel.id = panelId;
        panel.hidden = true;
        button.addEventListener("click", function() {
            const isOpen = this.getAttribute("aria-expanded") === "true";
            this.setAttribute("aria-expanded", String(!isOpen));
            this.classList.toggle("active", !isOpen);
            panel.hidden = isOpen;
        });
    });
}
