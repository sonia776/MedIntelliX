
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const regions = [
        { name: "North Region", coverage: 86, screening: 77, followup: 81, readiness: 82 },
        { name: "South Region", coverage: 89, screening: 84, followup: 86, readiness: 88 },
        { name: "East Region", coverage: 72, screening: 65, followup: 69, readiness: 69 },
        { name: "West Region", coverage: 81, screening: 75, followup: 78, readiness: 79 },
        { name: "Central Region", coverage: 65, screening: 62, followup: 63, readiness: 63 }
    ];

    const indicatorNames = {
        coverage: "Healthcare coverage",
        screening: "Preventive screening",
        followup: "Follow-up completion",
        readiness: "Facility readiness"
    };

    const elements = {
        period: document.getElementById("periodFilter"),
        indicator: document.getElementById("indicatorFilter"),
        reset: document.getElementById("resetStatistics"),
        search: document.getElementById("statisticsSearch"),
        chart: document.getElementById("statisticsChart"),
        chartTitle: document.getElementById("statisticsChartTitle"),
        insights: document.getElementById("statisticsInsights"),
        tableBody: document.getElementById("statisticsTableBody"),
        emptyState: document.getElementById("statisticsEmptyState"),
        coverage: document.getElementById("populationCoverage"),
        screening: document.getElementById("screeningParticipation"),
        followup: document.getElementById("followupCompletion"),
        readiness: document.getElementById("facilityReadiness")
    };

    function getPeriodFactor() {
        return {
            month: 1,
            quarter: 1.02,
            year: 1.04
        }[elements.period.value] || 1;
    }

    function getValue(region, indicator) {
        return Math.min(100, Math.round(region[indicator] * getPeriodFactor()));
    }

    function average(indicator) {
        return Math.round(
            regions.reduce((sum, region) => sum + getValue(region, indicator), 0) /
            regions.length
        );
    }

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

        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    }

    function renderSummary() {
        elements.coverage.textContent = average("coverage") + "%";
        elements.screening.textContent = average("screening") + "%";
        elements.followup.textContent = average("followup") + "%";
        elements.readiness.textContent = average("readiness") + "%";
    }

    function renderChart() {
        const indicator = elements.indicator.value;
        const sortedRegions = [...regions].sort(
            (a, b) => getValue(b, indicator) - getValue(a, indicator)
        );

        elements.chartTitle.textContent = indicatorNames[indicator] + " by region";

        elements.chart.innerHTML = sortedRegions.map(region => {
            const value = getValue(region, indicator);

            return `
                <div class="statistics-bar-row">
                    <span class="statistics-bar-label">${escapeHTML(region.name)}</span>
                    <div class="statistics-bar-track"
                         role="img"
                         aria-label="${escapeHTML(region.name)}: ${value}%">
                        <div class="statistics-bar-fill" style="width:${value}%"></div>
                    </div>
                    <strong class="statistics-bar-value">${value}%</strong>
                </div>
            `;
        }).join("");
    }

    function renderInsights() {
        const indicator = elements.indicator.value;
        const sorted = [...regions].sort(
            (a, b) => getValue(b, indicator) - getValue(a, indicator)
        );

        const highest = sorted[0];
        const lowest = sorted[sorted.length - 1];
        const gap = getValue(highest, indicator) - getValue(lowest, indicator);

        const messages = [
            {
                icon: "bi-trophy",
                title: "Highest sample indicator",
                text: `${highest.name} records ${getValue(highest, indicator)}% for ${indicatorNames[indicator].toLowerCase()}.`
            },
            {
                icon: "bi-clipboard-data",
                title: "Potential review area",
                text: `${lowest.name} records ${getValue(lowest, indicator)}%. Further investigation would be needed before drawing conclusions.`
            },
            {
                icon: "bi-arrows-expand",
                title: "Difference between regions",
                text: `The illustrative difference between the highest and lowest values is ${gap} percentage points.`
            }
        ];

        elements.insights.innerHTML = messages.map(message => `
            <div class="statistics-insight">
                <span class="statistics-insight-icon"><i class="bi ${message.icon}"></i></span>
                <div>
                    <strong>${escapeHTML(message.title)}</strong>
                    <p>${escapeHTML(message.text)}</p>
                </div>
            </div>
        `).join("");
    }

    function getStatus(region) {
        const value = getValue(region, elements.indicator.value);

        if (value >= 80) return { label: "Higher indicator", className: "status-on-track" };
        if (value >= 70) return { label: "Moderate indicator", className: "status-review" };

        return { label: "Needs investigation", className: "status-delayed" };
    }

    function renderTable() {
        const query = elements.search.value.trim().toLowerCase();

        const filtered = regions.filter(region =>
            region.name.toLowerCase().includes(query)
        );

        elements.tableBody.innerHTML = filtered.map(region => {
            const status = getStatus(region);

            return `
                <tr>
                    <td><strong>${escapeHTML(region.name)}</strong></td>
                    <td>${getValue(region, "coverage")}%</td>
                    <td>${getValue(region, "screening")}%</td>
                    <td>${getValue(region, "followup")}%</td>
                    <td>${getValue(region, "readiness")}%</td>
                    <td>
                        <span class="government-status ${status.className}">
                            ${escapeHTML(status.label)}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");

        elements.emptyState.hidden = filtered.length > 0;
    }

    function renderAll() {
        renderSummary();
        renderChart();
        renderInsights();
        renderTable();
    }

    elements.period.addEventListener("change", renderAll);
    elements.indicator.addEventListener("change", renderAll);
    elements.search.addEventListener("input", renderTable);

    elements.reset.addEventListener("click", () => {
        elements.period.value = "month";
        elements.indicator.value = "coverage";
        elements.search.value = "";
        renderAll();
        showToast("Statistics filters have been reset.");
    });

    renderAll();
});
