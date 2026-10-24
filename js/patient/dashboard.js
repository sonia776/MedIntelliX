
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
