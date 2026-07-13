// Joy Guru - Admin Payment Collections Module
(function () {
  window.AdminPayments = {
    openCollectModal: function (bookingId) {
      const bookings = StateEngine.getBookings() || [];
      const b = bookings.find(item => item.id === bookingId);
      if (!b) return;

      let modal = document.getElementById('admin-payment-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-payment-modal';
        modal.className = 'fixed inset-0 z-[1000] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-4';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="bg-card w-full max-w-md rounded-2xl border border-border overflow-hidden shadow-2xl flex flex-col">
          <div class="bg-primary text-primary-foreground p-5 flex items-center justify-between border-b border-border">
            <h3 class="font-heading font-bold text-base text-secondary flex items-center gap-1.5">
              <iconify-icon icon="lucide:credit-card" class="text-lg"></iconify-icon> Collect Remaining Balance
            </h3>
            <button onclick="document.getElementById('admin-payment-modal').remove()" class="text-primary-foreground/80 hover:text-primary-foreground">
              <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
            </button>
          </div>
          <form id="admin-payment-collect-form" class="p-6 space-y-4 text-xs">
            <div class="bg-muted p-4 rounded-xl space-y-2">
              <div class="flex justify-between"><span>Booking ID:</span><strong>${b.id}</strong></div>
              <div class="flex justify-between"><span>Customer:</span><strong>${b.customerName}</strong></div>
              <div class="flex justify-between"><span>Total Proposed Fare:</span><strong>₹${b.finalFare || b.payableAmount}</strong></div>
              <div class="flex justify-between text-emerald-600"><span>Advance Paid:</span><strong>₹${b.advancePaid}</strong></div>
              <div class="flex justify-between text-secondary text-sm font-bold border-t border-border pt-2 mt-2">
                <span>Collect Balance Due:</span>
                <span>₹${b.balanceDue}</span>
              </div>
            </div>

            <div class="space-y-3">
              <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Channel Selection</p>
              
              <!-- Cash -->
              <label class="border border-border hover:border-secondary p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between group">
                <div class="flex items-center gap-3">
                  <input type="radio" name="adminpaychannel" value="cash" checked class="accent-primary w-4 h-4">
                  <div>
                    <span class="block text-xs font-bold text-primary">Cash Payment</span>
                    <span class="block text-[9px] text-muted-foreground">Handover physical paper notes to driver pilot</span>
                  </div>
                </div>
              </label>

              <!-- UPI -->
              <label class="border border-border hover:border-secondary p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between group">
                <div class="flex items-center gap-3">
                  <input type="radio" name="adminpaychannel" value="upi" class="accent-primary w-4 h-4">
                  <div>
                    <span class="block text-xs font-bold text-primary">UPI Transfer</span>
                    <span class="block text-[9px] text-muted-foreground">Collect via PhonePe / GPay / Paytm</span>
                  </div>
                </div>
              </label>

              <!-- QR Code -->
              <label class="border border-border hover:border-secondary p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between group">
                <div class="flex items-center gap-3">
                  <input type="radio" name="adminpaychannel" value="qr" class="accent-primary w-4 h-4">
                  <div>
                    <span class="block text-xs font-bold text-primary">Scan QR Code</span>
                    <span class="block text-[9px] text-muted-foreground">Present company dynamic QR code to passenger</span>
                  </div>
                </div>
              </label>

              <!-- Bank Transfer -->
              <label class="border border-border hover:border-secondary p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between group">
                <div class="flex items-center gap-3">
                  <input type="radio" name="adminpaychannel" value="bank" class="accent-primary w-4 h-4">
                  <div>
                    <span class="block text-xs font-bold text-primary">Direct Bank Transfer</span>
                    <span class="block text-[9px] text-muted-foreground">IMPS / NEFT / RTGS to company current account</span>
                  </div>
                </div>
              </label>
            </div>

            <div class="pt-4 flex gap-3">
              <button type="button" onclick="document.getElementById('admin-payment-modal').remove()" class="flex-1 bg-muted hover:bg-muted/80 text-primary font-bold py-3 rounded-xl">Cancel</button>
              <button type="submit" class="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3 rounded-xl shadow-md">Confirm Payment</button>
            </div>
          </form>
        </div>
      `;

      document.getElementById('admin-payment-collect-form').onsubmit = (e) => {
        e.preventDefault();
        const method = document.querySelector('input[name="adminpaychannel"]:checked').value;
        const total = b.finalFare || b.payableAmount;
        
        // Update booking payment state
        b.advancePaid += b.balanceDue; // Fully paid
        b.balanceDue = 0;
        b.status = 'Completed'; // Fully completed on payment collection

        // Trigger notification
        if (window.AdminNotifications) {
          window.AdminNotifications.addNotification(`Remaining payment of ₹${total - b.advancePaid} collected via ${method.toUpperCase()} for ${b.id}`, 'success');
        }

        // Save
        if (window.AdminBookings) {
          window.AdminBookings.saveBookings(bookings);
        } else {
          StateEngine.updateBookings(bookings);
        }

        // Close payment modal
        document.getElementById('admin-payment-modal').remove();
        
        UIUtils.showToast('Payment successful!', 'success');

        // Automatically show generated Invoice
        if (window.AdminInvoice) {
          window.AdminInvoice.showInvoice(b.id);
        }
      };
    }
  };
})();
