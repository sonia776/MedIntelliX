
/* ========================================
   MedIntelliX - Registration Functionality
   ======================================== */

document.addEventListener("DOMContentLoaded", function () {

    // Get HTML elements
    const registerForm = document.getElementById("registerForm");
    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("registerEmail");
    const passwordInput = document.getElementById("registerPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const acceptTerms = document.getElementById("acceptTerms");

    const organisationFields = document.getElementById("organisationFields");
    const organisationName = document.getElementById("organisationName");
    const institutionId = document.getElementById("institutionId");
    const organisationLabel = document.getElementById("organisationLabel");
    const institutionIdLabel = document.getElementById("institutionIdLabel");

    const registerMessage = document.getElementById("registerMessage");
    const registerButton = document.getElementById("registerButton");
    const registerYear = document.getElementById("registerYear");

    // Update footer year
    if (registerYear) {
        registerYear.textContent = new Date().getFullYear();
    }

    // Show feedback message
    function showMessage(message, type = "info") {
        if (!registerMessage) return;

        registerMessage.textContent = message;
        registerMessage.hidden = false;

        registerMessage.classList.remove(
            "message-info",
            "message-error",
            "message-success"
        );

        registerMessage.classList.add(`message-${type}`);
    }

    // Hide feedback message
    function hideMessage() {
        if (!registerMessage) return;

        registerMessage.hidden = true;
        registerMessage.textContent = "";
    }

    // Read selected account type
    function getSelectedAccountType() {
        const selected = document.querySelector(
            'input[name="accountType"]:checked'
        );

        return selected ? selected.value : "";
    }

    // Show or hide institutional fields
    function updateAccountFields() {
        const accountType = getSelectedAccountType();
        const isInstitutional =
            accountType === "hospital" ||
            accountType === "government";

        if (!organisationFields) return;

        organisationFields.hidden = !isInstitutional;

        // Institutional fields are required only for these account types
        if (organisationName) {
            organisationName.required = isInstitutional;
        }

        if (institutionId) {
            institutionId.required = isInstitutional;
        }

        // Adjust labels and placeholders
        if (accountType === "hospital") {
            organisationLabel.textContent = "Hospital name";
            organisationName.placeholder = "Enter hospital name";

            institutionIdLabel.textContent = "Hospital registration ID";
            institutionId.placeholder = "Enter hospital registration ID";

        } else if (accountType === "government") {
            organisationLabel.textContent = "Government department";
            organisationName.placeholder = "Enter department name";

            institutionIdLabel.textContent = "Department / institutional ID";
            institutionId.placeholder = "Enter authorised institutional ID";
        }

        hideMessage();
    }

    // Listen for account type changes
    document.querySelectorAll('input[name="accountType"]').forEach(
        function (radio) {
            radio.addEventListener("change", updateAccountFields);
        }
    );

    // Initialise fields
    updateAccountFields();

    // Show or hide password
    document.querySelectorAll("[data-password-target]").forEach(
        function (button) {

            button.addEventListener("click", function () {
                const targetId = button.getAttribute("data-password-target");
                const input = document.getElementById(targetId);

                if (!input) return;

                const shouldShow = input.type === "password";

                input.type = shouldShow ? "text" : "password";

                button.innerHTML = shouldShow
                    ? '<i class="bi bi-eye-slash"></i>'
                    : '<i class="bi bi-eye"></i>';

                button.setAttribute(
                    "aria-label",
                    shouldShow ? "Hide password" : "Show password"
                );

                button.setAttribute("aria-pressed", String(shouldShow));
            });

        }
    );

    // Clear validation styling when the user edits a field
    [
        fullNameInput,
        emailInput,
        passwordInput,
        confirmPasswordInput,
        organisationName,
        institutionId
    ].forEach(function (input) {

        if (!input) return;

        input.addEventListener("input", function () {
            input.classList.remove("is-invalid");
            hideMessage();
        });

    });

    // Validate the registration form
    if (registerForm) {

        registerForm.addEventListener("submit", function (event) {

            event.preventDefault();
            hideMessage();

            let isValid = true;

            const fullName = fullNameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const accountType = getSelectedAccountType();

            // Full name validation
            if (fullName.length < 2 || fullName.length > 100) {
                fullNameInput.classList.add("is-invalid");
                isValid = false;
            } else {
                fullNameInput.classList.remove("is-invalid");
            }

            // Email validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email) || email.length > 254) {
                emailInput.classList.add("is-invalid");
                isValid = false;
            } else {
                emailInput.classList.remove("is-invalid");
            }

            // Password length validation
            if (password.length < 12 || password.length > 128) {
                passwordInput.classList.add("is-invalid");
                isValid = false;
            } else {
                passwordInput.classList.remove("is-invalid");
            }

            // Confirm password validation
            if (
                !confirmPassword ||
                password !== confirmPassword
            ) {
                confirmPasswordInput.classList.add("is-invalid");
                isValid = false;
            } else {
                confirmPasswordInput.classList.remove("is-invalid");
            }

            // Terms checkbox validation
            if (!acceptTerms.checked) {
                isValid = false;
            }

            // Account type validation
            if (!accountType) {
                showMessage(
                    "Please select an account type.",
                    "error"
                );

                return;
            }

            // Institutional details validation
            if (
                accountType === "hospital" ||
                accountType === "government"
            ) {
                const organisationValue = organisationName.value.trim();
                const institutionValue = institutionId.value.trim();

                if (!organisationValue) {
                    organisationName.classList.add("is-invalid");
                    isValid = false;
                } else {
                    organisationName.classList.remove("is-invalid");
                }

                if (!institutionValue) {
                    institutionId.classList.add("is-invalid");
                    isValid = false;
                } else {
                    institutionId.classList.remove("is-invalid");
                }
            }

            // Stop if any field is invalid
            if (!isValid) {
                showMessage(
                    "Please check the highlighted fields, confirm that your passwords match, and accept the terms.",
                    "error"
                );

                return;
            }

            // Real API Call to Sonia's Backend Server
            const API_BASE = "http://localhost:5000";

            registerButton.disabled = true;
            const originalButtonContent = registerButton.innerHTML;
            registerButton.innerHTML = '<span>Creating Account...</span> <span class="spinner-border spinner-border-sm ms-2" role="status"></span>';

            const payload = {
                fullName: fullNameInput.value.trim(),
                email: emailInput.value.trim(),
                password: password,
                accountType: accountType,
                organisationName: (accountType !== "patient" && organisationName) ? organisationName.value.trim() : null,
                institutionId: (accountType !== "patient" && institutionId) ? institutionId.value.trim() : null
            };

            fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Failed to create account.");
                }
                return data;
            })
            .then((data) => {
                localStorage.setItem("medintellix_token", data.token);
                localStorage.setItem("medintellix_user", JSON.stringify(data.user));

                showMessage(
                    `Account created successfully for ${data.user.full_name}! Redirecting to your dashboard...`,
                    "success"
                );

                const isInPagesDir = window.location.pathname.includes("/pages/");
                const targetDashboard = isInPagesDir
                    ? `${data.user.role}/dashboard.html`
                    : `pages/${data.user.role}/dashboard.html`;

                setTimeout(() => {
                    window.location.href = targetDashboard;
                }, 1200);
            })
            .catch((err) => {
                showMessage(err.message || "Unable to connect to registration server. Please check backend status.", "error");
            })
            .finally(() => {
                registerButton.disabled = false;
                registerButton.innerHTML = originalButtonContent;
            });

        });

    }

    // Terms and privacy links are placeholders for now
    const termsLink = document.getElementById("termsLink");
    const privacyLink = document.getElementById("privacyLink");

    if (termsLink) {
        termsLink.addEventListener("click", function (event) {
            event.preventDefault();

            showMessage(
                "The Terms of Service will be published before registration goes live.",
                "info"
            );
        });
    }

    if (privacyLink) {
        privacyLink.addEventListener("click", function (event) {
            event.preventDefault();

            showMessage(
                "The Privacy Policy will be published before registration goes live.",
                "info"
            );
        });
    }

});
