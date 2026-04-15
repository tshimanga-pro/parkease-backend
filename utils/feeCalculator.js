function calculateParkingFee(vehicleType, arrivalDate) {
  const departureDate = new Date();
  // Calculate duration in hours
  const durationMs = departureDate - arrivalDate;
  const durationHours = durationMs / (1000 * 60 * 60);

  // Determine if arrival is day time (6:00am - 6:59pm) or night time (7:00pm - 5:59am)
  const hour = arrivalDate.getHours();
  const isDayTime = hour >= 6 && hour < 19;

  // Automated fee calculation rules
  if (durationHours < 3) {
    switch (vehicleType) {
      case "Truck":
        return 2000;
      case "Personal Car":
        return 2000;
      case "Taxi":
        return 2000;
      case "Coaster":
        return 3000;
      case "Boda-boda":
        return 1000;
    }
  } else {
    if (isDayTime) {
      switch (vehicleType) {
        case "Truck":
          return 5000;
        case "Personal Car":
          return 3000;
        case "Taxi":
          return 3000;
        case "Coaster":
          return 4000;
        case "Boda-boda":
          return 2000;
      }
    } else {
      switch (vehicleType) {
        case "Truck":
          return 10000;
        case "Personal Car":
          return 2000;
        case "Taxi":
          return 2000;
        case "Coaster":
          return 2000;
        case "Boda-boda":
          return 2000;
      }
    }
  }
  return 0;
}

module.exports = calculateParkingFee;
