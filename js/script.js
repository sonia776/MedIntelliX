
// =========================================================
// MedIntelliX — Main JavaScript
// File: js/script.js
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // -----------------------------------------------------
    // 1. UPDATE THE FOOTER YEAR
    // -----------------------------------------------------

    const currentYear = document.querySelector("#current-year");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    // -----------------------------------------------------
    // 2. NAVBAR SHADOW ON SCROLL
    // -----------------------------------------------------

    const navbar = document.querySelector(".site-navbar");

    function updateNavbarShadow() {
        if (!navbar) return;

        navbar.classList.toggle("navbar-scrolled", window.scrollY > 10);
    }

    updateNavbarShadow();

    window.addEventListener("scroll", updateNavbarShadow, {
        passive: true
    });


    // -----------------------------------------------------
    // 3. CLOSE MOBILE NAVBAR AFTER CLICKING A LINK
    // -----------------------------------------------------

    const navbarCollapse = document.querySelector("#mainNavbar");
    const navbarLinks = document.querySelectorAll(
        "#mainNavbar .nav-link"
    );

    navbarLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            if (!navbarCollapse || !window.bootstrap) return;

            const collapseInstance =
                bootstrap.Collapse.getOrCreateInstance(navbarCollapse);

            collapseInstance.hide();
        });
    })


    // -----------------------------------------------------
    // 4. CLOSE MOBILE NAVBAR WHEN CLICKING OUTSIDE
    // -----------------------------------------------------

    document.addEventListener("click", function (event) {

        if (!navbar || !navbarCollapse) return;

        const navbarToggler =
            document.querySelector(".navbar-toggler");

        const clickedInsideNavbar =
            navbar.contains(event.target);

        if (
            !clickedInsideNavbar &&
            navbarCollapse.classList.contains("show") &&
            window.bootstrap
        ) {
            const collapseInstance =
                window.bootstrap.Collapse.getOrCreateInstance(
                    navbarCollapse
                );

            collapseInstance.hide();
        }
    });


    // -----------------------------------------------------
    // 5. NOTICE / TOAST MESSAGE
    // -----------------------------------------------------

    let noticeTimeout;

    function showNotice(message) {

        let notice = document.querySelector("#site-notice");

        if (!notice) {
            notice = document.createElement("div");
            notice.id = "site-notice";

            notice.setAttribute("role", "status");
            notice.setAttribute("aria-live", "polite");

            document.body.appendChild(notice);
        }

        notice.textContent = message;
        notice.hidden = false;

        clearTimeout(noticeTimeout);

        noticeTimeout = setTimeout(function () {
            notice.hidden = true;
        }, 4500);
    }


    // -----------------------------------------------------
    // 6. LANGUAGE SELECTOR
    // -----------------------------------------------------

    const languageSelect =
        document.querySelector("#languageSelect");

    if (languageSelect) {

        languageSelect.addEventListener("change", function () {

            if (languageSelect.value === "hi") {
                showNotice(
                    "Hindi translation is not available yet. " +
                    "The interface will remain in English."
                );
            } else {
                showNotice(
                    "English selected."
                );
            }
        });
    }


    // -----------------------------------------------------
    // 7. CONTACT FORM
    // -----------------------------------------------------

    const contactForm =
        document.querySelector("#contactForm");

    if (contactForm) {

        contactForm.addEventListener("submit", function (event) {

            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            showNotice(
                "Thank you for your message! This is a demo form, " +
                "so your message has not been sent or saved."
            );

            contactForm.reset();
        });
    }


    // -----------------------------------------------------
    // 8. GET STARTED LINKS
    // -----------------------------------------------------

    const getStartedLinks = document.querySelectorAll(
        'a[href="#get-started"]'
    );

    const contactName =
        document.querySelector("#contactName");

    getStartedLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            if (contactName) {
                event.preventDefault();

                const targetSection =
                    document.querySelector("#get-started");

                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }

                setTimeout(function () {
                    contactName.focus({
                        preventScroll: true
                    });
                }, 500);
            }
        });
    });


    // -----------------------------------------------------
    // 9. BASIC PAGE INITIALISATION
    // -----------------------------------------------------

    document.documentElement.classList.add("js-ready");

});
