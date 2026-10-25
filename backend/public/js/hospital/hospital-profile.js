
document.addEventListener("DOMContentLoaded", () => {
    const $ = id => document.getElementById(id);

    const defaults = {
        hospitalName: "MedIntelliX City Hospital",
        institutionalId: "HSP-DEMO-001",
        hospitalType: "Multi-speciality Hospital",
        hospitalAddress: "42 Health Avenue",
        hospitalCity: "New Delhi",
        hospitalState: "Delhi",
        hospitalPin: "110001",
        hospitalPhone: "011-4000-1234",
        hospitalEmail: "contact@example.test",
        hospitalWebsite: "",
        hospitalDescription: "A fictional multi-speciality institution used to demonstrate the MedIntelliX hospital portal.",
        openingTime: "09:00",
        closingTime: "18:00"
    };

    const profileFields = [
        "hospitalName",
        "institutionalId",
        "hospitalType",
        "hospitalAddress",
        "hospitalCity",
        "hospitalState",
        "hospitalPin",
        "hospitalPhone",
        "hospitalEmail",
        "hospitalWebsite",
        "hospitalDescription",
        "openingTime",
        "closingTime"
    ];

    const serviceFields = [
        "serviceEmergency",
        "serviceLaboratory",
        "serviceImaging",
        "servicePharmacy"
    ];

    const defaultServices = {
        serviceEmergency: true,
        serviceLaboratory: true,
        serviceImaging: true,
        servicePharmacy: false
    };

    function showToast(message) {
        const toast = $("profileToast");
        toast.textContent = message;
        toast.classList.add("show");

        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    function loadDefaults() {
        profileFields.forEach(id => {
            $(id).value = defaults[id];
        });

        serviceFields.forEach(id => {
            $(id).checked = defaultServices[id];
        });

        updateBanner();
    }

    function updateBanner() {
        $("bannerHospitalName").textContent = $("hospitalName").value.trim() || defaults.hospitalName;
        $("bannerHospitalLocation").textContent =
            `${$("hospitalCity").value.trim()}, ${$("hospitalState").value.trim()}`.replace(/^,\s*|,\s*$/g, "");
        $("bannerHospitalId").textContent = $("institutionalId").value;
    }

    $("hospitalProfileForm").addEventListener("submit", event => {
        event.preventDefault();

        const form = $("hospitalProfileForm");
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        updateBanner();
        showToast("Profile updated for this demo session. Changes will reset on refresh.");
    });

    $("servicesForm").addEventListener("submit", event => {
        event.preventDefault();

        const opening = $("openingTime").value;
        const closing = $("closingTime").value;

        if (!opening || !closing) {
            showToast("Please enter both operating times.");
            return;
        }

        if (opening === closing) {
            showToast("Opening and closing times cannot be identical.");
            return;
        }

        const chosenServices = serviceFields
            .filter(id => $(id).checked)
            .map(id => $(id).nextElementSibling.textContent.trim());

        showToast(
            `Demo settings updated: ${chosenServices.length} service(s) selected.`
        );
    });

    $("resetProfileButton").addEventListener("click", () => {
        loadDefaults();
        showToast("The demo profile has been reset.");
    });

    $("hospitalPin").addEventListener("input", event => {
        event.target.value = event.target.value.replace(/\D/g, "").slice(0, 6);
    });

    $("hospitalName").addEventListener("input", updateBanner);
    $("hospitalCity").addEventListener("input", updateBanner);
    $("hospitalState").addEventListener("input", updateBanner);

    $("helpButton").addEventListener("click", () => {
        showToast("Production setup requires secure authentication, server-side validation, and an audit trail.");
    });

    loadDefaults();
});
