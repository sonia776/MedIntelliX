
document.addEventListener("DOMContentLoaded", () => {
    const $ = id => document.getElementById(id);

    // Fictional demonstration data only.
    const dashboardData = {
        hospitals: 248,
        patients: 128450,
        reports: 1860,
        activePrograms: 6,
        reporting: {
            submitted: 1420,
            review: 280,
            pending: 160
        }
    };

    const regions = [
        { name: "North Region", hospitals: 58, reporting: 94, coverage: 86, readiness: 82, status: "On track" },
        { name: "South Region", hospitals: 64, reporting: 91, coverage: 89, readiness: 88, status: "On track" },
        { name: "East Region", hospitals: 42, reporting: 76, coverage: 72, readiness: 69, status: "Attention needed" },
        { name: "West Region", hospitals: 51, reporting: 87, coverage: 81, readiness: 79, status: "On track" },
        { name: "Central Region", hospitals: 33, reporting: 68, coverage: 65, readiness: 63, status: "Delayed" }
    ];

    const programs = [
        {
            name: "Preventive Health Outreach",
            category: "COMMUNITY HEALTH",
            progress: 78,
            target: "78% of illustrative target",
            icon: "bi-heart-pulse",
            tone: "teal"
        },
        {
            name: "Maternal Health Support",
            category: "MATERNAL HEALTH",
            progress: 64,
            target: "64% of illustrative target",
            icon: "bi-person-hearts",
            tone: "coral"
        },
        {
            name: "Digital Health Records",
            category: "DIGITAL HEALTH",
            progress: 86,
            target: "86% of illustrative target",
            icon: "bi-file-earmark-medical",
            tone: "blue"
        }
    ];

    const escapeHTML = value =>
        String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);

    function showToast(message) {
        const toast = $("governmentToast");
        toast.textContent = message;
        toast.classList.add("show");

        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    }

    function renderStatistics() {
        $("totalHospitals").textContent = dashboardData.hospitals.toLocaleString("en-IN");
        $("totalPatients").textContent = dashboardData.patients.toLocaleString("en-IN");
        $("totalReports").textContent = dashboardData.reports.toLocaleString("en-IN");
        $("activePrograms").textContent = dashboardData.activePrograms;
    }

    function renderReportingOverview() {
        const data = dashboardData.reporting;
        const total = data.submitted + data.review + data.pending;

        $("reportingTotal").textContent = total.toLocaleString("en-IN");
        $("submittedCount").textContent = data.submitted.toLocaleString("en-IN");
        $("reviewCount").textContent = data.review.toLocaleString("en-IN");
        $("pendingCount").textContent = data.pending.toLocaleString("en-IN");

        [
            ["submittedBar", data.submitted],
            ["reviewBar", data.review],
            ["pendingBar", data.pending]
        ].forEach(([id, value]) => {
            const bar = $(id);
            const percentage = total ? (value / total) * 100 : 0;
            bar.style.width = `${percentage}%`;
            bar.setAttribute("aria-valuenow", Math.round(percentage));
            bar.setAttribute("aria-valuemin", "0");
            bar.setAttribute("aria-valuemax", "100");
        });
    }

    function renderChart() {
        const metric = $("chartMetric").value;

        const metricSettings = {
            coverage: { label: "Coverage index", field: "coverage" },
            reporting: { label: "Reporting rate", field: "reporting" },
            facilities: { label: "Facility readiness", field: "readiness" }
        };

        const setting = metricSettings[metric];
        const chart = $("regionalChart");

        chart.setAttribute(
            "aria-label",
            `${setting.label} by region, based on fictional demonstration data`
        );

        chart.innerHTML = regions.map(region => {
            const value = region[setting.field];

            return `
                <div class="government-chart-row">
                    <div class="government-chart-region">${escapeHTML(region.name)}</div>
                    <div class="government-chart-track">
                        <div class="government-chart-bar" style="width:${value}%"></div>
                    </div>
                    <div class="government-chart-value">${value}%</div>
                </div>
            `;
        }).join("");
    }

    function renderRegionalTable() {
        const query = $("regionSearch").value.trim().toLowerCase();
        const selectedStatus = $("regionStatusFilter").value;

        const filtered = regions.filter(region =>
            region.name.toLowerCase().includes(query) &&
            (selectedStatus === "all" || region.status === selectedStatus)
        );

        $("regionalTableBody").innerHTML = filtered.map(region => {
            const statusClass = {
                "On track": "gov-status-on-track",
                "Attention needed": "gov-status-attention",
                "Delayed": "gov-status-delayed"
            }[region.status];

            return `
                <tr>
                    <td><strong>${escapeHTML(region.name)}</strong></td>
                    <td>${region.hospitals}</td>
                    <td>
                        <div class="government-table-metric">
                            <div class="progress government-mini-progress">
                                <div class="progress-bar" style="width:${region.reporting}%"></div>
                            </div>
                            <span>${region.reporting}%</span>
                        </div>
                    </td>
                    <td>${region.coverage}%</td>
                    <td>
                        <span class="government-status ${statusClass}">
                            ${escapeHTML(region.status)}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");

        $("regionalEmptyState").classList.toggle("d-none", filtered.length > 0);
        $("regionalTable").classList.toggle("d-none", filtered.length === 0);
    }

    function renderPrograms() {
        $("programCards").innerHTML = programs.map(program => `
            <div class="col-12 col-md-6 col-xl-4">
                <article class="government-program-card">
                    <div class="government-program-top">
                        <span class="government-program-icon ${program.tone}">
                            <i class="bi ${program.icon}"></i>
                        </span>
                        <span class="government-program-category">
                            ${escapeHTML(program.category)}
                        </span>
                    </div>
                    <h4>${escapeHTML(program.name)}</h4>
                    <div class="government-program-progress-heading">
                        <span>Illustrative progress</span>
                        <strong>${program.progress}%</strong>
                    </div>
                    <div class="progress government-progress">
                        <div class="progress-bar program-bar-${program.tone}"
                             style="width:${program.progress}%"
                             role="progressbar"
                             aria-label="${escapeHTML(program.name)} progress"
                             aria-valuenow="${program.progress}"
                             aria-valuemin="0"
                             aria-valuemax="100"></div>
                    </div>
                    <p>${escapeHTML(program.target)}</p>
                </article>
            </div>
        `).join("");
    }

    function resetRegionFilters() {
        $("regionSearch").value = "";
        $("regionStatusFilter").value = "all";
        renderRegionalTable();
    }

    $("chartMetric").addEventListener("change", renderChart);
    $("regionSearch").addEventListener("input", renderRegionalTable);
    $("regionStatusFilter").addEventListener("change", renderRegionalTable);
    $("resetRegionFilters").addEventListener("click", resetRegionFilters);

    $("refreshDashboardButton").addEventListener("click", () => {
        // Re-render the current local demo data; no server request is made.
        renderStatistics();
        renderReportingOverview();
        renderChart();
        renderRegionalTable();
        renderPrograms();
        showToast("Dashboard refreshed using demonstration data.");
    });

    renderStatistics();
    renderReportingOverview();
    renderChart();
    renderRegionalTable();
    renderPrograms();
});
