
/* =========================================
   MedIntelliX — Shared Portal JavaScript
   File: js/common.js
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    initializePortalSidebar();
    initializePortalNotifications();
    initializePortalLinks();
});

/* ---------- Mobile Sidebar ---------- */

function initializePortalSidebar() {
    const sidebar = document.getElementById("patientSidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const toggleButton = document.getElementById("sidebarToggle");

    if (!sidebar || !overlay || !toggleButton) {
        return;
    }

    function openSidebar() {
        sidebar.classList.add("sidebar-open");
        overlay.classList.add("overlay-visible");

        toggleButton.setAttribute("aria-expanded", "true");
        overlay.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
        sidebar.classList.remove("sidebar-open");
        overlay.classList.remove("overlay-visible");

        toggleButton.setAttribute("aria-expanded", "false");
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function toggleSidebar() {
        const isOpen = sidebar.classList.contains("sidebar-open");

        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    toggleButton.setAttribute("aria-controls", sidebar.id);
    toggleButton.setAttribute("aria-expanded", "false");
    overlay.setAttribute("aria-hidden", "true");

    toggleButton.addEventListener("click", toggleSidebar);
    overlay.addEventListener("click", closeSidebar);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });

    sidebar.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            closeSidebar();
        });
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 900) {
            closeSidebar();
        }
    });
}

/* ---------- Demo Notifications ---------- */

function showPortalNotice(message, type = "info") {
    let notice = document.getElementById("portalNotice");

    if (!notice) {
        notice = document.createElement("div");
        notice.id = "portalNotice";
        notice.className = "portal-notice";
        notice.setAttribute("role", "status");
        notice.setAttribute("aria-live", "polite");

        document.body.appendChild(notice);
    }

    notice.className = "portal-notice portal-notice-" + type;
    notice.textContent = message;
    notice.hidden = false;

    if (notice.hideTimeout) {
        clearTimeout(notice.hideTimeout);
    }

    notice.hideTimeout = setTimeout(function () {
        notice.hidden = true;
    }, 4000);
}

function initializePortalNotifications() {
    const notificationButton = document.getElementById(
        "notificationButton"
    );

    if (!notificationButton) {
        return;
    }

    notificationButton.addEventListener("click", function () {
        const notifSection = document.getElementById("notifications-section");
        if (notifSection) {
            notifSection.scrollIntoView({ behavior: "smooth" });
        } else {
            window.location.href = "dashboard.html#notifications-section";
        }
    });
}

/* ---------- Portal Sign Out ---------- */

function initializePortalLinks() {
    const logoutLink = document.getElementById("logoutLink");

    if (logoutLink) {
        logoutLink.addEventListener("click", function (event) {
            event.preventDefault();
            localStorage.removeItem("medintellix_token");
            localStorage.removeItem("medintellix_user");
            window.location.href = "../login.html";
        });
    }
}
