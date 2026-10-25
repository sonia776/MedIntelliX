
document.addEventListener("DOMContentLoaded", function () {
    const yearElement = document.getElementById("appointmentsYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    const appointments = [
        {
            reference: "APT-DEMO-001",
            title: "General Consultation",
            status: "scheduled",
            provider: "Dr. Sample Provider",
            clinic: "Example Health Centre",
            date: "28 Oct 2026",
            time: "10:30 AM"
        },
        {
            reference: "APT-DEMO-002",
            title: "Routine Follow-up",
            status: "completed",
            provider: "Dr. Example Clinician",
            clinic: "Sample Medical Centre",
            date: "09 Oct 2026",
            time: "02:00 PM"
        },
        {
            reference: "APT-DEMO-003",
            title: "Specialist Consultation",
            status: "cancelled",
            provider: "Dr. Demo Specialist",
            clinic: "Example Hospital",
            date: "22 Sep 2026",
            time: "11:15 AM"
        }
    ];

    const cards = Array.from(
        document.querySelectorAll(".appointment-card")
    );

    const searchInput = document.getElementById("appointmentSearch");
    const statusFilter = document.getElementById("appointmentStatusFilter");
    const emptyState = document.getElementById("appointmentEmpty");

    function filterAppointments() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value;
        let visibleCount = 0;

        cards.forEach(function (card) {
            const text = card.textContent.toLowerCase();
            const matchesSearch = text.includes(query);
            const matchesStatus =
                selectedStatus === "all" ||
                card.dataset.status === selectedStatus;

            const visible = matchesSearch && matchesStatus;
            card.hidden = !visible;

            if (visible) {
                visibleCount++;
            }
        });

        emptyState.style.display = visibleCount === 0 ? "block" : "none";
    }

    searchInput.addEventListener("input", filterAppointments);
    statusFilter.addEventListener("change", filterAppointments);

    const count = function (status) {
        return appointments.filter(function (appointment) {
            return appointment.status === status;
        }).length;
    };

    document.getElementById("totalAppointments").textContent =
        appointments.length;

    document.getElementById("scheduledAppointments").textContent =
        count("scheduled");

    document.getElementById("completedAppointments").textContent =
        count("completed");

    const modalElement = document.getElementById("appointmentDetailsModal");

    if (modalElement && window.bootstrap) {
        const modal = new bootstrap.Modal(modalElement);

        document.querySelectorAll("[data-appointment]").forEach(function (button) {
            button.addEventListener("click", function () {
                const index = Number(button.dataset.appointment);
                const appointment = appointments[index];

                if (!appointment) {
                    return;
                }

                document.getElementById("appointmentModalTitle").textContent =
                    appointment.title;

                document.getElementById("modalAppointmentReference").textContent =
                    appointment.reference;

                document.getElementById("modalAppointmentStatus").textContent =
                    appointment.status.charAt(0).toUpperCase() +
                    appointment.status.slice(1) + " (demo)";

                document.getElementById("modalAppointmentProvider").textContent =
                    appointment.provider;

                document.getElementById("modalAppointmentClinic").textContent =
                    appointment.clinic;

                document.getElementById("modalAppointmentDate").textContent =
                    appointment.date;

                document.getElementById("modalAppointmentTime").textContent =
                    appointment.time;

                modal.show();
            });
        });
    }
});
