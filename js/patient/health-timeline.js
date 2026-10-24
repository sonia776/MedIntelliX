
document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // Update the footer year.
    const yearElement = document.getElementById("timelineYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Fictional demonstration events only.
    // Dates use YYYY-MM-DD for reliable chronological sorting.
    const timelineEvents = [
        {
            id: 1,
            date: "2026-10-09",
            type: "follow-up",
            title: "Routine follow-up",
            description:
                "A sample follow-up visit to review progress and discuss the next steps in care.",
            source: "Sample Medical Centre",
            note: "This is fictional demonstration information."
        },
        {
            id: 2,
            date: "2026-10-05",
            type: "report",
            title: "Complete Blood Count (CBC)",
            description:
                "A sample laboratory report entry showing where blood test reports can appear in the patient's timeline.",
            source: "Example Diagnostic Laboratory",
            note: "No actual laboratory values are included in this demonstration."
        },
        {
            id: 3,
            date: "2026-09-22",
            type: "consultation",
            title: "General consultation",
            description:
                "A sample consultation record with a healthcare provider and a summary of the visit.",
            source: "Example Health Centre",
            note: "Consultation notes would be available here once a secure backend is connected."
        },
        {
            id: 4,
            date: "2026-09-18",
            type: "diagnosis",
            title: "Clinical assessment recorded",
            description:
                "A demonstration entry representing a clinician-recorded assessment in the health record.",
            source: "Example Health Centre",
            note: "This is not a real diagnosis or a recommendation for treatment."
        },
        {
            id: 5,
            date: "2026-08-30",
            type: "report",
            title: "Basic Metabolic Panel (BMP)",
            description:
                "A sample medical report entry representing a laboratory test added to the patient's record.",
            source: "Example Diagnostic Laboratory",
            note: "This demonstration contains no real test results."
        },
        {
            id: 6,
            date: "2026-08-12",
            type: "consultation",
            title: "Initial health consultation",
            description:
                "A sample entry representing an initial consultation and the creation of a health record.",
            source: "Example Health Centre",
            note: "Real consultation records require authorised access and secure storage."
        }
    ];

    const searchInput = document.getElementById("timelineSearch");
    const typeFilter = document.getElementById("timelineTypeFilter");
    const sortSelect = document.getElementById("timelineSort");
    const timelineList = document.getElementById("timelineList");
    const emptyState = document.getElementById("timelineEmpty");
    const resultLabel = document.getElementById("timelineResultLabel");
    const clearButton = document.getElementById("clearTimelineFilters");

    const totalEventsElement = document.getElementById("totalEvents");
    const reportEventsElement = document.getElementById("reportEvents");
    const consultationEventsElement =
        document.getElementById("consultationEvents");

    const detailsModalElement =
        document.getElementById("timelineDetailsModal");

    const modal = detailsModalElement && window.bootstrap
        ? new bootstrap.Modal(detailsModalElement)
        : null;

    const modalTitle = document.getElementById("timelineModalTitle");
    const modalType = document.getElementById("timelineModalType");
    const modalDate = document.getElementById("timelineModalDate");
    const modalDescription =
        document.getElementById("timelineModalDescription");
    const modalSource = document.getElementById("timelineModalSource");
    const modalNote = document.getElementById("timelineModalNote");

    const typeLabels = {
        consultation: "Consultation",
        report: "Medical report",
        diagnosis: "Clinical assessment",
        "follow-up": "Follow-up"
    };

    const typeIcons = {
        consultation: "bi-person-lines-fill",
        report: "bi-file-earmark-medical",
        diagnosis: "bi-clipboard2-pulse",
        "follow-up": "bi-arrow-repeat"
    };

    // Format dates in a readable way without changing the stored date.
    function formatDate(dateString) {
        const parts = dateString.split("-").map(Number);

        // Use local date components to avoid timezone date shifts.
        const date = new Date(parts[0], parts[1] - 1, parts[2]);

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    // Update the three summary cards.
    function updateSummary() {
        if (totalEventsElement) {
            totalEventsElement.textContent = timelineEvents.length;
        }

        if (reportEventsElement) {
            reportEventsElement.textContent = timelineEvents.filter(
                event => event.type === "report"
            ).length;
        }

        if (consultationEventsElement) {
            consultationEventsElement.textContent = timelineEvents.filter(
                event => event.type === "consultation"
            ).length;
        }
    }

    // Create an individual event using DOM methods and textContent.
    function createTimelineEvent(event) {
        const article = document.createElement("article");
        article.className = "timeline-event";

        const marker = document.createElement("span");
        marker.className = `timeline-marker ${event.type}`;
        marker.setAttribute("aria-hidden", "true");

        const markerIcon = document.createElement("i");
        markerIcon.className = `bi ${typeIcons[event.type]}`;
        marker.appendChild(markerIcon);

        const card = document.createElement("div");
        card.className = "timeline-event-card";

        const top = document.createElement("div");
        top.className = "timeline-event-top";

        const headingGroup = document.createElement("div");

        const title = document.createElement("h3");
        title.className = "timeline-event-title";
        title.textContent = event.title;

        const date = document.createElement("div");
        date.className = "timeline-event-date";

        const dateIcon = document.createElement("i");
        dateIcon.className = "bi bi-calendar3 me-2";
        dateIcon.setAttribute("aria-hidden", "true");

        date.append(dateIcon, document.createTextNode(formatDate(event.date)));

        headingGroup.append(title, date);

        const badge = document.createElement("span");
        badge.className = `timeline-type ${event.type}`;
        badge.textContent = typeLabels[event.type];

        top.append(headingGroup, badge);

        const description = document.createElement("p");
        description.className = "timeline-event-description";
        description.textContent = event.description;

        const footer = document.createElement("div");
        footer.className = "timeline-event-footer";

        const source = document.createElement("span");
        source.className = "timeline-source";

        const sourceIcon = document.createElement("i");
        sourceIcon.className = "bi bi-hospital me-2";
        sourceIcon.setAttribute("aria-hidden", "true");

        source.append(
            sourceIcon,
            document.createTextNode(event.source)
        );

        const detailsButton = document.createElement("button");
        detailsButton.type = "button";
        detailsButton.className = "timeline-details-button";
        detailsButton.textContent = "View details ";

        const arrow = document.createElement("i");
        arrow.className = "bi bi-arrow-right";
        arrow.setAttribute("aria-hidden", "true");

        detailsButton.appendChild(arrow);

        detailsButton.addEventListener("click", function () {
            showEventDetails(event);
        });

        footer.append(source, detailsButton);
        card.append(top, description, footer);
        article.append(marker, card);

        return article;
    }

    // Render an event's details in the Bootstrap modal.
    function showEventDetails(event) {
        if (!modal) {
            return;
        }

        modalTitle.textContent = event.title;
        modalType.textContent = typeLabels[event.type];
        modalDate.textContent = formatDate(event.date);
        modalDescription.textContent = event.description;
        modalSource.textContent = event.source;
        modalNote.textContent = event.note;

        modal.show();
    }

    // Search, filter and sort the timeline.
    function renderTimeline() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const selectedType = typeFilter.value;
        const sortOrder = sortSelect.value;

        let filteredEvents = timelineEvents.filter(function (event) {
            const searchableText = [
                event.title,
                event.description,
                event.source,
                event.date,
                formatDate(event.date),
                typeLabels[event.type]
            ].join(" ").toLowerCase();

            const matchesSearch = searchableText.includes(searchTerm);

            const matchesType =
                selectedType === "all" || event.type === selectedType;

            return matchesSearch && matchesType;
        });

        filteredEvents.sort(function (a, b) {
            const comparison = a.date.localeCompare(b.date);

            return sortOrder === "oldest" ? comparison : -comparison;
        });

        // Clear previous events.
        timelineList.replaceChildren();

        // Add matching events.
        filteredEvents.forEach(function (event) {
            timelineList.appendChild(createTimelineEvent(event));
        });

        const hasEvents = filteredEvents.length > 0;

        timelineList.hidden = !hasEvents;
        emptyState.hidden = hasEvents;

        if (resultLabel) {
            resultLabel.textContent =
                `Showing ${filteredEvents.length} of ${timelineEvents.length} sample events`;
        }
    }

    // Connect all controls.
    searchInput.addEventListener("input", renderTimeline);
    typeFilter.addEventListener("change", renderTimeline);
    sortSelect.addEventListener("change", renderTimeline);

    clearButton.addEventListener("click", function () {
        searchInput.value = "";
        typeFilter.value = "all";
        sortSelect.value = "newest";
        renderTimeline();
        searchInput.focus();
    });

    // Initial page setup.
    updateSummary();
    renderTimeline();
});
