
/* ========================================
   MedIntelliX - Login Functionality
   ======================================== */

document.addEventListener("DOMContentLoaded", function () {

    // Get HTML elements
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const loginButton = document.getElementById("loginButton");
    const loginMessage = document.getElementById("loginMessage");
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");
    const currentYear = document.getElementById("current-year");

    // Update footer year
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Display a message on the login page
    function showMessage(message, type = "info") {
        if (!loginMessage) return;

        loginMessage.textContent = message;
        loginMessage.hidden = false;

        // Reset message styling
        loginMessage.classList.remove(
            "message-info",
            "message-error",
            "message-success"
        );

        loginMessage.classList.add(`message-${type}`);
    }

    // Hide the current message
    function hideMessage() {
        if (loginMessage) {
            loginMessage.hidden = true;
            loginMessage.textContent = "";
        }
    }

    // Get the selected portal
    function getSelectedRole() {
        const selectedRole = document.querySelector(
            'input[name="userRole"]:checked'
        );

        return selectedRole ? selectedRole.value : "";
    }

    // Password visibility toggle
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {

            const isPasswordHidden =
                passwordInput.type === "password";

            passwordInput.type = isPasswordHidden
                ? "text"
                : "password";

            togglePassword.innerHTML = isPasswordHidden
                ? '<i class="bi bi-eye-slash"></i>'
                : '<i class="bi bi-eye"></i>';

            togglePassword.setAttribute(
                "aria-label",
                isPasswordHidden ? "Hide password" : "Show password"
            );

            togglePassword.setAttribute(
                "aria-pressed",
                String(isPasswordHidden)
            );

        });
    }

    // Clear validation styling as the user types
    [emailInput, passwordInput].forEach(function (input) {

        if (!input) return;

        input.addEventListener("input", function () {
            input.classList.remove("is-invalid");
            hideMessage();
        });

    });

    // Clear messages when a different portal is selected
    document.querySelectorAll('input[name="userRole"]').forEach(
        function (radio) {

            radio.addEventListener("change", function () {
                hideMessage();
            });

        }
    );

    // Login form submission
    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            // Prevent the browser's default form submission
            event.preventDefault();

            hideMessage();

            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const role = getSelectedRole();

            let isValid = true;

            // Validate email
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!email || !emailPattern.test(email)) {
                emailInput.classList.add("is-invalid");
                isValid = false;
            } else {
                emailInput.classList.remove("is-invalid");
            }

            // Validate password
            if (!password.trim()) {
                passwordInput.classList.add("is-invalid");
                isValid = false;
            } else {
                passwordInput.classList.remove("is-invalid");
            }

            // Validate portal selection
            if (!role) {
                showMessage(
                    "Please select a portal before continuing.",
                    "error"
                );

                return;
            }

            // Stop if form fields are invalid
            if (!isValid) {
                showMessage(
                    "Please enter a valid email address and password.",
                    "error"
                );

                return;
            }

            // Real API Call to Sonia's Backend Server
            const API_BASE = "http://localhost:5000";

            loginButton.disabled = true;
            const originalButtonContent = loginButton.innerHTML;
            loginButton.innerHTML = '<span>Signing in...</span> <span class="spinner-border spinner-border-sm ms-2" role="status"></span>';

            fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password,
                    role
                })
            })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Failed to authenticate.");
                }
                return data;
            })
            .then((data) => {
                // Store JWT token and user info
                localStorage.setItem("medintellix_token", data.token);
                localStorage.setItem("medintellix_user", JSON.stringify(data.user));

                showMessage(
                    `Welcome back, ${data.user.full_name}! Redirecting to your dashboard...`,
                    "success"
                );

                // Determine redirect path
                const isInPagesDir = window.location.pathname.includes("/pages/");
                const targetDashboard = isInPagesDir
                    ? `${data.user.role}/dashboard.html`
                    : `pages/${data.user.role}/dashboard.html`;

                setTimeout(() => {
                    window.location.href = targetDashboard;
                }, 1000);
            })
            .catch((err) => {
                showMessage(err.message || "Unable to connect to authentication server. Please ensure backend is running.", "error");
            })
            .finally(() => {
                loginButton.disabled = false;
                loginButton.innerHTML = originalButtonContent;
            });

        });

    }

    // Forgot password handler
    if (forgotPasswordLink) {

        forgotPasswordLink.addEventListener("click", function (event) {

            event.preventDefault();

            const email = emailInput ? emailInput.value.trim() : "";
            const API_BASE = "http://localhost:5000";

            fetch(`${API_BASE}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email || "your registered email" })
            })
            .then(res => res.json())
            .then(data => {
                showMessage(data.message || "Password recovery instructions sent.", "info");
            })
            .catch(() => {
                showMessage("Password recovery dispatched to your email.", "info");
            });

        });

    }

});