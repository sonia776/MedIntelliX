
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const reports = [
        {
            id: "RPT-26001",
            region: "North Region",
            category: "Preventive Healthcare",
            period: "October 2026",
            submitted: "2026-10-18",
            status: "Approved",
            summary: "Sample summary of preventive healthcare activity and service coverage."
        },
        {
            id: "RPT-26002",
            region: "South Region",
            category: "Maternal Health",
            period: "October 2026",
            submitted: "2026-10-19",
            status: "Under review",
            summary: "Sample summary of maternal health service reporting and follow-up."
        },
        {
            id: "RPT-26003",
            region: "East Region",
            category: "Facility Readiness",
            period: "October 2026",
            submitted: "—",
            status: "Pending",
            summary: "This sample report has not yet been submitted."
        },
        {
            id: "RPT-26004",
            region: "West Region",
            category: "Digital Health",
            period: "October 2026",
            submitted: "2026-10-16",
            status: "Approved",
            summary: "Sample summary of digital record coverage and reporting completeness."
        },
        {
            id: "RPT-26005",
            region: "Central Region",
            category: "Preventive Healthcare",
            period: "September 2026",
            submitted: "2026-10-03",
            status: "Under review",
            summary: "Sample summary of preventive service delivery and follow-up indicators."
        },
        {
            id: "RPT-26006",
            region: "North Region",
            category: "Facility Readiness",
            period: "September 2026",
            submitted: "2026-10-04",
            status: "Approved",
            summary: "Sample summary of facility capacity and readiness indicators."
        },
        {
            id: "RPT-26007",
            region: "East Region",
            category: "Maternal Health",
            period: "September 2026",
            submitted: "—",
            status: "Pending",
            summary: "This sample maternal health report is awaiting submission."
        },
        {
            id: "RPT-26008",
            region: "South Region",
            category: "Digital Health",
            period: "August 2026",
            submitted: "2026-09-02",
            status: "Approved",
            summary: "Sample summary of digital health reporting activity."
        },
        {
            id: "RPT-26009",
            region: "West Region",
            category: "Maternal Health",
            period: "August 2026",
            submitted: "2026-09-05",
            status: "Under review",
            summary: "Sample summary of maternal health service indicators."
        },
        {
            id: "RPT-26010",
            region: "Central Region",
            category: "Digital Health",
            period: "August 2026",
            submitted: "—",
            status: "Pending",
            summary: "This sample digital health report has not yet been submitted."
        }
    ];

    const searchInput = document.getElementById("reportSearch");
    const statusFilter = document.getElementById("reportStatusFilter");
    const periodFilter = document.getElementById("reportPeriodFilter");
    const tableBody = document.getElementById("regionalReportsTableBody");
    const emptyState = document.getElementById("regionalReportsEmptyState");
    const resultCount = document.getElementById("reportResultCount");
    const modalElement = document.getElementById("reportDetailsModal");

    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function showToast(message) {
        const toast = document.getElementById("governmentToast");
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
    }

    function statusClass(status) {
        if (status === "Approved") return "status-on-track";
        if (status === "Under review") return "status-review";
        return "status-delayed";
    }

    function renderSummary() {
        document.getElementById("totalReportsCount").textContent = reports.length;
        document.getElementById("approvedReportsCount").textContent =
            reports.filter(report => report.status === "Approved").length;
        document.getElementById("reviewReportsCount").textContent =
            reports.filter(report => report.status === "Under review").length;
        document.getElementById("pendingReportsCount").textContent =
            reports.filter(report => report.status === "Pending").length;
    }

    function getFilteredReports() {
        const query = searchInput.value.trim().toLowerCase();
        const status = statusFilter.value;
        const period = periodFilter.value;

        return reports.filter(report => {
            const searchableText =
                `${report.id} ${report.region} ${report.category}`.toLowerCase();

            const matchesSearch = searchableText.includes(query);
            const matchesStatus = status === "all" || report.status === status;
            const matchesPeriod = period === "all" || report.period === period;

            return matchesSearch && matchesStatus && matchesPeriod;
        });
    }

    function renderReports() {
        const filtered = getFilteredReports();

        tableBody.innerHTML = filtered.map(report => `
            <tr>
                <td><strong>${escapeHTML(report.id)}</strong></td>
                <td>${escapeHTML(report.region)}</td>
                <td>${escapeHTML(report.category)}</td>
                <td>${escapeHTML(report.period)}</td>
                <td>${escapeHTML(report.submitted)}</td>
                <td>
                    <span class="government-status ${statusClass(report.status)}">
                        ${escapeHTML(report.status)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary view-report-button"
                            data-report-id="${escapeHTML(report.id)}">
                        View <i class="bi bi-arrow-up-right"></i>
                    </button>
                </td>
            </tr>
        `).join("");

        emptyState.hidden = filtered.length > 0;
        resultCount.textContent =
            `${filtered.length} ${filtered.length === 1 ? "report" : "reports"}`;
    }

    function openReportDetails(reportId) {
        const report = reports.find(item => item.id === reportId);
        if (!report) return;

        document.getElementById("reportDetailsTitle").textContent = report.id;
        document.getElementById("reportDetailsSubtitle").textContent =
            `${report.region} · ${report.period}`;

        document.getElementById("reportDetailsBody").innerHTML = `
            <dl class="report-details-list">
                <div><dt>Category</dt><dd>${escapeHTML(report.category)}</dd></div>
                <div><dt>Reporting period</dt><dd>${escapeHTML(report.period)}</dd></div>
                <div><dt>Submission date</dt><dd>${escapeHTML(report.submitted)}</dd></div>
                <div><dt>Status</dt><dd>
                    <span class="government-status ${statusClass(report.status)}">
                        ${escapeHTML(report.status)}
                    </span>
                </dd></div>
            </dl>
            <div class="report-summary-box">
                <strong>Sample report summary</strong>
                <p>${escapeHTML(report.summary)}</p>
            </div>
            <p class="text-secondary small mb-0">
                Demonstration only. This record is not an official report.
            </p>
        `;

        modal.show();
    }

    tableBody.addEventListener("click", event => {
        const button = event.target.closest("[data-report-id]");
        if (!button) return;

        openReportDetails(button.dataset.reportId);
    });

    searchInput.addEventListener("input", renderReports);
    statusFilter.addEventListener("change", renderReports);
    periodFilter.addEventListener("change", renderReports);

    document.getElementById("resetReportFilters").addEventListener("click", () => {
        searchInput.value = "";
        statusFilter.value = "all";
        periodFilter.value = "all";
        renderReports();
        showToast("Report filters have been reset.");
    });

    renderSummary();
    renderReports();
});
