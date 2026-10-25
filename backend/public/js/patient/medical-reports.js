
/* =========================================
   MedIntelliX — Medical Reports
   File: js/patient/medical-reports.js
   DEMO DATA ONLY
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const list = document.getElementById("reportsList");
    const search = document.getElementById("reportSearch");
    const filter = document.getElementById("reportTypeFilter");
    const emptyState = document.getElementById("reportsEmpty");

    if (!list || !search || !filter || !emptyState) {
        return;
    }

    const cards = Array.from(list.querySelectorAll(".report-card"));

    const year = document.getElementById("reportsYear");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    const totalReports = document.getElementById("totalReports");
    const labReports = document.getElementById("labReports");

    if (totalReports) {
        totalReports.textContent = String(cards.length);
    }

    if (labReports) {
        labReports.textContent = String(
            cards.filter(function (card) {
                return card.dataset.type === "lab";
            }).length
        );
    }

    function filterReports() {
        const term = search.value.trim().toLowerCase();
        const selectedType = filter.value;
        let visibleCount = 0;

        cards.forEach(function (card) {
            const searchableText = (
                card.dataset.search + " " + card.textContent
            ).toLowerCase();

            const matchesSearch = searchableText.includes(term);
            const matchesType =
                selectedType === "all" ||
                card.dataset.type === selectedType;

            const visible = matchesSearch && matchesType;

            card.hidden = !visible;

            if (visible) {
                visibleCount++;
            }
        });

        emptyState.style.display = visibleCount === 0 ? "block" : "none";
    }

    function showReportSummary(card) {
        const title = card.querySelector(".report-heading h2");
        const date = card.querySelector(".report-heading p");
        const type = card.querySelector(".report-type-badge");
        const facility = card.querySelector(".report-meta span");

        const modalTitle = document.getElementById("reportModalTitle");
        const modalBody = document.getElementById("reportModalBody");
        const modalElement = document.getElementById("reportDetailsModal");

        if (!modalTitle || !modalBody || !modalElement || !title) {
            return;
        }

        modalTitle.textContent = title.textContent.trim();
        modalBody.replaceChildren();

        const warning = document.createElement("p");
        warning.className = "small text-secondary";
        warning.textContent =
            "Fictional demonstration entry. No real test results or clinical interpretation are available.";

        const reportType = document.createElement("p");
        reportType.textContent = "Category: " +
            (type ? type.textContent.trim() : "Not specified");

        const reportDate = document.createElement("p");
        reportDate.textContent = date
            ? date.textContent.trim()
            : "Date not specified";

        const reportFacility = document.createElement("p");
        reportFacility.textContent = facility
            ? facility.textContent.trim()
            : "Facility not specified";

        modalBody.append(
            warning,
            reportType,
            reportDate,
            reportFacility
        );

        if (window.bootstrap) {
            window.bootstrap.Modal
                .getOrCreateInstance(modalElement)
                .show();
        }
    }

    search.addEventListener("input", filterReports);
    filter.addEventListener("change", filterReports);

    cards.forEach(function (card) {
        const button = card.querySelector(".report-view-button");

        if (button) {
            button.addEventListener("click", function () {
                showReportSummary(card);
            });
        }
    });

    filterReports();
});
