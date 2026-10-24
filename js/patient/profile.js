
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
        emergencyName: document.getElementById("emergencyName"),
        relationship: document.getElementById("relationship"),
        emergencyPhone: document.getElementById("emergencyPhone")
    };

    const originalValues = new Map();

    // Save the initial form values so Reset can restore them.
    form.querySelectorAll("input, select, textarea").forEach(function (field) {
        if (field.type !== "checkbox" && field.type !== "reset" && field.type !== "submit") {
            originalValues.set(field.id, field.value);
        }
    });

    const currentYear = document.getElementById("profileYear");
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    function displayMessage(element, text, type) {
        element.textContent = text;
        element.hidden = false;
        element.className = "small mt-3 " +
            (type === "success" ? "text-success" : "text-danger");
    }

    function getInitials(name) {
        return name.trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("");
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
        const name = fields.name.value.trim() || "Patient";
        const email = fields.email.value.trim() || "Not provided";
        const phone = fields.phone.value.trim() || "Not provided";
        const initials = getInitials(name) || "P";

        document.getElementById("profileDisplayName").textContent = name;
        document.getElementById("profileDisplayEmail").textContent = email;
        document.getElementById("profileAvatar").textContent = initials;
        document.getElementById("profileInitials").textContent = initials;
        document.getElementById("patientName").textContent = name;

        document.getElementById("summaryEmail").textContent = email;
        document.getElementById("summaryPhone").textContent = phone;
        document.getElementById("summaryBirthDate").textContent =
            formatBirthDate(fields.birthDate.value);

        const emergencyName = fields.emergencyName.value.trim();
        const relationship = fields.relationship.value;
        const emergencyPhone = fields.emergencyPhone.value.trim();

        let emergencySummary = "Not provided";

        if (emergencyName) {
            emergencySummary = emergencyName;

            if (relationship) {
                emergencySummary += " (" +
                    fields.relationship.options[
                        fields.relationship.selectedIndex
                    ].text + ")";
            }

            if (emergencyPhone) {
                emergencySummary += " · " + emergencyPhone;
            }
        } else if (emergencyPhone) {
            emergencySummary = emergencyPhone;
        }

        document.getElementById("summaryEmergency").textContent =
            emergencySummary;
    }

    // Basic validation for optional phone number fields.
    function isValidPhone(value) {
        if (!value.trim()) {
            return true;
        }

        // Allows digits, spaces, +, hyphens and parentheses.
        const cleaned = value.replace(/[\s()+-]/g, "");
        return /^\d{7,15}$/.test(cleaned);
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        if (!isValidPhone(fields.phone.value)) {
            fields.phone.setCustomValidity(
                "Enter a valid phone number containing 7–15 digits."
            );
            fields.phone.reportValidity();
            fields.phone.setCustomValidity("");
            fields.phone.focus();
            return;
        }

        if (!isValidPhone(fields.emergencyPhone.value)) {
            fields.emergencyPhone.setCustomValidity(
                "Enter a valid emergency phone number containing 7–15 digits."
            );
            fields.emergencyPhone.reportValidity();
            fields.emergencyPhone.setCustomValidity("");
            fields.emergencyPhone.focus();
            return;
        }

        if (
            fields.emergencyName.value.trim() &&
            !fields.emergencyPhone.value.trim()
        ) {
            displayMessage(
                message,
                "Please add a phone number for the emergency contact, or clear the contact name.",
                "error"
            );
            fields.emergencyPhone.focus();
            return;
        }

        updateProfileDisplay();

        // Update the reset baseline for the edited form.
        form.querySelectorAll("input, select, textarea").forEach(function (field) {
            if (originalValues.has(field.id)) {
                originalValues.set(field.id, field.value);
            }
        });

        displayMessage(
            message,
            "Profile updated in this page's demo. Changes are not stored on a server.",
            "success"
        );
    });

    form.addEventListener("reset", function () {
        // Wait until the browser has restored the original field values.
        window.setTimeout(function () {
            message.hidden = true;
            updateProfileDisplay();
        }, 0);
    });

    // Keep the visible profile summary in sync while editing.
    [
        fields.name,
        fields.email,
        fields.phone,
        fields.birthDate,
        fields.emergencyName,
        fields.relationship,
        fields.emergencyPhone
    ].forEach(function (field) {
        field.addEventListener("input", updateProfileDisplay);
        field.addEventListener("change", updateProfileDisplay);
    });

    // Demo preferences: no backend or persistent storage.
    document.getElementById("savePreferences").addEventListener("click", function () {
        const preferences = {
            appointmentReminders:
                document.getElementById("appointmentReminders").checked,
            recordUpdates:
                document.getElementById("recordUpdates").checked,
            productAnnouncements:
                document.getElementById("productAnnouncements").checked
        };

        // Demonstrate that the selected preferences can be read.
        // They are deliberately not stored or transmitted.
        const selectedCount = Object.values(preferences).filter(Boolean).length;

        displayMessage(
            preferencesMessage,
            `Preferences updated for this demo (${selectedCount} enabled). They have not been saved permanently.`,
            "success"
        );
    });

    updateProfileDisplay();
});