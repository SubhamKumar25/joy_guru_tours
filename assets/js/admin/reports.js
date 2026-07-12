// Joy Guru - Admin Reports Generation Module
(function () {
  window.AdminReports = {
    init: function () {
      this.generateSummary();
    },

    generateSummary: function () {
      const bookings = StateEngine.getBookings() || [];
      const reportContainer = document.getElementById('reports-summary-container');
      if (!reportContainer) return;

      // Group totals
      const completed = bookings.filter(b => b.status === 'Completed' || b.status === 'Fully Paid');
      const cancelled = bookings.filter(b => b.status === 'Cancelled');
      
      const totalRevenue = completed.reduce((sum, b) => sum + (b.payableAmount || 0), 0);
      const totalDiscount = completed.reduce((sum, b) => sum + (b.discount || 0), 0);
      const activeFleetUsage = bookings.filter(b => b.status === 'Driver Assigned' || b.status === 'Trip Started').length;

      // Calculate simple usage by type
      const usageByType = { suv: 0, sedan: 0, hatchback: 0 };
      bookings.forEach(b => {
        if (usageByType[b.vehicleType] !== undefined) {
          usageByType[b.vehicleType]++;
        }
      });

      reportContainer.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <!-- Revenue Summary -->
          <div class="bg-muted/40 border border-border p-4 rounded-xl space-y-2">
            <h4 class="font-bold text-primary flex items-center gap-1.5">
              <iconify-icon icon="lucide:dollar-sign"></iconify-icon> Revenue Summary
            </h4>
            <div class="space-y-1">
              <div class="flex justify-between"><span>Settled Revenue:</span><strong>₹${totalRevenue.toLocaleString('en-IN')}</strong></div>
              <div class="flex justify-between"><span>Discounts Given:</span><strong>₹${totalDiscount.toLocaleString('en-IN')}</strong></div>
              <div class="flex justify-between"><span>Avg. Trip Value:</span><strong>₹${completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0}</strong></div>
            </div>
          </div>

          <!-- Booking Summary -->
          <div class="bg-muted/40 border border-border p-4 rounded-xl space-y-2">
            <h4 class="font-bold text-primary flex items-center gap-1.5">
              <iconify-icon icon="lucide:check-square"></iconify-icon> Booking Overview
            </h4>
            <div class="space-y-1">
              <div class="flex justify-between"><span>Total Bookings:</span><strong>${bookings.length}</strong></div>
              <div class="flex justify-between"><span>Completed Trips:</span><strong>${completed.length}</strong></div>
              <div class="flex justify-between text-red-600"><span>Cancelled Trips:</span><strong>${cancelled.length}</strong></div>
            </div>
          </div>

          <!-- Vehicle Usage -->
          <div class="bg-muted/40 border border-border p-4 rounded-xl space-y-2">
            <h4 class="font-bold text-primary flex items-center gap-1.5">
              <iconify-icon icon="lucide:trending-up"></iconify-icon> Vehicle Fleet Stats
            </h4>
            <div class="space-y-1">
              <div class="flex justify-between"><span>Active on Roads:</span><strong>${activeFleetUsage}</strong></div>
              <div class="flex justify-between"><span>SUVs Booked:</span><strong>${usageByType.suv}</strong></div>
              <div class="flex justify-between"><span>Sedans Booked:</span><strong>${usageByType.sedan}</strong></div>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-border flex justify-end gap-2 text-xs">
          <button onclick="window.AdminReports.exportReport('daily')" class="text-primary font-bold px-3 py-1.5 rounded hover:bg-muted border border-border transition-all">Daily Log</button>
          <button onclick="window.AdminReports.exportReport('weekly')" class="text-primary font-bold px-3 py-1.5 rounded hover:bg-muted border border-border transition-all">Weekly Log</button>
          <button onclick="window.AdminReports.exportReport('monthly')" class="bg-primary text-primary-foreground font-bold px-3 py-1.5 rounded hover:bg-primary/95 transition-all">Monthly Log</button>
        </div>
      `;
    },

    exportReport: function (type) {
      UIUtils.showToast(`Compiling and downloading ${type} CSV report...`, 'success');
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.AdminReports.init();
  });
})();
