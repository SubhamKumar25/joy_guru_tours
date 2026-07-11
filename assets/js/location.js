/**
 * Joy Guru Tours & Travels - Geolocation & Real-Time Navbar Location Tracking Widget
 */

(function() {
  let lastLat = null;
  let lastLon = null;
  let lastGeocodeTime = 0;

  document.addEventListener('DOMContentLoaded', function() {
    initRealTimeNavbarLocation();
  });

  function initRealTimeNavbarLocation() {
    const navbarSpan = document.getElementById('navbar-location-span');
    if (!navbarSpan) return;

    // Load cached location if available
    const cachedLocation = localStorage.getItem('jg_current_location');
    if (cachedLocation) {
      updateNavbarLabel(navbarSpan, cachedLocation);
    }

    // Allow user to manually override location by clicking on the navbar badge (helps fix IP routing errors)
    navbarSpan.style.cursor = 'pointer';
    navbarSpan.title = 'Click to correct location';
    navbarSpan.addEventListener('click', function() {
      const current = localStorage.getItem('jg_current_location') || 'Silchar, Assam';
      const manualLoc = prompt('Enter your current city/location (e.g. Club Road, Silchar, Assam):', current);
      if (manualLoc !== null && manualLoc.trim() !== '') {
        const cleaned = manualLoc.trim();
        updateNavbarLabel(navbarSpan, cleaned);
        localStorage.setItem('jg_current_location', cleaned);
        UIUtils.showToast(`Location set to: ${cleaned}`, 'success');

        // Trigger custom event
        window.dispatchEvent(new CustomEvent('jg-realtime-location-updated', {
          detail: { name: cleaned, manual: true }
        }));
      }
    });

    // Ask for browser geolocation with STRICT high-accuracy GPS settings
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const now = Date.now();

          lastLat = lat;
          lastLon = lon;
          lastGeocodeTime = now;

          // Call free OpenStreetMap Nominatim reverse geocoding API
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
          
          fetch(url, {
            headers: {
              'Accept-Language': 'en-US,en;q=0.9',
              'User-Agent': 'JoyGuruToursTravelsLocationWidget/1.0'
            }
          })
          .then(res => res.json())
          .then(data => {
            if (data && data.address) {
              const addr = data.address;
              
              // Extract Area, City, State as requested
              const area = addr.road || addr.suburb || addr.neighbourhood || addr.village || addr.industrial || addr.county || '';
              const city = addr.city || addr.town || addr.municipality || '';
              const state = addr.state || 'Assam';

              // Build address string (e.g., Club Road, Silchar, Assam)
              let addressParts = [];
              if (area) addressParts.push(area);
              if (city) addressParts.push(city);
              if (state) addressParts.push(state);

              // Join parts cleanly
              const locationStr = addressParts.length > 0 ? addressParts.join(', ') : 'Silchar, Assam';

              // Update Navbar & save to localStorage
              updateNavbarLabel(navbarSpan, locationStr);
              localStorage.setItem('jg_current_location', locationStr);
              
              // Dispatch event
              window.dispatchEvent(new CustomEvent('jg-realtime-location-updated', {
                detail: { lat: lat, lon: lon, name: locationStr }
              }));
            }
          })
          .catch(err => {
            console.error('Nominatim reverse geocoding error:', err);
          });
        },
        function(error) {
          console.warn('Strict GPS geolocation tracking permission denied or timeout:', error);
          if (!localStorage.getItem('jg_current_location') && lastLat === null) {
            updateNavbarLabel(navbarSpan, 'Select Location');
          }
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    } else {
      if (!localStorage.getItem('jg_current_location')) {
        updateNavbarLabel(navbarSpan, 'Select Location');
      }
    }
  }

  function updateNavbarLabel(element, text) {
    element.innerHTML = `<iconify-icon icon="lucide:map-pin" class="text-secondary"></iconify-icon> ${text}`;
  }
})();
