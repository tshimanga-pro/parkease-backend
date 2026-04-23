      (function () {
        const user = JSON.parse(localStorage.getItem("parkEaseUser") || "null");
        const userNameEl = document.getElementById("userName");
        const userEmailEl = document.getElementById("userEmail");

        if (user && userNameEl && userEmailEl) {
          const displayName = [user.firstName, user.surname].filter(Boolean).join(" ");
          userNameEl.textContent = displayName || user.email || "Parking Attendant";
          userEmailEl.textContent = user.email || "attendant@example.com";
        }
      })();

      const totalVehiclesEl = document.getElementById("totalVehicles");
      const totalRevenueEl = document.getElementById("totalRevenue");
      const slotFillEl = document.getElementById("slotFill");
      const slotCountEl = document.getElementById("slotCount");
      const slotTotalEl = document.getElementById("slotTotal");
      const slotPercEl = document.getElementById("slotPerc");
      const activityLog = document.getElementById("activityLog");
      const arrivalsBody = document.querySelector(".arrivals-table tbody");

      function formatUGX(value) {
        return value.toLocaleString(undefined, {
          style: "currency",
          currency: "UGX",
          maximumFractionDigits: 0,
        });
      }

      function getRegistrations() {
        try {
          const raw = localStorage.getItem("parkEaseRegistrations");
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      }

      function getSignouts() {
        try {
          const raw = localStorage.getItem("parkEaseSignouts");
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      }

      function getTodayKey() {
        return new Date().toISOString().slice(0, 10);
      }

      function getTodayRevenue() {
        const todayKey = getTodayKey();
        return getSignouts().reduce((sum, signout) => {
          const signoutDate = String(signout.signoutDate || "");
          const amount = Number(signout.fee || 0);
          return sum + (signoutDate === todayKey && Number.isFinite(amount) ? amount : 0);
        }, 0);
      }

      function getCurrentShift() {
        const rawUser = localStorage.getItem("parkEaseUser");
        const user = rawUser ? JSON.parse(rawUser) : null;
        const loginTime = user?.loginTime ? new Date(user.loginTime) : new Date();
        const hour = loginTime.getHours();

        if (hour >= 7 && hour < 18) {
          return { label: "Day Shift", range: "07:00 – 18:00" };
        }

        if (hour >= 19 || hour < 6) {
          return { label: "Night Shift", range: "19:00 – 06:00" };
        }

        return { label: "Transition Shift", range: "18:00 – 19:00" };
      }

      function updateShiftInfo() {
        const shiftTimeEl = document.getElementById("shiftTime");
        if (!shiftTimeEl) return;
        const shift = getCurrentShift();
        shiftTimeEl.textContent = `${shift.label} (${shift.range})`;
      }

      function updateStats() {
        const registrations = getRegistrations();
        const totalVehicles = registrations.length;
        const revenue = getTodayRevenue();
        const maxSlots = 60;
        const occupied = totalVehicles;
        const percent = maxSlots ? Math.round((occupied / maxSlots) * 100) : 0;

        totalVehiclesEl.textContent = totalVehicles;
        totalRevenueEl.textContent = formatUGX(revenue);
        slotCountEl.textContent = occupied;
        slotTotalEl.textContent = maxSlots;
        slotPercEl.textContent = percent;
        slotFillEl.style.width = `${percent}%`;

      }

      function updateTable() {
        const registrations = getRegistrations();
        const signouts = getSignouts();
        const rows = [];

        registrations.forEach((entry) => {
          rows.push({
            time: entry.arrivalTime || entry.date || "—",
            plate: entry.numberPlate || "—",
            type: entry.vehicleType || "—",
            status: "Parked",
          });
        });

        signouts.slice(-10).reverse().forEach((entry) => {
          rows.push({
            time: entry.outTime ? new Date(entry.outTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
            plate: entry.numberPlate || "—",
            type: entry.vehicleType || "—",
            status: "Signed Out",
          });
        });

        const sorted = rows.sort((a, b) => {
          const aTime = a.time === "—" ? 0 : Date.parse(`1970-01-01T${a.time}:00`);
          const bTime = b.time === "—" ? 0 : Date.parse(`1970-01-01T${b.time}:00`);
          return bTime - aTime;
        });

        arrivalsBody.innerHTML = sorted
          .slice(0, 10)
          .map(
            (row) => `
                <tr>
                  <td>${row.time}</td>
                  <td>${row.plate}</td>
                  <td>${row.type}</td>
                  <td><span class="status-badge ${row.status === "Parked" ? "parked" : "signed-out"}">${row.status}</span></td>
                  <td><button class="actions-menu" title="More actions">⋮</button></td>
                </tr>
              `,
          )
          .join("");
      }

      function addActivity(message) {
        const item = document.createElement("li");
        item.textContent = `${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — ${message}`;
        activityLog.prepend(item);
        if (activityLog.children.length > 10) {
          activityLog.removeChild(activityLog.lastChild);
        }
      }

      document
        .getElementById("notificationBtn")
        .addEventListener("click", () => {
          addActivity("Viewed notifications");
          document
            .getElementById("notificationBtn")
            .setAttribute("data-count", "0");
        });

      document
        .getElementById("dashboardSearch")
        .addEventListener("input", (event) => {
          const term = event.target.value.trim();
          if (!term) return;
          addActivity(`Searching for “${term}”`);
        });

      updateShiftInfo();
      updateStats();
      updateTable();
