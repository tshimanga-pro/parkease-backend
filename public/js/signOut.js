(() => {
  const STORAGE_KEY = "parkEaseRegistrations";

  const searchQuery = document.getElementById("searchQuery");
  const searchBtn = document.getElementById("searchBtn");

  const sidebarMessage = document.getElementById("sidebarMessage");
  const sidebarDetails = document.getElementById("sidebarDetails");
  const sbDriver = document.getElementById("sbDriver");
  const sbPlate = document.getElementById("sbPlate");
  const sbVehicle = document.getElementById("sbVehicle");
  const sbArrival = document.getElementById("sbArrival");
  const sbDuration = document.getElementById("sbDuration");
  const sbFee = document.getElementById("sbFee");
  const sbStatus = document.getElementById("sbStatus");
  const sbSignOut = document.getElementById("sbSignOut");

  let currentEntry = null;

  function getRegistrations() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function formatDateTime(value) {
    if (!value) return "—";
    const d = new Date(value);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDuration(ms) {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  function calculateFee(vehicleType, arrivalTime, signOutTime) {
    const durationMs = signOutTime - arrivalTime;
    const durationHrs = durationMs / (1000 * 60 * 60);
    const hour = new Date(arrivalTime).getHours();
    const isDay = hour >= 6 && hour < 19;
    const isShort = durationHrs < 3;

    const rates = {
      Truck: { short: 2000, day: 5000, night: 10000 },
      "Personal Car": { short: 2000, day: 3000, night: 2000 },
      Taxi: { short: 2000, day: 3000, night: 2000 },
      Coaster: { short: 3000, day: 4000, night: 2000 },
      "Boda Boda": { short: 1000, day: 2000, night: 2000 },
    };

    const r = rates[vehicleType] || rates["Personal Car"];
    return isShort ? r.short : isDay ? r.day : r.night;
  }

  function clearSidebar() {
    currentEntry = null;
    sidebarMessage.textContent = "Search a receipt or plate to see details here.";
    sidebarDetails.hidden = true;
    sbStatus.textContent = "PENDING SIGN-OUT";
    sbStatus.className = "status-badge pending";
    sbSignOut.disabled = true;
  }

  function showSidebarEntry(entry) {
    currentEntry = entry;
    sidebarDetails.hidden = false;
    sidebarMessage.textContent = "";

    const now = Date.now();
    const arrivalMs = new Date(entry.arrivalTime || entry.date || Date.now()).getTime();
    const durationMs = Math.max(0, now - arrivalMs);

    sbDriver.textContent = entry.driverName;
    sbPlate.textContent = entry.numberPlate;
    sbVehicle.textContent = entry.vehicleType;
    sbArrival.textContent = formatDateTime(entry.arrivalTime || entry.date);
    sbDuration.textContent = formatDuration(durationMs);
    sbFee.textContent = `UGX ${calculateFee(entry.vehicleType, arrivalMs, now).toLocaleString()}`;

    sbSignOut.disabled = false;
  }

  function findEntry(query) {
    const normalized = (query || "").trim().toLowerCase();
    if (!normalized) return null;

    const entries = getRegistrations();
    return entries.find((entry) => {
      const plate = (entry.numberPlate || "").toLowerCase();
      const receiptId = (entry.receiptId || "").toLowerCase();
      return plate === normalized || receiptId === normalized;
    });
  }

  function handleSearch() {
    clearSidebar();
    const entry = findEntry(searchQuery.value);
    if (!entry) {
      sidebarMessage.textContent = "No matching receipt found. Try a different ID or plate.";
      return;
    }

    showSidebarEntry(entry);
  }

  function handleSignOut() {
    if (!currentEntry) return;

    const remaining = getRegistrations().filter(
      (entry) => entry.receiptId !== currentEntry.receiptId,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));

    sbStatus.textContent = "SIGNED OUT";
    sbStatus.className = "status-badge complete";
    sbSignOut.disabled = true;
  }

  searchBtn?.addEventListener("click", handleSearch);
  sbSignOut?.addEventListener("click", handleSignOut);

  document.addEventListener("DOMContentLoaded", () => {
    clearSidebar();
  });
})();
