/**
 * Shift Display Script
 * Updates #shift span with current shift based on time of day
 * Day Shift: 06:00 - 18:00
 * Night Shift: 18:00 - 06:00
 */

(function () {
  try {
    const shiftEl = document.getElementById("shift");
    if (!shiftEl) return;

    const now = new Date();
    const hour = now.getHours();

    let shiftLabel = "";

    // Day shift: 06:00 - 18:00 (6am to 6pm)
    if (hour >= 6 && hour < 18) {
      shiftLabel = "Day Shift (06:00 – 18:00)";
    }
    // Night shift: 18:00 - 06:00 (6pm to 6am next day)
    else if (hour >= 18 || hour < 6) {
      shiftLabel = "Night Shift (18:00 – 06:00)";
    }

    shiftEl.textContent = shiftLabel;
  } catch (e) {
    console.error("Shift script error:", e);
  }
})();
