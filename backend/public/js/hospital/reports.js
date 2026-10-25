
document.addEventListener("DOMContentLoaded", () => {
    const reports = [
        {
            id: "RPT-3101",
            patient: "Ananya Verma",
            patientId: "PAT-1001",
            type: "Blood Test",
            doctor: "Dr. Meera Sharma",
            date: "2026-10-20",
            status: "pending",
            notes: "Routine laboratory report submitted for clinician review."
        },
        {
            id: "RPT-3102",
            patient: "Rohan Mehta",
            patientId: "PAT-1002",
            type: "Imaging",
            doctor: "Dr. Arjun Kapoor",
            date: "2026-10-19",
            status: "reviewed",
            notes: "Demonstration imaging report. Refer to the authorised clinical record for interpretation."
        },
        {
            id: "RPT-3103",
            patient: "Priya Nair",
            patientId: "PAT-1003",
            type: "Pathology",
            doctor: "Dr. Kavita Rao",
            date: "2026-10-18",
            status: "pending",
            notes: "Sample pathology report awaiting review."
        },
        {
            id: "RPT-3104",
            patient: "Kabir Singh",
            patientId: "PAT-1004",
            type: "Cardiology",
            doctor: "Dr. Arjun Kapoor",
            date: "2026-10-17",
            status: "reviewed",
            notes: "Fictional cardiology report entry for interface testing."
        },
        {
            id: "RPT-3105",
            patient: "Ishita Das",
            patientId: "PAT-1005",
            type: "General",
            doctor: "Dr. Meera Sharma",
            date: "2026-10-16",
            status: "archived",
            notes: "Archived demonstration document. No real report file is attached."
        },
        {
            id: "RPT-3106",
            patient: "Dev Malhotra",
            patientId: "PAT-1006",
            type: "Blood Test",
            doctor: "Dr. Kavita Rao",
            date: "2026-10-15",
            status: "pending",
            notes: "Routine test report waiting for authorised review."
        },
        {
            id: "RPT-3107",
            patient: "Sara Thomas",
            patientId: "PAT-1007",
            type: "Imaging",
            doctor: "Dr. Meera Sharma",
            date: "2026-10-14",
            status: "reviewed",
            notes: "Fictional imaging report entry."
        },
        {
            id: "RPT-3108",
            patient: "Aditya Joshi",
            patientId: "PAT-1008",
            type: "General",
            doctor: "Dr. Arjun Kapoor",
            date: "2026-10-13",
            status: "pending",
            notes: "General report entry awaiting review."
        }
    ];

    const tableBody = document.getElementById("reportsTableBody");
    const searchInput = document.getElementById("reportSearch");
    const statusFilter = document.getElementById("statusFilter");
    const typeFilter = document.getElementById("typeFilter");
    const emptyState = document.getElementById("emptyState");
    const resultsCount = document.getElementById("resultsCount");
    const modalElement = document.getElementById("reportDetailsModal");
    const reportModal = bootstrap.Modal.getOrCreateInstance(modalElement);

    let selectedReportId = null;

    const escapeHTML = (value) =>
        String(value).replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);

    const formatDate = (dateString) => {
        const date = new Date(`${dateString}T00:00:00`);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const statusLabel = (status) => ({
        pending: "Pending review",
        reviewed: "Reviewed",
        archived: "Archived"
    }[status] || status);

    function showToast(message) {
        const toast = document.getElementById("reportToast");
        if (!toast) {
            if (typeof window.showPortalNotice === "function") {
                window.showPortalNotice(message);
            }
            return;
        }

        toast.textContent = message;
        toast.classList.add("show");

        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    }

    function updateStatistics() {
        document.getElementById("totalReports").textContent = reports.length;
        document.getElementById("pendingReports").textContent =
            reports.filter(report => report.status === "pending").length;
        document.getElementById("reviewedReports").textContent =
            reports.filter(report => report.status === "reviewed").length;
        document.getElementById("archivedReports").textContent =
            reports.filter(report => report.status === "archived").length;
    }

    function getFilteredReports() {
        const query = searchInput.value.trim().toLowerCase();
        const status = statusFilter.value;
        const type = typeFilter.value;

        return reports.filter(report => {
            const searchable = [
                report.id,
                report.patient,
                report.patientId,
                report.type,
                report.doctor
            ].join(" ").toLowerCase();

            return searchable.includes(query) &&
                (status === "all" || report.status === status) &&
                (type === "all" || report.type === type);
        });
    }

    function renderReports() {
        const filteredReports = getFilteredReports();

        tableBody.innerHTML = filteredReports.map(report => `
            <tr>
                <td>
                    <strong>${escapeHTML(report.id)}</strong>
                    <div class="small text-secondary">${escapeHTML(report.patientId)}</div>
                </td>
                <td>${escapeHTML(report.patient)}</td>
                <td>${escapeHTML(report.type)}</td>
                <td>${escapeHTML(report.doctor)}</td>
                <td>${formatDate(report.date)}</td>
                <td>
                    <span class="status-badge status-${escapeHTML(report.status)}">
                        ${escapeHTML(statusLabel(report.status))}
                    </span>
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary view-report"
                            data-report-id="${escapeHTML(report.id)}">
                        Details
                    </button>
                </td>
            </tr>
        `).join("");

        resultsCount.textContent =
            `${filteredReports.length} ${filteredReports.length === 1 ? "report" : "reports"}`;

        emptyState.classList.toggle("d-none", filteredReports.length !== 0);
        tableBody.closest("table").classList.toggle("d-none", filteredReports.length === 0);
        updateStatistics();
    }

    function openReport(reportId) {
        const report = reports.find(item => item.id === reportId);
        if (!report) return;

        selectedReportId = reportId;
        document.getElementById("reportModalTitle").textContent = report.id;

        document.getElementById("reportDetailsBody").innerHTML = `
            <div class="report-detail-grid">
                <div><span>Patient</span><strong>${escapeHTML(report.patient)}</strong></div>
                <div><span>Patient ID</span><strong>${escapeHTML(report.patientId)}</strong></div>
                <div><span>Report type</span><strong>${escapeHTML(report.type)}</strong></div>
                <div><span>Requested by</span><strong>${escapeHTML(report.doctor)}</strong></div>
                <div><span>Report date</span><strong>${formatDate(report.date)}</strong></div>
                <div><span>Current status</span><strong>${escapeHTML(statusLabel(report.status))}</strong></div>
            </div>
            <hr>
            <h6>Notes</h6>
            <p class="text-secondary mb-0">${escapeHTML(report.notes)}</p>
            <div class="alert alert-light border mt-3 mb-0 small">
                <i class="bi bi-info-circle me-1"></i>
                This is a fictional interface demonstration, not a clinical report.
            </div>
        `;

        document.getElementById("markPendingButton").disabled = report.status === "pending";
        document.getElementById("markReviewedButton").disabled = report.status === "reviewed";
        document.getElementById("archiveReportButton").disabled = report.status === "archived";

        reportModal.show();
    }

    function changeSelectedStatus(newStatus) {
        const report = reports.find(item => item.id === selectedReportId);
        if (!report) return;

        report.status = newStatus;
        reportModal.hide();
        renderReports();

        const messages = {
            pending: "Report marked as pending review.",
            reviewed: "Report marked as reviewed in this demo.",
            archived: "Report archived in this demo."
        };

        showToast(messages[newStatus]);
    }

    tableBody.addEventListener("click", event => {
        const button = event.target.closest(".view-report");
        if (button) openReport(button.dataset.reportId);
    });

    searchInput.addEventListener("input", renderReports);
    statusFilter.addEventListener("change", renderReports);
    typeFilter.addEventListener("change", renderReports);

    function resetFilters() {
        searchInput.value = "";
        statusFilter.value = "all";
        typeFilter.value = "all";
        renderReports();
    }

    document.getElementById("resetFilters").addEventListener("click", resetFilters);
    document.getElementById("emptyResetButton").addEventListener("click", resetFilters);

    document.getElementById("markPendingButton").addEventListener("click", () => {
        changeSelectedStatus("pending");
    });

    document.getElementById("markReviewedButton").addEventListener("click", () => {
        changeSelectedStatus("reviewed");
    });

    document.getElementById("archiveReportButton").addEventListener("click", () => {
        changeSelectedStatus("archived");
    });

    document.getElementById("exportButton").addEventListener("click", () => {
        const filteredReports = getFilteredReports();
        const headings = ["Report ID", "Patient", "Patient ID", "Type", "Doctor", "Date", "Status"];

        const rows = filteredReports.map(report => [
            report.id,
            report.patient,
            report.patientId,
            report.type,
            report.doctor,
            report.date,
            statusLabel(report.status)
        ]);

        const csvCell = value => `"${String(value).replace(/"/g, '""')}"`;
        const csv = [headings, ...rows]
            .map(row => row.map(csvCell).join(","))
            .join("\r\n");

        const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "medintellix-demo-reports.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        showToast("Demo report list exported as CSV.");
    });

    renderReports();
});
