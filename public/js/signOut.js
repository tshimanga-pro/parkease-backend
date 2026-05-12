(() => {
  const searchQuery = document.getElementById("searchQuery");
  const searchBtn = document.getElementById("searchBtn");
  const signOutForm = document.getElementById("signOutForm");
  const vehicleIdInput = document.getElementById("vehicleId");

  const sidebarMessage = document.getElementById("sidebarMessage");
  const sidebarDetails = document.getElementById("sidebarDetails");
  const sbDriver = document.getElementById("sbDriver");
  const sbTicket = document.getElementById("sbTicket");
  const sbPlate = document.getElementById("sbPlate");
  const sbVehicle = document.getElementById("sbVehicle");
  const sbArrival = document.getElementById("sbArrival");
  const sbDuration = document.getElementById("sbDuration");
  const sbFee = document.getElementById("sbFee");
  const sbStatus = document.getElementById("sbStatus");
  const sbSignOut = document.getElementById("sbSignOut");

  let currentVehicle = null;

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

  function clearSidebar() {
    currentVehicle = null;
    vehicleIdInput.value = "";
    sidebarMessage.textContent = "Search a ticket or plate to see details here.";
    sidebarDetails.hidden = true;
    sbStatus.textContent = "VEHICLE READY TO CHECKOUT";
    sbStatus.className = "status-badge pending";
    sbSignOut.disabled = true;
  }

  function showSidebarEntry(vehicle) {
    currentVehicle = vehicle;
    vehicleIdInput.value = vehicle._id;
    sidebarDetails.hidden = false;
    sidebarMessage.textContent = "";

    const now = Date.now();
    const arrivalMs = new Date(vehicle.arrivalTime).getTime();
    const durationMs = Math.max(0, now - arrivalMs);

    sbDriver.textContent = vehicle.driverName || "—";
    sbTicket.textContent = vehicle.receiptNumber || "—";
    sbPlate.textContent = vehicle.numberPlate || "—";
    sbVehicle.textContent = vehicle.vehicleType || "—";
    sbArrival.textContent = formatDateTime(vehicle.arrivalTime);
    sbDuration.textContent = formatDuration(durationMs);
    sbFee.textContent = `UGX ${vehicle.fee.toLocaleString()}`;
    sbStatus.textContent = "VEHICLE READY TO CHECKOUT";
    sbStatus.className = "status-badge pending";
    sbSignOut.disabled = false;
  }

  async function handleSearch(e) {
    e.preventDefault();
    clearSidebar();

    const query = searchQuery.value.trim();
    if (!query) {
      sidebarMessage.textContent = "Please enter a ticket number or plate number.";
      return;
    }

    try {
      const response = await fetch("/signout/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchQuery: query }),
      });

      const data = await response.json();

      if (!response.ok) {
        sidebarMessage.textContent = data.error || "Search failed.";
        return;
      }

      if (data.success && data.vehicle) {
        showSidebarEntry(data.vehicle);
      }
    } catch (error) {
      console.error("Search error:", error);
      sidebarMessage.textContent = "An error occurred during search.";
    }
  }

  function handleSignOutClick(e) {
    e.preventDefault();
    if (!currentVehicle) {
      alert("Please search for a vehicle first.");
      return;
    }
    signOutForm.submit();
  }

  searchBtn?.addEventListener("click", handleSearch);
  sbSignOut?.addEventListener("click", handleSignOutClick);

  document.addEventListener("DOMContentLoaded", () => {
    clearSidebar();
  });
})();
