
/* =========================================
   MedIntelliX — Health Records
   File: js/patient/health-records.js
   DEMO DATA ONLY
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const recordsList = document.getElementById("recordsList");
    const searchInput = document.getElementById("recordSearch");
    const typeFilter = document.getElementById("recordTypeFilter");
    const emptyState = document.getElementById("recordEmpty");

    if (!recordsList || !searchInput || !typeFilter || !emptyState) {
        return;
    }

    const records = Array.from(
        recordsList.querySelectorAll(".record-card")
    );

    const yearElement = document.getElementById("recordsYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    updateSummary();

    function filterRecords() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const selectedType = typeFilter.value;

        let visibleCount = 0;

        records.forEach(function (record) {
            const searchableText = (
                record.dataset.search + " " + record.textContent
            ).toLowerCase();

            const matchesSearch = searchableText.includes(searchTerm);

            const matchesType =
                selectedType === "all" ||
                record.dataset.type === selectedType;

            const shouldShow = matchesSearch && matchesType;

            record.hidden = !shouldShow;

            if (shouldShow) {
                visibleCount++;
            }
        });

        emptyState.style.display =
            visibleCount === 0 ? "block" : "none";
    }

    function updateSummary() {
        const totalElement = document.getElementById("totalRecords");
        const consultationsElement =
            document.getElementById("consultationCount");
        const facilitiesElement =
            document.getElementById("facilityCount");

        const consultations = records.filter(function (record) {
            return record.dataset.type === "consultation";
        });

        const facilities = new Set();

        records.forEach(function (record) {
            const facilityElement = record.querySelector(
                ".record-details .record-detail:nth-child(2)"
            );

            if (facilityElement) {
                facilities.add(facilityElement.textContent.trim());
            }
        });

        if (totalElement) {
            totalElement.textContent = String(records.length);
        }

        if (consultationsElement) {
            consultationsElement.textContent = String(consultations.length);
        }

        if (facilitiesElement) {
            facilitiesElement.textContent = String(facilities.size);
        }
    }

    function showRecordDetails(record) {
        const titleElement = record.querySelector(".record-card-title h2");
        const descriptionElement = record.querySelector(".record-description");
        const dateElement = record.querySelector(".record-card-title p");

        const modalTitle = document.getElementById("recordModalTitle");
        const modalBody = document.getElementById("recordModalBody");

        if (!modalTitle || !modalBody || !titleElement || !descriptionElement) {
            return;
        }

        // Use textContent so record text is not interpreted as HTML.
        modalTitle.textContent = titleElement.textContent.trim();
        modalBody.replaceChildren();

        const notice = document.createElement("p");
        notice.className = "small text-secondary";
        notice.textContent =
            "Fictional demonstration content — not a real medical record.";

        const description = document.createElement("p");
        description.textContent = descriptionElement.textContent.trim();

        modalBody.append(notice, description);

        if (dateElement) {
            const date = document.createElement("p");
            date.className = "small text-secondary mb-0";
            date.textContent = dateElement.textContent.trim();
            modalBody.appendChild(date);
        }

        const modalElement = document.getElementById("recordDetailsModal");

        if (modalElement && window.bootstrap) {
            window.bootstrap.Modal.getOrCreateInstance(modalElement).show();
        }
    }

    searchInput.addEventListener("input", filterRecords);
    typeFilter.addEventListener("change", filterRecords);

    records.forEach(function (record) {
        const button = record.querySelector(".record-view-button");

        if (button) {
            button.addEventListener("click", function () {
                showRecordDetails(record);
            });
        }
    });

    filterRecords();
});
