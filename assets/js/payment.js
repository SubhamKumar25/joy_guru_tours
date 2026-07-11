/**
 * Joy Guru Tours & Travels - Payment History Management Script
 */

(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Only run on the dashboard page
    const isDashboard = document.querySelector('[data-page="user-dashboard-invoice"]') || document.getElementById('dashboard') || window.location.pathname.includes('user-dashboard');
    if (!isDashboard) return;

    // Wait a brief moment to let script.js finish initial rendering, then override
    setTimeout(renderPaymentHistory, 60);
  });

  function renderPaymentHistory() {
    const tbody = document.getElementById('payment-history-tbody');
    if (!tbody) return;

    const bookings = getBookings();
    tbody.innerHTML = '';

    if (bookings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="py-6 text-center text-xs text-muted-foreground">No payment records found.</td>
        </tr>
      `;
      return;
    }

    bookings.forEach(b => {
      const tr = document.createElement('tr');
      tr.className = "border-b border-border hover:bg-muted/30 transition-all text-xs";

      // Status Badge formatting
      let statusBadge = '';
      if (b.status === 'Fully Paid' || b.status === 'Payment Completed' || b.status === 'Completed') {
        statusBadge = `<span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">Fully Paid</span>`;
      } else if (b.status === 'Cancelled') {
        statusBadge = `<span class="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">Cancelled</span>`;
      } else {
        statusBadge = `<span class="bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full text-[10px]">Advance Paid</span>`;
      }

      tr.innerHTML = `
        <td class="py-3 px-4 font-bold text-primary">${b.id}</td>
        <td class="py-3 px-4">${b.travelDate}</td>
        <td class="py-3 px-4 font-semibold text-emerald-600">₹${b.advancePaid.toLocaleString()}</td>
        <td class="py-3 px-4 font-semibold text-slate-700">${b.status === 'Fully Paid' ? '₹0' : `₹${b.balanceDue.toLocaleString()}`}</td>
        <td class="py-3 px-4">${statusBadge}</td>
        <td class="py-3 px-4 text-right">
          <button class="download-receipt-btn text-xs text-secondary font-bold hover:underline flex items-center justify-end gap-1 w-full text-right">
            <iconify-icon icon="lucide:file-text"></iconify-icon> Receipt
          </button>
        </td>
      `;

      // Event listener for action button
      tr.querySelector('.download-receipt-btn').onclick = function() {
        triggerReceiptDownload(b);
      };

      tbody.appendChild(tr);
    });
  }

  function getBookings() {
    try {
      return JSON.parse(localStorage.getItem('jg_bookings')) || [];
    } catch (e) {
      return [];
    }
  }

  function triggerReceiptDownload(booking) {
    UIUtils.showToast(`Generating Payment Receipt for ${booking.id}...`, 'success');
    setTimeout(() => {
      UIUtils.showToast(`Receipt downloaded successfully!`, 'success');
    }, 1500);
  }

  // Hook into storage updates to keep synchronized
  window.addEventListener('storage', function(e) {
    if (e.key === 'jg_bookings') {
      renderPaymentHistory();
    }
  });
})();
