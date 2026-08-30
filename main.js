document.addEventListener("DOMContentLoaded", () => {
    // Inject Header
    fetch("header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-placeholder").innerHTML = data;
            highlightActiveNav();
        })
        .catch(err => console.error("Error loading header:", err));

    // Inject Footer
    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;
        })
        .catch(err => console.error("Error loading footer:", err));

    // Initialize Page Scripts
    initAccordions();
    handlePaymentPage();
    initBookingWizard();
});

// Highlights current menu item
function highlightActiveNav() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".site-nav a");

    navLinks.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });
}

// Handles FAQ Accordions
function initAccordions() {
    const acc = document.querySelectorAll(".faq-question");
    acc.forEach(button => {
        button.addEventListener("click", function() {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    });
}

// Handles interactive gig selection on dances.html
function initBookingWizard() {
    if (!window.location.pathname.includes("dances.html")) return;

    const gigData = {
        robertson: {
            name: "Robertson NSW",
            address: "55 Hoddle Street, Robertson NSW 2577",
            dates: [
                { date: "November 28", link: "payments.html?event=regularbushdances" }
            ],
            cost: ["$20 Online / $25 at the door", "$80 per family"]
        },
        lidcombe: {
            name: "Lidcombe NSW",
            address: "57 Church Street, Lidcombe NSW 2141",
            dates: [
                { date: "November 6", link: "payments.html?event=regularbushdances" }
            ],
            cost: ["$20 Online / $25 at the door", "$80 per family"]
        }
    };

    const locButtons = document.querySelectorAll('.location-btn');
    const stepDate = document.getElementById('step-date');
    const dateOptions = document.getElementById('date-options');
    const stepDetails = document.getElementById('step-details');
    const gigDetailsCard = document.getElementById('gig-details-card');

    locButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Reset location buttons
            locButtons.forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-secondary');
            });
            // Highlight selected
            e.target.classList.remove('btn-secondary');
            e.target.classList.add('btn-primary');

            const selectedLoc = e.target.getAttribute('data-loc');

            // Show date step, hide details
            stepDate.classList.remove('hidden');
            stepDetails.classList.add('hidden');

            // Populate dates
            dateOptions.innerHTML = '';
            gigData[selectedLoc].dates.forEach(d => {
                const dBtn = document.createElement('button');
                dBtn.className = 'btn btn-secondary date-btn';
                dBtn.innerText = d.date;
                dBtn.addEventListener('click', (event) => {
                    // Reset date buttons
                    document.querySelectorAll('.date-btn').forEach(b => {
                        b.classList.remove('btn-primary');
                        b.classList.add('btn-secondary');
                    });
                    event.target.classList.remove('btn-secondary');
                    event.target.classList.add('btn-primary');
                    
                    showDetails(selectedLoc, d);
                });
                dateOptions.appendChild(dBtn);
            });
        });
    });

    function showDetails(locKey, dateObj) {
        const data = gigData[locKey];
        stepDetails.classList.remove('hidden');

        gigDetailsCard.innerHTML = `
            <div class="gig-header">
                <h2>${data.name}</h2>
                <p class="gig-date">${dateObj.date}</p>
            </div>
            <div class="gig-body">
                <p><strong>Location:</strong><br>${data.address}</p>
                <div class="gig-cost">
                    <p><strong>Tickets:</strong></p>
                    <ul>
                        ${data.cost.map(c => `<li>${c}</li>`).join('')}
                    </ul>
                </div>
                <a href="${dateObj.link}" class="btn btn-primary cta-btn">Pay Now</a>
            </div>
        `;
    }
}

// Handles dynamic content injection for payments.html
function handlePaymentPage() {
    if (!window.location.pathname.includes("payments.html")) return;

    const urlParams = new URLSearchParams(window.location.search);
    const eventParam = urlParams.get('event'); 
    const rawSearch = window.location.search.replace('?', '');

    const container = document.getElementById("payment-container");
    const title = document.getElementById("payment-title");

    if (eventParam === "regularbushdances" || rawSearch === "=regularbushdances" || rawSearch === "regularbushdances") {
        title.innerText = "Monthly Bush Dances Tickets";
        container.innerHTML = `
            <div class="gigs-grid">
                <div class="gig-card">
                    <div class="gig-header">
                        <h2>Robertson NSW</h2>
                        <p class="gig-date">November 28</p>
                    </div>
                    <div class="gig-body">
                        <p><strong>Tickets:</strong> $20 Online / $80 Family</p>
                        <a href="https://square.online/checkout/robertson-placeholder" class="btn btn-primary cta-btn">Checkout</a>
                    </div>
                </div>
                <div class="gig-card">
                    <div class="gig-header">
                        <h2>Lidcombe NSW</h2>
                        <p class="gig-date">November 6</p>
                    </div>
                    <div class="gig-body">
                        <p><strong>Tickets:</strong> $20 Online / $80 Family</p>
                        <a href="https://square.online/checkout/lidcombe-placeholder" class="btn btn-primary cta-btn">Checkout</a>
                    </div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <h2 style="color: var(--primary-dark-green); margin-bottom: 1rem;">No Event Selected</h2>
                <p>Please select a valid event link to proceed with your payment.</p>
                <a href="index.html" class="btn btn-secondary" style="margin-top: 1.5rem;">Return Home</a>
            </div>
        `;
    }
}