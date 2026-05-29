      (function () {
        const user = JSON.parse(localStorage.getItem("parkEaseUser") || "null");
        const userNameEl = document.getElementById("userName");
        const userEmailEl = document.getElementById("userEmail");

        if (!user || !userNameEl || !userEmailEl) {
          return;
        }

        const displayName = [user.firstName, user.surname].filter(Boolean).join(" ");
        userNameEl.textContent = displayName || user.email || "Service Manager";
        userEmailEl.textContent = user.email || "manager@example.com";
      })();

      function formatDateKey(date) {
        return new Date(date).toISOString().slice(0, 10);
      }

      function formatTime(value) {
        if (!value) return "—";
        const date = new Date(value);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }

      function getTyreTransactions() {
        try {
          const raw = localStorage.getItem("tyreClinicTransactions");
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      }

      function getBatteryTransactions() {
        try {
          const raw = localStorage.getItem("parkEaseBatteryTransactions");
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      }

      function getBatteryRegistrations() {
        try {
          const raw = localStorage.getItem("parkEaseBatteries");
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      }

      function getTodayKey() {
        return new Date().toISOString().slice(0, 10);
      }

      function formatCurrency(value) {
        return value.toLocaleString(undefined, {
          style: "currency",
          currency: "UGX",
          maximumFractionDigits: 0,
        });
      }

      function parseUgandaShillings(value) {
        if (value == null) return 0;
        const cleaned = String(value).replace(/[^0-9.-]+/g, "");
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : 0;
      }

      function getTodayTyreServices() {
        const todayKey = getTodayKey();
        return getTyreTransactions().filter((tx) => {
          const txDate = new Date(tx.date).toISOString().slice(0, 10);
          return txDate === todayKey;
        });
      }

      function getTodayBatteryTransactions() {
        const todayKey = getTodayKey();
        return getBatteryTransactions().filter((entry) => {
          const createdKey = new Date(entry.createdAt).toISOString().slice(0, 10);
          return createdKey === todayKey;
        });
      }

      function updateMetrics() {
        const batteryRegistrations = getBatteryRegistrations();
        const tyreTransactions = getTyreTransactions();
        const todayTyreServices = getTodayTyreServices();
        const todayBatteryTransactions = getTodayBatteryTransactions();

        const batteryRevenueToday = todayBatteryTransactions.reduce(
          (sum, entry) => sum + parseUgandaShillings(entry.price),
          0,
        );
        const tyreRevenueToday = todayTyreServices.reduce(
          (sum, tx) => sum + parseUgandaShillings(tx.grandTotal),
          0,
        );
        const batteryTotalRegistered = batteryRegistrations.length;

        const batteryCard = document.querySelector(".stat-card:nth-child(1) .stat-card__value");
        const tyreCard = document.querySelector(".stat-card:nth-child(2) .stat-card__value");
        const batteryRegisteredCard = document.querySelector(".stat-card:nth-child(3) .stat-card__value");

        if (batteryCard) batteryCard.textContent = formatCurrency(batteryRevenueToday);
        if (tyreCard) tyreCard.textContent = formatCurrency(tyreRevenueToday);
        if (batteryRegisteredCard) batteryRegisteredCard.textContent = batteryTotalRegistered;
      }

      function buildTyreItem(tx) {
        if (!Array.isArray(tx.services) || !tx.services.length) {
          return `UGX ${Number(tx.grandTotal || 0).toLocaleString()}`;
        }
        return tx.services.map((service) => service.label || service.code || service).join(", ");
      }

      function updateServiceActivityTable() {
        const tbody = document.querySelector(".arrivals-table tbody");
        if (!tbody) return;

        const tyreTransactions = getTyreTransactions()
          .map((tx) => ({
            time: formatTime(tx.date),
            service: "Tyre Service",
            item: buildTyreItem(tx),
            status: "Completed",
          }))
          .sort((a, b) => (a.time < b.time ? 1 : -1));

        const batteryTransactions = getBatteryTransactions()
          .map((entry) => ({
            time: formatTime(entry.createdAt),
            service: `Battery ${entry.serviceType === "hire" ? "Hire" : "Sale"}`,
            item: `${entry.batteryType || "Battery"} - ${entry.serviceType.charAt(0).toUpperCase() + entry.serviceType.slice(1)}`,
            status: "Completed",
          }))
          .sort((a, b) => (a.time < b.time ? 1 : -1));

        const rows = [...tyreTransactions, ...batteryTransactions]
          .slice(0, 10)
          .map((row) => `
                <tr>
                  <td>${row.time}</td>
                  <td>${row.service}</td>
                  <td>${row.item}</td>
                  <td><span class="status-badge parked">${row.status}</span></td>
                </tr>
              `)
          .join("");

        tbody.innerHTML = rows || `
            <tr>
              <td colspan="4" style="text-align:center; opacity:0.65;">
                No service activities available.
              </td>
            </tr>
          `;
      }

      updateMetrics();
      updateServiceActivityTable();
