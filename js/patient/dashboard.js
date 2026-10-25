
/* =========================================
   MedIntelliX — Patient Dashboard
   File: js/patient/dashboard.js

   DEMO ONLY:
   All statistics and profile details below
   are fictional sample data.
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    initializeDashboardYear();
    initializePatientProfile();
    initializeDashboardStatistics();
});

/* ---------- Footer Year ---------- */

function initializeDashboardYear() {
    const yearElement = document.getElementById("dashboardYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

/* ---------- Patient Profile ---------- */

function initializePatientProfile() {
    let patientName = "Alex Morgan";

    // 1. Try reading logged-in user from localStorage
    const savedUserJson = localStorage.getItem("medintellix_user");
    if (savedUserJson) {
        try {
            const savedUser = JSON.parse(savedUserJson);
            if (savedUser && savedUser.full_name) {
                patientName = savedUser.full_name;
            }
        } catch (e) {
            console.error("Error reading saved user:", e);
        }
    }

    const patientNameElement = document.getElementById("patientName");
    const welcomeNameElement = document.getElementById("welcomeName");
    const initialsElement = document.getElementById("profileInitials");

    if (patientNameElement) {
        patientNameElement.textContent = patientName;
    }

    if (welcomeNameElement) {
        welcomeNameElement.textContent = getFirstName(patientName);
    }

    if (initialsElement) {
        initialsElement.textContent = getInitials(patientName);
    }
}

function getFirstName(fullName) {
    const cleanedName = fullName.trim();

    if (!cleanedName) {
        return "there";
    }

    return cleanedName.split(/\s+/)[0];
}

function getInitials(fullName) {
    const cleanedName = fullName.trim();

    if (!cleanedName) {
        return "MD";
    }

    return cleanedName
        .split(/\s+/)
        .slice(0, 2)
        .map(function (part) {
            return part.charAt(0).toUpperCase();
        })
        .join("");
}

/* ---------- Dashboard Statistics ---------- */

function initializeDashboardStatistics() {
    const token = localStorage.getItem("medintellix_token");
    const API_BASE = "http://localhost:5000";

    // If authenticated, fetch live stats from Sonia's backend
    if (token) {
        fetch(`${API_BASE}/api/patient/dashboard`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(res => {
            if (res.success && res.data) {
                const stats = res.data.statistics;
                updateStatistic("recordsCount", stats.records);
                updateStatistic("reportsCount", stats.reports);
                updateStatistic("medicationsCount", stats.medications);
                updateStatistic("appointmentsCount", stats.appointments);

                if (res.data.user && res.data.user.full_name) {
                    const patientNameElement = document.getElementById("patientName");
                    const welcomeNameElement = document.getElementById("welcomeName");
                    const initialsElement = document.getElementById("profileInitials");

                    if (patientNameElement) patientNameElement.textContent = res.data.user.full_name;
                    if (welcomeNameElement) welcomeNameElement.textContent = getFirstName(res.data.user.full_name);
                    if (initialsElement) initialsElement.textContent = getInitials(res.data.user.full_name);
                }
            }
        })
        .catch(err => {
            console.warn("Backend not reachable for dashboard stats, showing local values.", err);
            loadFallbackStatistics();
        });
    } else {
        loadFallbackStatistics();
    }
}

function loadFallbackStatistics() {
    const demoStatistics = {
        records: 8,
        reports: 4,
        medications: 2,
        appointments: 1
    };

    updateStatistic("recordsCount", demoStatistics.records);
    updateStatistic("reportsCount", demoStatistics.reports);
    updateStatistic("medicationsCount", demoStatistics.medications);
    updateStatistic("appointmentsCount", demoStatistics.appointments);
}

function updateStatistic(elementId, value) {
    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.textContent = String(value);
}

/* ==========================================================
   CATEGORY 6: AI MEDICAL HEALTH ASSISTANT (LLM API)
   Developer: Sonia (APIs & External Integrations)
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
    const API_BASE = "http://localhost:5000";

    // 1. SYMPTOM TRIAGE CONTROLLER
    const symptomsInput = document.getElementById("aiSymptomsInput");
    const btnAnalyze = document.getElementById("btnAnalyzeSymptoms");
    const symptomsResult = document.getElementById("aiSymptomsResult");

    async function analyzeSymptoms(symptomsText) {
        if (!symptomsText || !symptomsText.trim()) return;
        symptomsResult.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-teal" role="status" style="color: #0d9488;"></div>
                <p class="small text-muted mt-2">MedIntelliX AI analyzing clinical presentation and triage severity...</p>
            </div>
        `;

        try {
            const res = await fetch(`${API_BASE}/api/external/ai/symptom-triage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ symptoms: symptomsText })
            });
            const data = await res.json();

            if (!data.success) {
                symptomsResult.innerHTML = `<div class="alert alert-warning">${data.message}</div>`;
                return;
            }

            const badgeColor = data.triageLevel === "EMERGENCY" ? "bg-danger" : (data.triageLevel === "URGENT_ATTENTION" ? "bg-warning text-dark" : "bg-info text-dark");

            let conditionsHtml = "";
            if (data.possibleConditions && data.possibleConditions.length > 0) {
                conditionsHtml = `
                    <div class="mb-2">
                        <strong class="small d-block mb-1 text-secondary">Possible Differential Conditions:</strong>
                        <ul class="list-unstyled mb-0 small">
                            ${data.possibleConditions.map(c => `
                                <li class="mb-1 d-flex align-items-baseline gap-1">
                                    <span class="badge bg-light text-dark border">${c.likelihood || "Moderate"}</span>
                                    <span><strong>${c.name}:</strong> <span class="text-muted">${c.reason || ""}</span></span>
                                </li>
                            `).join("")}
                        </ul>
                    </div>
                `;
            }

            let recsHtml = "";
            if (data.recommendations && data.recommendations.length > 0) {
                recsHtml = `
                    <div class="p-2 rounded bg-light border mb-2 small">
                        <strong class="d-block mb-1 text-teal" style="color: #0d9488;"><i class="bi bi-clipboard2-check me-1"></i> Recommended Clinical Actions:</strong>
                        <ul class="mb-0 ps-3">
                            ${data.recommendations.map(r => `<li>${r}</li>`).join("")}
                        </ul>
                    </div>
                `;
            }

            let redFlagsHtml = "";
            if (data.redFlags && data.redFlags.length > 0) {
                redFlagsHtml = `
                    <div class="p-2 rounded bg-danger-subtle text-danger-emphasis small border border-danger-subtle mb-2">
                        <i class="bi bi-exclamation-triangle-fill me-1"></i><strong>Red Flag Warning Signs:</strong>
                        <ul class="mb-0 ps-3">
                            ${data.redFlags.map(rf => `<li>${rf}</li>`).join("")}
                        </ul>
                    </div>
                `;
            }

            symptomsResult.innerHTML = `
                <div class="ai-triage-output small">
                    <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                        <span class="badge ${badgeColor} px-2 py-1">${data.triageLevel.replace('_', ' ')}</span>
                        <span class="text-muted" style="font-size: 11px;"><i class="bi bi-stars text-teal"></i> ${data.source}</span>
                    </div>
                    <p class="mb-2 fw-semibold text-dark">${data.summary}</p>
                    ${redFlagsHtml}
                    ${conditionsHtml}
                    ${recsHtml}
                    <div class="text-muted mt-2 pt-1 border-top" style="font-size: 10px;">
                        <i class="bi bi-shield-lock me-1"></i> ${data.disclaimer}
                    </div>
                </div>
            `;
        } catch (err) {
            symptomsResult.innerHTML = `
                <div class="alert alert-danger rounded-3 small">
                    <i class="bi bi-x-circle me-1"></i> Failed to connect to MedIntelliX AI service. Make sure backend is active.
                </div>
            `;
        }
    }

    if (btnAnalyze && symptomsInput) {
        btnAnalyze.addEventListener("click", () => analyzeSymptoms(symptomsInput.value));
    }

    document.querySelectorAll(".ai-quick-symptom").forEach(btn => {
        btn.addEventListener("click", () => {
            symptomsInput.value = btn.dataset.symptom;
            analyzeSymptoms(btn.dataset.symptom);
        });
    });

    // 2. LAB REPORT EXPLAINER CONTROLLER
    const reportInput = document.getElementById("aiReportInput");
    const btnExplain = document.getElementById("btnExplainReport");
    const reportResult = document.getElementById("aiReportResult");

    async function explainLabReport(reportText) {
        if (!reportText || !reportText.trim()) return;
        reportResult.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-teal" role="status" style="color: #0d9488;"></div>
                <p class="small text-muted mt-2">Interpreting laboratory findings with clinical guidance...</p>
            </div>
        `;

        try {
            const res = await fetch(`${API_BASE}/api/external/ai/explain-report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reportText })
            });
            const data = await res.json();

            if (!data.success) {
                reportResult.innerHTML = `<div class="alert alert-warning">${data.message}</div>`;
                return;
            }

            let findingsHtml = "";
            if (data.keyFindings && data.keyFindings.length > 0) {
                findingsHtml = `
                    <div class="mb-2">
                        <strong class="small d-block mb-1 text-secondary">Key Test Parameters:</strong>
                        <ul class="list-unstyled mb-0 small">
                            ${data.keyFindings.map(f => `
                                <li class="mb-1 p-2 rounded bg-light border">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <strong class="text-dark">${f.parameter}</strong>
                                        <span class="badge bg-secondary-subtle text-secondary">Normal: ${f.normalRange}</span>
                                    </div>
                                    <div class="text-muted mt-1" style="font-size: 11px;">${f.clinicalNote}</div>
                                </li>
                            `).join("")}
                        </ul>
                    </div>
                `;
            }

            let adviceHtml = "";
            if (data.lifestyleAdvice && data.lifestyleAdvice.length > 0) {
                adviceHtml = `
                    <div class="p-2 rounded bg-light border mb-2 small">
                        <strong class="d-block mb-1 text-teal" style="color: #0d9488;"><i class="bi bi-heart-pulse me-1"></i> Lifestyle &amp; Dietary Guidance:</strong>
                        <ul class="mb-0 ps-3">
                            ${data.lifestyleAdvice.map(a => `<li>${a}</li>`).join("")}
                        </ul>
                    </div>
                `;
            }

            reportResult.innerHTML = `
                <div class="ai-report-output small">
                    <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                        <span class="badge bg-teal text-white" style="background-color: #0d9488;">${data.testCategory || "Lab Analysis"}</span>
                        <span class="text-muted" style="font-size: 11px;"><i class="bi bi-stars text-teal"></i> ${data.source}</span>
                    </div>
                    <p class="mb-2 fw-semibold text-dark">${data.summary}</p>
                    ${findingsHtml}
                    ${adviceHtml}
                    <div class="alert alert-info py-2 px-3 small mb-0 mt-2">
                        <strong><i class="bi bi-info-circle me-1"></i> Next Steps:</strong> ${data.nextSteps}
                    </div>
                </div>
            `;
        } catch (err) {
            reportResult.innerHTML = `
                <div class="alert alert-danger rounded-3 small">
                    <i class="bi bi-x-circle me-1"></i> Failed to interpret report.
                </div>
            `;
        }
    }

    if (btnExplain && reportInput) {
        btnExplain.addEventListener("click", () => explainLabReport(reportInput.value));
    }

    document.querySelectorAll(".ai-quick-report").forEach(btn => {
        btn.addEventListener("click", () => {
            reportInput.value = btn.dataset.report;
            explainLabReport(btn.dataset.report);
        });
    });
});

