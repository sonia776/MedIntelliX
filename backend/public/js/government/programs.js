
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const programs = [
        {
            id: "PH-001",
            name: "Preventive Health Outreach",
            category: "Preventive Care",
            status: "Active",
            progress: 78,
            regions: ["North Region", "South Region", "West Region"],
            target: "Expand access to preventive screening",
            description: "A fictional initiative demonstrating community screening and health-awareness monitoring.",
            milestone: "Sample milestone: review outreach coverage."
        },
        {
            id: "PH-002",
            name: "Maternal Health Support",
            category: "Maternal Health",
            status: "Active",
            progress: 64,
            regions: ["North Region", "East Region", "Central Region"],
            target: "Improve access to maternal care and follow-up",
            description: "A fictional initiative demonstrating monitoring of maternal health services.",
            milestone: "Sample milestone: evaluate follow-up completion."
        },
        {
            id: "PH-003",
            name: "Digital Health Records Initiative",
            category: "Digital Health",
            status: "Active",
            progress: 86,
            regions: ["North Region", "South Region", "East Region", "West Region"],
            target: "Improve secure digital health-record availability",
            description: "A fictional initiative demonstrating the adoption of digital record systems.",
            milestone: "Sample milestone: review implementation and access controls."
        },
        {
            id: "PH-004",
            name: "Community Wellness Education",
            category: "Community Health",
            status: "Active",
            progress: 57,
            regions: ["East Region", "Central Region"],
            target: "Expand access to community health education",
            description: "A fictional initiative demonstrating health-literacy and community-engagement activities.",
            milestone: "Sample milestone: review community participation."
        },
        {
            id: "PH-005",
            name: "Regional Facility Improvement",
            category: "Facility Development",
            status: "Planning",
            progress: 22,
            regions: ["Central Region", "East Region"],
            target: "Plan improvements to healthcare facilities",
            description: "A fictional initiative demonstrating early-stage facility development planning.",
            milestone: "Sample milestone: complete an illustrative needs assessment."
        },
        {
            id: "PH-006",
            name: "Healthy Living Awareness",
            category: "Preventive Care",
            status: "Completed",
            progress: 100,
            regions: ["South Region", "West Region"],
            target: "Deliver a sample healthy-living awareness campaign",
            description: "A fictional initiative shown as completed for demonstration purposes.",
            milestone: "Sample milestone: document lessons learned."
        }
    ];

    const searchInput = document.getElementById("programSearch");
    const categoryFilter = document.getElementById("programCategoryFilter");
    const statusFilter = document.getElementById("programStatusFilter");
    const grid = document.getElementById("publicHealthProgramGrid");
    const emptyState = document.getElementById("programEmptyState");
    const resultCount = document.getElementById("programResultCount");

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("programDetailsModal")
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
        if (status === "Active") return "status-on-track";
        if (status === "Planning") return "status-review";
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
        document.getElementById("programTotal").textContent = programs.length;

        document.getElementById("programActive").textContent =
            programs.filter(program => program.status === "Active").length;

        const average = Math.round(
            programs.reduce((sum, program) => sum + program.progress, 0) /
            programs.length
        );

        document.getElementById("programAverage").textContent = average + "%";

        document.getElementById("programRegions").textContent =
            new Set(programs.flatMap(program => program.regions)).size;
    }

    function getFilteredPrograms() {
        const query = searchInput.value.trim().toLowerCase();

        return programs.filter(program => {
            const searchableText = [
                program.id,
                program.name,
                program.category,
                program.target
            ].join(" ").toLowerCase();

            return searchableText.includes(query) &&
                (categoryFilter.value === "all" ||
                    program.category === categoryFilter.value) &&
                (statusFilter.value === "all" ||
                    program.status === statusFilter.value);
        });
    }

    function renderPrograms() {
        const filtered = getFilteredPrograms();

        grid.innerHTML = filtered.map(program => `
            <article class="public-health-program-card">
                <div class="program-card-top">
                    <span class="program-card-icon"><i class="bi bi-heart-pulse"></i></span>
                    <span class="government-status ${statusClass(program.status)}">
                        ${escapeHTML(program.status)}
                    </span>
                </div>

                <span class="program-card-id">${escapeHTML(program.id)}</span>
                <h4>${escapeHTML(program.name)}</h4>
                <span class="program-category-label">${escapeHTML(program.category)}</span>

                <p class="program-card-description">${escapeHTML(program.description)}</p>

                <div class="program-progress-heading">
                    <span>Illustrative progress</span>
                    <strong>${program.progress}%</strong>
                </div>

                <div class="program-progress-track"
                     role="img" aria-label="Illustrative progress: ${program.progress}%">
                    <div class="program-progress-fill" style="width:${program.progress}%"></div>
                </div>

                <div class="program-region-count">
                    <i class="bi bi-geo-alt"></i>
                    ${program.regions.length} sample regions
                </div>

                <button class="btn btn-outline-secondary program-details-button"
                        data-program-id="${escapeHTML(program.id)}">
                    View program details <i class="bi bi-arrow-right"></i>
                </button>
            </article>
        `).join("");

        emptyState.hidden = filtered.length > 0;
        resultCount.textContent =
            `${filtered.length} ${filtered.length === 1 ? "program" : "programs"}`;
    }

    function openProgramDetails(programId) {
        const program = programs.find(item => item.id === programId);
        if (!program) return;

        document.getElementById("programDetailsTitle").textContent = program.name;
        document.getElementById("programDetailsSubtitle").textContent =
            `${program.id} · ${program.category}`;

        document.getElementById("programDetailsBody").innerHTML = `
            <div class="program-detail-overview">
                <span class="program-detail-icon"><i class="bi bi-heart-pulse"></i></span>
                <div>
                    <span class="government-status ${statusClass(program.status)}">
                        ${escapeHTML(program.status)}
                    </span>
                    <p class="text-secondary small mt-2 mb-0">
                        All values are fictional demonstration data.
                    </p>
                </div>
            </div>

            <dl class="report-details-list">
                <div><dt>Program ID</dt><dd>${escapeHTML(program.id)}</dd></div>
                <div><dt>Focus area</dt><dd>${escapeHTML(program.category)}</dd></div>
                <div><dt>Status</dt><dd>${escapeHTML(program.status)}</dd></div>
                <div><dt>Illustrative progress</dt><dd>${program.progress}%</dd></div>
                <div><dt>Sample regions covered</dt><dd>${program.regions.length}</dd></div>
            </dl>

            <div class="report-summary-box">
                <strong>Program objective</strong>
                <p>${escapeHTML(program.target)}</p>
            </div>

            <h6 class="mb-3">Sample regions</h6>
            <div class="hospital-service-list">
                ${program.regions.map(region =>
                    `<span><i class="bi bi-geo-alt"></i> ${escapeHTML(region)}</span>`
                ).join("")}
            </div>

            <div class="report-summary-box mt-4 mb-0">
                <strong>Illustrative next milestone</strong>
                <p>${escapeHTML(program.milestone)}</p>
            </div>
        `;

        modal.show();
    }

    grid.addEventListener("click", event => {
        const button = event.target.closest("[data-program-id]");
        if (button) openProgramDetails(button.dataset.programId);
    });

    searchInput.addEventListener("input", renderPrograms);
    categoryFilter.addEventListener("change", renderPrograms);
    statusFilter.addEventListener("change", renderPrograms);

    document.getElementById("resetProgramFilters").addEventListener("click", () => {
        searchInput.value = "";
        categoryFilter.value = "all";
        statusFilter.value = "all";

        renderPrograms();
        showToast("Program filters have been reset.");
    });

    renderSummary();
    renderPrograms();
});
