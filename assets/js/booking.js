/**
 * Joy Guru Tours & Travels - My Bookings, Dynamic Cards, and Timeline Management
 */

(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Only run on the User Dashboard page
    const isDashboard = document.querySelector('[data-page="user-dashboard-invoice"]') || document.getElementById('dashboard') || window.location.pathname.includes('user-dashboard');
    if (!isDashboard) return;

    // Wait a brief moment to let script.js finish initial rendering, then override
    setTimeout(initCustomBookings, 50);
  });

  function initCustomBookings() {
    renderCustomBookingsList();

    // Listen to changes in bookings (e.g. if balance collected in Admin page)
    window.addEventListener('storage', function(e) {
      if (e.key === 'jg_bookings') {
        renderCustomBookingsList();
      }
    });

    // Check if redirecting from checkout success to open the latest invoice
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      const bookings = getBookings();
      const lastBookingId = localStorage.getItem('jg_last_booking_id');
      const latest = bookings.find(b => b.id === lastBookingId) || bookings[0];
      if (latest) {
        showBookingDetails(latest);
      }
    }
  }

  function getBookings() {
    try {
      return JSON.parse(localStorage.getItem('jg_bookings')) || [];
    } catch (e) {
      return [];
    }
  }

  function getStatusStyle(status) {
    switch (status) {
      case 'Advance Paid':
        return {
          bg: 'bg-orange-100 dark:bg-orange-950/40',
          text: 'text-orange-600 dark:text-orange-400',
          border: 'border-orange-200 dark:border-orange-900/50'
        };
      case 'Confirmed':
      case 'Booking Confirmed':
        return {
          bg: 'bg-blue-100 dark:bg-blue-950/40',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-900/50'
        };
      case 'Completed':
      case 'Fully Paid':
      case 'Payment Completed':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-950/40',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-200 dark:border-emerald-900/50'
        };
      case 'Cancelled':
        return {
          bg: 'bg-rose-100 dark:bg-rose-950/40',
          text: 'text-rose-600 dark:text-rose-400',
          border: 'border-rose-200 dark:border-rose-900/50'
        };
      default:
        return {
          bg: 'bg-orange-100 dark:bg-orange-950/40',
          text: 'text-orange-600 dark:text-orange-400',
          border: 'border-orange-200 dark:border-orange-900/50'
        };
    }
  }

  function renderCustomBookingsList() {
    const listContainer = document.getElementById('dashboard-bookings-list');
    if (!listContainer) return;

    const bookings = getBookings();
    listContainer.innerHTML = '';

    if (bookings.length === 0) {
      listContainer.innerHTML = `<div class="col-span-full py-8 text-center text-xs text-muted-foreground">No bookings found.</div>`;
      return;
    }

    bookings.forEach(b => {
      const card = document.createElement('div');
      const style = getStatusStyle(b.status);
      card.className = "bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between";
      
      card.innerHTML = `
        <div class="space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <span class="text-xs font-bold text-primary">ID: ${b.id}</span>
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full ${style.bg} ${style.text} border ${style.border}">${b.status}</span>
          </div>
          
          <div class="space-y-2.5 text-xs">
            <div class="flex items-start gap-2">
              <span class="text-primary mt-0.5 flex"><iconify-icon icon="lucide:map-pin"></iconify-icon></span>
              <div class="overflow-hidden">
                <p class="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Pickup</p>
                <p class="text-slate-800 dark:text-slate-200 truncate font-semibold">${b.pickup}</p>
              </div>
            </div>
            
            <div class="flex items-start gap-2">
              <span class="text-secondary mt-0.5 flex"><iconify-icon icon="lucide:navigation"></iconify-icon></span>
              <div class="overflow-hidden">
                <p class="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Destination</p>
                <p class="text-slate-800 dark:text-slate-200 truncate font-semibold">${b.destination}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span class="block text-[9px] text-muted-foreground uppercase font-bold">Date & Time</span>
                <span class="font-semibold text-primary dark:text-slate-200">${b.travelDate} at ${b.travelTime}</span>
              </div>
              <div>
                <span class="block text-[9px] text-muted-foreground uppercase font-bold">Vehicle</span>
                <span class="font-semibold text-primary dark:text-slate-200">${b.vehicleName}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span class="block text-[9px] text-muted-foreground uppercase font-bold">Advance Paid</span>
                <span class="font-bold text-emerald-600">₹${b.advancePaid.toLocaleString()}</span>
              </div>
              <div>
                <span class="block text-[9px] text-muted-foreground uppercase font-bold">Remaining Due</span>
                <span class="font-bold text-secondary">₹${b.balanceDue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-border flex justify-between gap-3 mt-4">
          <button class="view-details-btn text-xs text-primary font-bold hover:text-secondary flex items-center gap-1">
            <iconify-icon icon="lucide:info"></iconify-icon> Details
          </button>
          <button class="download-invoice-btn text-xs text-secondary font-bold hover:underline flex items-center gap-1">
            <iconify-icon icon="lucide:download"></iconify-icon> Receipt
          </button>
        </div>
      `;

      // Click to view details
      card.querySelector('.view-details-btn').onclick = (e) => {
        e.stopPropagation();
        showBookingDetails(b);
      };
      card.onclick = () => {
        showBookingDetails(b);
      };

      // Click to download invoice
      card.querySelector('.download-invoice-btn').onclick = (e) => {
        e.stopPropagation();
        triggerPDFDownload(b);
      };

      listContainer.appendChild(card);
    });
  }

  function showBookingDetails(booking) {
    const detailsPanel = document.getElementById('selected-booking-details-panel');
    if (!detailsPanel) return;

    const style = getStatusStyle(booking.status);
    
    // Timeline steps configuration
    const stages = [
      "Booking Requested",
      "Advance Payment Received",
      "Booking Confirmed",
      "Trip Scheduled",
      "Trip Completed",
      "Remaining Payment Pending",
      "Full Payment Completed",
      "Invoice Generated"
    ];

    // Determine current index based on status
    let activeStageIndex = 1; // "Advance Payment Received" is step 2 (index 1)
    if (booking.status === 'Confirmed' || booking.status === 'Booking Confirmed') {
      activeStageIndex = 2; // "Booking Confirmed" (index 2)
    } else if (booking.status === 'Completed') {
      activeStageIndex = 4; // "Trip Completed" (index 4)
    } else if (booking.status === 'Fully Paid' || booking.status === 'Payment Completed') {
      activeStageIndex = 7; // "Invoice Generated" (index 7, all done)
    }

    let timelineHtmlHtml = '';
    stages.forEach((stage, idx) => {
      const isCompleted = idx <= activeStageIndex;
      const isCurrent = idx === activeStageIndex;
      
      let stepIcon = 'lucide:circle';
      let iconColor = 'text-muted-foreground';
      let lineClass = 'bg-border';

      if (isCompleted) {
        stepIcon = 'lucide:check-circle';
        iconColor = 'text-emerald-500';
        lineClass = 'bg-emerald-500';
      } else if (isCurrent) {
        stepIcon = 'lucide:clock';
        iconColor = 'text-secondary';
        lineClass = 'bg-secondary';
      }

      timelineHtmlHtml += `
        <div class="flex flex-1 flex-col items-center text-center relative px-2">
          <!-- Step Line -->
          ${idx > 0 ? `<div class="absolute left-[-50%] right-[50%] top-3 h-0.5 ${idx <= activeStageIndex ? 'bg-emerald-500' : 'bg-border'} z-0 hidden md:block"></div>` : ''}
          <span class="relative z-10 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center ${iconColor} text-base mb-1">
            <iconify-icon icon="${stepIcon}"></iconify-icon>
          </span>
          <span class="text-[9px] font-bold text-primary max-w-[80px] leading-tight block">${stage}</span>
        </div>
      `;
    });

    detailsPanel.innerHTML = `
      <div class="space-y-6">
        <!-- Status & ID Header -->
        <div class="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Booking Reference</span>
            <h3 class="font-heading font-black text-base text-primary">${booking.id}</h3>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[10px] font-bold px-3 py-1.5 rounded-full ${style.bg} ${style.text} border ${style.border}">${booking.status}</span>
          </div>
        </div>

        <!-- Booking Timeline -->
        <div class="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h4 class="font-heading font-bold text-xs text-primary uppercase tracking-wider border-b border-border pb-3">Booking Progress Timeline</h4>
          <div class="flex flex-col md:flex-row justify-between items-stretch md:items-start gap-4 pt-2">
            ${timelineHtmlHtml}
          </div>
        </div>

        <!-- Route Details & Simplified Travel Invoice -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-7 bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h4 class="font-heading font-bold text-xs text-primary uppercase tracking-wider border-b border-border pb-2">Trip Specifications</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span class="block text-[9px] text-muted-foreground uppercase font-bold">Pickup Address</span>
                <p class="font-semibold text-primary mt-1">${booking.pickup}</p>
              </div>
              <div>
                <span class="block text-[9px] text-muted-foreground uppercase font-bold">Destination Address</span>
                <p class="font-semibold text-primary mt-1">${booking.destination}</p>
              </div>
              <div>
                <span class="block text-[9px] text-muted-foreground uppercase font-bold">Vehicle Selection</span>
                <p class="font-semibold text-primary mt-1">${booking.vehicleName} (${booking.vehicleType.toUpperCase()})</p>
              </div>
              <div>
                <span class="block text-[9px] text-muted-foreground uppercase font-bold">Scheduled Time</span>
                <p class="font-semibold text-primary mt-1">${booking.travelDate} at ${booking.travelTime}</p>
              </div>
            </div>
          </div>

          <!-- Professional Travel Invoice -->
          <div class="lg:col-span-5 bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h4 class="font-heading font-bold text-xs text-primary uppercase tracking-wider border-b border-border pb-2">Professional Invoice</h4>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span class="text-muted-foreground">Vehicle Fare</span>
                <span class="font-semibold text-primary">₹${booking.baseFare.toLocaleString()}.00</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span class="text-muted-foreground">Coupon Discount</span>
                <span class="font-semibold text-emerald-600">-₹${booking.discount.toLocaleString()}.00</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span class="text-muted-foreground">Advance Paid</span>
                <span class="font-semibold text-primary">₹${booking.advancePaid.toLocaleString()}.00</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span class="text-muted-foreground">Remaining Amount</span>
                <span class="font-semibold text-primary">₹${booking.balanceDue.toLocaleString()}.00</span>
              </div>
              <div class="flex justify-between py-2 text-sm font-black border-t border-double border-border mt-3">
                <span class="text-primary">Final Amount</span>
                <span class="text-secondary">₹${booking.payableAmount.toLocaleString()}.00</span>
              </div>
            </div>

            <button id="invoice-download-btn-custom" class="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2.5 rounded-lg text-xs mt-3 flex items-center justify-center gap-1.5 transition-all shadow-sm">
              <iconify-icon icon="lucide:download"></iconify-icon> Download Travel Receipt
            </button>
          </div>
        </div>
      </div>
    `;

    // Bind back button trigger
    const listView = document.getElementById('trips-list-view');
    const detailsView = document.getElementById('trip-details-view');
    if (listView) listView.classList.add('hidden');
    if (detailsView) detailsView.classList.remove('hidden');

    const downloadBtn = document.getElementById('invoice-download-btn-custom');
    if (downloadBtn) {
      downloadBtn.onclick = function() {
        triggerPDFDownload(booking);
      };
    }
  }

  function triggerPDFDownload(booking) {
    const btn = document.querySelector(`#invoice-download-btn-custom`) || document.querySelector('.download-invoice-btn');
    const originalHtml = btn ? btn.innerHTML : '';
    
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<iconify-icon icon="lucide:loader" class="animate-spin"></iconify-icon> Generating...`;
    }

    UIUtils.showToast('Generating travel receipt...', 'success');
    
    setTimeout(function() {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
      UIUtils.showToast('Travel Receipt Downloaded!', 'success');
    }, 1500);
  }
})();
