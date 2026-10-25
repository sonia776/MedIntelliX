
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
    let patientName = "Patient";

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
    const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://localhost:5000" : "";

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
    const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://localhost:5000" : "";

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

    // ==========================================================
    // NOTIFICATION API CONTROLLER (EMAIL & SMS)
    // ==========================================================

    let currentUser = null;
    try {
        const savedUserJson = localStorage.getItem("medintellix_user");
        if (savedUserJson) {
            currentUser = JSON.parse(savedUserJson);
        }
    } catch (e) {
        console.warn("Could not read saved user:", e);
    }

    const currentUserId = currentUser ? currentUser.id : null;
    const currentUserEmail = currentUser ? currentUser.email : null;
    const currentUserPhone = currentUser ? (currentUser.phone || "") : "";

    const btnTriggerAppt = document.getElementById("btnTriggerApptReminders");
    const btnTriggerRefill = document.getElementById("btnTriggerRefillAlerts");
    const btnRefreshNotifs = document.getElementById("btnRefreshNotifs");
    const notifListContainer = document.getElementById("notificationHistoryList");
    const notifCountBadge = document.getElementById("notifCountBadge");
    const sidebarNotifBadge = document.getElementById("sidebarNotifBadge");
    const alertBanner = document.getElementById("notificationAlertBanner");
    const alertMsg = document.getElementById("notificationAlertMsg");
    const btnDispatchCustom = document.getElementById("btnDispatchCustomNotif");
    const topbarNotifBtn = document.getElementById("notificationButton");

    // Prefill user's email and phone into dispatch inputs
    const notifEmailInput = document.getElementById("notifRecipientEmail");
    const notifPhoneInput = document.getElementById("notifRecipientPhone");
    if (notifEmailInput && currentUserEmail) {
        notifEmailInput.value = currentUserEmail;
    }
    if (notifPhoneInput && currentUserPhone) {
        notifPhoneInput.value = currentUserPhone;
    }

    if (topbarNotifBtn) {
        topbarNotifBtn.addEventListener("click", () => {
            const section = document.getElementById("notifications-section");
            if (section) {
                section.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    function showBannerAlert(message, type = "success") {
        if (!alertBanner || !alertMsg) return;
        alertBanner.className = `alert alert-${type} alert-dismissible fade show mb-3`;
        alertMsg.innerHTML = message;
        alertBanner.classList.remove("d-none");
        setTimeout(() => {
            alertBanner.classList.add("d-none");
        }, 6000);
    }

    async function loadNotificationHistory() {
        if (!notifListContainer) return;

        if (!currentUserId && !currentUserEmail) {
            notifListContainer.innerHTML = `
                <div class="text-center py-4 text-muted small">
                    <i class="bi bi-bell-slash text-secondary fs-4 d-block mb-1"></i>
                    No notifications recorded yet for this account.
                </div>
            `;
            if (notifCountBadge) notifCountBadge.textContent = "0 Logged";
            if (sidebarNotifBadge) sidebarNotifBadge.textContent = "0";
            return;
        }

        try {
            const queryParams = new URLSearchParams();
            if (currentUserId) queryParams.set("userId", currentUserId);
            if (currentUserEmail) queryParams.set("email", currentUserEmail);
            queryParams.set("limit", "20");

            const res = await fetch(`${API_BASE}/api/external/notifications/history?${queryParams.toString()}`);
            const data = await res.json();

            if (!data.success || !data.notifications || data.notifications.length === 0) {
                notifListContainer.innerHTML = `
                    <div class="text-center py-4 text-muted small">
                        <i class="bi bi-bell-slash text-secondary fs-4 d-block mb-1"></i>
                        No notifications recorded yet for this account.
                    </div>
                `;
                if (notifCountBadge) notifCountBadge.textContent = "0 Logged";
                if (sidebarNotifBadge) sidebarNotifBadge.textContent = "0";
                return;
            }

            const notifs = data.notifications;
            if (notifCountBadge) notifCountBadge.textContent = `${notifs.length} Logged`;
            if (sidebarNotifBadge) sidebarNotifBadge.textContent = notifs.length;

            notifListContainer.innerHTML = notifs.map(n => {
                let channelBadge = `<span class="badge bg-secondary-subtle text-secondary border">${n.channel}</span>`;
                if (n.channel === "EMAIL") {
                    channelBadge = `<span class="badge bg-info-subtle text-info border"><i class="bi bi-envelope me-1"></i>EMAIL</span>`;
                } else if (n.channel === "SMS") {
                    channelBadge = `<span class="badge bg-warning-subtle text-warning-emphasis border"><i class="bi bi-chat-dots me-1"></i>SMS</span>`;
                } else if (n.channel === "MULTI") {
                    channelBadge = `<span class="badge bg-primary-subtle text-primary border"><i class="bi bi-broadcast me-1"></i>EMAIL + SMS</span>`;
                }

                let typeIcon = "bi-bell";
                if (n.type === "APPOINTMENT_REMINDER") typeIcon = "bi-calendar-check text-primary";
                else if (n.type === "MEDICATION_REFILL") typeIcon = "bi-capsule-pill text-warning";
                else typeIcon = "bi-info-circle text-info";

                const dateStr = n.created_at ? new Date(n.created_at).toLocaleString() : "Recent";
                const meta = typeof n.metadata === "string" ? JSON.parse(n.metadata || "{}") : (n.metadata || {});
                const recipientLabel = n.recipient_email || n.recipient_phone || (currentUser && currentUser.full_name) || "Patient";

                return `
                    <div class="p-2 mb-2 rounded bg-light border border-light-subtle small transition">
                        <div class="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-1">
                            <span class="fw-bold text-dark d-flex align-items-center">
                                <i class="bi ${typeIcon} me-1 fs-6"></i> ${n.title}
                            </span>
                            <div class="d-flex gap-1 align-items-center">
                                ${channelBadge}
                                <span class="badge bg-success-subtle text-success border border-success-subtle" style="font-size: 10px;">
                                    <i class="bi bi-check-circle-fill me-1"></i>${n.status}
                                </span>
                            </div>
                        </div>
                        <p class="mb-1 text-secondary" style="font-size: 12px;">${n.message}</p>
                        <div class="d-flex justify-content-between align-items-center text-muted flex-wrap gap-1" style="font-size: 11px;">
                            <span><i class="bi bi-person-check me-1"></i>${recipientLabel}</span>
                            <span><i class="bi bi-clock me-1"></i>${dateStr}</span>
                        </div>
                        ${meta.smsDispatchId || meta.emailMessageId ? `
                            <div class="mt-1 pt-1 border-top text-muted font-monospace" style="font-size: 10px;">
                                ${meta.smsDispatchId ? `<span class="me-2">SMS Ref: <strong>${meta.smsDispatchId}</strong></span>` : ""}
                                ${meta.emailMessageId ? `<span>Email ID: ${meta.emailMessageId.substring(0, 22)}...</span>` : ""}
                            </div>
                        ` : ""}
                    </div>
                `;
            }).join("");

        } catch (err) {
            console.error("Error loading notification history:", err);
            notifListContainer.innerHTML = `
                <div class="alert alert-danger py-2 small">
                    <i class="bi bi-x-circle me-1"></i> Could not load notifications from backend.
                </div>
            `;
        }
    }

    // Trigger Appointment Reminders
    if (btnTriggerAppt) {
        btnTriggerAppt.addEventListener("click", async () => {
            btnTriggerAppt.disabled = true;
            btnTriggerAppt.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status"></span> Scanning...`;

            try {
                const res = await fetch(`${API_BASE}/api/external/notifications/trigger-appointment-reminders`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: currentUserId,
                        email: currentUserEmail,
                        phone: currentUserPhone
                    })
                });
                const data = await res.json();

                if (data.success) {
                    if (data.count === 0) {
                        showBannerAlert(`<strong><i class="bi bi-info-circle me-1"></i> Notice:</strong> No upcoming appointments found for your account. You can book an appointment or send a custom notification below.`, "info");
                    } else {
                        showBannerAlert(`<strong><i class="bi bi-check2-circle me-1"></i> Success!</strong> Dispatched 24h-48h appointment reminders via Email &amp; SMS for <strong>${data.count} scheduled consultation(s)</strong>.`);
                    }
                    loadNotificationHistory();
                } else {
                    showBannerAlert("Failed to trigger appointment reminders.", "warning");
                }
            } catch (err) {
                showBannerAlert("Error connecting to notification service.", "danger");
            } finally {
                btnTriggerAppt.disabled = false;
                btnTriggerAppt.innerHTML = `<i class="bi bi-calendar2-check me-1"></i> Trigger 24h Appt Reminders`;
            }
        });
    }

    // Trigger Medication Refill Alerts
    if (btnTriggerRefill) {
        btnTriggerRefill.addEventListener("click", async () => {
            btnTriggerRefill.disabled = true;
            btnTriggerRefill.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status"></span> Checking...`;

            try {
                const res = await fetch(`${API_BASE}/api/external/notifications/trigger-refill-alerts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        daysThreshold: 60,
                        userId: currentUserId
                    })
                });
                const data = await res.json();

                if (data.success) {
                    if (data.count === 0) {
                        showBannerAlert(`<strong><i class="bi bi-info-circle me-1"></i> Notice:</strong> No active prescriptions requiring refill for your account at this time.`, "info");
                    } else {
                        showBannerAlert(`<strong><i class="bi bi-capsule-pill me-1"></i> Refill Warnings Dispatched!</strong> Sent low-stock and renewal warnings via Email &amp; SMS for <strong>${data.count} active prescription(s)</strong>.`);
                    }
                    loadNotificationHistory();
                } else {
                    showBannerAlert("Failed to trigger refill alerts.", "warning");
                }
            } catch (err) {
                showBannerAlert("Error connecting to notification service.", "danger");
            } finally {
                btnTriggerRefill.disabled = false;
                btnTriggerRefill.innerHTML = `<i class="bi bi-capsule-pill me-1"></i> Trigger Medicine Refill Alerts`;
            }
        });
    }

    // Refresh Button
    if (btnRefreshNotifs) {
        btnRefreshNotifs.addEventListener("click", () => {
            loadNotificationHistory();
        });
    }

    // On-Demand Direct Dispatch
    if (btnDispatchCustom) {
        btnDispatchCustom.addEventListener("click", async () => {
            const email = (document.getElementById("notifRecipientEmail")?.value || currentUserEmail || "").trim();
            const phone = (document.getElementById("notifRecipientPhone")?.value || currentUserPhone || "").trim();
            const template = document.getElementById("notifTemplateSelect")?.value || "appt";
            const channelEmail = document.getElementById("channelEmail")?.checked;
            const channelSms = document.getElementById("channelSms")?.checked;

            if (!email && !phone) {
                alert("Please enter recipient email or mobile number.");
                return;
            }

            const channels = [];
            if (channelEmail) channels.push("EMAIL");
            if (channelSms) channels.push("SMS");

            if (channels.length === 0) {
                alert("Please select at least one channel (Email or SMS).");
                return;
            }

            let title = "MedIntelliX Clinical Update";
            let message = "Your healthcare provider has shared an update regarding your care plan.";
            let type = "SYSTEM_ALERT";

            if (template === "appt") {
                type = "APPOINTMENT_REMINDER";
                title = "Appointment Reminder: Dr. Rachel Green";
                message = "Your clinical consultation is confirmed for tomorrow at 10:30 AM at City Central Hospital. Please bring prior records.";
            } else if (template === "refill") {
                type = "MEDICATION_REFILL";
                title = "Rx Refill Alert: Atorvastatin (20mg)";
                message = "Your Atorvastatin supply has 5 days remaining. Please reorder prescription via MedIntelliX or contact your pharmacy.";
            } else if (template === "report") {
                type = "SYSTEM_ALERT";
                title = "Diagnostic Lab Report Ready";
                message = "Your Complete Blood Count & Lipid Panel report is now verified and available for review in your Patient Portal.";
            }

            btnDispatchCustom.disabled = true;
            btnDispatchCustom.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Dispatching...`;

            try {
                const res = await fetch(`${API_BASE}/api/external/notifications/send`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: currentUserId,
                        type,
                        channels,
                        title,
                        message,
                        recipientEmail: email,
                        recipientPhone: phone
                    })
                });

                const data = await res.json();
                if (data.success) {
                    const resultBox = document.getElementById("dispatchLiveResult");
                    const resultDetails = document.getElementById("dispatchLiveResultDetails");
                    if (resultBox && resultDetails) {
                        resultBox.classList.remove("d-none");
                        resultDetails.innerHTML = `
                            <div><strong>Recipient:</strong> ${email} · ${phone}</div>
                            <div><strong>Channels:</strong> ${channels.join(" + ")}</div>
                            <div><strong>Delivery Status:</strong> <span class="badge bg-success">DELIVERED</span></div>
                            <div><strong>Database ID:</strong> ${data.notification.id}</div>
                        `;
                    }
                    showBannerAlert(`<strong><i class="bi bi-broadcast me-1"></i> Dispatched!</strong> Sent ${title} via ${channels.join(" &amp; ")}.`);
                    loadNotificationHistory();
                }
            } catch (err) {
                showBannerAlert("Failed to dispatch custom notification.", "danger");
            } finally {
                btnDispatchCustom.disabled = false;
                btnDispatchCustom.innerHTML = `<i class="bi bi-broadcast me-1"></i> Dispatch Multi-Channel Notification`;
            }
        });
    }

    // Initial load of notification history
    loadNotificationHistory();
});


