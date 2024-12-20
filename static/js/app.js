const socket = io();
let map;
let markers = {};

// Initialize the map
function initMap() {
  // map = L.map('map').setView([0, 0], 15);

  const mapCenter = [17.98473652903185, 79.53070160758276]; // Replace with desired location (latitude, longitude)
  const mapZoom = 16.5; // Set zoom level

  // Create the map centered on the specified location
  map = L.map('map').setView(mapCenter, mapZoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('location_update', function (data) {
    const { latitude, longitude, car_id } = data;

    // Create a new marker for each car
    const marker = L.marker([latitude, longitude]).addTo(map);
    marker.bindPopup(`Car ${car_id}: ${latitude}, ${longitude}`);
  });

  // Fetch initial locations from the server
  fetch('/get_locations')
    .then((response) => response.json())
    .then((locations) => {
      locations.forEach((location) => {
        updateMarker(location.car_id, location.latitude, location.longitude);
      });
    });
}

// Update marker on the map
function updateMarker(carId, latitude, longitude) {
  if (!markers[carId]) {
    markers[carId] = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`Car ${carId}`);
  } else {
    markers[carId].setLatLng([latitude, longitude]);
  }
}

// Listen for location updates
socket.on('location_update', (data) => {
  const { car_id, latitude, longitude } = data;

  // Update map with the new location
  updateMarker(car_id, latitude, longitude);
});

// Initialize the map on page load
window.onload = initMap;
