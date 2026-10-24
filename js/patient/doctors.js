
document.addEventListener("DOMContentLoaded", function () {
    const yearElement = document.getElementById("doctorsYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    const doctors = [
        {
            name: "Dr. Sample Provider",
            specialty: "General Medicine",
            facility: "Example Health Centre",
            location: "Demo location, India",
            credentials: "Example credentials — not verified"
        },
        {
            name: "Dr. Example Clinician",
            specialty: "Cardiology",
            facility: "Sample Medical Centre",
            location: "Demo location, India",
            credentials: "Example credentials — not verified"
        },
        {
            name: "Dr. Demo Specialist",
            specialty: "Dermatology",
            facility: "Example Hospital",
            location: "Demo location, India",
            credentials: "Example credentials — not verified"
        },
        {
            name: "Dr. Prototype Consultant",
            specialty: "Paediatrics",
            facility: "Demo Family Clinic",
            location: "Demo location, India",
            credentials: "Example credentials — not verified"
        }
    ];

    const cards = Array.from(document.querySelectorAll(".doctor-card"));
    const searchInput = document.getElementById("doctorSearch");
    const specialtyFilter = document.getElementById("specialtyFilter");
    const emptyState = document.getElementById("doctorEmpty");

    function filterDoctors() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedSpecialty = specialtyFilter.value;
        let visibleCount = 0;

        cards.forEach(function (card) {
            const searchableText = card.textContent.toLowerCase();
            const matchesSearch = searchableText.includes(query);
            const matchesSpecialty =
                selectedSpecialty === "all" ||
                card.dataset.specialty === selectedSpecialty;

            const visible = matchesSearch && matchesSpecialty;
            card.hidden = !visible;

            if (visible) {
                visibleCount++;
            }
        });

        emptyState.style.display = visibleCount === 0 ? "block" : "none";
    }

    searchInput.addEventListener("input", filterDoctors);
    specialtyFilter.addEventListener("change", filterDoctors);

    const specialties = new Set(
        doctors.map(function (doctor) {
            return doctor.specialty;
        })
    );

    const facilities = new Set(
        doctors.map(function (doctor) {
            return doctor.facility;
        })
    );

    document.getElementById("totalDoctors").textContent = doctors.length;
    document.getElementById("totalSpecialties").textContent = specialties.size;
    document.getElementById("totalFacilities").textContent = facilities.size;

    const modalElement = document.getElementById("doctorDetailsModal");

    if (modalElement && window.bootstrap) {
        const doctorModal = new bootstrap.Modal(modalElement);

        document.querySelectorAll("[data-doctor]").forEach(function (button) {
            button.addEventListener("click", function () {
                const index = Number(button.dataset.doctor);
                const doctor = doctors[index];

                if (!doctor) {
                    return;
                }

                document.getElementById("doctorModalTitle").textContent =
                    doctor.name;

                document.getElementById("modalDoctorSpecialty").textContent =
                    doctor.specialty;

                document.getElementById("modalDoctorFacility").textContent =
                    doctor.facility;

                document.getElementById("modalDoctorLocation").textContent =
                    doctor.location;

                document.getElementById("modalDoctorCredentials").textContent =
                    doctor.credentials;

                doctorModal.show();
            });
        });
    }
});
