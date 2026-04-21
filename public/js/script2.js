const validateForm = (values) => {
  const errors = [];

  if (!values.driverName || values.driverName.trim().length < 2) {
    errors.push("Driver name must be at least 2 characters.");
  }

  const numberPlatePattern = /^[Uu][A-Za-z]{2}\s?\d{3}[A-Za-z]$/;
  if (!numberPlatePattern.test(values.numberPlate || "")) {
    errors.push("Number plate must be in Ugandan format (e.g., UAX 123A).");
  }

  if (!values.vehicleModel) {
    errors.push("Vehicle model is mandatory !");
  }

  if (!values.vehicleColor) {
    errors.push("Vehicle color is mandatory !");
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
    errors.push("Arrival time is mandatory !");
  }

  const phonePattern = /^(?:07\d{8}|2567\d{8}|\+2567\d{8})$/;
  if (!phonePattern.test(values.phoneNumber || "")) {
    errors.push(
      "Phone number must be a Ugandan number (e.g., 0712345678 or +256712345678)."
    );
  }

  if (!values.vehicleType) {
    errors.push("Vehicle type must be selected.");
  }

let isBodaWarning = false;

if (values.vehicleType === "Boda Boda") {
  const ninPattern = /^\d{8,10}$/;
  if (!ninPattern.test(values.ninNumber || "")) {
    errors.push("NIN Number is mandatory for Boda Bodas and must be 8–10 digits.");
    isBodaWarning = true;
  }
}
  return errors;
};