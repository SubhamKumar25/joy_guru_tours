// Joy Guru Travel Platform — Shared Script (Interactive Prototype Engine)
// Generated for fully connected high-fidelity experience

// Initialize dummy state if not already set
(function initDefaultState() {
  if (!localStorage.getItem('jg_is_initialized')) {
    const wasDemo = localStorage.getItem('jg_demo_mode');
    localStorage.clear();
    if (wasDemo) localStorage.setItem('jg_demo_mode', wasDemo);
    localStorage.setItem('jg_is_initialized', 'true');
    localStorage.setItem('jg_logged_in', 'false');
    
    // Default bookings array
    const defaultBookings = [
      {
        id: 'JG-2025-4829',
        customerName: 'Rahul Sharma',
        customerPhone: '+91 94350 12345',
        customerEmail: 'rahul@example.com',
        route: 'Silchar ⇄ Shillong',
        vehicleName: 'Toyota Innova Crysta',
        vehicleType: 'suv',
        driverName: 'Bimal Das',
        driverPhone: '+91 94350 99999',
        travelDate: '2025-10-15',
        travelTime: '09:30 AM',
        pickup: 'Silchar Airport (IXS), Assam',
        destination: 'Shillong, Meghalaya',
        baseFare: 6499,
        gst: 300,
        discount: 500,
        payableAmount: 6299,
        advancePaid: 1500,
        balanceDue: 4799,
        status: 'Advance Paid' // 'Pending', 'Confirmed', 'Advance Paid', 'Driver Assigned', 'Trip Started', 'Completed', 'Fully Paid', 'Cancelled'
      },
      {
        id: 'JG-2025-4830',
        customerName: 'Ananya Das',
        customerPhone: '+91 94350 54321',
        customerEmail: 'ananya@example.com',
        route: 'Silchar ⇄ Guwahati',
        vehicleName: 'Swift Dzire / Etios',
        vehicleType: 'sedan',
        driverName: 'Rahul Nath',
        driverPhone: '+91 94350 88888',
        travelDate: '2025-10-18',
        travelTime: '08:00 AM',
        pickup: 'Silchar Club Road, Assam',
        destination: 'Guwahati, Assam',
        baseFare: 4499,
        gst: 200,
        discount: 0,
        payableAmount: 4699,
        advancePaid: 1000,
        balanceDue: 3699,
        status: 'Advance Paid'
      }
    ];
    localStorage.setItem('jg_bookings', JSON.stringify(defaultBookings));

    // Active search parameters
    const defaultSearch = {
      pickup: 'Silchar Airport (IXS), Assam',
      destination: 'Shillong, Meghalaya',
      date: '2025-10-15',
      time: '09:30 AM',
      passengers: '4',
      vehicleType: 'suv'
    };
    localStorage.setItem('jg_active_search', JSON.stringify(defaultSearch));

    // Default selected vehicle
    localStorage.setItem('jg_selected_vehicle', JSON.stringify({
      name: 'Toyota Innova Crysta',
      type: 'suv',
      baseFare: 6499,
      driver: 'Bimal Das',
      rating: '4.9 ★',
      image: 'https://uxmagic.blob.core.windows.net/public/agent-images/luxury-suv-1783757866936-wp7ctnkd6fo.png'
    }));

    // Default coupon
    localStorage.setItem('jg_coupon_applied', 'false');
  }
})();

// Core State Helpers
window.StateEngine = {
  isLoggedIn: function() {
    return localStorage.getItem('jg_logged_in') === 'true';
  },
  login: function(name, email) {
    localStorage.setItem('jg_logged_in', 'true');
    localStorage.setItem('jg_user_name', name || 'Rahul Sharma');
    localStorage.setItem('jg_user_email', email || 'rahul@example.com');
  },
  logout: function() {
    localStorage.setItem('jg_logged_in', 'false');
    localStorage.removeItem('jg_user_name');
    localStorage.removeItem('jg_user_email');
    localStorage.setItem('jg_demo_mode', 'false');
  },
  getActiveSearch: function() {
    return JSON.parse(localStorage.getItem('jg_active_search'));
  },
  setActiveSearch: function(searchObj) {
    localStorage.setItem('jg_active_search', JSON.stringify(searchObj));
  },
  getSelectedVehicle: function() {
    return JSON.parse(localStorage.getItem('jg_selected_vehicle'));
  },
  setSelectedVehicle: function(vehicleObj) {
    localStorage.setItem('jg_selected_vehicle', JSON.stringify(vehicleObj));
  },
  getBookings: function() {
    return JSON.parse(localStorage.getItem('jg_bookings'));
  },
  updateBookings: function(bookingsArray) {
    localStorage.setItem('jg_bookings', JSON.stringify(bookingsArray));
  },
  isDemoMode: function() {
    return localStorage.getItem('jg_demo_mode') === 'true';
  }
};

// UI & Animations Utilities
window.UIUtils = {
  toggleElement: function (selector) {
    var el = document.querySelector(selector);
    if (el) el.classList.toggle('hidden');
  },

  showToast: function(message, type = 'success') {
    let toast = document.getElementById('prototype-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'prototype-toast';
      toast.className = 'custom-toast';
      document.body.appendChild(toast);
    }
    
    toast.className = `custom-toast ${type} show`;
    toast.innerHTML = `
      <iconify-icon icon="${type === 'success' ? 'lucide:check-circle' : 'lucide:alert-circle'}" class="text-lg"></iconify-icon>
      <span>${message}</span>
    `;

    setTimeout(function() {
      toast.classList.remove('show');
    }, 3000);
  },

  showLoading: function(text, duration = 1500, callback) {
    let loader = document.getElementById('prototype-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'prototype-loader';
      loader.className = 'loading-overlay';
      loader.innerHTML = `
        <div class="spinner"></div>
        <div class="text-white text-sm font-semibold tracking-wider uppercase font-sans">${text || 'Loading...'}</div>
      `;
      document.body.appendChild(loader);
    } else {
      loader.querySelector('div:last-child').textContent = text || 'Loading...';
    }

    loader.classList.add('show');

    setTimeout(function() {
      loader.classList.remove('show');
      if (typeof callback === 'function') callback();
    }, duration);
  },

  setupRipples: function() {
    document.querySelectorAll('button, .clickable-ripple').forEach(function(btn) {
      btn.classList.add('ripple-effect');
      btn.addEventListener('click', function(e) {
        let x = e.clientX - e.target.getBoundingClientRect().left;
        let y = e.clientY - e.target.getBoundingClientRect().top;
        let ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }
};

// Guided Demo Assistant System
window.DemoAssistant = {
  getCurrentStep: function() {
    const path = window.location.pathname;
    if (path.includes('index.html') || path.endsWith('/') || path === '') return 1;
    if (path.includes('Login & Signup.html')) return 2;
    if (path.includes('Search%20Results.html') || path.includes('Search Results.html')) return 3;
    if (path.includes('Booking%20&%20Payment.html') || path.includes('Booking & Payment.html')) {
      const modal = document.getElementById('razorpay-modal');
      if (modal && !modal.classList.contains('hidden')) {
        return 5;
      }
      return 4;
    }
    if (path.includes('User%20Dashboard%20&%20Invoice.html') || path.includes('User Dashboard & Invoice.html')) {
      const activeBooking = StateEngine.getBookings().find(b => b.id === 'JG-2025-4829' || b.id.startsWith('JG-25'));
      if (activeBooking && activeBooking.status === 'Fully Paid') {
        return 8;
      }
      return 6;
    }
    if (path.includes('Admin%20Control%20Center.html') || path.includes('Admin Control Center.html')) return 7;
    return 0;
  },

  getStepDetails: function(step) {
    switch(step) {
      case 1:
        return {
          title: "Step 1: Search Cab",
          desc: "Welcome to Joy Guru Tours & Travels! Prefill or customize your pickup/destination details in the 'Book Premium Cab' card and click 'Find Luxury Rides' to check out the rides.",
          actionText: "Search Cabs",
          selector: "form button[type='submit']"
        };
      case 2:
        return {
          title: "Step 2: Account Login",
          desc: "Sign in to your customer portal using the prefilled accounts (or click 'Google Login'). Successful login is required to link bookings to your profile.",
          actionText: "Login Now",
          selector: "#login-submit-btn"
        };
      case 3:
        return {
          title: "Step 3: Compare & Select Ride",
          desc: "Browse through our verified vehicles. Try toggling checkboxes in the Filters Sidebar to filter. Click 'Select Ride' on the Premium Innova Crysta to proceed.",
          actionText: "Select Innova Crysta",
          selector: "button[onclick*='Select Ride']"
        };
      case 4:
        return {
          title: "Step 4: Check Summary & Discount",
          desc: "Verify your travel itinerary. Apply the discount coupon code 'NORTHEAST2025' to instantly save ₹500, then click 'Proceed to Pay Advance'.",
          actionText: "Pay Advance (₹1,500)",
          selector: "button[onclick*='razorpay-modal']"
        };
      case 5:
        return {
          title: "Step 5: Razorpay Advance",
          desc: "Simulate a secure online transaction through our integrated Razorpay Popup. Click the 'Simulate Success' button in the popup footer to pay ₹1,500.",
          actionText: "Simulate Success",
          selector: "button[onclick*='Simulate Success']"
        };
      case 6:
        return {
          title: "Step 6: Dashboard Tracking",
          desc: "Booking confirmed! You are now in the User Dashboard. Here you can track driver details and download the Invoice. Next, let's open the Admin Dashboard to collect the remaining balance.",
          actionText: "Go to Admin Dashboard",
          selector: ""
        };
      case 7:
        return {
          title: "Step 7: Collect Remaining Balance",
          desc: "As the driver or administrator, locate your active booking (Rahul Sharma) in the Live Bookings table and click 'Collect Balance' to accept the cash/UPI payment of ₹4,799.",
          actionText: "Collect ₹4,799 Cash/UPI",
          selector: "button[onclick*='Collect Balance']"
        };
      case 8:
        return {
          title: "Step 8: Verified Invoice Receipt",
          desc: "Payment collected! Click 'Dashboard' on the left menu (or click 'View Dashboard') to check that the Invoice now reads 'Fully Paid' with ₹0 due. The interactive walkthrough is complete!",
          actionText: "Back to Launcher",
          selector: ""
        };
      default:
        return null;
    }
  },

  renderGuide: function() {
    if (!StateEngine.isDemoMode()) return;
    
    const step = this.getCurrentStep();
    const details = this.getStepDetails(step);
    if (!details) return;

    let guideCard = document.getElementById('demo-guide-card');
    if (!guideCard) {
      guideCard = document.createElement('div');
      guideCard.id = 'demo-guide-card';
      guideCard.className = 'demo-guide-card';
      document.body.appendChild(guideCard);
    }

    // Set layout
    guideCard.innerHTML = `
      <div class="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between border-b border-secondary">
        <span class="font-heading font-bold text-xs tracking-wider uppercase text-secondary flex items-center gap-1">
          <iconify-icon icon="lucide:navigation" class="animate-bounce"></iconify-icon> Guided Tour
        </span>
        <button onclick="localStorage.setItem('jg_demo_mode', 'false'); this.closest('.demo-guide-card').remove(); UIUtils.showToast('Guided Tour Cancelled', 'error');" class="text-primary-foreground/70 hover:text-primary-foreground text-xs font-bold">
          Exit Tour
        </button>
      </div>
      <div class="p-4 space-y-3">
        <h4 class="font-heading font-bold text-sm text-primary leading-tight">${details.title}</h4>
        <p class="text-xs text-muted-foreground leading-relaxed">${details.desc}</p>
        <div class="pt-2 flex justify-between items-center">
          <span class="text-[10px] bg-muted text-muted-foreground font-semibold px-2 py-0.5 rounded-full">Step ${step} of 8</span>
          ${details.selector === "" ? `
            <button id="guide-manual-btn" class="bg-secondary text-secondary-foreground font-bold px-3 py-1.5 rounded text-[10px] hover:bg-secondary/95 transition-all shadow-md">
              ${details.actionText}
            </button>
          ` : `
            <span class="text-[10px] text-secondary font-bold animate-pulse">Follow prompt above</span>
          `}
        </div>
      </div>
    `;

    // Highlight target selector if it exists on page
    if (details.selector) {
      const targetEl = document.querySelector(details.selector);
      if (targetEl) {
        targetEl.style.outline = "3px solid var(--secondary)";
        targetEl.style.outlineOffset = "4px";
      }
    }

    // Bind manually advanced steps
    const manualBtn = document.getElementById('guide-manual-btn');
    if (manualBtn) {
      manualBtn.addEventListener('click', () => {
        if (step === 6) {
          window.location.href = "Admin Control Center.html";
        } else if (step === 8) {
          StateEngine.logout();
          window.location.href = "index.html";
        }
      });
    }
  }
};

// Standard Document Ready Hook
document.addEventListener('DOMContentLoaded', function () {
  // Check login authentication state
  const path = window.location.pathname;
  const isLoginPage = path.includes('Login') || path.includes('Signup');
  const isLauncher = path.includes('Launcher');
  const isLandingPage = path === '' || path === '/' || path.includes('index.html');
  const isLoggedIn = StateEngine.isLoggedIn();

  if (!isLoggedIn && !isLoginPage && !isLauncher && !isLandingPage && !StateEngine.isDemoMode()) {
    window.location.href = "Login & Signup.html";
    return;
  }

  if (isLoggedIn && isLoginPage) {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (redirect === 'booking') {
      window.location.href = "Booking & Payment.html";
    } else {
      window.location.href = "index.html";
    }
    return;
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // Prevent default form submit
  document.querySelectorAll('form').forEach(function (form) {
    if (!form.hasAttribute('data-ajax-submit')) {
      form.addEventListener('submit', function (e) { e.preventDefault(); });
    }
  });

  // Initialize common elements
  UIUtils.setupRipples();
  DemoAssistant.renderGuide();

  // Sync Logged In State with UI Header / Navbars
  (function syncNavbarState() {
    const isLoggedIn = StateEngine.isLoggedIn();
    
    // Portal Login buttons in header
    const loginBtns = document.querySelectorAll('#login-btn, button, a');
    loginBtns.forEach(el => {
      if (el.id === 'login-btn' || el.textContent.includes('Portal Login') || el.textContent.includes('Login / Sign In')) {
        if (isLoggedIn) {
          const rawName = localStorage.getItem('jg_user_name') || 'User';
          const shortName = rawName.split(' ')[0]; // First name
          el.innerHTML = `<iconify-icon icon="lucide:user" class="text-lg"></iconify-icon> ${shortName}`;
          el.onclick = function() {
            window.location.href = "User Dashboard & Invoice.html";
          };
        } else {
          el.innerHTML = `<iconify-icon icon="lucide:user" class="text-lg"></iconify-icon> Login / Sign In`;
          el.onclick = function() {
            window.location.href = "Login & Signup.html";
          };
        }
      }
    });

    // Logo Links
    const logoBlock = document.querySelector('header .flex.items-center.gap-3, footer .flex.items-center.gap-3');
    if (logoBlock) {
      logoBlock.style.cursor = 'pointer';
      logoBlock.addEventListener('click', function() {
        window.location.href = "index.html";
      });
    }
  })();

  // ── Page-specific Initializers ──

  // 1. LANDING PAGE
  if (document.querySelector('[data-page="landing-page"]')) {
    const searchForm = document.querySelector('section#home form');
    
    // Trip Type Selector Tabs Toggling
    const btnOneWay = document.getElementById('type-one-way');
    const btnRoundTrip = document.getElementById('type-round-trip');
    const btnAirport = document.getElementById('type-airport');
    
    const returnDateContainer = document.getElementById('return-date-container');
    const pickupInput = document.getElementById('pickup-location');
    const dropInput = document.getElementById('drop-destination');

    function setActiveTripType(activeBtn) {
      [btnOneWay, btnRoundTrip, btnAirport].forEach(btn => {
        if (btn) {
          btn.className = "text-muted-foreground hover:text-primary text-xs font-semibold py-2 rounded-md transition-colors";
        }
      });
      if (activeBtn) {
        activeBtn.className = "bg-primary text-primary-foreground text-xs font-semibold py-2 rounded-md shadow-sm";
      }
    }

    if (btnOneWay) {
      btnOneWay.addEventListener('click', () => {
        setActiveTripType(btnOneWay);
        if (returnDateContainer) returnDateContainer.classList.add('hidden');
        if (pickupInput) {
          pickupInput.placeholder = "Enter pickup location (e.g. Silchar)";
          pickupInput.value = "";
        }
        if (dropInput) {
          dropInput.placeholder = "Enter destination (e.g. Shillong, Tura)";
          dropInput.value = "";
        }
      });
    }

    if (btnRoundTrip) {
      btnRoundTrip.addEventListener('click', () => {
        setActiveTripType(btnRoundTrip);
        if (returnDateContainer) returnDateContainer.classList.remove('hidden');
        if (pickupInput) {
          pickupInput.placeholder = "Enter pickup location (e.g. Silchar)";
        }
        if (dropInput) {
          dropInput.placeholder = "Enter destination (e.g. Shillong, Tura)";
        }
      });
    }

    if (btnAirport) {
      btnAirport.addEventListener('click', () => {
        setActiveTripType(btnAirport);
        if (returnDateContainer) returnDateContainer.classList.add('hidden');
        if (pickupInput) {
          pickupInput.value = "Silchar Town, Assam";
        }
        if (dropInput) {
          dropInput.value = "Silchar Airport (IXS), Assam";
          dropInput.placeholder = "Enter Airport (e.g. Silchar Airport IXS)";
        }
      });
    }

    if (searchForm) {
      searchForm.removeAttribute('onsubmit'); // override static behavior
      searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Save inputs to state
        const pickupInputEl = document.getElementById('pickup-location');
        const dropInputEl = document.getElementById('drop-destination');
        const dateInput = document.getElementById('travel-date');
        const timeInput = document.getElementById('travel-time');

        if (!pickupInputEl || !pickupInputEl.value.trim() || !dropInputEl || !dropInputEl.value.trim()) {
          UIUtils.showToast('Please enter both pickup and destination locations', 'error');
          return;
        }

        const searchObj = {
          pickup: pickupInputEl.value.trim(),
          destination: dropInputEl.value.trim(),
          date: dateInput && dateInput.value ? dateInput.value : new Date().toISOString().split('T')[0],
          time: timeInput && timeInput.value ? timeInput.value : '10:00 AM',
          passengers: '4',
          vehicleType: 'suv'
        };

        StateEngine.setActiveSearch(searchObj);

        UIUtils.showLoading('Searching Luxury Rides...', 1200, function() {
          window.location.href = "Search Results.html";
        });
      });
    }

    // Popular Route clicks
    document.querySelectorAll('#routes .group').forEach(routeCard => {
      const heading = routeCard.querySelector('h4').textContent; // e.g. "Silchar ⇄ Shillong"
      const fareText = routeCard.querySelector('span.text-lg').textContent;
      const cleanFare = parseInt(fareText.replace(/[^\d]/g, '')) || 5499;

      const parts = heading.split('⇄').map(s => s.trim());
      const origin = parts[0] ? parts[0] + ', Assam' : 'Silchar, Assam';
      const destination = parts[1] ? parts[1] + ', Northeast India' : 'Shillong, Meghalaya';

      // Bind route card click
      routeCard.style.cursor = 'pointer';
      routeCard.addEventListener('click', () => {
        const searchObj = {
          pickup: origin,
          destination: destination,
          date: '2025-10-15',
          time: '09:30 AM',
          passengers: '4',
          vehicleType: 'suv'
        };
        StateEngine.setActiveSearch(searchObj);
        
        // Prefill Innova/Dzire details in local storage for this selected route
        StateEngine.setSelectedVehicle({
          name: cleanFare > 6000 ? 'Toyota Innova Crysta' : 'Swift Dzire / Etios',
          type: cleanFare > 6000 ? 'suv' : 'sedan',
          baseFare: cleanFare,
          driver: cleanFare > 6000 ? 'Bimal Das' : 'Rahul Nath',
          rating: '4.9 ★',
          image: cleanFare > 6000 ? 'https://uxmagic.blob.core.windows.net/public/agent-images/luxury-suv-1783757866936-wp7ctnkd6fo.png' : 'https://uxmagic.blob.core.windows.net/public/agent-images/luxury-suv-1783757866936-wp7ctnkd6fo.png'
        });

        UIUtils.showLoading('Setting up Route...', 800, () => {
          window.location.href = "Search Results.html";
        });
      });
    });
  }

  // 2. SEARCH RESULTS PAGE
  if (document.querySelector('[data-page="search-results"]')) {
    const searchData = StateEngine.getActiveSearch();
    
    // Fill top overview bar
    if (searchData) {
      const overviewBar = document.querySelector('.bg-primary.text-primary-foreground.py-4');
      if (overviewBar) {
        overviewBar.innerHTML = `
          <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div class="flex items-center gap-2">
                <span class="text-secondary font-semibold">From:</span>
                <span>${searchData.pickup}</span>
              </div>
              <div class="text-secondary/60 hidden sm:inline">|</div>
              <div class="flex items-center gap-2">
                <span class="text-secondary font-semibold">To:</span>
                <span>${searchData.destination}</span>
              </div>
              <div class="text-secondary/60 hidden sm:inline">|</div>
              <div class="flex items-center gap-2">
                <span class="text-secondary font-semibold">Date:</span>
                <span>${searchData.date}</span>
              </div>
              <div class="text-secondary/60 hidden sm:inline">|</div>
              <div class="flex items-center gap-2">
                <span class="text-secondary font-semibold">Time:</span>
                <span>${searchData.time}</span>
              </div>
            </div>
            <a href="index.html" class="bg-background/10 px-3 py-1 rounded-lg text-xs font-semibold border border-border/20 hover:bg-background/20 transition-all">
              Modify Search
            </a>
          </div>
        `;
      }
    }

    // Filter Logic
    const premiumSuvCheckbox = document.getElementById('filter-suv');
    const executiveSedanCheckbox = document.getElementById('filter-sedan');
    const luxuryTravelerCheckbox = document.getElementById('filter-traveler');
    const priceSlider = document.getElementById('filter-price-slider');
    const sliderLabel = document.getElementById('filter-price-label');
    
    // Add unique markup properties dynamically
    const cards = document.querySelectorAll('section.lg\\:col-span-9 > div.bg-card');
    if (cards[0]) { cards[0].setAttribute('data-type', 'suv'); cards[0].setAttribute('data-price', '6499'); }
    if (cards[1]) { cards[1].setAttribute('data-type', 'sedan'); cards[1].setAttribute('data-price', '4499'); }
    if (cards[2]) { cards[2].setAttribute('data-type', 'traveler'); cards[2].setAttribute('data-price', '11999'); }

    function applyFilters() {
      const showSuv = premiumSuvCheckbox ? premiumSuvCheckbox.checked : true;
      const showSedan = executiveSedanCheckbox ? executiveSedanCheckbox.checked : true;
      const showTraveler = luxuryTravelerCheckbox ? luxuryTravelerCheckbox.checked : true;
      const maxPrice = priceSlider ? parseInt(priceSlider.value) : 12000;

      if (sliderLabel && priceSlider) {
        sliderLabel.textContent = '₹' + parseInt(priceSlider.value).toLocaleString();
      }

      let count = 0;
      cards.forEach(card => {
        const type = card.getAttribute('data-type');
        const price = parseInt(card.getAttribute('data-price')) || 5000;
        
        let typeMatch = false;
        if (type === 'suv' && showSuv) typeMatch = true;
        if (type === 'sedan' && showSedan) typeMatch = true;
        if (type === 'traveler' && showTraveler) typeMatch = true;
        
        const priceMatch = price <= maxPrice;

        if (typeMatch && priceMatch) {
          card.classList.remove('hidden');
          count++;
        } else {
          card.classList.add('hidden');
        }
      });

      // Update count
      const countLabel = document.querySelector('section.lg\\:col-span-9 p.text-sm.font-semibold.text-muted-foreground');
      if (countLabel) {
        countLabel.innerHTML = `Showing <span class="text-primary font-bold">${count} Available Premium Vehicles</span>`;
      }
    }

    // Attach listeners
    if (premiumSuvCheckbox) premiumSuvCheckbox.addEventListener('change', applyFilters);
    if (executiveSedanCheckbox) executiveSedanCheckbox.addEventListener('change', applyFilters);
    if (luxuryTravelerCheckbox) luxuryTravelerCheckbox.addEventListener('change', applyFilters);
    if (priceSlider) {
      priceSlider.addEventListener('input', applyFilters);
      applyFilters(); // run once to init labels
    }

    // Bind Select buttons
    cards.forEach(card => {
      const selectBtn = card.querySelector('button');
      if (selectBtn) {
        selectBtn.removeAttribute('onclick'); // remove standard alert
        selectBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          const vehicleName = card.querySelector('h3').textContent.split('\n')[0].trim();
          const vehicleType = card.getAttribute('data-type');
          const baseFare = parseInt(card.getAttribute('data-price')) || 6499;
          const driver = card.querySelector('.bg-muted strong') ? card.querySelector('.bg-muted strong').textContent : 'Bimal Das';
          
          StateEngine.setSelectedVehicle({
            name: vehicleName,
            type: vehicleType,
            baseFare: baseFare,
            driver: driver,
            rating: '4.9 ★',
            image: card.querySelector('img') ? card.querySelector('img').getAttribute('src') : 'https://uxmagic.blob.core.windows.net/public/agent-images/luxury-suv-1783757866936-wp7ctnkd6fo.png'
          });

          UIUtils.showLoading('Preparing Booking Invoice...', 1000, () => {
            // Force user to log in before checking out if logged out
            if (StateEngine.isLoggedIn()) {
              window.location.href = "Booking & Payment.html";
            } else {
              UIUtils.showToast('Please log in to continue booking', 'error');
              setTimeout(() => {
                window.location.href = "Login & Signup.html?redirect=booking";
              }, 1200);
            }
          });
        });
      }
    });
  }

  // 3. BOOKING & PAYMENT PAGE
  if (document.querySelector('[data-page="booking-payment"]')) {
    const selectedVehicle = StateEngine.getSelectedVehicle();
    const searchData = StateEngine.getActiveSearch();

    // Dynamically calculate fees based on selected vehicle
    let baseFare = selectedVehicle ? selectedVehicle.baseFare : 6499;
    let discount = localStorage.getItem('jg_coupon_applied') === 'true' ? 500 : 0;
    
    function updateCheckoutFares() {
      let subtotal = baseFare - discount;
      let gst = Math.round(subtotal * 0.05);
      let totalPayable = subtotal + gst;
      let advance = Math.round(totalPayable * 0.25);
      let balance = totalPayable - advance;

      // Update Fare Elements in HTML
      const baseFareEl = document.querySelector('.space-y-6 div.text-sm div:nth-child(1) span:last-child');
      const discountEl = document.querySelector('.space-y-6 div.text-sm div:nth-child(2) span:last-child');
      const gstEl = document.querySelector('.space-y-6 div.text-sm div:nth-child(4) span:last-child');
      const totalPayableEl = document.querySelector('.border-t.border-border.pt-3 span:last-child');
      const advanceEl = document.querySelector('.bg-muted div.flex.justify-between.text-sm span:last-child');
      const balanceEl = document.querySelector('.bg-muted div.flex.justify-between.text-xs span:last-child');

      if (baseFareEl) baseFareEl.textContent = `₹${baseFare.toLocaleString()}`;
      if (discountEl) {
        discountEl.textContent = discount > 0 ? `-₹${discount.toLocaleString()}` : `₹0`;
        discountEl.className = discount > 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-primary';
      }
      if (gstEl) gstEl.textContent = `₹${gst.toLocaleString()}`;
      if (totalPayableEl) totalPayableEl.textContent = `₹${totalPayable.toLocaleString()}`;
      if (advanceEl) advanceEl.textContent = `₹${advance.toLocaleString()}`;
      if (balanceEl) balanceEl.textContent = `₹${balance.toLocaleString()}`;

      // Save calculated fares to localStorage for Dashboard / Invoice pages
      localStorage.setItem('jg_calc_base', baseFare);
      localStorage.setItem('jg_calc_discount', discount);
      localStorage.setItem('jg_calc_gst', gst);
      localStorage.setItem('jg_calc_total', totalPayable);
      localStorage.setItem('jg_calc_advance', advance);
      localStorage.setItem('jg_calc_balance', balance);
    }

    // Load active vehicle details
    if (selectedVehicle) {
      const vTitle = document.querySelector('h4.font-heading.font-semibold.text-base');
      const vDesc = document.querySelector('p.text-xs.text-muted-foreground');
      const vRating = document.querySelector('div.text-secondary.font-bold');

      if (vTitle) vTitle.textContent = selectedVehicle.name;
      if (vDesc) {
        vDesc.textContent = `${selectedVehicle.type === 'suv' ? 'SUV' : selectedVehicle.type === 'sedan' ? 'Sedan' : 'Traveler'} • AC • ${selectedVehicle.type === 'suv' ? '6+1' : selectedVehicle.type === 'sedan' ? '4' : '12'} Seats • Clean Cabin`;
      }
      if (vRating) vRating.innerHTML = `<iconify-icon icon="lucide:star" class="text-sm"></iconify-icon> 4.9 (${selectedVehicle.driver})`;
    }

    // Load Route Details
    if (searchData) {
      const pickupEl = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.gap-4 div:nth-child(1) p');
      const pickupTime = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.gap-4 div:nth-child(1) span:last-child');
      const dropEl = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.gap-4 div:nth-child(2) p');

      if (pickupEl) pickupEl.textContent = searchData.pickup;
      if (pickupTime) pickupTime.textContent = `${searchData.date} • ${searchData.time}`;
      if (dropEl) dropEl.textContent = searchData.destination;
    }

    // Coupon Apply Event
    const couponInput = document.getElementById('coupon-input');
    const couponBtn = document.getElementById('coupon-apply-btn');
    const couponSuccessMsg = document.getElementById('coupon-success-msg');

    updateCheckoutFares(); // Initial draw

    if (couponBtn && couponInput) {
      couponBtn.removeAttribute('onclick'); // override standard click
      couponBtn.textContent = localStorage.getItem('jg_coupon_applied') === 'true' ? 'Applied' : 'Apply';
      
      couponBtn.addEventListener('click', function() {
        const code = couponInput.value.trim().toUpperCase();
        if (code === 'NORTHEAST2025') {
          discount = 500;
          localStorage.setItem('jg_coupon_applied', 'true');
          couponBtn.textContent = 'Applied';
          if (couponSuccessMsg) {
            couponSuccessMsg.style.display = 'block';
            couponSuccessMsg.innerHTML = `<iconify-icon icon="lucide:circle-check"></iconify-icon> Coupon NORTHEAST2025 applied! Saved ₹500.`;
          }
          UIUtils.showToast('Coupon Applied Successfully!', 'success');
          updateCheckoutFares();
        } else {
          UIUtils.showToast('Invalid Coupon Code', 'error');
        }
      });
    }

    // Razorpay Popup Interactions
    const razorpayModal = document.getElementById('razorpay-modal');
    const proceedBtn = document.querySelector('button[onclick*="razorpay-modal"]');
    
    if (proceedBtn) {
      proceedBtn.removeAttribute('onclick');
      proceedBtn.addEventListener('click', function() {
        if (razorpayModal) {
          // Pre-populate amount in Razorpay modal dynamically
          const razorpayAmountEl = razorpayModal.querySelector('.bg-muted.px-5.py-3 span:last-child');
          const advancePayable = localStorage.getItem('jg_calc_advance') || '1,500';
          if (razorpayAmountEl) razorpayAmountEl.textContent = `₹${parseInt(advancePayable).toLocaleString()}.00`;
          
          razorpayModal.classList.remove('hidden');
          DemoAssistant.renderGuide(); // render guide again for step 5
        }
      });
    }

    // Simulating Success Inside Razorpay Modal
    const simBtn = razorpayModal ? razorpayModal.querySelector('button[onclick*="Simulate Success"]') : null;
    if (simBtn) {
      simBtn.removeAttribute('onclick');
      simBtn.addEventListener('click', function() {
        // Change text to processing
        simBtn.textContent = "Processing...";
        simBtn.disabled = true;

        setTimeout(function() {
          // Close Razorpay Modal
          if (razorpayModal) razorpayModal.classList.add('hidden');
          
          // Show simulated main loading screen
          UIUtils.showLoading('Confirming payment with Razorpay...', 1500, function() {
            // Generate dynamic booking ID
            const bookingId = 'JG-' + new Date().toISOString().slice(2,10).replace(/-/g,'') + '-' + Math.floor(100 + Math.random() * 900);
            
            // Append booking object to local state
            const currentBookings = StateEngine.getBookings();
            const newBooking = {
              id: bookingId,
              customerName: localStorage.getItem('jg_user_name') || 'Rahul Sharma',
              customerPhone: '+91 94350 12345',
              customerEmail: localStorage.getItem('jg_user_email') || 'rahul@example.com',
              route: `${searchData ? searchData.pickup.split(',')[0] : 'Silchar Airport'} ⇄ ${searchData ? searchData.destination.split(',')[0] : 'Shillong'}`,
              vehicleName: selectedVehicle ? selectedVehicle.name : 'Toyota Innova Crysta',
              vehicleType: selectedVehicle ? selectedVehicle.type : 'suv',
              driverName: selectedVehicle ? selectedVehicle.driver : 'Bimal Das',
              driverPhone: '+91 94350 99999',
              travelDate: searchData ? searchData.date : '2025-10-15',
              travelTime: searchData ? searchData.time : '09:30 AM',
              pickup: searchData ? searchData.pickup : 'Silchar Airport (IXS), Assam',
              destination: searchData ? searchData.destination : 'Shillong, Meghalaya',
              baseFare: parseInt(localStorage.getItem('jg_calc_base')) || 6499,
              gst: parseInt(localStorage.getItem('jg_calc_gst')) || 300,
              discount: parseInt(localStorage.getItem('jg_calc_discount')) || 500,
              payableAmount: parseInt(localStorage.getItem('jg_calc_total')) || 6299,
              advancePaid: parseInt(localStorage.getItem('jg_calc_advance')) || 1500,
              balanceDue: parseInt(localStorage.getItem('jg_calc_balance')) || 4799,
              status: 'Advance Paid'
            };
            
            currentBookings.unshift(newBooking); // add as most recent
            StateEngine.updateBookings(currentBookings);
            
            // Set active booking ID in state
            localStorage.setItem('jg_last_booking_id', bookingId);
            
            // Toast Success
            UIUtils.showToast('Payment Completed! Booking Confirmed.', 'success');

            // Redirect to User Dashboard
            setTimeout(() => {
              window.location.href = "User Dashboard & Invoice.html?success=true";
            }, 1000);
          });
        }, 1200);
      });
    }
  }

  // 4. USER DASHBOARD & INVOICE PAGE
  if (document.querySelector('[data-page="user-dashboard-invoice"]') || document.getElementById('dashboard') || window.location.pathname.includes('User%20Dashboard')) {
    const bookings = StateEngine.getBookings();
    
    // Find active booking (most recent or selected)
    const lastBookingId = localStorage.getItem('jg_last_booking_id') || 'JG-2025-4829';
    const activeBooking = bookings.find(b => b.id === lastBookingId) || bookings[0];

    // Trigger confirmation notification animation popup if redirected from payment success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      // Clear query params to prevent repeating popups
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Inject alert overlay
      let successAlert = document.createElement('div');
      successAlert.className = 'fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-4';
      successAlert.innerHTML = `
        <div class="bg-card w-full max-w-sm rounded-2xl border border-border p-6 shadow-2xl text-center space-y-4 animate-scale-up">
          <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-sm">
            <iconify-icon icon="lucide:check-circle"></iconify-icon>
          </div>
          <div>
            <h3 class="font-heading font-bold text-lg text-primary">Booking Confirmed!</h3>
            <p class="text-xs text-muted-foreground mt-1">Booking ID: <strong class="text-primary">${activeBooking.id}</strong></p>
          </div>
          <p class="text-xs text-muted-foreground leading-relaxed">
            Your advance payment of <strong>₹${activeBooking.advancePaid.toLocaleString()}</strong> has been secured via Razorpay. WhatsApp/Email notifications have been sent to you.
          </p>
          <div class="grid grid-cols-2 gap-3 pt-2">
            <button id="noti-preview-btn" class="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4 py-2.5 rounded-lg text-xs">
              Preview Alerts
            </button>
            <button id="close-success-alert" class="bg-muted hover:bg-muted/80 text-primary font-bold px-4 py-2.5 rounded-lg text-xs">
              Go to Dashboard
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(successAlert);

      document.getElementById('close-success-alert').onclick = function() {
        successAlert.remove();
      };
      
      document.getElementById('noti-preview-btn').onclick = function() {
        successAlert.remove();
        // Trigger notification simulation overlay
        triggerNotificationPreviews(activeBooking);
      };
    }

    function triggerNotificationPreviews(booking) {
      let previewOverlay = document.createElement('div');
      previewOverlay.className = 'fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4';
      previewOverlay.innerHTML = `
        <div class="bg-card w-full max-w-4xl rounded-2xl border border-border overflow-hidden shadow-2xl flex flex-col md:flex-row h-[550px]">
          <!-- WhatsApp Preview Panel -->
          <div class="flex-1 bg-[#efeae2] flex flex-col">
            <div class="bg-[#00a884] text-white p-3 flex items-center gap-3">
              <div class="w-8 h-8 rounded-full overflow-hidden bg-white">
                <img src="Assets image/logo.png" alt="Joy Guru Logo" class="w-full h-full object-cover">
              </div>
              <div>
                <span class="block text-xs font-bold">Joy Guru Tours & Travels</span>
                <span class="block text-[9px] opacity-80">Official Business Account</span>
              </div>
            </div>
            <div class="p-4 flex-1 overflow-y-auto space-y-4 flex flex-col justify-end">
              <div class="bg-white rounded-lg p-3 text-[11px] text-slate-800 shadow-sm max-w-[85%] border-l-4 border-emerald-500 self-start">
                <p class="font-bold text-emerald-600 mb-1">Joy Guru Tours & Travels</p>
                Dear <strong>${booking.customerName}</strong>, your premium ride with Joy Guru is confirmed! 🚗💨<br><br>
                📌 <strong>Booking ID:</strong> ${booking.id}<br>
                📍 <strong>Route:</strong> ${booking.route}<br>
                📅 <strong>Date:</strong> ${booking.travelDate}<br>
                👤 <strong>Driver Assigned:</strong> ${booking.driverName} (${booking.driverPhone})<br><br>
                💵 <strong>Advance Paid:</strong> ₹${booking.advancePaid.toLocaleString()}<br>
                💳 <strong>Remaining Balance:</strong> ₹${booking.balanceDue.toLocaleString()} (Pay cash/UPI to pilot)<br><br>
                Thank you for choosing us! Support Desk: +91 94350 XXXXX
                <span class="block text-[8px] text-slate-400 mt-2 text-right">14:08 PM</span>
              </div>
            </div>
          </div>

          <!-- Email Preview Panel -->
          <div class="flex-1 bg-white flex flex-col border-t md:border-t-0 md:border-l border-border">
            <div class="bg-slate-100 p-3 border-b border-border text-[11px]">
              <p class="text-slate-500">From: <strong>bookings@joygurutravels.com</strong></p>
              <p class="text-slate-500">To: <strong>${booking.customerEmail}</strong></p>
              <p class="text-slate-800 font-bold mt-1">Subject: Booking Confirmed & Payment Receipt - ${booking.id}</p>
            </div>
            <div class="p-6 flex-1 overflow-y-auto font-sans text-xs text-slate-800 space-y-4">
              <div class="flex items-center gap-3 border-b border-border pb-3">
                <div class="w-8 h-8 rounded-full overflow-hidden border border-border/20">
                  <img src="Assets image/logo.png" alt="Joy Guru Logo" class="w-full h-full object-cover">
                </div>
                <div>
                  <span class="font-heading font-bold text-sm tracking-wide text-primary">JOY GURU</span>
                  <span class="text-[9px] tracking-widest text-secondary uppercase font-bold">Tours & Travels</span>
                </div>
              </div>
              <p>Hi ${booking.customerName},</p>
              <p>Your advance payment has been successfully verified. Please find your travel invoice summary below.</p>
              <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[10px] space-y-1.5">
                <div class="flex justify-between"><span>Booking ID:</span><strong>${booking.id}</strong></div>
                <div class="flex justify-between"><span>Vehicle:</span><strong>${booking.vehicleName}</strong></div>
                <div class="flex justify-between"><span>Travel Date:</span><strong>${booking.travelDate} at ${booking.travelTime}</strong></div>
                <div class="flex justify-between"><span>Total Fare:</span><strong>₹${booking.payableAmount.toLocaleString()}</strong></div>
                <div class="flex justify-between text-emerald-600"><span>Advance Secured:</span><strong>₹${booking.advancePaid.toLocaleString()}</strong></div>
                <div class="flex justify-between text-secondary"><span>Balance Due:</span><strong>₹${booking.balanceDue.toLocaleString()}</strong></div>
              </div>
              <p class="text-[10px] text-slate-400 leading-relaxed">Please pay the remaining balance to driver at the completion of your journey. Safe travels!</p>
            </div>
            <div class="p-3 bg-slate-100 border-t border-border flex justify-end">
              <button id="close-noti-preview" class="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4 py-1.5 rounded text-xs">
                Dismiss Previews
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(previewOverlay);

      document.getElementById('close-noti-preview').onclick = function() {
        previewOverlay.remove();
      };
    }

    // Render bookings list and select trip
    const bookingsListContainer = document.getElementById('dashboard-bookings-list');
    const selectedBookingDetailsPanel = document.getElementById('selected-booking-details-panel');

    function populateBookingDetails(booking) {
      if (!booking || !selectedBookingDetailsPanel) return;

      let statusPillText = "Advance Paid (Confirmed)";
      let statusPillClass = "bg-emerald-100 text-emerald-800";
      if (booking.status === 'Fully Paid') {
        statusPillText = "Fully Paid (Receipt Generated)";
      } else if (booking.status === 'Completed') {
        statusPillText = "Trip Completed (Pending Balance)";
        statusPillClass = "bg-blue-100 text-blue-800";
      }

      let step2Color = booking.status === 'Fully Paid' ? 'bg-primary' : 'bg-secondary';
      let step3Color = booking.status === 'Fully Paid' ? 'bg-primary' : 'bg-muted';
      let step3Opacity = booking.status === 'Fully Paid' ? '' : 'opacity-60';

      let step3Content = booking.status === 'Fully Paid'
        ? `<span class="font-bold text-primary block">Trip Completed & Payment Finalised</span>
           <span class="text-muted-foreground">${booking.pickup.split(',')[0]} to ${booking.destination.split(',')[0]} Route Completed successfully. Paid remaining balance of ₹${booking.balanceDue.toLocaleString()} to pilot.</span>`
        : `<span class="font-bold text-muted-foreground block">Trip Started (Pending)</span>
           <span class="text-muted-foreground">${booking.pickup.split(',')[0]} to ${booking.destination.split(',')[0]} • Remaining amount ₹${booking.balanceDue.toLocaleString()} due at drop.</span>`;

      selectedBookingDetailsPanel.innerHTML = `
        <div class="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 class="font-heading font-bold text-lg text-primary">Active Booking Status</h3>
              <p class="text-xs text-muted-foreground">Booking ID: <strong class="text-primary">${booking.id}</strong></p>
            </div>
            <span class="text-xs ${statusPillClass} font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <iconify-icon icon="lucide:check-circle"></iconify-icon> ${statusPillText}
            </span>
          </div>

          <!-- Booking Status Timeline -->
          <div class="relative pl-6 space-y-6 border-l-2 border-primary/20">
            <!-- Step 1 -->
            <div class="relative">
              <div class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-primary border-4 border-background"></div>
              <div class="text-xs">
                <span class="font-bold text-primary block">Booking Confirmed & Advance Paid</span>
                <span class="text-muted-foreground">${booking.travelDate} • ${booking.travelTime} • Received ₹${booking.advancePaid.toLocaleString()}</span>
              </div>
            </div>
            <!-- Step 2 -->
            <div class="relative">
              <div class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ${step2Color} border-4 border-background"></div>
              <div class="text-xs">
                <span class="font-bold text-primary block">Driver Assigned</span>
                <span class="text-muted-foreground">Pilot: <strong class="text-primary">${booking.driverName}</strong> (${booking.driverPhone}) • ${booking.vehicleName}</span>
              </div>
            </div>
            <!-- Step 3 -->
            <div class="relative">
              <div class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ${step3Color} border-4 border-background"></div>
              <div class="text-xs ${step3Opacity}">
                ${step3Content}
              </div>
            </div>
          </div>

          <!-- Professional GST Invoice Layout (Inline Viewer) -->
          <div class="border border-border rounded-xl overflow-hidden mt-6">
            <div class="bg-muted px-4 py-3 border-b border-border flex items-center justify-between">
              <span class="text-xs font-bold text-primary flex items-center gap-1">
                <iconify-icon icon="lucide:file-text"></iconify-icon> Professional GST Invoice (${booking.id})
              </span>
              <button id="invoice-download-btn" class="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1">
                <iconify-icon icon="lucide:download"></iconify-icon> Download PDF
              </button>
            </div>

            <div class="p-6 bg-background text-slate-800 space-y-6 text-xs font-sans">
              <!-- Invoice Header -->
              <div class="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <span class="font-heading font-black text-sm tracking-wide text-primary">JOY GURU TOURS & TRAVELS</span>
                  <p class="text-[10px] text-slate-500 mt-1">
                    Club Road, Silchar, Assam - 788001<br>
                    GSTIN: 18AABCJ3829K1Z4<br>
                    Email: billing@joygurutravels.com
                  </p>
                </div>
                <div class="text-right">
                  <span class="text-lg font-heading font-bold text-primary block">TAX INVOICE</span>
                  <span class="text-[10px] text-slate-500 block">Invoice No: <strong class="text-slate-800">INV-${booking.id.substring(3)}</strong></span>
                  <span class="text-[10px] text-slate-500 block">Date: ${booking.travelDate}</span>
                </div>
              </div>

              <!-- Bill To / Bill From -->
              <div class="grid grid-cols-2 gap-4 text-[10px]">
                <div>
                  <span class="block font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Details</span>
                  <p class="font-semibold text-slate-800">${booking.customerName}</p>
                  <p class="text-slate-500">Phone: ${booking.customerPhone}<br>Email: ${booking.customerEmail}</p>
                </div>
                <div>
                  <span class="block font-bold text-slate-500 uppercase tracking-wider mb-1">Trip Summary</span>
                  <p class="font-semibold text-slate-800">${booking.route}</p>
                  <p class="text-slate-500">Vehicle: ${booking.vehicleName} (${booking.vehicleType.toUpperCase()})<br>Date: ${booking.travelDate} at ${booking.travelTime}</p>
                </div>
              </div>

              <!-- Invoice Table -->
              <table class="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr class="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
                    <th class="py-2 px-3">Description</th>
                    <th class="py-2 px-3 text-right">SAC Code</th>
                    <th class="py-2 px-3 text-right">Rate</th>
                    <th class="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-slate-100">
                    <td class="py-2 px-3">Premium One-Way Outstation Cab Rental (${booking.route})</td>
                    <td class="py-2 px-3 text-right">9964</td>
                    <td class="py-2 px-3 text-right">₹${booking.baseFare.toLocaleString()}.00</td>
                    <td class="py-2 px-3 text-right">₹${booking.baseFare.toLocaleString()}.00</td>
                  </tr>
                  ${booking.discount > 0 ? `
                    <tr class="border-b border-slate-100">
                      <td class="py-2 px-3 text-emerald-600">Coupon Discount</td>
                      <td class="py-2 px-3 text-right">—</td>
                      <td class="py-2 px-3 text-right text-emerald-600">-₹${booking.discount.toLocaleString()}.00</td>
                      <td class="py-2 px-3 text-right text-emerald-600">-₹${booking.discount.toLocaleString()}.00</td>
                    </tr>
                  ` : ''}
                  <tr class="border-b border-slate-100">
                    <td class="py-2 px-3">CGST (2.5%)</td>
                    <td class="py-2 px-3 text-right">—</td>
                    <td class="py-2 px-3 text-right">₹${Math.round(booking.gst / 2).toLocaleString()}.00</td>
                    <td class="py-2 px-3 text-right">₹${Math.round(booking.gst / 2).toLocaleString()}.00</td>
                  </tr>
                  <tr class="border-b border-slate-100">
                    <td class="py-2 px-3">SGST (2.5%)</td>
                    <td class="py-2 px-3 text-right">—</td>
                    <td class="py-2 px-3 text-right">₹${Math.round(booking.gst / 2).toLocaleString()}.00</td>
                    <td class="py-2 px-3 text-right">₹${Math.round(booking.gst / 2).toLocaleString()}.00</td>
                  </tr>
                </tbody>
              </table>

              <!-- Summary Totals -->
              <div class="flex justify-between items-start pt-4">
                <div class="space-y-1">
                  <span class="block font-bold text-slate-500 uppercase tracking-wider">Payment Status</span>
                  <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">${booking.status.toUpperCase()}</span>
                </div>
                <div class="w-48 space-y-1.5 text-right">
                  <div class="flex justify-between text-[10px]">
                    <span class="text-slate-500">Gross Total:</span>
                    <span class="font-semibold text-slate-800">₹${booking.payableAmount.toLocaleString()}.00</span>
                  </div>
                  <div class="flex justify-between text-[10px]">
                    <span class="text-slate-500">Advance Paid:</span>
                    <span class="font-bold text-emerald-600">₹${booking.advancePaid.toLocaleString()}.00</span>
                  </div>
                  <div class="flex justify-between text-[10px] border-t border-slate-200 pt-1.5 font-bold">
                    <span class="text-slate-800">${booking.status === 'Fully Paid' ? 'Total Paid Amount:' : 'Balance Due:'}</span>
                    <span class="text-primary">${booking.status === 'Fully Paid' ? `₹${booking.payableAmount.toLocaleString()}.00` : `₹${booking.balanceDue.toLocaleString()}.00`}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // PDF Download trigger wiring
      const downloadBtn = document.getElementById('invoice-download-btn');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
          downloadBtn.disabled = true;
          downloadBtn.innerHTML = `<iconify-icon icon="lucide:loader" class="animate-spin"></iconify-icon> Downloading...`;
          UIUtils.showToast('Generating high fidelity PDF in invoice sandbox...', 'success');
          setTimeout(function() {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = `<iconify-icon icon="lucide:download"></iconify-icon> Download PDF`;
            UIUtils.showToast('Tax Invoice Download Completed!', 'success');
          }, 2000);
        });
      }
    }

    function renderBookingsList() {
      if (!bookingsListContainer) return;
      bookingsListContainer.innerHTML = '';

      if (bookings.length === 0) {
        bookingsListContainer.innerHTML = `<p class="text-xs text-muted-foreground">No bookings found.</p>`;
        if (selectedBookingDetailsPanel) {
          selectedBookingDetailsPanel.innerHTML = `
            <div class="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
              Select a booking to view details.
            </div>
          `;
        }
        return;
      }

      bookings.forEach(b => {
        const card = document.createElement('div');
        card.className = "p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer";
        
        let statusBadgeClass = "bg-blue-100 text-blue-800";
        if (b.status === 'Fully Paid' || b.status === 'Completed') {
          statusBadgeClass = "bg-emerald-100 text-emerald-800";
        }

        card.innerHTML = `
          <div class="flex justify-between items-start gap-2 mb-3">
            <span class="font-bold text-xs text-primary">${b.id}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeClass}">${b.status}</span>
          </div>
          <div class="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
            <iconify-icon icon="lucide:navigation" class="text-secondary text-sm"></iconify-icon>
            ${b.route}
          </div>
          <div class="text-xs text-muted-foreground flex justify-between pt-2 border-t border-slate-100 mt-2">
            <span>Date: ${b.travelDate}</span>
            <span class="font-bold text-slate-700">₹${b.payableAmount.toLocaleString()}</span>
          </div>
        `;

        card.onclick = () => {
          populateBookingDetails(b);
          const listView = document.getElementById('trips-list-view');
          const detailsView = document.getElementById('trip-details-view');
          if (listView) listView.classList.add('hidden');
          if (detailsView) detailsView.classList.remove('hidden');
        };

        bookingsListContainer.appendChild(card);
      });
    }

    // Wire up back to list button
    const backBtn = document.getElementById('back-to-trips-btn');
    if (backBtn) {
      backBtn.onclick = () => {
        const listView = document.getElementById('trips-list-view');
        const detailsView = document.getElementById('trip-details-view');
        if (listView) listView.classList.remove('hidden');
        if (detailsView) detailsView.classList.add('hidden');
      };
    }

    // Populate dynamic UI elements at start
    renderBookingsList();
    
    // If successful checkout redirect, automatically open the latest booking details
    const dashboardUrlParams = new URLSearchParams(window.location.search);
    if (dashboardUrlParams.get('success') === 'true' && activeBooking) {
      populateBookingDetails(activeBooking);
      const listView = document.getElementById('trips-list-view');
      const detailsView = document.getElementById('trip-details-view');
      if (listView) listView.classList.add('hidden');
      if (detailsView) detailsView.classList.remove('hidden');
      UIUtils.showToast('Booking Successful! Invoice Generated.', 'success');
    }

    // Bind left sidebar navigation items
    const sidebarDashboard = document.querySelector('nav a[href="#dashboard"]');
    const sidebarTrips = document.querySelector('nav a[href="#trips"]');
    const sidebarPayments = document.querySelector('nav a[href="#payments"]');
    
    if (sidebarDashboard) {
      sidebarDashboard.removeAttribute('href');
      sidebarDashboard.addEventListener('click', () => {
        UIUtils.showToast('Active Dashboard Selected', 'success');
      });
    }
    if (sidebarTrips) {
      sidebarTrips.removeAttribute('href');
      sidebarTrips.addEventListener('click', () => {
        if (menuTripsBtn) menuTripsBtn.click();
      });
    }
    if (sidebarPayments) {
      sidebarPayments.removeAttribute('href');
      sidebarPayments.addEventListener('click', () => {
        if (menuPaymentsBtn) menuPaymentsBtn.click();
      });
    }

    // Quick stats binding
    const upcomingTripsStat = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-3.gap-6 div:nth-child(1)');
    const walletBalanceStat = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-3.gap-6 div:nth-child(3)');
    if (upcomingTripsStat) {
      upcomingTripsStat.style.cursor = 'pointer';
      upcomingTripsStat.onclick = () => { if (menuTripsBtn) menuTripsBtn.click(); };
    }
    if (walletBalanceStat) {
      walletBalanceStat.style.cursor = 'pointer';
      walletBalanceStat.onclick = () => {
        UIUtils.showToast('Credits: ₹1,250.', 'success');
      };
    }

    // Sync Profile Details with LocalStorage
    const profNameEl = document.getElementById('profile-disp-name');
    const profEmailEl = document.getElementById('profile-disp-email');
    if (profNameEl && localStorage.getItem('jg_user_name')) {
      profNameEl.textContent = localStorage.getItem('jg_user_name');
    }
    if (profEmailEl && localStorage.getItem('jg_user_email')) {
      profEmailEl.textContent = localStorage.getItem('jg_user_email');
    }

    // Profile vs Trips vs Payments Tab Toggle
    const menuProfileBtn = document.getElementById('menu-profile');
    const menuTripsBtn = document.getElementById('menu-trips');
    const menuPaymentsBtn = document.getElementById('menu-payments');
    
    const profileTabContent = document.getElementById('profile-tab-content');
    const tripsTabContent = document.getElementById('trips-tab-content');
    const paymentsTabContent = document.getElementById('payments-tab-content');

    const setActiveTab = (activeBtn, activeContent) => {
      // Reset all buttons
      [menuProfileBtn, menuTripsBtn, menuPaymentsBtn].forEach(btn => {
        if (btn) btn.className = "flex items-center gap-2.5 text-muted-foreground hover:text-primary hover:bg-muted px-4 py-2.5 rounded-lg transition-all";
      });
      // Set active button
      if (activeBtn) activeBtn.className = "flex items-center gap-2.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg";
      
      // Hide all contents
      [profileTabContent, tripsTabContent, paymentsTabContent].forEach(content => {
        if (content) content.classList.add('hidden');
      });
      // Show active content
      if (activeContent) activeContent.classList.remove('hidden');
    };

    if (menuProfileBtn && profileTabContent) {
      menuProfileBtn.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveTab(menuProfileBtn, profileTabContent);
      });
    }

    if (menuTripsBtn && tripsTabContent) {
      menuTripsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveTab(menuTripsBtn, tripsTabContent);
      });
    }

    if (menuPaymentsBtn && paymentsTabContent) {
      menuPaymentsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveTab(menuPaymentsBtn, paymentsTabContent);
      });
    }

      // Automatically focus on Trips tab if redirected after success or if hash is #trips
      const tripsParams = new URLSearchParams(window.location.search);
      if (tripsParams.get('success') === 'true' || window.location.hash === '#trips') {
        if (menuTripsBtn) menuTripsBtn.click();
      }
  }

  // 5. ADMIN CONTROL CENTER PAGE
  if (document.querySelector('[data-page="admin-control-center"]')) {
    let bookings = StateEngine.getBookings();

    function renderBookingsTable() {
      const tbody = document.querySelector('table tbody');
      if (!tbody) return;

      tbody.innerHTML = '';
      bookings.forEach(booking => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-border hover:bg-muted/30 transition-all";
        
        tr.innerHTML = `
          <td class="py-3.5 px-4 font-bold text-primary">${booking.id}</td>
          <td class="py-3.5 px-4 font-semibold">${booking.customerName}</td>
          <td class="py-3.5 px-4">${booking.route}</td>
          <td class="py-3.5 px-4">${booking.driverName}</td>
          <td class="py-3.5 px-4 text-emerald-600 font-bold">₹${booking.advancePaid.toLocaleString()}</td>
          <td class="py-3.5 px-4 font-bold ${booking.status === 'Fully Paid' ? 'text-emerald-600' : 'text-secondary'}">
            ${booking.status === 'Fully Paid' ? '₹0 (Paid)' : `₹${booking.balanceDue.toLocaleString()}`}
          </td>
          <td class="py-3.5 px-4 text-right">
            ${booking.status === 'Fully Paid' ? `
              <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">Collected</span>
            ` : `
              <button data-booking-id="${booking.id}" class="collect-btn bg-secondary text-secondary-foreground font-bold px-2.5 py-1.5 rounded text-[10px] hover:bg-secondary/95 transition-all shadow-sm">
                Collect Balance
              </button>
            `}
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Recalculate Admin Stats dynamically based on list
      let totalRevenue = 845200; // base admin revenue
      let pendingCollection = 0;
      let activeCount = 0;

      bookings.forEach(b => {
        if (b.status === 'Advance Paid') {
          pendingCollection += b.balanceDue;
          activeCount++;
        }
      });

      const metrics = document.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-4.gap-6 > div');
      if (metrics[1]) metrics[1].querySelector('span.text-2xl').textContent = `${40 + activeCount} Rides`;
      if (metrics[2]) metrics[2].querySelector('span.text-2xl').textContent = `₹${pendingCollection.toLocaleString()}`;

      // Re-bind Collect Balance buttons
      tbody.querySelectorAll('.collect-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const bookingId = btn.getAttribute('data-booking-id');
          openCollectionModal(bookingId);
        });
      });
    }

    function openCollectionModal(bookingId) {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      let modal = document.createElement('div');
      modal.className = 'fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-4';
      modal.innerHTML = `
        <div class="bg-card w-full max-w-md rounded-2xl border border-border overflow-hidden shadow-2xl flex flex-col">
          <div class="bg-primary text-primary-foreground p-5 flex items-center justify-between border-b border-border">
            <h3 class="font-heading font-bold text-base text-secondary flex items-center gap-1.5">
              <iconify-icon icon="lucide:credit-card" class="text-lg"></iconify-icon> Cash/UPI Balance Collection
            </h3>
            <button id="close-collect-modal" class="text-primary-foreground/80 hover:text-primary-foreground">
              <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div class="bg-muted p-4 rounded-xl space-y-2 text-xs">
              <div class="flex justify-between"><span>Booking ID:</span><strong>${booking.id}</strong></div>
              <div class="flex justify-between"><span>Customer:</span><strong>${booking.customerName}</strong></div>
              <div class="flex justify-between"><span>Total Payable:</span><strong>₹${booking.payableAmount.toLocaleString()}</strong></div>
              <div class="flex justify-between text-emerald-600"><span>Advance Secured:</span><strong>₹${booking.advancePaid.toLocaleString()}</strong></div>
              <div class="flex justify-between text-secondary text-sm font-bold border-t border-border pt-2 mt-2">
                <span>Collect Balance Due:</span>
                <span>₹${booking.balanceDue.toLocaleString()}</span>
              </div>
            </div>

            <div class="space-y-3">
              <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Channel Selection</p>
              
              <!-- Cash Option -->
              <label class="border border-border hover:border-secondary p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between group">
                <div class="flex items-center gap-3">
                  <input type="radio" name="paychannel" value="cash" checked class="accent-primary w-4 h-4">
                  <div>
                    <span class="block text-xs font-bold text-primary">Cash Collection</span>
                    <span class="block text-[9px] text-muted-foreground">Handover physical paper notes to driver pilot</span>
                  </div>
                </div>
              </label>

              <!-- UPI Option -->
              <label class="border border-border hover:border-secondary p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between group">
                <div class="flex items-center gap-3">
                  <input type="radio" name="paychannel" value="upi" class="accent-primary w-4 h-4">
                  <div>
                    <span class="block text-xs font-bold text-primary">Simulate Driver UPI QR Code Scan</span>
                    <span class="block text-[9px] text-muted-foreground">Generates dynamic payment payload instantly</span>
                  </div>
                </div>
              </label>
            </div>
            
            <button id="confirm-collection-btn" class="w-full bg-secondary hover:bg-secondary/95 text-secondary-foreground font-bold py-3.5 rounded-xl text-sm transition-all shadow-md mt-2">
              Confirm Receipt of ₹${booking.balanceDue.toLocaleString()}
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('close-collect-modal').onclick = () => modal.remove();
      
      document.getElementById('confirm-collection-btn').onclick = () => {
        // Update booking state
        booking.status = 'Fully Paid';
        StateEngine.updateBookings(bookings);
        
        UIUtils.showLoading('Updating account balances & invoice GST records...', 1200, () => {
          modal.remove();
          UIUtils.showToast('Balance Collected successfully!', 'success');
          renderBookingsTable();
          DemoAssistant.renderGuide(); // re-render demo guide for step 8
        });
      };
    }

    renderBookingsTable();
  }



  // Root Guided Tour trigger
  const demoLink = document.getElementById('start-demo-link');
  if (demoLink) {
    demoLink.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.setItem('jg_demo_mode', 'true');
      localStorage.setItem('jg_logged_in', 'false');
      localStorage.setItem('jg_coupon_applied', 'false');
      UIUtils.showLoading('Starting Guided Tour Mode...', 1000, () => {
        UIUtils.showToast('Guided Tour Active! Use the Search form above.', 'success');
        // Reload page to start step 1 guide
        window.location.reload();
      });
    });
  }
});
