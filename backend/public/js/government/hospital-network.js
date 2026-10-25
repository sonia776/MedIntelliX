
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const hospitals = [
        {
            id: "HSP-001",
            name: "North Valley General Hospital",
            city: "Sample City A",
            region: "North Region",
            type: "General Hospital",
            beds: 320,
            services: ["Emergency care", "General medicine", "Diagnostics"],
            status: "Operational"
        },
        {
            id: "HSP-002",
            name: "Northern Heart Care Centre",
            city: "Sample City B",
            region: "North Region",
            type: "Specialty Hospital",
            beds: 180,
            services: ["Cardiology", "Cardiac diagnostics"],
            status: "Operational"
        },
        {
            id: "HSP-003",
            name: "Southern Community Health Centre",
            city: "Sample City C",
            region: "South Region",
            type: "Community Clinic",
            beds: 40,
            services: ["Primary care", "Preventive screening"],
            status: "Operational"
        },
        {
            id: "HSP-004",
            name: "South Coast General Hospital",
            city: "Sample City D",
            region: "South Region",
            type: "General Hospital",
            beds: 450,
            services: ["Emergency care", "Surgery", "Maternity care"],
            status: "Limited services"
        },
        {
            id: "HSP-005",
            name: "Eastern Regional Medical Centre",
            city: "Sample City E",
            region: "East Region",
            type: "General Hospital",
            beds: 260,
            services: ["General medicine", "Diagnostics", "Paediatrics"],
            status: "Under maintenance"
        },
        {
            id: "HSP-006",
            name: "Eastside Community Clinic",
            city: "Sample City F",
            region: "East Region",
            type: "Community Clinic",
            beds: 30,
            services: ["Primary care", "Vaccination"],
            status: "Operational"
        },
        {
            id: "HSP-007",
            name: "Western Specialist Institute",
            city: "Sample City G",
            region: "West Region",
            type: "Specialty Hospital",
            beds: 210,
            services: ["Orthopaedics", "Rehabilitation"],
            status: "Operational"
        },
        {
            id: "HSP-008",
            name: "West District General Hospital",
            city: "Sample City H",
            region: "West Region",
            type: "General Hospital",
            beds: 380,
            services: ["Emergency care", "Surgery", "General medicine"],
            status: "Operational"
        },
        {
            id: "HSP-009",
            name: "Central Community Clinic",
            city: "Sample City I",
            region: "Central Region",
            type: "Community Clinic",
            beds: 25,
            services: ["Primary care", "Preventive screening"],
            status: "Limited services"
        },
        {
            id: "HSP-010",
            name: "Central Regional Hospital",
            city: "Sample City J",
            region: "Central Region",
            type: "General Hospital",
            beds: 290,
            services: ["Emergency care", "Diagnostics", "Maternity care"],
            status: "Operational"
        }
    ];

    const searchInput = document.getElementById("hospitalSearch");
    const regionFilter = document.getElementById("hospitalRegionFilter");
    const typeFilter = document.getElementById("hospitalTypeFilter");
    const statusFilter = document.getElementById("hospitalStatusFilter");
    const grid = document.getElementById("hospitalNetworkGrid");
    const emptyState = document.getElementById("hospitalNetworkEmpty");
    const resultCount = document.getElementById("networkResultCount");

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("hospitalDetailsModal")
    );

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function statusClass(status) {
        if (status === "Operational") return "status-on-track";
        if (status === "Under maintenance") return "status-review";
        return "status-delayed";
    }

    function showToast(message) {
        const toast = document.getElementById("governmentToast");
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
    }

    function renderSummary() {
        document.getElementById("networkTotal").textContent = hospitals.length;

        document.getElementById("networkOperational").textContent =
            hospitals.filter(hospital => hospital.status === "Operational").length;

        document.getElementById("networkBeds").textContent =
            hospitals.reduce((total, hospital) => total + hospital.beds, 0)
                .toLocaleString("en-IN");

        document.getElementById("networkRegions").textContent =
            new Set(hospitals.map(hospital => hospital.region)).size;
    }

    function getFilteredHospitals() {
        const query = searchInput.value.trim().toLowerCase();

        return hospitals.filter(hospital => {
            const searchableText = [
                hospital.id,
                hospital.name,
                hospital.city,
                hospital.region,
                hospital.type
            ].join(" ").toLowerCase();

            return searchableText.includes(query) &&
                (regionFilter.value === "all" || hospital.region === regionFilter.value) &&
                (typeFilter.value === "all" || hospital.type === typeFilter.value) &&
                (statusFilter.value === "all" || hospital.status === statusFilter.value);
        });
    }

    function renderHospitals() {
        const filtered = getFilteredHospitals();

        grid.innerHTML = filtered.map(hospital => `
            <article class="hospital-network-card">
                <div class="hospital-card-top">
                    <div class="hospital-card-icon">
                        <i class="bi bi-hospital"></i>
                    </div>
                    <span class="government-status ${statusClass(hospital.status)}">
                        ${escapeHTML(hospital.status)}
                    </span>
                </div>

                <span class="hospital-card-id">${escapeHTML(hospital.id)}</span>
                <h4>${escapeHTML(hospital.name)}</h4>

                <p class="hospital-card-location">
                    <i class="bi bi-geo-alt"></i>
                    ${escapeHTML(hospital.city)} · ${escapeHTML(hospital.region)}
                </p>

                <div class="hospital-card-metrics">
                    <div>
                        <span>Facility type</span>
                        <strong>${escapeHTML(hospital.type)}</strong>
                    </div>
                    <div>
                        <span>Sample bed capacity</span>
                        <strong>${hospital.beds.toLocaleString("en-IN")}</strong>
                    </div>
                </div>

                <button class="btn btn-outline-secondary hospital-details-button"
                        data-hospital-id="${escapeHTML(hospital.id)}">
                    View facility details <i class="bi bi-arrow-right"></i>
                </button>
            </article>
        `).join("");

        emptyState.hidden = filtered.length > 0;
        resultCount.textContent =
            `${filtered.length} ${filtered.length === 1 ? "facility" : "facilities"}`;
    }

    function openHospitalDetails(hospitalId) {
        const hospital = hospitals.find(item => item.id === hospitalId);
        if (!hospital) return;

        document.getElementById("hospitalDetailsTitle").textContent = hospital.name;
        document.getElementById("hospitalDetailsSubtitle").textContent =
            `${hospital.id} · ${hospital.region}`;

        document.getElementById("hospitalDetailsBody").innerHTML = `
            <div class="hospital-detail-overview">
                <span class="hospital-detail-large-icon"><i class="bi bi-hospital"></i></span>
                <div>
                    <span class="government-status ${statusClass(hospital.status)}">
                        ${escapeHTML(hospital.status)}
                    </span>
                    <p class="text-secondary mt-2 mb-0">
                        ${escapeHTML(hospital.city)} · ${escapeHTML(hospital.region)}
                    </p>
                </div>
            </div>

            <dl class="report-details-list">
                <div><dt>Facility ID</dt><dd>${escapeHTML(hospital.id)}</dd></div>
                <div><dt>Facility type</dt><dd>${escapeHTML(hospital.type)}</dd></div>
                <div><dt>Illustrative bed capacity</dt><dd>${hospital.beds.toLocaleString("en-IN")}</dd></div>
            </dl>

            <h6 class="mb-3">Listed sample services</h6>
            <div class="hospital-service-list">
                ${hospital.services.map(service =>
                    `<span><i class="bi bi-check2-circle"></i> ${escapeHTML(service)}</span>`
                ).join("")}
            </div>

            <p class="text-secondary small mt-4 mb-0">
                Fictional facility profile for demonstration. Details have not been verified.
            </p>
        `;

        modal.show();
    }

    grid.addEventListener("click", event => {
        const button = event.target.closest("[data-hospital-id]");
        if (button) openHospitalDetails(button.dataset.hospitalId);
    });

    [searchInput, regionFilter, typeFilter, statusFilter].forEach(element => {
        element.addEventListener(
            element === searchInput ? "input" : "change",
            renderHospitals
        );
    });

    document.getElementById("resetNetworkFilters").addEventListener("click", () => {
        searchInput.value = "";
        regionFilter.value = "all";
        typeFilter.value = "all";
        statusFilter.value = "all";

        renderHospitals();
        showToast("Hospital network filters have been reset.");
    });

    renderSummary();
    renderHospitals();
});
