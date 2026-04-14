(() => {
  const storageKey = "parkEaseRegistrations";
  const form = document.getElementById("registrationForm");
  if (!form) {
    return;
  }
  const messageEl = document.getElementById("formMessage");
  const entriesBody = document.getElementById("entriesBody");
  const entriesTable = document.querySelector(".entries-table");
  const emptyState = document.querySelector(".saved-entries .empty-state");
  // const printButton = document.getElementById("printReceipt");
  let lastSavedEntry = null;

  function showMessage(text, kind = "success") {
    messageEl.textContent = text;
    messageEl.className = "form-message";
    messageEl.classList.add(kind === "error" ? "error" : "success");
  }

  function clearMessage() {
    messageEl.textContent = "";
    messageEl.className = "form-message";
  }

  function setPrintEnabled(enabled) {
    if (!printButton) return;
    printButton.disabled = !enabled;
    printButton.classList.toggle("disabled", !enabled);
  }

  function printReceipt(entry) {
    if (!entry) return;

    const receiptHtml = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>ParkEase Receipt</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 22px; color: #0f172a; }
            h1 { margin-top: 0; font-size: 1.6rem; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { padding: 10px 12px; border: 1px solid #d1d5db; text-align: left; }
            th { background: #f3f4f6; }
            .note { margin-top: 20px; font-size: 0.95rem; color: #374151; }
          </style>
        </head>
        <body>
          <h1>ParkEase Receipt</h1>
          <p><strong>Date:</strong> ${formatDate(entry.date)} ${entry.arrivalTime || ""}</p>
          <table>
            <tr><th>Driver</th><td>${entry.driverName}</td></tr>
            <tr><th>Number Plate</th><td>${entry.numberPlate}</td></tr>
            <tr><th>Vehicle Model</th><td>${entry.vehicleModel}</td></tr>
            <tr><th>Vehicle Color</th><td>${entry.vehicleColor}</td></tr>
            <tr><th>Vehicle Type</th><td>${entry.vehicleType}</td></tr>
            <tr><th>Phone</th><td>${entry.phoneNumber}</td></tr>
            ${entry.ninNumber ? `<tr><th>NIN</th><td>${entry.ninNumber}</td></tr>` : ""}
          </table>
          <p class="note">Please keep this receipt as proof of registration.</p>
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>`;

    const printWindow = window.open("", "_blank", "width=600,height=700");
    if (!printWindow) {
      showMessage("Unable to open print window. Please allow pop-ups.", "error");
      return;
    }

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  }

  function getRegistrations() {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.warn("Failed to parse saved registrations", error);
      return [];
    }
  }

  function saveRegistrations(entries) {
    localStorage.setItem(storageKey, JSON.stringify(entries));
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function renderEntries(entries) {
    if (!entries.length) {
      entriesTable.hidden = true;
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;
    entriesTable.hidden = false;
    entriesBody.innerHTML = "";

    entries
      .slice()
      .reverse()
      .forEach((entry) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${formatDate(entry.date)} ${entry.arrivalTime || ""}</td>
          <td>${entry.driverName}</td>
          <td>${entry.numberPlate}</td>
          <td>${entry.vehicleType}</td>
          <td>${entry.phoneNumber}</td>
        `;
        entriesBody.appendChild(row);
      });
  }

  function validateForm(values) {
    const errors = [];

    if (!values.driverName || values.driverName.trim().length < 2) {
      errors.push("Driver name must be at least 2 characters.");
    }

    const numberPlatePattern = /^[Uu][A-Za-z]{2}\s?\d{3}[A-Za-z]$/;
    if (!numberPlatePattern.test(values.numberPlate || "")) {
      errors.push(
        "Number plate must be in Ugandan format (e.g., UAX 123A).",
      );
    }

    if (!values.vehicleModel) {
      errors.push("Vehicle model is required.");
    }

    if (!values.vehicleColor) {
      errors.push("Vehicle color is required.");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = values.date ? new Date(values.date) : null;
    if (!selectedDate) {
      errors.push("Date is required.");
    } else if (selectedDate < today) {
      errors.push("Date cannot be in the past.");
    }

    if (!values.arrivalTime) {
      errors.push("Arrival time is required.");
    }

    const phonePattern = /^(?:07\d{8}|2567\d{8}|\+2567\d{8})$/;
    if (!phonePattern.test(values.phoneNumber || "")) {
      errors.push(
        "Phone number must be a Ugandan number (e.g., 0712345678 or +256712345678).",
      );
    }

    if (!values.vehicleType) {
      errors.push("Vehicle type must be selected.");
    }

    if (values.vehicleType === "Boda Boda") {
      const ninPattern = /^\d{8,10}$/;
      if (!ninPattern.test(values.ninNumber || "")) {
        errors.push(
          "NIN Number is required for Boda Bodas and must be 8–10 digits.",
        );
      }
    }

    return errors;
  }

  function getFormValues() {
    return {
      driverName: form.driverName.value.trim(),
      numberPlate: form.numberPlate.value.trim(),
      vehicleModel: form.vehicleModel.value.trim(),
      vehicleColor: form.vehicleColor.value.trim(),
      arrivalTime: form.arrivalTime.value,
      date: form.date.value,
      phoneNumber: form.phoneNumber.value.trim(),
      ninNumber: form.ninNumber.value.trim(),
      vehicleType: form.vehicleType.value,
      createdAt: new Date().toISOString(),
    };
  }

  function resetForm() {
    form.reset();
    clearMessage();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearMessage();

    const values = getFormValues();
    const errors = validateForm(values);

    if (errors.length) {
      showMessage(errors.join(" "), "error");
      return;
    }

    const entries = getRegistrations();
    entries.push(values);
    saveRegistrations(entries);

    lastSavedEntry = values;
    setPrintEnabled(true);

    renderEntries(entries);
    showMessage("Registration saved to local storage.", "success");
    resetForm();
  });

  if (printButton) {
    printButton.addEventListener("click", () => {
      printReceipt(lastSavedEntry);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const entries = getRegistrations();
    renderEntries(entries);

    if (entries.length) {
      lastSavedEntry = entries[entries.length - 1];
      setPrintEnabled(true);
    } else {
      setPrintEnabled(false);
    }
  });
})();
