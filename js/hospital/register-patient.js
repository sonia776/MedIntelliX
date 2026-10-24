
document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const form = document.getElementById("registerPatientForm");
    const successPanel = document.getElementById("registrationSuccess");
    const referenceElement = document.getElementById("demoReference");
    const dateOfBirth = document.getElementById("dateOfBirth");
    const registrationDate = document.getElementById("registrationDate");
    const genderSelect = document.getElementById("gender");
    const selfDescribeGroup = document.getElementById("selfDescribeGroup");
    const genderDescription = document.getElementById("genderDescription");
    const emergencyPhone = document.getElementById("emergencyPhone");
    const phone = document.getElementById("phone");

    const yearElement = document.getElementById("hospitalYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Use local calendar dates rather than UTC dates.
    function getLocalDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    const today = getLocalDateString(new Date());

    // Prevent future dates for date of birth and registration.
    dateOfBirth.max = today;
    registrationDate.max = today;
    registrationDate.value = today;

    function isValidPhoneNumber(value) {
        const trimmed = value.trim();

        if (!trimmed) {
            return false;
        }

        // Accept digits, spaces, parentheses, hyphens and an optional leading +.
        if (!/^\+?[0-9\s()-]+$/.test(trimmed)) {
            return false;
        }

        const digitCount = trimmed.replace(/\D/g, "").length;

        return digitCount >= 7 && digitCount <= 15;
    }

    function validatePhoneField(field, required) {
        const value = field.value.trim();
        let valid = true;

        if (required && !value) {
            valid = false;
        } else if (value && !isValidPhoneNumber(value)) {
            valid = false;
        }

        field.setCustomValidity(valid ? "" : "Enter a valid phone number.");

        // Only display the validation state after the field has been touched
        // or the form has been submitted.
        if (field.dataset.touched === "true" || form.dataset.submitted === "true") {
            field.classList.toggle("is-invalid", !valid);
            field.classList.toggle("is-valid", valid && value.length > 0);
        }

        return valid;
    }

    function validateDateOfBirth() {
        const value = dateOfBirth.value;
        const valid = Boolean(value) && value <= today;

        dateOfBirth.setCustomValidity(
            valid ? "" : "Enter a date of birth that is not in the future."
        );

        return valid;
    }

    function validateRegistrationDate() {
        const value = registrationDate.value;
        const valid = Boolean(value) && value <= today;

        registrationDate.setCustomValidity(
            valid ? "" : "Enter today or an earlier date."
        );

        return valid;
    }

    function updateGenderDescription() {
        const isSelfDescribed = genderSelect.value === "Self-describe";

        selfDescribeGroup.classList.toggle("d-none", !isSelfDescribed);
        genderDescription.required = false;

        if (!isSelfDescribed) {
            genderDescription.value = "";
        }
    }

    function clearValidationStyles() {
        form.querySelectorAll(".is-invalid, .is-valid").forEach(function (field) {
            field.classList.remove("is-invalid", "is-valid");
        });

        form.querySelectorAll("input, select, textarea").forEach(function (field) {
            field.setCustomValidity("");
            delete field.dataset.touched;
        });

        delete form.dataset.submitted;
    }

    function resetDemoState() {
        successPanel.classList.add("d-none");
        form.classList.remove("was-validated");

        clearValidationStyles();
        updateGenderDescription();

        dateOfBirth.max = today;
        registrationDate.max = today;
        registrationDate.value = today;

        form.querySelectorAll("input, select, textarea").forEach(function (field) {
            field.setCustomValidity("");
        });
    }

    // Validate phone numbers as users leave their fields.
    [phone, emergencyPhone].forEach(function (field) {
        field.addEventListener("blur", function () {
            field.dataset.touched = "true";
            validatePhoneField(field, field === phone);
        });

        field.addEventListener("input", function () {
            field.setCustomValidity("");

            if (field.dataset.touched === "true" ||
                form.dataset.submitted === "true") {
                validatePhoneField(field, field === phone);
            }
        });
    });

    dateOfBirth.addEventListener("change", validateDateOfBirth);
    registrationDate.addEventListener("change", validateRegistrationDate);
    genderSelect.addEventListener("change", updateGenderDescription);

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        form.dataset.submitted = "true";

        const dobValid = validateDateOfBirth();
        const registrationValid = validateRegistrationDate();
        const phoneValid = validatePhoneField(phone, true);
        const emergencyPhoneValid = emergencyPhone.value.trim() === "" ||
            validatePhoneField(emergencyPhone, false);

        // Mark the form so Bootstrap displays its validation feedback.
        form.classList.add("was-validated");

        const nativeFormValid = form.checkValidity();

        if (!dobValid || !registrationValid ||
            !phoneValid || !emergencyPhoneValid || !nativeFormValid) {
            const firstInvalidField = form.querySelector(":invalid");

            if (firstInvalidField) {
                firstInvalidField.focus();
            }

            successPanel.classList.add("d-none");
            return;
        }

        // This reference is for the UI demonstration only.
        // No form data is sent to a server or stored in a database.
        const demoReference = "MIX-DEMO-" + Date.now().toString().slice(-8);

        referenceElement.textContent = demoReference;
        successPanel.classList.remove("d-none");

        successPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    form.addEventListener("reset", function () {
        // Wait for the browser to reset the form fields first.
        window.setTimeout(resetDemoState, 0);
    });

    document.getElementById("registerAnother").addEventListener("click", function () {
        form.reset();
        successPanel.classList.add("d-none");

        document.getElementById("firstName").focus();
    });

    document.getElementById("clearForm").addEventListener("click", function () {
        successPanel.classList.add("d-none");
    });

    updateGenderDescription();
});
