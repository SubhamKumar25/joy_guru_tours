/**
 * Joy Guru Tours & Travels - Interactive Map Logic (Leaflet + OSRM)
 */

(function initMapLogic() {
  document.addEventListener('DOMContentLoaded', () => {
    let map = null;
    let routingControl = null;
    let pickupMarker = null;
    let dropMarker = null;
    let polyline = null;

    const desktopContainer = document.getElementById('desktop-map-container');
    const heroTextContent = document.getElementById('hero-text-content');
    
    const mobileSheet = document.getElementById('mobile-map-sheet');
    const closeMobileBtn = document.getElementById('close-mobile-map');

    // UI Elements for ETA and Distance
    const desktopEta = document.getElementById('desktop-eta');
    const desktopDist = document.getElementById('desktop-dist');
    const mobileEta = document.getElementById('mobile-eta');
    const mobileDist = document.getElementById('mobile-dist');
    const desktopInfoBox = document.getElementById('desktop-map-info');
    const mobileInfoBox = document.getElementById('mobile-map-info');

    // Default icon
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const destinationIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Toggle Map UI based on viewport
    function showMapUI() {
      if (window.innerWidth >= 1024) {
        // Desktop
        if (heroTextContent) heroTextContent.classList.add('hidden');
        if (desktopContainer) desktopContainer.classList.remove('hidden');
      } else {
        // Mobile
        if (mobileSheet) mobileSheet.classList.remove('translate-y-full');
      }
    }

    if (closeMobileBtn) {
      closeMobileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        mobileSheet.classList.add('translate-y-full');
      });
    }

    function initMap(containerId) {
      if (map) return map;
      map = L.map(containerId, {
        zoomControl: false // We will add custom zoom control if needed
      }).setView([24.8333, 92.7789], 13); // Default Silchar

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);
      
      L.control.zoom({
         position: 'topright'
      }).addTo(map);

      // Locate me button
      const locateControl = L.control({position: 'bottomright'});
      locateControl.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.innerHTML = `<button style="background: white; border: none; width: 30px; height: 30px; cursor: pointer; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg></button>`;
        div.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          map.locate({setView: true, maxZoom: 16});
        }
        return div;
      };
      locateControl.addTo(map);

      return map;
    }

    function updateMap(pickup, destination) {
      // Determine which container to use based on screen size
      const isDesktop = window.innerWidth >= 1024;
      const containerId = isDesktop ? 'desktop-map' : 'mobile-map';
      
      // Initialize if null
      if (!map) {
        initMap(containerId);
      } else {
        // Handle map container switch on resize (invalidateSize is required when moving or unhiding)
        setTimeout(() => map.invalidateSize(), 300);
      }

      // Clear existing markers/lines
      if (pickupMarker) map.removeLayer(pickupMarker);
      if (dropMarker) map.removeLayer(dropMarker);
      if (polyline) map.removeLayer(polyline);

      pickupMarker = L.marker([pickup.lat, pickup.lon], {icon: defaultIcon}).addTo(map);
      pickupMarker.bindPopup(`<b>Pickup</b><br>${pickup.name}`).openPopup();

      dropMarker = L.marker([destination.lat, destination.lon], {icon: destinationIcon}).addTo(map);
      dropMarker.bindPopup(`<b>Drop</b><br>${destination.name}`);

      // Fit bounds to both points
      const bounds = L.latLngBounds([pickup.lat, pickup.lon], [destination.lat, destination.lon]);
      map.fitBounds(bounds, { padding: [50, 50] });

      // Fetch Route from OSRM
      fetchRoute(pickup, destination);
    }

    function fetchRoute(start, end) {
      // OSRM coordinates are lon,lat
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`;
      
      fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(c => [c[1], c[0]]); // Leaflet uses lat,lon
          
          if (polyline) map.removeLayer(polyline);
          polyline = L.polyline(coords, {color: '#2563eb', weight: 5, opacity: 0.7}).addTo(map);
          
          // Fit bounds to the actual route polyline
          map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

          // Update UI info
          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMins = Math.round(route.duration / 60);
          
          let durationStr = `${durationMins} mins`;
          if (durationMins > 60) {
            const hrs = Math.floor(durationMins / 60);
            const m = durationMins % 60;
            durationStr = `${hrs} hr ${m} min`;
          }

          if (desktopEta) desktopEta.textContent = durationStr;
          if (desktopDist) desktopDist.textContent = `${distanceKm} km`;
          if (mobileEta) mobileEta.textContent = durationStr;
          if (mobileDist) mobileDist.textContent = `${distanceKm} km`;

          if (desktopInfoBox) desktopInfoBox.classList.remove('hidden');
          if (mobileInfoBox) mobileInfoBox.classList.remove('hidden');
        }
      })
      .catch(err => {
        console.error('Error fetching route from OSRM:', err);
      });
    }

    // Listen to autocomplete selections
    window.addEventListener('jg-locations-updated', (e) => {
      const { pickup, destination } = e.detail;
      
      if (pickup && destination) {
        showMapUI();
        updateMap(pickup, destination);
      }
    });

  });
})();
