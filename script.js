document.addEventListener("DOMContentLoaded", () => {
    // Mobile Menu Toggle
    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener("click", () => {
            const expanded = menuBtn.getAttribute("aria-expanded") === "true";
            menuBtn.setAttribute("aria-expanded", !expanded);
            mobileMenu.classList.toggle("active");
        });
    }

    // Sticky Navigation
    const navbar = document.getElementById("mainNav");
    if (navbar) {
        window.addEventListener("scroll", () => {
            navbar.classList.toggle("scrolled", window.scrollY > 100);
        });
    }

    // Payment Plan Modal & Calculator
    const paymentModal = document.getElementById("paymentModal");
    const calcPriceInput = document.getElementById("calc-price");
    const calcMonthsInput = document.getElementById("calc-months");
    const calcResultElement = document.getElementById("calc-result");

    const planData = {
        "20x30": {
            title: "20x30 Plot Payment Plan (Minsundu)",
            options: [
                { term: "6 Months", price: 55000 },
                { term: "12 Months", price: 60000 },
                { term: "18 Months", price: 65000 },
            ],
            cashPrice: 50000
        },
        "30x30": {
            title: "30x30 Plot Payment Plan (Minsundu)",
            options: [
                { term: "12 Months", price: 65000 },
                { term: "18 Months", price: 70000 },
                { term: "24 Months", price: 75000 },
            ],
            cashPrice: 60000
        },
        "dola-hill": {
            title: "Dola Hill Plot Payment Plan",
            options: [
                { term: "Cash Price", price: 130000 },
            ],
            cashPrice: 130000
        },
    };

    function calculatePayment() {
        if (!calcPriceInput || !calcMonthsInput || !calcResultElement) return;
        const price = parseFloat(calcPriceInput.value) || 0;
        const months = parseInt(calcMonthsInput.value) || 1;
        const deposit = price * 0.1;
        const monthly = months > 0 ? (price - deposit) / months : 0;
        calcResultElement.textContent = `ZMW ${monthly.toLocaleString("en-ZM", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (calcPriceInput && calcMonthsInput) {
        [calcPriceInput, calcMonthsInput].forEach(el => el.addEventListener("input", calculatePayment));
    }

    window.showPaymentPlan = (planType) => {
        const plan = planData[planType];
        if (!plan || !paymentModal) return;

        const planContainer = document.getElementById(`plan${planType}`);
        if (planContainer) {
            let html = `<div class="plan-details-container"><h4>${plan.title}</h4>`;
            plan.options.forEach(opt => {
                html += `<div class="plan-option"><h5>${opt.term}</h5><p>Total: ZMW ${opt.price.toLocaleString('en-ZM')}</p></div>`;
            });
            html += `</div>`;
            planContainer.innerHTML = html;
        }

        paymentModal.classList.add("active");
        document.body.style.overflow = "hidden";

        calcPriceInput.value = plan.options[0]?.price || plan.cashPrice;
        calculatePayment();
    };

    window.closePaymentModal = () => {
        if (!paymentModal) return;
        paymentModal.classList.remove("active");
        document.body.style.overflow = "auto";
    };

    if (paymentModal) {
        paymentModal.addEventListener("click", (e) => {
            if (e.target === paymentModal) closePaymentModal();
        });
    }

    // Contact Form to WhatsApp
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const subject = document.getElementById("subject").value;
            const message = document.getElementById("message").value.trim();

            if (!name || !email || !message) {
                alert("Please fill in all required fields.");
                return;
            }

            const whatsappMessage = `New Inquiry from ${name}\n\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subject}\n\nMessage:\n${message}`;
            window.open(`https://wa.me/260955869020?text=${encodeURIComponent(whatsappMessage)}`, "_blank");
            contactForm.reset();
        });
    }

    // Property Filtering System
    window.filterProperties = () => {
        const type = document.getElementById("filter-type")?.value || "";
        const price = document.getElementById("filter-price")?.value || "";
        const location = document.getElementById("filter-location")?.value || "";

        const cards = document.querySelectorAll(".property-card");
        const visibleCountEl = document.getElementById("visible-count");
        let visibleCount = 0;

        cards.forEach((card) => {
            const cardType = card.dataset.type;
            const cardPrice = parseInt(card.dataset.price);
            const cardLocation = card.dataset.location;

            let priceMatch = !price;
            if (price) {
                const [min, max] = price.split('-').map(p => parseInt(p));
                priceMatch = cardPrice >= min && cardPrice <= max;
            }

            const match = (!type || cardType === type) && (!location || cardLocation === location) && priceMatch;
            card.style.display = match ? "flex" : "none";
            if (match) visibleCount++;
        });

        if (visibleCountEl) visibleCountEl.textContent = visibleCount;
    };

    // Initialize filter counts
    const totalCountEl = document.getElementById("total-count");
    if (totalCountEl) {
        totalCountEl.textContent = document.querySelectorAll(".property-card").length;
        filterProperties();
    }


    // Leaflet.js Map Initialization
    const mapElement = document.getElementById("mapid");
    if (mapElement) {
        const map = L.map("mapid").setView([-12.9649, 28.6369], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const properties = [
            { coords: [-12.886, 28.6522], title: "Minsundu Plots", plan: "20x30" },
            { coords: [-12.9782, 28.6415], title: "Ndola CBD Flat", plan: "none" },
            { coords: [-12.9542, 28.5857], title: "Dola Hill Plot", plan: "dola-hill" },
        ];

        properties.forEach(({ coords, title, plan }) => {
            const popupContent = `<b>${title}</b><br>${plan !== 'none' ? `<a href="#" onclick="showPaymentPlan('${plan}')">View Payment Plan</a>` : '<a href="contact.html">Inquire</a>'}`;
            L.marker(coords).addTo(map).bindPopup(popupContent);
        });
    }
});