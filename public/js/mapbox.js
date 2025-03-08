/* eslint-disable */
export const displayMap = (locations) => {
  // Initialize the map (disable zooming but allow panning)
  const map = L.map('map', {
    zoomControl: true, // Allows zooming with buttons
    scrollWheelZoom: false, // Disable zooming with scroll
    doubleClickZoom: false, // Disable zooming with double click
    touchZoom: false, // Disable zooming on touch devices
    dragging: true, // Allows panning
  });

  // Add tile layer with OpenStreetMap style
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map);

  // Create a feature group to store markers
  const markers = L.featureGroup();

  // Define a custom div icon (uses CSS)
  const customIcon = L.divIcon({
    className: 'marker',  
    iconSize: [32, 40], 
    iconAnchor: [16, 20],  
    popupAnchor: [0, -12],  
  });

  // Loop through locations and add markers with popups
  locations.forEach((loc) => {
    const marker = L.marker([loc.coordinates[1], loc.coordinates[0]], { icon: customIcon })
      .addTo(map)
      .bindPopup(
        `<b>Day ${loc.day}: ${loc.description}</b>`, {
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,   
        closeOnClick: false, 
      }
      );

    // Add marker to the markers feature group
    markers.addLayer(marker);

    // Open the popup by default
    marker.openPopup();
  });

  // Fit map bounds to markers
  map.fitBounds(markers.getBounds(), { padding: [200, 150, 100, 300] });
};
