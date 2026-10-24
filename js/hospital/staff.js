
document.addEventListener("DOMContentLoaded", () => {
    const staff = [
        { id: "STF-101", name: "Dr. Meera Sharma", role: "Doctor", department: "General Medicine", email: "meera.sharma@example.test", status: "active" },
        { id: "STF-102", name: "Dr. Arjun Kapoor", role: "Doctor", department: "Cardiology", email: "arjun.kapoor@example.test", status: "active" },
        { id: "STF-103", name: "Nisha Patel", role: "Nurse", department: "Patient Care", email: "nisha.patel@example.test", status: "active" },
        { id: "STF-104", name: "Rahul Das", role: "Lab Technician", department: "Laboratory", email: "rahul.das@example.test", status: "pending" },
        { id: "STF-105", name: "Kavita Rao", role: "Doctor", department: "Pathology", email: "kavita.rao@example.test", status: "active" },
        { id: "STF-106", name: "Aman Khanna", role: "Administrator", department: "Administration", email: "aman.khanna@example.test", status: "active" },
        { id: "STF-107", name: "Pooja Menon", role: "Receptionist", department: "Front Desk", email: "pooja.menon@example.test", status: "inactive" },
        { id: "STF-108", name: "Farhan Ali", role: "Nurse", department: "Patient Care", email: "farhan.ali@example.test", status: "active" }
    ];

    const $ = id => document.getElementById(id);
    const tableBody = $("staffTableBody");
    const staffModal = bootstrap.Modal.getOrCreateInstance($("staffDetailsModal"));
    const addModal = bootstrap.Modal.getOrCreateInstance($("addStaffModal"));

    let selectedStaffId = null;
    let nextId = 109;

    const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);

    const statusText = status => ({
        active: "Active",
        pending: "Pending",
        inactive: "Inactive"
    }[status] || status);

    function toast(message) {
        const element = $("staffToast");
        element.textContent = message;
        element.classList.add("show");
        window.clearTimeout(toast.timer);
        toast.timer = window.setTimeout(() => element.classList.remove("show"), 2600);
    }

    function updateStats() {
        $("totalStaff").textContent = staff.length;
        $("activeStaff").textContent = staff.filter(person => person.status === "active").length;
        $("pendingStaff").textContent = staff.filter(person => person.status === "pending").length;
        $("inactiveStaff").textContent = staff.filter(person => person.status === "inactive").length;
    }

    function filteredStaff() {
        const query = $("staffSearch").value.trim().toLowerCase();
        const role = $("roleFilter").value;
        const status = $("statusFilter").value;

        return staff.filter(person => {
            const text = [person.id, person.name, person.role, person.department, person.email]
                .join(" ").toLowerCase();

            return text.includes(query)
                && (role === "all" || person.role === role)
                && (status === "all" || person.status === status);
        });
    }

    function renderStaff() {
        const results = filteredStaff();

        tableBody.innerHTML = results.map(person => `
            <tr>
                <td><strong>${escapeHTML(person.name)}</strong></td>
                <td>${escapeHTML(person.id)}</td>
                <td>${escapeHTML(person.role)}</td>
                <td>${escapeHTML(person.department)}</td>
                <td>${escapeHTML(person.email)}</td>
                <td><span class="status-badge status-${escapeHTML(person.status)}">${escapeHTML(statusText(person.status))}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary view-staff" data-id="${escapeHTML(person.id)}">
                        Details
                    </button>
                </td>
            </tr>
        `).join("");

        $("resultsCount").textContent = `${results.length} ${results.length === 1 ? "staff member" : "staff members"}`;
        $("emptyState").classList.toggle("d-none", results.length > 0);
        $("staffTable").classList.toggle("d-none", results.length === 0);
        updateStats();
    }

    function openStaffDetails(id) {
        const person = staff.find(item => item.id === id);
        if (!person) return;

        selectedStaffId = id;
        $("staffModalTitle").textContent = person.name;
        $("staffDetailsBody").innerHTML = `
            <div class="report-detail-grid">
                <div><span>Staff ID</span><strong>${escapeHTML(person.id)}</strong></div>
                <div><span>Role</span><strong>${escapeHTML(person.role)}</strong></div>
                <div><span>Department</span><strong>${escapeHTML(person.department)}</strong></div>
                <div><span>Email</span><strong>${escapeHTML(person.email)}</strong></div>
                <div><span>Account status</span><strong>${escapeHTML(statusText(person.status))}</strong></div>
            </div>
            <div class="alert alert-light border small mt-3 mb-0">
                Status changes here are temporary demo actions. They do not grant or revoke actual system access.
            </div>
        `;

        $("toggleStaffStatusButton").textContent =
            person.status === "active" ? "Deactivate demo account" : "Activate demo account";

        staffModal.show();
    }

    tableBody.addEventListener("click", event => {
        const button = event.target.closest(".view-staff");
        if (button) openStaffDetails(button.dataset.id);
    });

    ["staffSearch", "roleFilter", "statusFilter"].forEach(id => {
        $(id).addEventListener(id === "staffSearch" ? "input" : "change", renderStaff);
    });

    function resetFilters() {
        $("staffSearch").value = "";
        $("roleFilter").value = "all";
        $("statusFilter").value = "all";
        renderStaff();
    }

    $("resetFilters").addEventListener("click", resetFilters);
    $("emptyResetButton").addEventListener("click", resetFilters);

    $("toggleStaffStatusButton").addEventListener("click", () => {
        const person = staff.find(item => item.id === selectedStaffId);
        if (!person) return;

        person.status = person.status === "active" ? "inactive" : "active";
        staffModal.hide();
        renderStaff();
        toast(`${person.name}'s demo status is now ${statusText(person.status).toLowerCase()}.`);
    });

    $("addStaffButton").addEventListener("click", () => {
        $("addStaffForm").reset();
        addModal.show();
    });

    $("addStaffForm").addEventListener("submit", event => {
        event.preventDefault();

        const name = $("newStaffName").value.trim();
        const email = $("newStaffEmail").value.trim();
        const role = $("newStaffRole").value;
        const department = $("newStaffDepartment").value.trim();

        if (!name || !email || !role || !department) {
            toast("Please complete every field.");
            return;
        }

        if (staff.some(person => person.email.toLowerCase() === email.toLowerCase())) {
            toast("That email already exists in this demo list.");
            return;
        }

        staff.push({
            id: `STF-${nextId++}`,
            name,
            email,
            role,
            department,
            status: "pending"
        });

        addModal.hide();
        resetFilters();
        toast("Demo staff member added with pending status.");
    });

    renderStaff();
});
