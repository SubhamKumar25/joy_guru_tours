/**
 * Joy Guru Tours & Travels - Geolocation & Live Current Location Navbar Widget
 */

(function() {
  document.addEventListener('DOMContentLoaded', function() {
    initLiveNavbarLocation();
  });

  function initLiveNavbarLocation() {
    const navbarSpan = document.getElementById('navbar-location-span');
    if (!navbarSpan) return;

    // Load cached location if available
    const cachedLocation = localStorage.getItem('jg_current_location');
    if (cachedLocation) {
      updateNavbarLabel(navbarSpan, cachedLocation);
    }

    // Ask for browser geolocation access on load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

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
              const city = addr.city || addr.town || addr.suburb || addr.village || 'Northeast';
              const state = addr.state || 'India';
              const locationStr = `${city}, ${state}`;

              // Update Navbar & save to localStorage
              updateNavbarLabel(navbarSpan, locationStr);
              localStorage.setItem('jg_current_location', locationStr);
            }
          })
          .catch(err => {
            console.error('Nominatim reverse geocoding error:', err);
            // Default to cached or default
            if (!cachedLocation) {
              updateNavbarLabel(navbarSpan, 'Silchar, Assam');
            }
          });
        },
        function(error) {
          console.warn('Geolocation permission denied or error:', error);
          if (!cachedLocation) {
            updateNavbarLabel(navbarSpan, 'Select Location');
          }
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      if (!cachedLocation) {
        updateNavbarLabel(navbarSpan, 'Select Location');
      }
    }
  }

  function updateNavbarLabel(element, text) {
    element.innerHTML = `<iconify-icon icon="lucide:map-pin" class="text-secondary"></iconify-icon> ${text}`;
  }
})();
