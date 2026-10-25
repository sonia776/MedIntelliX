document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const form = document.getElementById("profileForm");
    const message = document.getElementById("profileMessage");
    const preferencesMessage = document.getElementById("preferencesMessage");

    const fields = {
        name: document.getElementById("fullName"),
        email: document.getElementById("emailAddress"),
        phone: document.getElementById("phoneNumber"),
        birthDate: document.getElementById("dateOfBirth"),
        gender: document.getElementById("gender"),
        address: document.getElementById("address"),
        emergencyName: document.getElementById("emergencyName"),
        relationship: document.getElementById("relationship"),
        emergencyPhone: document.getElementById("emergencyPhone"),
        patientId: document.getElementById("patientId")
    };

    const originalValues = new Map();
    const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://localhost:5000" : "";

    const currentYear = document.getElementById("profileYear");
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    function displayMessage(element, text, type) {
        if (!element) return;
        element.textContent = text;
        element.hidden = false;
        element.className = "small mt-3 " +
            (type === "success" ? "text-success fw-semibold" : "text-danger fw-semibold");
    }

    function getInitials(name) {
        return (name || "").trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("") || "P";
    }

    function formatBirthDate(value) {
        if (!value) {
            return "Not provided";
        }

        const parts = value.split("-").map(Number);
        const date = new Date(parts[0], parts[1] - 1, parts[2]);

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function updateProfileDisplay() {
        const name = (fields.name ? fields.name.value.trim() : "") || "Patient";
        const email = (fields.email ? fields.email.value.trim() : "") || "Not provided";
        const phone = (fields.phone ? fields.phone.value.trim() : "") || "Not provided";
        const initials = getInitials(name);

        const displayNameEl = document.getElementById("profileDisplayName");
        const displayEmailEl = document.getElementById("profileDisplayEmail");
        const avatarEl = document.getElementById("profileAvatar");
        const initialsEl = document.getElementById("profileInitials");
        const patientNameEl = document.getElementById("patientName");

        if (displayNameEl) displayNameEl.textContent = name;
        if (displayEmailEl) displayEmailEl.textContent = email;
        if (avatarEl) avatarEl.textContent = initials;
        if (initialsEl) initialsEl.textContent = initials;
        if (patientNameEl) patientNameEl.textContent = name;

        const summaryEmail = document.getElementById("summaryEmail");
        const summaryPhone = document.getElementById("summaryPhone");
        const summaryBirthDate = document.getElementById("summaryBirthDate");
        const summaryEmergency = document.getElementById("summaryEmergency");

        if (summaryEmail) summaryEmail.textContent = email;
        if (summaryPhone) summaryPhone.textContent = phone;
        if (summaryBirthDate && fields.birthDate) {
            summaryBirthDate.textContent = formatBirthDate(fields.birthDate.value);
        }

        const emergencyName = fields.emergencyName ? fields.emergencyName.value.trim() : "";
        const relationship = fields.relationship ? fields.relationship.value : "";
        const emergencyPhone = fields.emergencyPhone ? fields.emergencyPhone.value.trim() : "";

        let emergencySummary = "Not provided";
        if (emergencyName) {
            emergencySummary = emergencyName;
            if (relationship && fields.relationship) {
                const relText = fields.relationship.options[fields.relationship.selectedIndex]?.text || relationship;
                emergencySummary += " (" + relText + ")";
            }
            if (emergencyPhone) {
                emergencySummary += " · " + emergencyPhone;
            }
        } else if (emergencyPhone) {
            emergencySummary = emergencyPhone;
        }

        if (summaryEmergency) {
            summaryEmergency.textContent = emergencySummary;
        }
    }

    // Basic validation for phone number
    function isValidPhone(value) {
        if (!value || !value.trim()) {
            return true;
        }
        const cleaned = value.replace(/[\s()+-]/g, "");
        return /^\d{7,15}$/.test(cleaned);
    }

    // Load initial profile data
    function loadInitialProfileData() {
        let currentUser = null;
        try {
            const raw = localStorage.getItem("medintellix_user");
            if (raw) currentUser = JSON.parse(raw);
        } catch (e) {
            console.warn("Could not parse current user:", e);
        }

        const profileKey = "medintellix_profile_" + (currentUser && currentUser.id ? currentUser.id : "default");
        let savedProfile = null;
        try {
            const rawProfile = localStorage.getItem(profileKey);
            if (rawProfile) savedProfile = JSON.parse(rawProfile);
        } catch (e) {
            console.warn("Could not parse saved profile:", e);
        }

        // Populate fields from localStorage
        if (currentUser) {
            if (fields.name && currentUser.full_name) fields.name.value = currentUser.full_name;
            if (fields.email && currentUser.email) fields.email.value = currentUser.email;
            if (fields.phone && currentUser.phone) fields.phone.value = currentUser.phone;
            if (fields.patientId && currentUser.id) {
                fields.patientId.value = currentUser.id.toUpperCase().replace(/^USR_/, "PT-");
            }
        }

        if (savedProfile) {
            if (fields.birthDate && savedProfile.dateOfBirth) fields.birthDate.value = savedProfile.dateOfBirth;
            if (fields.gender && savedProfile.gender) fields.gender.value = savedProfile.gender;
            if (fields.address && savedProfile.address) fields.address.value = savedProfile.address;
            if (fields.emergencyName && savedProfile.emergencyName) fields.emergencyName.value = savedProfile.emergencyName;
            if (fields.relationship && savedProfile.relationship) fields.relationship.value = savedProfile.relationship;
            if (fields.emergencyPhone && savedProfile.emergencyPhone) fields.emergencyPhone.value = savedProfile.emergencyPhone;
            if (fields.phone && !fields.phone.value && savedProfile.phone) fields.phone.value = savedProfile.phone;
        }

        // Try to fetch latest from backend if authenticated
        const token = localStorage.getItem("medintellix_token");
        if (token) {
            fetch(`${API_BASE}/api/patient/profile`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.user) {
                    if (fields.name && data.user.full_name) fields.name.value = data.user.full_name;
                    if (fields.email && data.user.email) fields.email.value = data.user.email;
                    if (fields.phone && data.user.phone) fields.phone.value = data.user.phone;
                    if (fields.patientId && data.user.id) {
                        fields.patientId.value = data.user.id.toUpperCase().replace(/^USR_/, "PT-");
                    }

                    if (data.profile) {
                        if (fields.birthDate && data.profile.date_of_birth) {
                            fields.birthDate.value = data.profile.date_of_birth.substring(0, 10);
                        }
                        if (fields.gender && data.profile.gender) fields.gender.value = data.profile.gender;
                        if (fields.address && data.profile.address) fields.address.value = data.profile.address;
                        if (fields.emergencyName && data.profile.emergency_contact_name) {
                            fields.emergencyName.value = data.profile.emergency_contact_name;
                        }
                        if (fields.relationship && data.profile.relationship) {
                            fields.relationship.value = data.profile.relationship;
                        }
                        if (fields.emergencyPhone && data.profile.emergency_contact_phone) {
                            fields.emergencyPhone.value = data.profile.emergency_contact_phone;
                        }
                    }

                    // Save snapshot
                    cacheCurrentProfile();
                    updateProfileDisplay();
                    cacheOriginalBaseline();
                }
            })
            .catch(err => {
                console.log("Using cached profile:", err.message);
            });
        }

        updateProfileDisplay();
        cacheOriginalBaseline();
    }

    function cacheOriginalBaseline() {
        if (!form) return;
        form.querySelectorAll("input, select, textarea").forEach(function (field) {
            if (field.type !== "checkbox" && field.type !== "reset" && field.type !== "submit") {
                originalValues.set(field.id, field.value);
            }
        });
    }

    function cacheCurrentProfile() {
        let currentUser = null;
        try {
            currentUser = JSON.parse(localStorage.getItem("medintellix_user") || "{}");
        } catch (e) {
            currentUser = {};
        }

        const updatedName = fields.name ? fields.name.value.trim() : (currentUser.full_name || "Patient");
        const updatedEmail = fields.email ? fields.email.value.trim() : (currentUser.email || "");
        const updatedPhone = fields.phone ? fields.phone.value.trim() : (currentUser.phone || "");

        currentUser.full_name = updatedName;
        currentUser.email = updatedEmail;
        currentUser.phone = updatedPhone;

        localStorage.setItem("medintellix_user", JSON.stringify(currentUser));

        const profileData = {
            fullName: updatedName,
            email: updatedEmail,
            phone: updatedPhone,
            dateOfBirth: fields.birthDate ? fields.birthDate.value : "",
            gender: fields.gender ? fields.gender.value : "",
            address: fields.address ? fields.address.value.trim() : "",
            emergencyName: fields.emergencyName ? fields.emergencyName.value.trim() : "",
            relationship: fields.relationship ? fields.relationship.value : "",
            emergencyPhone: fields.emergencyPhone ? fields.emergencyPhone.value.trim() : ""
        };

        const profileKey = "medintellix_profile_" + (currentUser.id ? currentUser.id : "default");
        localStorage.setItem(profileKey, JSON.stringify(profileData));

        return { currentUser, profileData };
    }

    // Submit handler
    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            if (!form.reportValidity()) {
                return;
            }

            if (!isValidPhone(fields.phone.value)) {
                fields.phone.setCustomValidity("Enter a valid phone number containing 7–15 digits.");
                fields.phone.reportValidity();
                fields.phone.setCustomValidity("");
                fields.phone.focus();
                return;
            }

            if (!isValidPhone(fields.emergencyPhone.value)) {
                fields.emergencyPhone.setCustomValidity("Enter a valid emergency phone number containing 7–15 digits.");
                fields.emergencyPhone.reportValidity();
                fields.emergencyPhone.setCustomValidity("");
                fields.emergencyPhone.focus();
                return;
            }

            if (fields.emergencyName.value.trim() && !fields.emergencyPhone.value.trim()) {
                displayMessage(message, "Please add a phone number for the emergency contact, or clear the contact name.", "error");
                fields.emergencyPhone.focus();
                return;
            }

            // Save to LocalStorage immediately
            const { currentUser, profileData } = cacheCurrentProfile();

            // Update UI elements
            updateProfileDisplay();
            cacheOriginalBaseline();

            // Persist to Backend if Token is available
            const token = localStorage.getItem("medintellix_token");
            if (token) {
                try {
                    const response = await fetch(`${API_BASE}/api/patient/profile`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify(profileData)
                    });
                    const resData = await response.json();
                    if (!response.ok) {
                        throw new Error(resData.message || "Failed to sync profile with server.");
                    }
                } catch (e) {
                    console.warn("Server sync notice:", e.message);
                }
            }

            displayMessage(
                message,
                `Profile updated successfully! Welcome, ${profileData.fullName}. Changes are saved across your session.`,
                "success"
            );
        });

        form.addEventListener("reset", function () {
            window.setTimeout(function () {
                if (message) message.hidden = true;
                updateProfileDisplay();
            }, 0);
        });
    }

    // Real-time input synchronization
    [
        fields.name,
        fields.email,
        fields.phone,
        fields.birthDate,
        fields.emergencyName,
        fields.relationship,
        fields.emergencyPhone
    ].forEach(function (field) {
        if (!field) return;
        field.addEventListener("input", updateProfileDisplay);
        field.addEventListener("change", updateProfileDisplay);
    });

    // Preferences handler
    const savePrefBtn = document.getElementById("savePreferences");
    if (savePrefBtn) {
        savePrefBtn.addEventListener("click", function () {
            displayMessage(preferencesMessage, "Preferences saved for this session.", "success");
            setTimeout(function () {
                if (preferencesMessage) preferencesMessage.hidden = true;
            }, 3000);
        });
    }

    // Initialize data on load
    loadInitialProfileData();
});