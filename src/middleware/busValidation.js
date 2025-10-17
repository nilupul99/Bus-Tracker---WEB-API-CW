// Validation middleware for bus operations
export const validateBus = (req, res, next) => {
  const { busNumber, route, capacity, currentLocation } = req.body;
  const errors = [];

  // Validate busNumber
  if (!busNumber) {
    errors.push('Bus number is required');
  } else if (typeof busNumber !== 'string' || !/^[A-Za-z0-9]{4}$/.test(busNumber)) {
    errors.push('Bus number not valid!');
  }

  // Validate route
  if (!route) {
    errors.push('Route is required');
  } else if (typeof route !== 'string' || route.length < 3) {
    errors.push('Route must be a string with at least 3 characters');
  }

  // Validate capacity
  if (capacity !== undefined) {
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100) {
      errors.push('Capacity must be an integer between 1 and 100');
    }
  }

  // Validate currentLocation
  if (currentLocation) {
    if (!currentLocation.coordinates || 
        !Array.isArray(currentLocation.coordinates) || 
        currentLocation.coordinates.length !== 2) {
      errors.push('Current location must have coordinates [longitude, latitude]');
    } else {
      const [longitude, latitude] = currentLocation.coordinates;
      if (longitude < -180 || longitude > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
      if (latitude < -90 || latitude > 90) {
        errors.push('Latitude must be between -90 and 90');
      }
    }
  }

  // Check for validation errors
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors
    });
  }

  next();
};