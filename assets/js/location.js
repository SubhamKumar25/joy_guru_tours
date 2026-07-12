/**
 * Joy Guru Tours & Travels - Geolocation & Real-Time Navbar Location
 *
 * - GPS ONLY via navigator.geolocation (NO IP-based lookup)
 * - Reverse geocoding via OpenStreetMap Nominatim
 * - Locality-level address: "Club Road, Silchar, Assam"
 * - Full error handling with distinct messages per error type
 * - Console debug logging throughout
 * - localStorage persistence across page refreshes
 */

(function () {
  var STORAGE_KEY = 'jg_current_location';
  var GEO_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  };

  // ─── Debug logger ───────────────────────────────────────────────────────────
  function log(label, value) {
    console.log('[JG Location] ' + label + ':', value);
  }

  // ─── Navbar update ──────────────────────────────────────────────────────────
  function updateNavbar(text) {
    var el = document.getElementById('navbar-location-span');
    if (!el) return;
    
    var htmlText = text;
    if (text !== 'Detecting location…' && text !== 'Select Location' && text !== 'Current Location') {
      var parts = text.split(',').map(function(p) { return p.trim(); });
      if (parts.length === 3) {
        // e.g. Club Road, Silchar, Assam -> Hide Club Road and Assam on mobile
        htmlText = '<span class="hidden sm:inline">' + parts[0] + ', </span>' + parts[1] + '<span class="hidden sm:inline">, ' + parts[2] + '</span>';
      } else if (parts.length === 2) {
        // e.g. Silchar, Assam -> Hide Assam on mobile
        htmlText = parts[0] + '<span class="hidden sm:inline">, ' + parts[1] + '</span>';
      }
    }

    el.innerHTML = '<iconify-icon icon="lucide:map-pin" class="text-secondary"></iconify-icon> ' + htmlText;
    // Make visible if it was hidden
    el.classList.remove('hidden');
  }

  // ─── Build human-readable address from Nominatim address object ─────────────
  // Priority:
  //   Locality:  road > suburb > neighbourhood > quarter > hamlet > village > town_district
  //   City:      city > town > municipality > city_district > county
  //   State:     state
  function buildAddress(addr) {
    log('Nominatim full address object', JSON.stringify(addr));

    var locality =
      addr.road         ||
      addr.suburb       ||
      addr.neighbourhood||
      addr.quarter      ||
      addr.hamlet       ||
      addr.village      ||
      addr.town_district||
      '';

    var city =
      addr.city         ||
      addr.town         ||
      addr.municipality ||
      addr.city_district||
      addr.county       ||
      '';

    var state = addr.state || '';

    log('Parsed locality', locality);
    log('Parsed city', city);
    log('Parsed state', state);

    var parts = [];
    if (locality) parts.push(locality);
    if (city)     parts.push(city);
    if (state)    parts.push(state);

    // Need at least city + state for a meaningful address
    if (parts.length === 0) return null;
    if (parts.length === 1 && !city && !state) return null;

    return parts.join(', ');
  }

  // ─── Reverse geocode via Nominatim ─────────────────────────────────────────
  function reverseGeocode(lat, lon, onSuccess, onFail) {
    var url =
      'https://nominatim.openstreetmap.org/reverse?format=json' +
      '&lat=' + lat +
      '&lon=' + lon +
      '&zoom=18' +
      '&addressdetails=1';

    log('Nominatim request URL', url);

    fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'JoyGuruToursTravels/1.0 (https://joy-guru-travel-platform.vercel.app)'
      }
    })
    .then(function (res) {
      if (!res.ok) {
        throw new Error('Nominatim HTTP ' + res.status);
      }
      return res.json();
    })
    .then(function (data) {
      log('Nominatim raw response', JSON.stringify(data));

      if (!data || !data.address) {
        throw new Error('No address in Nominatim response');
      }

      var addressStr = buildAddress(data.address);
      log('Built address string', addressStr);

      if (addressStr) {
        onSuccess(addressStr);
      } else {
        // Fallback: display_name first chunk
        var fallback = data.display_name
          ? data.display_name.split(',').slice(0, 2).join(',').trim()
          : null;
        log('Fallback from display_name', fallback);
        if (fallback) {
          onSuccess(fallback);
        } else {
          onFail(new Error('Address extraction failed'));
        }
      }
    })
    .catch(function (err) {
      log('Nominatim error', err.message);
      onFail(err);
    });
  }

  // ─── Geolocation success callback ──────────────────────────────────────────
  function onGeoSuccess(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var acc = position.coords.accuracy;

    log('Geolocation Status', 'SUCCESS');
    log('Latitude', lat);
    log('Longitude', lon);
    log('Accuracy (metres)', acc);

    // Show a temporary "Detecting..." while we fetch the address
    updateNavbar('Detecting location…');

    reverseGeocode(
      lat,
      lon,
      // success
      function (addressStr) {
        log('Final Address', addressStr);
        updateNavbar(addressStr);
        localStorage.setItem(STORAGE_KEY, addressStr);
        localStorage.setItem('jg_current_lat', lat);
        localStorage.setItem('jg_current_lon', lon);
        window.dispatchEvent(new CustomEvent('jg-realtime-location-updated', {
          detail: { lat: lat, lon: lon, name: addressStr }
        }));
      },
      // fail — geocoding failed but we have coords
      function (err) {
        log('Reverse Geocoding failed — using coords fallback', err.message);
        var fallbackText = 'Current Location';
        updateNavbar(fallbackText);
        localStorage.setItem(STORAGE_KEY, fallbackText);
        window.dispatchEvent(new CustomEvent('jg-realtime-location-updated', {
          detail: { lat: lat, lon: lon, name: fallbackText }
        }));
      }
    );
  }

  // ─── Geolocation error callback ─────────────────────────────────────────────
  function onGeoError(error) {
    log('Geolocation Status', 'ERROR — code ' + error.code);
    log('Geolocation error message', error.message);

    var msg;
    switch (error.code) {
      case error.PERMISSION_DENIED:
        msg = 'Location access denied';
        log('Error type', 'PERMISSION_DENIED — user blocked location');
        break;
      case error.POSITION_UNAVAILABLE:
        msg = 'Location unavailable';
        log('Error type', 'POSITION_UNAVAILABLE — hardware/signal issue');
        break;
      case error.TIMEOUT:
        msg = 'Location timed out';
        log('Error type', 'TIMEOUT — GPS took too long');
        break;
      default:
        msg = 'Select Location';
        log('Error type', 'UNKNOWN — ' + error.code);
    }

    // Only update navbar if there's no cached location
    if (!localStorage.getItem(STORAGE_KEY)) {
      updateNavbar(msg);
    }
  }

  // ─── Manual location override (click on navbar badge) ──────────────────────
  function attachManualOverride(el) {
    el.style.cursor = 'pointer';
    el.title = 'Click to view or change location';
    el.addEventListener('click', function () {
      var current = localStorage.getItem(STORAGE_KEY) || 'Select Location';
      
      // Check if modal already exists
      var modal = document.getElementById('jg-location-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'jg-location-modal';
        modal.className = 'fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 hidden';
        modal.innerHTML = `
          <div class="bg-card w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-border animate-fade-in">
            <div class="p-5 border-b border-border flex justify-between items-center">
              <h3 class="font-heading font-bold text-lg text-primary">Your Location</h3>
              <button id="jg-loc-close" class="text-muted-foreground hover:text-foreground"><iconify-icon icon="lucide:x" class="text-xl"></iconify-icon></button>
            </div>
            <div class="p-5 space-y-4">
              <div>
                <p class="text-xs text-muted-foreground mb-1">Current Address</p>
                <div class="flex items-start gap-2 bg-muted p-3 rounded-lg border border-border">
                  <iconify-icon icon="lucide:map-pin" class="text-secondary mt-0.5"></iconify-icon>
                  <p id="jg-loc-current-text" class="text-sm font-medium text-foreground"></p>
                </div>
              </div>
              <button id="jg-loc-gps-btn" class="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 p-3 rounded-xl text-sm font-bold transition-all">
                <iconify-icon icon="lucide:navigation"></iconify-icon> Use Current GPS Location
              </button>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <iconify-icon icon="lucide:search" class="text-muted-foreground"></iconify-icon>
                </div>
                <input type="text" id="jg-loc-search" placeholder="Search another location..." class="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none">
              </div>
              <div class="pt-2">
                <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Recent</p>
                <div class="flex flex-wrap gap-2">
                  <button class="jg-loc-preset text-xs bg-muted hover:bg-border px-3 py-1.5 rounded-full transition-all">Silchar</button>
                  <button class="jg-loc-preset text-xs bg-muted hover:bg-border px-3 py-1.5 rounded-full transition-all">Shillong</button>
                  <button class="jg-loc-preset text-xs bg-muted hover:bg-border px-3 py-1.5 rounded-full transition-all">Guwahati</button>
                </div>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        // Bind events
        document.getElementById('jg-loc-close').onclick = function() {
          modal.classList.add('hidden');
        };
        modal.onclick = function(e) {
          if (e.target === modal) modal.classList.add('hidden');
        };

        var updateAndClose = function(newLoc) {
          if (!newLoc || !newLoc.trim()) return;
          var cleaned = newLoc.trim();
          updateNavbar(cleaned);
          localStorage.setItem(STORAGE_KEY, cleaned);
          modal.classList.add('hidden');
          if (window.UIUtils && UIUtils.showToast) {
            UIUtils.showToast('Location updated to: ' + cleaned, 'success');
          }
          
          // Forward geocode to get coords for autocomplete bias
          fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(cleaned) + '&limit=1')
          .then(res => res.json())
          .then(data => {
             if (data && data.length > 0) {
               localStorage.setItem('jg_current_lat', data[0].lat);
               localStorage.setItem('jg_current_lon', data[0].lon);
               window.dispatchEvent(new CustomEvent('jg-realtime-location-updated', {
                 detail: { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), name: cleaned, manual: true }
               }));
             } else {
               localStorage.removeItem('jg_current_lat');
               localStorage.removeItem('jg_current_lon');
               window.dispatchEvent(new CustomEvent('jg-realtime-location-updated', {
                 detail: { name: cleaned, manual: true }
               }));
             }
          }).catch(() => {
             window.dispatchEvent(new CustomEvent('jg-realtime-location-updated', { detail: { name: cleaned, manual: true } }));
          });
        };

        var searchInput = document.getElementById('jg-loc-search');
        searchInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            updateAndClose(this.value);
            this.value = '';
          }
        });

        var presets = modal.querySelectorAll('.jg-loc-preset');
        presets.forEach(function(btn) {
          btn.onclick = function() {
            var val = this.textContent;
            if (val === 'Silchar' || val === 'Guwahati') val += ', Assam';
            if (val === 'Shillong') val += ', Meghalaya';
            updateAndClose(val);
          };
        });

        document.getElementById('jg-loc-gps-btn').onclick = function() {
          modal.classList.add('hidden');
          updateNavbar('Detecting location…');
          if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, GEO_OPTIONS);
          }
        };
      }
      
      document.getElementById('jg-loc-current-text').textContent = current;
      modal.classList.remove('hidden');
    });
  }

  // ─── Main init ──────────────────────────────────────────────────────────────
  function init() {
    var navbarSpan = document.getElementById('navbar-location-span');
    if (!navbarSpan) return;

    log('Geolocation Status', 'INIT — checking navigator.geolocation support');

    // 1. Load cached location immediately (instant display on refresh)
    var cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      log('Cached location found', cached);
      updateNavbar(cached);
    }

    // 2. Attach manual click-to-correct override
    attachManualOverride(navbarSpan);

    // 3. GPS detection
    if (navigator.geolocation) {
      log('Geolocation Status', 'API supported — requesting position');
      navigator.geolocation.getCurrentPosition(
        onGeoSuccess,
        onGeoError,
        GEO_OPTIONS
      );
    } else {
      log('Geolocation Status', 'NOT SUPPORTED by this browser');
      if (!cached) {
        updateNavbar('Select Location');
      }
    }
  }

  // Kick off on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
