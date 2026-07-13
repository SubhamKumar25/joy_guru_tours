// Joy Guru - Admin Invoice Module
(function () {
  window.AdminInvoice = {
    showInvoice: function (bookingId) {
      const bookings = StateEngine.getBookings() || [];
      const b = bookings.find(item => item.id === bookingId);
      if (!b) return;

      let modal = document.getElementById('admin-invoice-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-invoice-modal';
        modal.className = 'fixed inset-0 z-[1000] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-4';
        document.body.appendChild(modal);
      }

      const finalPaid = b.advancePaid;
      const discount = b.discount || 0;
      const baseFare = b.baseFare;

      modal.innerHTML = `
        <div class="bg-card w-full max-w-lg rounded-2xl border border-border overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div class="bg-primary text-primary-foreground p-5 flex items-center justify-between border-b border-border">
            <h3 class="font-heading font-bold text-base text-secondary flex items-center gap-1.5">
              <iconify-icon icon="lucide:receipt" class="text-lg"></iconify-icon> GST Invoice - ${b.id}
            </h3>
            <button onclick="document.getElementById('admin-invoice-modal').remove()" class="text-primary-foreground/80 hover:text-primary-foreground">
              <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
            </button>
          </div>
          <div class="p-6 space-y-6 overflow-y-auto text-xs" id="invoice-print-area">
            <!-- Invoice Header -->
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-bold text-base text-primary uppercase">Joy Guru Travels</h4>
                <p class="text-muted-foreground">Club Road, Silchar, Assam, 788001</p>
                <p class="text-muted-foreground">Support: +91 94350 XXXXX | info@joygurutravels.com</p>
              </div>
              <div class="text-right">
                <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded">PAID</span>
                <p class="text-[10px] text-muted-foreground mt-2">Invoice Date: ${new Date().toISOString().split('T')[0]}</p>
                <p class="text-[10px] text-muted-foreground">Booking Ref: ${b.id}</p>
              </div>
            </div>

            <!-- Customer & Route Details -->
            <div class="grid grid-cols-2 gap-4 border-t border-b border-border py-4">
              <div>
                <p class="font-bold text-[10px] text-muted-foreground uppercase">Billed To</p>
                <p class="font-bold text-primary mt-1">${b.customerName}</p>
                <p class="text-muted-foreground">${b.customerPhone || ''}</p>
                <p class="text-muted-foreground">${b.customerEmail || ''}</p>
              </div>
              <div>
                <p class="font-bold text-[10px] text-muted-foreground uppercase">Journey Details</p>
                <p class="font-bold text-primary mt-1">${b.vehicleName}</p>
                <p class="text-muted-foreground">${b.pickup.split(',')[0]} ⇄ ${b.destination.split(',')[0]}</p>
                <p class="text-muted-foreground">Date: ${b.travelDate} @ ${b.travelTime}</p>
              </div>
            </div>

            <!-- Invoice Table -->
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-border font-bold text-muted-foreground bg-muted text-[10px]">
                  <th class="py-2 px-3">Description</th>
                  <th class="py-2 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-border/50">
                  <td class="py-3 px-3">Proposed Total Fare (${b.vehicleName})</td>
                  <td class="py-3 px-3 text-right">₹${(b.finalFare || b.payableAmount || 0).toLocaleString()}</td>
                </tr>
                <tr class="border-b border-border/50 text-emerald-600 font-semibold">
                  <td class="py-3 px-3">Advance Paid (Receipt #1)</td>
                  <td class="py-3 px-3 text-right">-₹${(b.advancePaid || 0).toLocaleString()}</td>
                </tr>
                <tr class="border-b border-border/50 text-slate-600 font-semibold">
                  <td class="py-3 px-3">Remaining Balance Due</td>
                  <td class="py-3 px-3 text-right">₹${(b.balanceDue || 0).toLocaleString()}</td>
                </tr>
                <tr class="font-bold text-primary text-sm bg-muted/50 border-t-2 border-primary/50">
                  <td class="py-3 px-3">Total Settled Amount</td>
                  <td class="py-3 px-3 text-right">₹${((b.finalFare || b.payableAmount || 0) - b.balanceDue).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <p class="text-[10px] text-muted-foreground text-center italic mt-4">
              Thank you for traveling with Joy Guru! Wish you a happy journey.
            </p>
          </div>
          <div class="p-4 bg-muted border-t border-border flex justify-between gap-3">
            <button onclick="document.getElementById('admin-invoice-modal').remove()" class="bg-muted-foreground text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-muted-foreground/90">Close</button>
            <button onclick="window.AdminInvoice.downloadPDF('${b.id}')" class="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg text-xs hover:bg-primary/95 flex items-center gap-1.5">
              <iconify-icon icon="lucide:download"></iconify-icon> Download PDF
            </button>
          </div>
        </div>
      `;
    },

    downloadPDF: function (id) {
      UIUtils.showToast(`Generating PDF for ${id}...`, 'success');
      setTimeout(() => {
        // Open Print Dialog specifically targeting the printable element if supported
        window.print();
      }, 1000);
    }
  };
})();
