/* =========================================
   MedIntelliX — Shared Portal JavaScript
   File: js/common.js
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    initializePortalSidebar();
    initializePortalNotifications();
    initializePortalLinks();
    updatePortalUserDisplay();
});

/* ---------- User State & Identity Management ---------- */

function getCurrentUser() {
    try {
        const raw = localStorage.getItem("medintellix_user");
        if (raw) {
            const user = JSON.parse(raw);
            if (user && (user.full_name || user.email)) {
                return user;
            }
        }
    } catch (e) {
        console.warn("Could not parse saved user from localStorage:", e);
    }
    return null;
}

function setCurrentUser(user) {
    if (!user) return;
    try {
        localStorage.setItem("medintellix_user", JSON.stringify(user));
        updatePortalUserDisplay(user);
    } catch (e) {
        console.warn("Could not save user to localStorage:", e);
    }
}

function getUserInitials(fullName) {
    const cleaned = (fullName || "").trim();
    if (!cleaned) return "P";
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function updatePortalUserDisplay(explicitUser = null) {
    const user = explicitUser || getCurrentUser();
    const displayName = user && user.full_name ? user.full_name : "Patient";
    const initials = getUserInitials(displayName);

    // Update all matching elements across patient pages
    document.querySelectorAll("#patientName").forEach(function (el) {
        el.textContent = displayName;
    });

    document.querySelectorAll("#profileInitials, .topbar-avatar, #topbarAvatar").forEach(function (el) {
        el.textContent = initials;
    });

    const welcomeEl = document.getElementById("welcomeName");
    if (welcomeEl) {
        const firstName = displayName.split(/\s+/)[0] || displayName;
        welcomeEl.textContent = firstName;
    }
}

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
    const notificationButton = document.getElementById("notificationButton");

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
            // Clear current authentication session
            localStorage.removeItem("medintellix_token");
            localStorage.removeItem("medintellix_user");
            
            // Clean up profile storage keys if any
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith("medintellix_profile_")) {
                    keysToRemove.push(k);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));

            const inPages = window.location.pathname.includes("/pages/");
            const inSub = window.location.pathname.includes("/patient/") || 
                          window.location.pathname.includes("/hospital/") || 
                          window.location.pathname.includes("/government/");
            
            if (inSub) {
                window.location.href = "../login.html";
            } else if (inPages) {
                window.location.href = "login.html";
            } else {
                window.location.href = "pages/login.html";
            }
        });
    }
}
