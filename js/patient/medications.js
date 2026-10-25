
document.addEventListener("DOMContentLoaded", function () {
    const yearElement = document.getElementById("medicationsYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    const searchInput = document.getElementById("medicationSearch");
    const statusFilter = document.getElementById("medicationStatusFilter");
    const medicationCards = Array.from(
        document.querySelectorAll(".medication-card")
    );
    const emptyState = document.getElementById("medicationEmpty");

    const medications = [
        {
            name: "Example Medication A",
            reference: "MED-DEMO-001",
            status: "Active (demo)",
            provider: "Example Clinic",
            date: "12 Oct 2026",
            instructions: "See the original prescription."
        },
        {
            name: "Example Medication B",
            reference: "MED-DEMO-002",
            status: "Active (demo)",
            provider: "Sample Health Centre",
            date: "05 Oct 2026",
            instructions: "See the original prescription."
        },
        {
            name: "Example Medication C",
            reference: "MED-DEMO-003",
            status: "Completed (demo)",
            provider: "Example Medical Centre",
            date: "18 Sep 2026",
            instructions: "Refer to the archived record."
        }
    ];

    function filterMedications() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value;
        let visibleCount = 0;

        medicationCards.forEach(function (card) {
            const searchableText = card.textContent.toLowerCase();
            const cardStatus = card.dataset.status;

            const matchesSearch = searchableText.includes(query);
            const matchesStatus =
                selectedStatus === "all" || cardStatus === selectedStatus;

            const shouldShow = matchesSearch && matchesStatus;

            card.hidden = !shouldShow;

            if (shouldShow) {
                visibleCount++;
            }
        });

        emptyState.style.display = visibleCount === 0 ? "block" : "none";
    }

    if (searchInput && statusFilter && emptyState) {
        searchInput.addEventListener("input", filterMedications);
        statusFilter.addEventListener("change", filterMedications);
    }

    const totalElement = document.getElementById("totalMedications");
    const activeElement = document.getElementById("activeMedications");
    const completedElement = document.getElementById("completedMedications");

    if (totalElement) {
        totalElement.textContent = medications.length;
    }

    if (activeElement) {
        activeElement.textContent = medications.filter(function (medication) {
            return medication.status.startsWith("Active");
        }).length;
    }

    if (completedElement) {
        completedElement.textContent = medications.filter(function (medication) {
            return medication.status.startsWith("Completed");
        }).length;
    }

    // Open the details modal for the selected fictional record.
    const modalElement = document.getElementById("medicationDetailsModal");

    if (modalElement && window.bootstrap) {
        const medicationModal = new bootstrap.Modal(modalElement);

        document.querySelectorAll("[data-medication]").forEach(function (button) {
            button.addEventListener("click", function () {
                const index = Number(button.dataset.medication);
                const medication = medications[index];

                if (!medication) {
                    return;
                }

                document.getElementById("medicationModalTitle").textContent =
                    medication.name;

                document.getElementById("modalMedicationReference").textContent =
                    medication.reference;

                document.getElementById("modalMedicationStatus").textContent =
                    medication.status;

                document.getElementById("modalMedicationProvider").textContent =
                    medication.provider;

                document.getElementById("modalMedicationDate").textContent =
                    medication.date;

                document.getElementById("modalMedicationInstructions").textContent =
                    medication.instructions;

                medicationModal.show();
            });
        });
    }

    /* ==========================================================
       CATEGORY 6: APIS & EXTERNAL INTEGRATIONS (DEVELOPER: SONIA)
       OpenFDA Drug Database & ClinicalTrials.gov Integration
       ========================================================== */
    const API_BASE = "http://localhost:5000";

    // 1. OPENFDA DRUG SEARCH
    const fdaInput = document.getElementById("fdaDrugSearchInput");
    const btnSearchFda = document.getElementById("btnSearchFdaDrug");
    const fdaResultsContainer = document.getElementById("fdaDrugSearchResults");

    async function searchOpenFda(drugQuery) {
        if (!drugQuery || !drugQuery.trim()) return;
        fdaResultsContainer.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-teal" role="status" style="color: #0d9488;"></div>
                <p class="small text-muted mt-2">Connecting to official OpenFDA API database...</p>
            </div>
        `;

        try {
            const res = await fetch(`${API_BASE}/api/external/drugs/search?query=${encodeURIComponent(drugQuery.trim())}&limit=3`);
            const data = await res.json();

            if (!data.success || !data.results || data.results.length === 0) {
                fdaResultsContainer.innerHTML = `
                    <div class="alert alert-warning rounded-3">
                        <i class="bi bi-exclamation-triangle me-2"></i> No official FDA record matched "<strong>${drugQuery}</strong>". Try generic names like <em>Aspirin</em>, <em>Metformin</em>, or <em>Atorvastatin</em>.
                    </div>
                `;
                return;
            }

            let html = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="small text-muted"><i class="bi bi-shield-check text-success"></i> ${data.source} (${data.count} found)</span>
                </div>
                <div class="d-flex flex-column gap-3">
            `;

            data.results.forEach((drug) => {
                html += `
                    <div class="card border rounded-3 p-3 shadow-none bg-white">
                        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                            <div>
                                <h4 class="h6 fw-bold mb-1 text-teal" style="color: #0d9488;">${drug.brand_name}</h4>
                                <span class="badge bg-light text-dark border me-1">${drug.generic_name}</span>
                                <span class="badge bg-secondary-subtle text-secondary">${drug.manufacturer_name}</span>
                            </div>
                            <span class="badge bg-info-subtle text-info-emphasis rounded-pill">${drug.dosage_form || "Prescription / OTC"}</span>
                        </div>
                        <div class="small text-secondary mb-2">
                            <strong>Indications:</strong> ${drug.indications_and_usage}
                        </div>
                        <div class="small text-secondary mb-2">
                            <strong>Dosage Guidance:</strong> ${drug.dosage_and_administration}
                        </div>
                        ${drug.warnings ? `<div class="p-2 rounded bg-danger-subtle text-danger-emphasis small border border-danger-subtle"><i class="bi bi-exclamation-octagon me-1"></i><strong>Safety Warning:</strong> ${drug.warnings}</div>` : ''}
                    </div>
                `;
            });

            html += `</div>`;
            fdaResultsContainer.innerHTML = html;
        } catch (err) {
            fdaResultsContainer.innerHTML = `
                <div class="alert alert-danger rounded-3">
                    <i class="bi bi-x-circle me-2"></i> Failed to connect to OpenFDA service. Make sure backend is running on port 5000.
                </div>
            `;
        }
    }

    if (btnSearchFda && fdaInput) {
        btnSearchFda.addEventListener("click", () => searchOpenFda(fdaInput.value));
        fdaInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") searchOpenFda(fdaInput.value);
        });
    }

    document.querySelectorAll(".fda-quick-pill").forEach((btn) => {
        btn.addEventListener("click", () => {
            fdaInput.value = btn.dataset.drug;
            searchOpenFda(btn.dataset.drug);
        });
    });

    // 2. DRUG INTERACTION CHECKER
    const drugAInput = document.getElementById("drugAInput");
    const drugBInput = document.getElementById("drugBInput");
    const btnCheckInteraction = document.getElementById("btnCheckDrugInteraction");
    const interactionResultContainer = document.getElementById("drugInteractionResult");

    async function checkDrugInteraction(drugA, drugB) {
        if (!drugA || !drugB) return;
        interactionResultContainer.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-danger" role="status"></div>
                <p class="small text-muted mt-2">Checking pharmacological interactions and clinical contraindications...</p>
            </div>
        `;

        try {
            const res = await fetch(`${API_BASE}/api/external/drugs/interactions?drugA=${encodeURIComponent(drugA)}&drugB=${encodeURIComponent(drugB)}`);
            const data = await res.json();

            if (!data.success) {
                interactionResultContainer.innerHTML = `<div class="alert alert-warning">${data.message}</div>`;
                return;
            }

            const alertClass = data.risk_level === "danger"
                ? "alert-danger border-danger"
                : (data.risk_level === "warning" ? "alert-warning border-warning" : "alert-success border-success");

            const iconClass = data.risk_level === "danger"
                ? "bi-exclamation-triangle-fill text-danger"
                : (data.risk_level === "warning" ? "bi-exclamation-circle-fill text-warning" : "bi-check-circle-fill text-success");

            interactionResultContainer.innerHTML = `
                <div class="alert ${alertClass} rounded-3 p-3 border shadow-sm">
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <i class="bi ${iconClass} fs-4"></i>
                        <div>
                            <h5 class="mb-0 fw-bold">${data.severity}</h5>
                            <small class="text-muted">Combination: <strong>${data.drugA}</strong> + <strong>${data.drugB}</strong></small>
                        </div>
                    </div>
                    <hr class="my-2">
                    <p class="mb-2 small"><strong>Clinical Effect:</strong> ${data.clinical_effect}</p>
                    <p class="mb-2 small"><strong>Mechanism:</strong> ${data.mechanism}</p>
                    <div class="p-2 rounded bg-white small border">
                        <strong><i class="bi bi-lightbulb text-warning me-1"></i> Recommendation:</strong> ${data.recommendation}
                    </div>
                    <div class="mt-2 text-end">
                        <span class="small text-muted" style="font-size: 11px;">Source: ${data.source}</span>
                    </div>
                </div>
            `;
        } catch (err) {
            interactionResultContainer.innerHTML = `
                <div class="alert alert-danger rounded-3">
                    <i class="bi bi-x-circle me-2"></i> Error analyzing drug interactions.
                </div>
            `;
        }
    }

    if (btnCheckInteraction && drugAInput && drugBInput) {
        btnCheckInteraction.addEventListener("click", () => checkDrugInteraction(drugAInput.value, drugBInput.value));
    }

    document.querySelectorAll(".pair-quick-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            drugAInput.value = btn.dataset.a;
            drugBInput.value = btn.dataset.b;
            checkDrugInteraction(btn.dataset.a, btn.dataset.b);
        });
    });

    // 3. CLINICAL TRIALS SEARCH
    const ctConditionInput = document.getElementById("clinicalTrialConditionInput");
    const ctStatusSelect = document.getElementById("clinicalTrialStatusSelect");
    const btnSearchCt = document.getElementById("btnSearchClinicalTrials");
    const ctResultsContainer = document.getElementById("clinicalTrialsSearchResults");

    async function searchClinicalTrials(condition, status = "RECRUITING") {
        ctResultsContainer.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-teal" role="status" style="color: #0d9488;"></div>
                <p class="small text-muted mt-2">Querying official ClinicalTrials.gov registry (NIH / NLM)...</p>
            </div>
        `;

        try {
            const res = await fetch(`${API_BASE}/api/external/trials/search?condition=${encodeURIComponent(condition)}&status=${encodeURIComponent(status)}&limit=4`);
            const data = await res.json();

            if (!data.success || !data.trials || data.trials.length === 0) {
                ctResultsContainer.innerHTML = `
                    <div class="alert alert-warning rounded-3">
                        <i class="bi bi-info-circle me-2"></i> No active clinical trials found for "<strong>${condition}</strong>".
                    </div>
                `;
                return;
            }

            let html = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="small text-muted"><i class="bi bi-globe me-1"></i> ${data.source} (${data.count} trials returned)</span>
                </div>
                <div class="row g-3">
            `;

            data.trials.forEach((trial) => {
                html += `
                    <div class="col-md-6">
                        <div class="card h-100 border rounded-3 p-3 shadow-none bg-white d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                                    <span class="badge bg-teal text-white" style="background-color: #0d9488;">${trial.nctId}</span>
                                    <span class="badge ${trial.overallStatus === 'RECRUITING' ? 'bg-success' : 'bg-secondary'} rounded-pill">${trial.overallStatus}</span>
                                </div>
                                <h5 class="h6 fw-bold text-dark mb-2">${trial.briefTitle}</h5>
                                <p class="small text-secondary mb-2" style="font-size: 12px;">${trial.briefSummary}</p>
                                <div class="small text-muted mb-1"><strong>Sponsor:</strong> ${trial.leadSponsor}</div>
                                <div class="small text-muted mb-2"><strong>Phase:</strong> ${trial.phase || "Interventional"}</div>
                            </div>
                            <div class="pt-2 border-top mt-2 d-flex justify-content-between align-items-center">
                                <span class="badge bg-light text-dark border">Age: ${trial.eligibility ? trial.eligibility.minAge : "18+"}</span>
                                <a href="${trial.officialUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size: 12px;">
                                    View Protocol <i class="bi bi-box-arrow-up-right ms-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            ctResultsContainer.innerHTML = html;
        } catch (err) {
            ctResultsContainer.innerHTML = `
                <div class="alert alert-danger rounded-3">
                    <i class="bi bi-x-circle me-2"></i> Failed to query ClinicalTrials.gov API.
                </div>
            `;
        }
    }

    if (btnSearchCt && ctConditionInput && ctStatusSelect) {
        btnSearchCt.addEventListener("click", () => searchClinicalTrials(ctConditionInput.value, ctStatusSelect.value));
        ctConditionInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") searchClinicalTrials(ctConditionInput.value, ctStatusSelect.value);
        });
    }

    document.querySelectorAll(".ct-quick-pill").forEach((btn) => {
        btn.addEventListener("click", () => {
            ctConditionInput.value = btn.dataset.cond;
            searchClinicalTrials(btn.dataset.cond, ctStatusSelect.value);
        });
    });

    // Run initial search for preview
    searchOpenFda("Metformin");
    checkDrugInteraction("Aspirin", "Warfarin");
    searchClinicalTrials("Diabetes");
});
