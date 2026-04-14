(() => {
  const STORAGE_KEY = "parkEaseRole";
  const roleSelect = document.getElementById("roleSelect");
  const currentRoleEl = document.getElementById("currentRole");
  const dashboardContent = document.getElementById("dashboardContent");

  function setRole(role) {
    if (!role) {
      currentRoleEl.textContent = "Role: —";
      dashboardContent.innerHTML = `
        <p class="dashboard-help">Select a role to see your dashboard actions.</p>
      `;
      return;
    }

    localStorage.setItem(STORAGE_KEY, role);
    currentRoleEl.textContent = `Role: ${role}`;
    dashboardContent.innerHTML = getContentForRole(role);
  }

  function getContentForRole(role) {
    const shared = `
      <div class="dashboard-card">
        <h3>Quick Links</h3>
        <ul>
          <li><a href="vehicleRegistration.html">Register Vehicle</a></li>
          <li><a href="vehicleSignOut.html">Check Out</a></li>
          <li><a href="reports.html">Reports</a></li>
        </ul>
      </div>
    `;

    if (role === "Admin") {
      return `
        <div class="dashboard-card">
          <h3>Admin Actions</h3>
          <ul>
            <li><a href="reports.html">View Reports</a></li>
            
        </ul>
        </div>
        ${shared}
      `;
    }

    if (role === "Section Manager") {
      return `
        <div class="dashboard-card">
          <h3>Section Manager</h3>
          <ul>
            <li><a href="batterySection.html">Battery Section</a></li>
            <li><a href="tyreClinic.html">Tyre Clinic</a></li>
           
          </ul>
        </div>
        ${shared}
      `;
    }

    if (role === "Parking Attendant") {
      return `
        <div class="dashboard-card">
          <h3>Parking Attendant</h3>
          <ul>
            <li><a href="vehicleRegistration.html">Register Vehicle</a></li>
            <li><a href="vehicleSignOut.html">Sign Out Vehicle</a></li>
            <li><a href="#">View my assignments</a></li>
          </ul>
        </div>
        ${shared}
      `;
    }

    return `
      <p class="dashboard-help">Role not recognized. Please select a supported role.</p>
    `;
  }
              <li><a href="vehicleSignOut.html">Check Out</a></li>
  roleSelect.addEventListener("change", (event) => {
    setRole(event.target.value);
  });

  document.addEventListener("DOMContentLoaded", () => {
    const savedRole = localStorage.getItem(STORAGE_KEY);
    if (savedRole) {
      roleSelect.value = savedRole;
      setRole(savedRole);
    }
  });
})();
