
document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // Update the footer year.
    const yearElement = document.getElementById("hospitalYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Fictional demonstration organisation.
    const hospital = {
        name: "Example Hospital",
        initials: "EH",
        patientCount: 248,
        consultationCount: 18,
        reportCount: 7,
        staffCount: 32
    };

    // Update the organisation name and avatar.
    const hospitalName = document.getElementById("hospitalNameShort");
    const organisationName = document.getElementById("hospitalOrganisationName");
    const initials = document.getElementById("hospitalInitials");

    if (hospitalName) {
        hospitalName.textContent = hospital.name;
    }

    if (organisationName) {
        organisationName.textContent = hospital.name;
    }

    if (initials) {
        initials.textContent = hospital.initials;
    }

    // Update the dashboard summary cards.
    const dashboardValues = {
        hospitalPatientCount: hospital.patientCount,
        hospitalConsultationCount: hospital.consultationCount,
        hospitalReportCount: hospital.reportCount,
        hospitalStaffCount: hospital.staffCount
    };

    Object.entries(dashboardValues).forEach(function ([id, value]) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value.toLocaleString("en-IN");
        }
    });

    /*
     * The shared common.js handles the sidebar, notification
     * button and sign-out demonstration notice.
     *
     * These dashboard figures are illustrative only. They are
     * not retrieved from a server or a real hospital database.
     */
});
