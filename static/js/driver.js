// Establish WebSocket connection with the server
const socket = io(); // Assuming the WebSocket server is at the same domain
let watchId; // To store the watchPosition ID for later use (e.g., stopping)

// Button to start sharing location
document.getElementById('start-sharing').addEventListener('click', () => {
    const carId = document.getElementById('car-id').value;

    if (!carId) {
        alert('Please enter your Car ID.');
        return;
    }

    if (navigator.geolocation) {
        // Start watching position
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // Log position for debugging
                console.log(`Car ${carId} location: ${latitude}, ${longitude}`);

                socket.on('location_update', function (data) {
                    const { latitude, longitude, car_id } = data;

                    // Create marker and add it to the map
                    const marker = L.marker([latitude, longitude]).addTo(map);
                    marker.bindPopup(`Car ${car_id} Location: ${latitude}, ${longitude}`);
                });
                // Send location to the server via WebSocket
                socket.emit('update_location', {
                    car_id: parseInt(carId),
                    latitude,
                    longitude
                });
            },
            (error) => {
                console.error('Error getting location:', error.message);
                alert(`Error getting location: ${error.message}`);
            },
            {
                enableHighAccuracy: true, // Get precise location
                maximumAge: 10000,        // Cache location for 10 seconds
                timeout: 10000            // Wait 10 seconds before error
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});

// Optional: Button to stop sharing location
document.getElementById('stop-sharing').addEventListener('click', () => {
    if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
        console.log('Stopped sharing location');
        alert('Stopped sharing location.');
    }
});
