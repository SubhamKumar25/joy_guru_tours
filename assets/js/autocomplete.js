/**
 * Joy Guru Tours & Travels - Location Autocomplete using OpenStreetMap Nominatim
 */

(function() {
  const POPULAR_DESTINATIONS = [
    { name: "Shillong, Meghalaya", lat: 25.5788, lon: 91.8933 },
    { name: "Guwahati, Assam", lat: 26.1445, lon: 91.7362 },
    { name: "Dawki, Meghalaya", lat: 25.1782, lon: 92.0205 },
    { name: "Kaziranga, Assam", lat: 26.5775, lon: 93.1711 },
    { name: "Silchar Airport (IXS), Assam", lat: 24.9128, lon: 92.9786 }
  ];

  let debounceTimeout = null;

  document.addEventListener('DOMContentLoaded', function() {
    const pickupInput = document.getElementById('pickup-location');
    const dropInput = document.getElementById('drop-destination');

    if (!pickupInput || !dropInput) return;

    // Wrap in relative containers for absolute positioning of dropdowns
    setupWrapper(pickupInput, 'pickup');
    setupWrapper(dropInput, 'destination');

    // Bind event listeners
    bindAutocomplete(pickupInput, 'pickup');
    bindAutocomplete(dropInput, 'destination');
  });

  function setupWrapper(input, type) {
    // Add relative positioning parent to wrapper if not already
    const parent = input.parentElement;
    if (parent) {
      parent.classList.add('autocomplete-wrapper');
    }
  }

  function bindAutocomplete(input, type) {
    let dropdown = null;
    let focusedIndex = -1;
    let items = [];

    // Create dropdown container
    function createDropdown() {
      removeDropdown();
      dropdown = document.createElement('div');
      dropdown.className = 'autocomplete-dropdown';
      input.parentElement.appendChild(dropdown);
      focusedIndex = -1;
      items = [];
    }

    function removeDropdown() {
      if (dropdown) {
        dropdown.remove();
        dropdown = null;
      }
      focusedIndex = -1;
      items = [];
    }

    // Outside click helper
    const outsideClickListener = function(e) {
      if (dropdown && !input.contains(e.target) && !dropdown.contains(e.target)) {
        removeDropdown();
        document.removeEventListener('click', outsideClickListener);
      }
    };

    // Show initial suggestions (empty input)
    function showPrefillSuggestions() {
      createDropdown();
      document.addEventListener('click', outsideClickListener);

      // Section 1: Use Current Location (Only for Pickup)
      if (type === 'pickup') {
        const currentLocSec = document.createElement('div');
        currentLocSec.className = 'autocomplete-section';
        
        const currentLocItem = document.createElement('div');
        currentLocItem.className = 'autocomplete-item current-location';
        currentLocItem.innerHTML = `
          <span class="autocomplete-item-icon"><iconify-icon icon="lucide:navigation"></iconify-icon></span>
          <span class="autocomplete-item-text">Use Current Location</span>
        `;
        currentLocItem.onclick = function() {
          useCurrentLocation(input);
          removeDropdown();
        };
        currentLocSec.appendChild(currentLocItem);
        dropdown.appendChild(currentLocSec);
      }

      // Section 2: Recent Searches
      const recentSearches = getRecentSearches();
      if (recentSearches.length > 0) {
        const recentSec = document.createElement('div');
        recentSec.className = 'autocomplete-section';
        
        const header = document.createElement('div');
        header.className = 'autocomplete-header';
        header.textContent = 'Recent Searches';
        recentSec.appendChild(header);

        recentSearches.forEach(search => {
          const item = document.createElement('div');
          item.className = 'autocomplete-item';
          item.innerHTML = `
            <span class="autocomplete-item-icon"><iconify-icon icon="lucide:history"></iconify-icon></span>
            <span class="autocomplete-item-text">${search.name}</span>
          `;
          item.onclick = function() {
            selectLocation(input, search.name, search.lat, search.lon);
            removeDropdown();
          };
          recentSec.appendChild(item);
        });
        dropdown.appendChild(recentSec);
      }

      // Section 3: Popular Destinations
      const popularSec = document.createElement('div');
      popularSec.className = 'autocomplete-section';
      
      const popularHeader = document.createElement('div');
      popularHeader.className = 'autocomplete-header';
      popularHeader.textContent = 'Popular Destinations';
      popularSec.appendChild(popularHeader);

      POPULAR_DESTINATIONS.forEach(dest => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.innerHTML = `
          <span class="autocomplete-item-icon"><iconify-icon icon="lucide:map-pin"></iconify-icon></span>
          <span class="autocomplete-item-text">${dest.name}</span>
        `;
        item.onclick = function() {
          selectLocation(input, dest.name, dest.lat, dest.lon);
          removeDropdown();
        };
        popularSec.appendChild(item);
      });
      dropdown.appendChild(popularSec);

      // Collect all focusable items in dropdown for keyboard navigation
      items = Array.from(dropdown.querySelectorAll('.autocomplete-item'));
    }

    // Input handlers
    input.addEventListener('focus', function() {
      if (input.value.trim() === '') {
        showPrefillSuggestions();
      } else {
        triggerSearch(input.value.trim());
      }
    });

    input.addEventListener('input', function() {
      const val = input.value.trim();
      if (val === '') {
        showPrefillSuggestions();
      } else {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          triggerSearch(val);
        }, 300);
      }
    });

    // Keyboard navigation
    input.addEventListener('keydown', function(e) {
      if (!dropdown) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          showPrefillSuggestions();
          e.preventDefault();
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        focusedIndex = (focusedIndex + 1) % items.length;
        updateFocusStyles();
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        focusedIndex = (focusedIndex - 1 + items.length) % items.length;
        updateFocusStyles();
        e.preventDefault();
      } else if (e.key === 'Enter') {
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          items[focusedIndex].click();
          e.preventDefault();
        }
      } else if (e.key === 'Escape') {
        removeDropdown();
        e.preventDefault();
      }
    });

    function updateFocusStyles() {
      items.forEach((item, index) => {
        if (index === focusedIndex) {
          item.classList.add('focused');
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('focused');
        }
      });
    }

    // Core geocoding search call
    function triggerSearch(query) {
      createDropdown();
      document.addEventListener('click', outsideClickListener);

      // Show loader
      const loader = document.createElement('div');
      loader.className = 'autocomplete-loading';
      loader.innerHTML = `
        <div class="autocomplete-spinner"></div>
        <span>Searching locations...</span>
      `;
      dropdown.appendChild(loader);

      // Call Nominatim API (limitted to India)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=6`;
      
      fetch(url, {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'JoyGuruToursTravelsAutocomplete/1.0'
        }
      })
      .then(res => res.json())
      .then(data => {
        dropdown.innerHTML = '';
        if (data && data.length > 0) {
          items = [];
          data.forEach(loc => {
            const displayName = formatAddress(loc);
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.innerHTML = `
              <span class="autocomplete-item-icon"><iconify-icon icon="lucide:map-pin"></iconify-icon></span>
              <span class="autocomplete-item-text">${displayName}</span>
            `;
            item.onclick = function() {
              selectLocation(input, displayName, parseFloat(loc.lat), parseFloat(loc.lon));
              removeDropdown();
            };
            dropdown.appendChild(item);
            items.push(item);
          });
        } else {
          const noRes = document.createElement('div');
          noRes.className = 'autocomplete-no-results';
          noRes.innerHTML = `
            <iconify-icon icon="lucide:alert-circle" class="text-xl text-muted-foreground"></iconify-icon>
            <span>No locations found.</span>
          `;
          dropdown.appendChild(noRes);
        }
      })
      .catch(err => {
        console.error('Nominatim autocomplete error:', err);
        dropdown.innerHTML = '';
        const errorItem = document.createElement('div');
        errorItem.className = 'autocomplete-no-results';
        errorItem.innerHTML = `<span>Error fetching results.</span>`;
        dropdown.appendChild(errorItem);
      });
    }
  }

  // Format full Nominatim response address neatly
  function formatAddress(loc) {
    // If the display name is long, clean it up a bit
    const parts = loc.display_name.split(', ');
    if (parts.length > 4) {
      // Keep only first 4 relevant elements (e.g. Area, City, District, State)
      return parts.slice(0, 4).join(', ');
    }
    return loc.display_name;
  }

  // Handle location selection
  function selectLocation(input, name, lat, lon) {
    input.value = name;
    input.dataset.lat = lat;
    input.dataset.lon = lon;

    // Add to recent searches
    saveRecentSearch(name, lat, lon);

    // Dispatch update event for Leaflet map preview
    window.dispatchEvent(new CustomEvent('jg-locations-updated', {
      detail: {
        pickup: getCoordinates(document.getElementById('pickup-location')),
        destination: getCoordinates(document.getElementById('drop-destination'))
      }
    }));
  }

  function getCoordinates(input) {
    if (input && input.dataset.lat && input.dataset.lon) {
      return {
        lat: parseFloat(input.dataset.lat),
        lon: parseFloat(input.dataset.lon),
        name: input.value
      };
    }
    return null;
  }

  // Geolocation API support
  function useCurrentLocation(input) {
    if (!navigator.geolocation) {
      UIUtils.showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    input.value = "Detecting current location...";
    input.disabled = true;

    navigator.geolocation.getCurrentPosition(
      function(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Call Nominatim reverse geocoding to display a nice label
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
        fetch(url, {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'JoyGuruToursTravelsAutocomplete/1.0'
          }
        })
        .then(res => res.json())
        .then(data => {
          input.disabled = false;
          if (data && data.display_name) {
            const formatted = formatAddress(data);
            selectLocation(input, formatted, lat, lon);
          } else {
            selectLocation(input, `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`, lat, lon);
          }
        })
        .catch(err => {
          input.disabled = false;
          selectLocation(input, `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`, lat, lon);
        });
      },
      function(error) {
        input.disabled = false;
        input.value = "";
        let errMsg = "Error detecting location";
        if (error.code === error.PERMISSION_DENIED) {
          errMsg = "Location access denied by user";
        }
        UIUtils.showToast(errMsg, 'error');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // Recent Searches LocalStorage helpers
  function getRecentSearches() {
    try {
      const searches = localStorage.getItem('jg_recent_searches');
      return searches ? JSON.parse(searches) : [];
    } catch (e) {
      return [];
    }
  }

  function saveRecentSearch(name, lat, lon) {
    try {
      let searches = getRecentSearches();
      // Remove duplicate
      searches = searches.filter(s => s.name.toLowerCase() !== name.toLowerCase());
      // Prepend
      searches.unshift({ name, lat, lon });
      // Keep only top 5
      if (searches.length > 5) {
        searches = searches.slice(0, 5);
      }
      localStorage.setItem('jg_recent_searches', JSON.stringify(searches));
    } catch (e) {
      console.error('Error saving recent search:', e);
    }
  }
})();
