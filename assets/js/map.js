/**
 * Joy Guru Tours & Travels - Map Preview & OSRM Routing using Leaflet.js
 */

(function() {
  let map = null;
  let routeLayer = null;
  let pickupMarker = null;
  let destinationMarker = null;

  document.addEventListener('DOMContentLoaded', function() {
    // Listen for coordinates update event
    window.addEventListener('jg-locations-updated', function(e) {
      const pickup = e.detail.pickup;
      const destination = e.detail.destination;

      const container = document.getElementById('map-preview-container');
      if (!container) return;

      if (pickup && destination) {
        // Show map container
        container.classList.remove('hidden');
        
        // Initialize map if needed
        initMap();

        // Calculate and render route
        updateRoute(pickup, destination);
      } else {
        // Hide map container if inputs are cleared
        container.classList.add('hidden');
      }
    });
  });

  function initMap() {
    if (map !== null) {
      // Map already initialized, just trigger resize to ensure layout is updated
      setTimeout(() => { map.invalidateSize(); }, 100);
      return;
    }

    // Initialize Leaflet map targeting the 'map' div
    // Centered around Northeast India (Silchar/Shillong region)
    map = L.map('map', {
      zoomControl: true,
      attributionControl: false
    }).setView([25.3, 92.2], 8);

    // Use OpenStreetMap public tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);
  }

  function updateRoute(pickup, destination) {
    if (!map) return;

    // Clear previous layers/markers
    if (routeLayer) map.removeLayer(routeLayer);
    if (pickupMarker) map.removeLayer(pickupMarker);
    if (destinationMarker) map.removeLayer(destinationMarker);

    // Custom marker icons using Leaflet divIcon for matching styles (red for destination, dark for pickup)
    const pickupIcon = L.divIcon({
      className: 'custom-map-marker pickup',
      html: `<div style="background-color: #0f172a; width: 12px; height: 12px; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    const destIcon = L.divIcon({
      className: 'custom-map-marker destination',
      html: `<div style="background-color: #e11d48; width: 12px; height: 12px; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    // Add markers
    pickupMarker = L.marker([pickup.lat, pickup.lon], { icon: pickupIcon }).addTo(map)
      .bindPopup(`<b>Pickup:</b> ${pickup.name.split(',')[0]}`);
    
    destinationMarker = L.marker([destination.lat, destination.lon], { icon: destIcon }).addTo(map)
      .bindPopup(`<b>Destination:</b> ${destination.name.split(',')[0]}`);

    // Call OSRM API to get driving route
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lon},${pickup.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMins = Math.round(route.duration / 60);

          // Render route line on map
          const geojsonFeature = {
            type: "Feature",
            properties: {},
            geometry: route.geometry
          };

          routeLayer = L.geoJSON(geojsonFeature, {
            style: {
              color: '#e11d48', // brand secondary color
              weight: 4,
              opacity: 0.8
            }
          }).addTo(map);

          // Fit bounds to show entire route with some padding
          map.fitBounds(routeLayer.getBounds(), { padding: [20, 20] });

          // Update info text
          displayRouteInfo(distanceKm, durationMins);
        } else {
          // Fallback line if OSRM fails
          const latlngs = [
            [pickup.lat, pickup.lon],
            [destination.lat, destination.lon]
          ];
          routeLayer = L.polyline(latlngs, { color: '#64748b', weight: 3, dashArray: '5, 5' }).addTo(map);
          map.fitBounds(routeLayer.getBounds(), { padding: [30, 30] });
          displayRouteInfo(null, null);
        }
      })
      .catch(err => {
        console.error('OSRM Routing API error:', err);
        // Fallback straight line
        const latlngs = [
          [pickup.lat, pickup.lon],
          [destination.lat, destination.lon]
        ];
        routeLayer = L.polyline(latlngs, { color: '#64748b', weight: 3, dashArray: '5, 5' }).addTo(map);
        map.fitBounds(routeLayer.getBounds(), { padding: [30, 30] });
        displayRouteInfo(null, null);
      });
  }

  function displayRouteInfo(distance, durationMins) {
    const distEl = document.getElementById('route-distance');
    const timeEl = document.getElementById('route-duration');
    const fareEl = document.getElementById('route-fare');

    if (!distEl || !timeEl) return;

    if (distance !== null) {
      distEl.innerHTML = `Distance: <strong class="text-primary">${distance} km</strong>`;
      
      // Format time nicely
      let timeStr = `${durationMins} mins`;
      if (durationMins >= 60) {
        const hrs = Math.floor(durationMins / 60);
        const mins = durationMins % 60;
        timeStr = mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
      }
      timeEl.innerHTML = `Time: <strong class="text-primary">${timeStr}</strong>`;

      // Estimate fare: ~24.5 Rs per km (average of all vehicle options), min Rs 3,999 onwards
      const estFare = Math.max(3999, Math.round(distance * 24.5));
      if (fareEl) {
        fareEl.innerHTML = `Est. Fare: <strong class="text-secondary">₹${estFare.toLocaleString()}</strong>`;
      }
    } else {
      distEl.innerHTML = `Distance: <strong class="text-primary">-- km</strong>`;
      timeEl.innerHTML = `Time: <strong class="text-primary">-- mins</strong>`;
      if (fareEl) {
        fareEl.innerHTML = `Est. Fare: <strong class="text-secondary">--</strong>`;
      }
    }
  }
})();
