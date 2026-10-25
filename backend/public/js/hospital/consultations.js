
document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const consultations = [
        {
            id: "CON-2001",
            patient: "Aarav Sharma",
            patientId: "MIX-P1001",
            initials: "AS",
            doctor: "Dr. Priya Nair",
            date: "2026-10-20",
            time: "09:30",
            type: "General medicine",
            status: "scheduled",
            duration: "20 minutes",
            department: "General Medicine",
            notes: "Routine follow-up — fictional demo entry."
        },
        {
            id: "CON-2002",
            patient: "Ananya Verma",
            patientId: "MIX-P1002",
            initials: "AV",
            doctor: "Dr. Rahul Khanna",
            date: "2026-10-20",
            time: "10:00",
            type: "Cardiology",
            status: "in-progress",
            duration: "30 minutes",
            department: "Cardiology",
            notes: "Example consultation entry. No clinical information recorded."
        },
        {
            id: "CON-2003",
            patient: "Rohan Mehta",
            patientId: "MIX-P1003",
            initials: "RM",
            doctor: "Dr. Meera Joshi",
            date: "2026-10-20",
            time: "10:45",
            type: "General medicine",
            status: "completed",
            duration: "20 minutes",
            department: "General Medicine",
            notes: "Demo session marked complete."
        },
        {
            id: "CON-2004",
            patient: "Isha Kapoor",
            patientId: "MIX-P1004",
            initials: "IK",
            doctor: "Dr. Priya Nair",
            date: "2026-10-20",
            time: "11:15",
            type: "Dermatology",
            status: "scheduled",
            duration: "25 minutes",
            department: "Dermatology",
            notes: "Fictional appointment entry."
        },
        {
            id: "CON-2005",
            patient: "Kabir Malhotra",
            patientId: "MIX-P1005",
            initials: "KM",
            doctor: "Dr. Rahul Khanna",
            date: "2026-10-19",
            time: "14:00",
            type: "Cardiology",
            status: "cancelled",
            duration: "30 minutes",
            department: "Cardiology",
            notes: "Demo appointment cancelled."
        },
        {
            id: "CON-2006",
            patient: "Meera Iyer",
            patientId: "MIX-P1006",
            initials: "MI",
            doctor: "Dr. Meera Joshi",
            date: "2026-10-19",
            time: "15:30",
            type: "General medicine",
            status: "completed",
            duration: "20 minutes",
            department: "General Medicine",
            notes: "Demo session marked complete."
        },
        {
            id: "CON-2007",
            patient: "Dev Patel",
            patientId: "MIX-P1007",
            initials: "DP",
            doctor: "Dr. Priya Nair",
            date: "2026-10-18",
            time: "09:00",
            type: "Preventive care",
            status: "no-show",
            duration: "20 minutes",
            department: "Preventive Care",
            notes: "Demo appointment marked as no-show."
        },
        {
            id: "CON-2008",
            patient: "Sana Khan",
            patientId: "MIX-P1008",
            initials: "SK",
            doctor: "Dr. Meera Joshi",
            date: "2026-10-21",
            time: "12:00",
            type: "Dermatology",
            status: "scheduled",
            duration: "25 minutes",
            department: "Dermatology",
            notes: "Upcoming fictional consultation."
        }
    ];

    const tableBody = document.getElementById("consultationTableBody");
    const searchInput = document.getElementById("consultationSearch");
    const statusFilter = document.getElementById("statusFilter");
    const dateFilter = document.getElementById("dateFilter");
    const resultsCount = document.getElementById("resultsCount");
    const emptyState = document.getElementById("emptyConsultations");

    const modalElement = document.getElementById("consultationDetailsModal");
    const modal = window.bootstrap
        ? new bootstrap.Modal(modalElement)
        : null;

    const detailsTitle = document.getElementById("consultationDetailsTitle");
    const detailsBody = document.getElementById("consultationDetailsBody");
    const newStatusSelect = document.getElementById("newConsultationStatus");
    const saveStatusButton = document.getElementById("saveConsultationStatus");

    let selectedConsultationId = null;

    const yearElement = document.getElementById("hospitalYear");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        });
    }

    function formatDate(dateString) {
        const parts = dateString.split("-");

        return new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function formatTime(timeString) {
        const parts = timeString.split(":");
        const date = new Date();

        date.setHours(Number(parts[0]), Number(parts[1]), 0, 0);

        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    }

    function statusLabel(status) {
        const labels = {
            scheduled: "Scheduled",
            "in-progress": "In progress",
            completed: "Completed",
            cancelled: "Cancelled",
            "no-show": "No-show"
        };

        return labels[status] || "Unknown";
    }

    function updateSummary() {
        document.getElementById("totalConsultations").textContent =
            consultations.length;

        document.getElementById("scheduledConsultations").textContent =
            consultations.filter(item => item.status === "scheduled").length;

        document.getElementById("inProgressConsultations").textContent =
            consultations.filter(item => item.status === "in-progress").length;

        document.getElementById("completedConsultations").textContent =
            consultations.filter(item => item.status === "completed").length;
    }

    function getFilteredConsultations() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value;
        const selectedDate = dateFilter.value;

        return consultations
            .filter(function (item) {
                const searchable = [
                    item.id,
                    item.patient,
                    item.patientId,
                    item.doctor,
                    item.type,
                    item.department
                ].join(" ").toLowerCase();

                const matchesSearch = searchable.includes(query);
                const matchesStatus =
                    selectedStatus === "all" || item.status === selectedStatus;
                const matchesDate =
                    !selectedDate || item.date === selectedDate;

                return matchesSearch && matchesStatus && matchesDate;
            })
            .sort(function (a, b) {
                return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
            });
    }

    function renderConsultations() {
        const filtered = getFilteredConsultations();

        tableBody.innerHTML = "";

        filtered.forEach(function (item) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <div class="consultation-patient">
                        <div class="consultation-avatar">
                            ${escapeHTML(item.initials)}
                        </div>
                        <div>
                            <strong>${escapeHTML(item.patient)}</strong>
                            <small>${escapeHTML(item.patientId)}</small>
                        </div>
                    </div>
                </td>
                <td>${escapeHTML(item.doctor)}</td>
                <td>
                    <strong class="d-block text-dark fw-semibold">
                        ${escapeHTML(formatDate(item.date))}
                    </strong>
                    <span class="text-secondary small">
                        ${escapeHTML(formatTime(item.time))}
                    </span>
                </td>
                <td>${escapeHTML(item.type)}</td>
                <td>
                    <span class="consultation-status ${escapeHTML(item.status)}">
                        ${escapeHTML(statusLabel(item.status))}
                    </span>
                </td>
                <td>
                    <button type="button" class="consultation-action"
                            data-consultation-id="${escapeHTML(item.id)}">
                        <i class="bi bi-eye me-1"></i>Details
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        resultsCount.textContent =
            `Showing ${filtered.length} of ${consultations.length} demo consultations`;

        emptyState.classList.toggle("d-none", filtered.length !== 0);
        tableBody.classList.toggle("d-none", filtered.length === 0);
    }

    function showDetails(consultationId) {
        const item = consultations.find(function (entry) {
            return entry.id === consultationId;
        });

        if (!item || !modal) {
            return;
        }

        selectedConsultationId = item.id;
        detailsTitle.textContent = item.patient;
        newStatusSelect.value = item.status;

        detailsBody.innerHTML = `
            <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <div class="text-secondary small mb-1">Consultation ID</div>
                    <div class="fw-bold">${escapeHTML(item.id)}</div>
                    <div class="text-secondary small mt-1">
                        Patient ID: ${escapeHTML(item.patientId)}
                    </div>
                </div>
                <span class="consultation-status ${escapeHTML(item.status)}">
                    ${escapeHTML(statusLabel(item.status))}
                </span>
            </div>

            <div class="row g-3">
                <div class="col-12 col-md-6">
                    <div class="consultation-detail-card">
                        <h3 class="h6 fw-bold mb-3">
                            <i class="bi bi-person me-2"></i>Patient and clinician
                        </h3>
                        <div class="mb-3">
                            <div class="consultation-detail-label">Patient</div>
                            <div class="consultation-detail-value">
                                ${escapeHTML(item.patient)}
                            </div>
                        </div>
                        <div>
                            <div class="consultation-detail-label">Doctor</div>
                            <div class="consultation-detail-value">
                                ${escapeHTML(item.doctor)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-md-6">
                    <div class="consultation-detail-card">
                        <h3 class="h6 fw-bold mb-3">
                            <i class="bi bi-calendar-event me-2"></i>Schedule
                        </h3>
                        <div class="mb-3">
                            <div class="consultation-detail-label">Date and time</div>
                            <div class="consultation-detail-value">
                                ${escapeHTML(formatDate(item.date))},
                                ${escapeHTML(formatTime(item.time))}
                            </div>
                        </div>
                        <div>
                            <div class="consultation-detail-label">Estimated duration</div>
                            <div class="consultation-detail-value">
                                ${escapeHTML(item.duration)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12">
                    <div class="consultation-detail-card">
                        <h3 class="h6 fw-bold mb-3">
                            <i class="bi bi-clipboard2-pulse me-2"></i>Session information
                        </h3>
                        <div class="row g-3">
                            <div class="col-12 col-md-6">
                                <div class="consultation-detail-label">Consultation type</div>
                                <div class="consultation-detail-value">
                                    ${escapeHTML(item.type)}
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="consultation-detail-label">Department</div>
                                <div class="consultation-detail-value">
                                    ${escapeHTML(item.department)}
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="consultation-detail-label">Demo notes</div>
                                <div class="consultation-detail-value">
                                    ${escapeHTML(item.notes)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="alert alert-info small mt-3 mb-0">
                <i class="bi bi-info-circle me-2"></i>
                This is a fictional appointment. No real clinical record is displayed.
            </div>
        `;

        modal.show();
    }

    function resetFilters() {
        searchInput.value = "";
        statusFilter.value = "all";
        dateFilter.value = "";
        renderConsultations();
    }

    searchInput.addEventListener("input", renderConsultations);
    statusFilter.addEventListener("change", renderConsultations);
    dateFilter.addEventListener("change", renderConsultations);

    document.getElementById("resetFilters").addEventListener("click", resetFilters);
    document.getElementById("emptyReset").addEventListener("click", resetFilters);

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("[data-consultation-id]");

        if (button) {
            showDetails(button.dataset.consultationId);
        }
    });

    saveStatusButton.addEventListener("click", function () {
        const item = consultations.find(function (entry) {
            return entry.id === selectedConsultationId;
        });

        if (!item) {
            return;
        }

        item.status = newStatusSelect.value;

        updateSummary();
        renderConsultations();

        // Refresh the open modal's status badge.
        const statusBadge = detailsBody.querySelector(".consultation-status");

        if (statusBadge) {
            statusBadge.className =
                `consultation-status ${escapeHTML(item.status)}`;
            statusBadge.textContent = statusLabel(item.status);
        }

        // Inform the user that the change is only local.
        if (typeof window.showPortalNotice === "function") {
            window.showPortalNotice(
                "Demo consultation status updated in this page only. The change is not saved to a server.",
                "info"
            );
        }
    });

    updateSummary();
    renderConsultations();
});
