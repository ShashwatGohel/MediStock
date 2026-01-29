// Get user's current location
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
            },
            (error) => {
                let errorMessage = "Unable to retrieve your location";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location permission denied";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information unavailable";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location request timed out";
                        break;
                }
                reject(new Error(errorMessage));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    });
};

// Reverse geocode coordinates to address using Nominatim (OpenStreetMap)
export const getAddressFromCoords = async (latitude, longitude) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        const data = await response.json();

        if (data && data.display_name) {
            return data.display_name;
        }
        return "Address not found";
    } catch (error) {
        console.error("Error in reverse geocoding:", error);
        return "Error retrieving address";
    }
};

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
};

// Convert degrees to radians
const toRad = (degrees) => {
    return degrees * (Math.PI / 180);
};

// Format distance for display
export const formatDistance = (distanceInKm) => {
    if (distanceInKm < 1) {
        return `${Math.round(distanceInKm * 1000)} m`;
    }
    return `${distanceInKm.toFixed(1)} km`;
};

// Validate coordinates
export const validateCoordinates = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
        return { valid: false, error: "Coordinates must be numbers" };
    }

    if (latitude < -90 || latitude > 90) {
        return { valid: false, error: "Latitude must be between -90 and 90" };
    }

    if (longitude < -180 || longitude > 180) {
        return { valid: false, error: "Longitude must be between -180 and 180" };
    }

    return { valid: true, latitude, longitude };
};

// Get location from localStorage or return null
export const getSavedLocation = () => {
    try {
        const saved = localStorage.getItem("userLocation");
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error("Error reading saved location:", error);
    }
    return null;
};

// Save location to localStorage
export const saveLocation = (latitude, longitude) => {
    try {
        localStorage.setItem(
            "userLocation",
            JSON.stringify({ latitude, longitude, timestamp: Date.now() })
        );
    } catch (error) {
        console.error("Error saving location:", error);
    }
};
