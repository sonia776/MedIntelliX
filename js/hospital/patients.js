
document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const patients = [
        {
            id: "MIX-P1001",
            name: "Aarav Sharma",
            initials: "AS",
            email: "aarav.sharma@example.com",
            phone: "+91 90000 10001",
            age: 28,
            gender: "Male",
            enrolledOn: "2026-08-12",
            lastVisit: "2026-10-14",
            status: "active",
            bloodGroup: "O+",
            city: "New Delhi",
            emergencyContact: "Demo contact — not provided"
        },
        {
            id: "MIX-P1002",
            name: "Ananya Verma",
            initials: "AV",
            email: "ananya.verma@example.com",
            phone: "+91 90000 10002",
            age: 35,
            gender: "Female",
            enrolledOn: "2026-08-18",
            lastVisit: "2026-10-10",
            status: "active",
            bloodGroup: "A+",
            city: "Noida",
            emergencyContact: "Demo contact — not provided"
        },
        {
            id: "MIX-P1003",
            name: "Rohan Mehta",
            initials: "RM",
            email: "rohan.mehta@example.com",
            phone: "+91 90000 10003",
            age: 42,
            gender: "Male",
            enrolledOn: "2026-09-02",
            lastVisit: "2026-10-08",
            status: "pending",
            bloodGroup: "B+",
            city: "Gurugram",
            emergencyContact: "Demo contact — not provided"
        },
        {
            id: "MIX-P1004",
            name: "Isha Kapoor",
            initials: "IK",
            email: "isha.kapoor@example.com",
            phone: "+91 90000 10004",
            age: 24,
            gender: "Female",
            enrolledOn: "2026-09-07",
            lastVisit: "2026-10-12",
            status: "active",
            bloodGroup: "AB+",
            city: "New Delhi",
            emergencyContact: "Demo contact — not provided"
        },
        {
            id: "MIX-P1005",
            name: "Kabir Malhotra",
            initials: "KM",
            email: "kabir.malhotra@example.com",
            phone: "+91 90000 10005",
            age: 51,
            gender: "Male",
            enrolledOn: "2026-09-15",
            lastVisit: "2026-09-28",
            status: "inactive",
            bloodGroup: "O-",
            city: "Faridabad",
            emergencyContact: "Demo contact — not provided"
        },
        {
            id: "MIX-P1006",
            name: "Meera Iyer",
            initials: "MI",
            email: "meera.iyer@example.com",
            phone: "+91 90000 10006",
            age: 31,
            gender: "Female",
            enrolledOn: "2026-09-21",
            lastVisit: "2026-10-16",
            status: "active",
            bloodGroup: "A-",
            city: "New Delhi",
            emergencyContact: "Demo contact — not provided"
        },
        {
            id: "MIX-P1007",
            name: "Dev Patel",
            initials: "DP",
            email: "dev.patel@example.com",
            phone: "+91 90000 10007",
            age: 39,
            gender: "Male",
            enrolledOn: "2026-10-03",
            lastVisit: "Not recorded",
            status: "pending",
            bloodGroup: "Not recorded",
            city: "Ghaziabad",
            emergencyContact: "Demo contact — not provided"
        },
        {
            id: "MIX-P1008",
            name: "Sana Khan",
            initials: "SK",
            email: "sana.khan@example.com",
            phone: "+91 90000 10008",
            age: 27,
            gender: "Female",
            enrolledOn: "2026-10-05",
            lastVisit: "2026-10-17",
            status: "active",
            bloodGroup: "B-",
            city: "Noida",
            emergencyContact: "Demo contact — not provided"
        }
    ];

    const tableBody = document.getElementById("patientTableBody");
    const searchInput = document.getElementById("patientSearch");
    const statusFilter = document.getElementById("statusFilter");
    const resultsCount = document.getElementById("resultsCount");
    const emptyState = document.getElementById("emptyPatients");
    const totalElement = document.getElementById("totalPatients");
    const activeElement = document.getElementById("activePatients");
    const pendingElement = document.getElementById("pendingPatients");
    const detailsBody = document.getElementById("patientDetailsBody");
    const detailsTitle = document.getElementById("patientDetailsTitle");

    const modalElement = document.getElementById("patientDetailsModal");
    const detailsModal = modalElement && window.bootstrap
        ? new bootstrap.Modal(modalElement)
        : null;

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
        if (!dateString || dateString === "Not recorded") {
            return "Not recorded";
        }

        const parts = dateString.split("-");
        if (parts.length !== 3) {
            return dateString;
        }

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

    function getStatusLabel(status) {
        const labels = {
            active: "Active",
            pending: "Pending",
            inactive: "Inactive"
        };

        return labels[status] || "Unknown";
    }

    function getFilteredPatients() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value;

        return patients.filter(function (patient) {
            const searchableText = [
                patient.name,
                patient.id,
                patient.email,
                patient.city
            ].join(" ").toLowerCase();

            const matchesSearch = searchableText.includes(query);
            const matchesStatus =
                selectedStatus === "all" ||
                patient.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });
    }

    function renderPatients() {
        const filteredPatients = getFilteredPatients();

        tableBody.innerHTML = "";

        filteredPatients.forEach(function (patient) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <div class="patient-identity">
                        <div class="patient-avatar">
                            ${escapeHTML(patient.initials)}
                        </div>
                        <div>
                            <div class="patient-name">
                                ${escapeHTML(patient.name)}
                            </div>
                            <div class="patient-id">
                                ${escapeHTML(patient.id)}
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    ${escapeHTML(patient.age)} years<br>
                    <span class="text-secondary">
                        ${escapeHTML(patient.gender)}
                    </span>
                </td>
                <td>${escapeHTML(formatDate(patient.enrolledOn))}</td>
                <td>${escapeHTML(formatDate(patient.lastVisit))}</td>
                <td>
                    <span class="patient-status ${escapeHTML(patient.status)}">
                        <i class="bi bi-circle-fill" style="font-size:6px;"></i>
                        ${escapeHTML(getStatusLabel(patient.status))}
                    </span>
                </td>
                <td>
                    <button type="button"
                            class="patient-action-btn"
                            data-patient-id="${escapeHTML(patient.id)}"
                            aria-label="View ${escapeHTML(patient.name)} details"
                            title="View patient details">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        const count = filteredPatients.length;
        resultsCount.textContent =
            `Showing ${count} of ${patients.length} demo patients`;

        emptyState.classList.toggle("d-none", count !== 0);
        tableBody.classList.toggle("d-none", count === 0);
    }

    function renderSummary() {
        totalElement.textContent = patients.length;

        activeElement.textContent = patients.filter(function (patient) {
            return patient.status === "active";
        }).length;

        pendingElement.textContent = patients.filter(function (patient) {
            return patient.status === "pending";
        }).length;
    }

    function showPatientDetails(patientId) {
        const patient = patients.find(function (item) {
            return item.id === patientId;
        });

        if (!patient || !detailsModal) {
            return;
        }

        detailsTitle.textContent = patient.name;

        detailsBody.innerHTML = `
            <div class="d-flex align-items-center gap-3 mb-4">
                <div class="patient-avatar" style="width:56px;height:56px;font-size:16px;">
                    ${escapeHTML(patient.initials)}
                </div>
                <div>
                    <h3 class="h5 fw-bold mb-1">${escapeHTML(patient.name)}</h3>
                    <div class="text-secondary small">
                        Patient ID: ${escapeHTML(patient.id)}
                    </div>
                    <span class="patient-status ${escapeHTML(patient.status)} mt-2">
                        ${escapeHTML(getStatusLabel(patient.status))}
                    </span>
                </div>
            </div>

            <div class="row g-3">
                <div class="col-12 col-md-6">
                    <section class="detail-section">
                        <h3><i class="bi bi-person me-2"></i>Personal information</h3>
                        <div class="mb-3">
                            <div class="patient-detail-label">Age / Gender</div>
                            <div class="patient-detail-value">
                                ${escapeHTML(patient.age)} years · ${escapeHTML(patient.gender)}
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="patient-detail-label">City</div>
                            <div class="patient-detail-value">${escapeHTML(patient.city)}</div>
                        </div>
                        <div>
                            <div class="patient-detail-label">Blood group</div>
                            <div class="patient-detail-value">${escapeHTML(patient.bloodGroup)}</div>
                        </div>
                    </section>
                </div>

                <div class="col-12 col-md-6">
                    <section class="detail-section">
                        <h3><i class="bi bi-telephone me-2"></i>Contact information</h3>
                        <div class="mb-3">
                            <div class="patient-detail-label">Email</div>
                            <div class="patient-detail-value">${escapeHTML(patient.email)}</div>
                        </div>
                        <div class="mb-3">
                            <div class="patient-detail-label">Phone</div>
                            <div class="patient-detail-value">${escapeHTML(patient.phone)}</div>
                        </div>
                        <div>
                            <div class="patient-detail-label">Emergency contact</div>
                            <div class="patient-detail-value">${escapeHTML(patient.emergencyContact)}</div>
                        </div>
                    </section>
                </div>

                <div class="col-12">
                    <section class="detail-section">
                        <h3><i class="bi bi-clipboard2-check me-2"></i>Enrolment information</h3>
                        <div class="row g-3">
                            <div class="col-6">
                                <div class="patient-detail-label">Enrolled on</div>
                                <div class="patient-detail-value">
                                    ${escapeHTML(formatDate(patient.enrolledOn))}
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="patient-detail-label">Last visit</div>
                                <div class="patient-detail-value">
                                    ${escapeHTML(formatDate(patient.lastVisit))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <div class="alert alert-info mt-3 mb-0 small">
                <i class="bi bi-info-circle me-2"></i>
                This is fictional demonstration data. No medical record has been accessed.
            </div>
        `;

        detailsModal.show();
    }

    function resetFilters() {
        searchInput.value = "";
        statusFilter.value = "all";
        renderPatients();
    }

    searchInput.addEventListener("input", renderPatients);
    statusFilter.addEventListener("change", renderPatients);

    document.getElementById("resetFilters").addEventListener("click", resetFilters);
    document.getElementById("emptyReset").addEventListener("click", resetFilters);

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("[data-patient-id]");

        if (button) {
            showPatientDetails(button.dataset.patientId);
        }
    });

    renderSummary();
    renderPatients();
});
