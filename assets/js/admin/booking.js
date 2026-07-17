// Joy Guru - Admin Bookings Management Module
(function () {
  window.AdminBookings = {
    init: function () {
      this.renderTable();
      this.bindFilters();
    },

    getBookings: function () {
      return StateEngine.getBookings() || [];
    },

    saveBookings: function (bookings) {
      StateEngine.updateBookings(bookings);
      this.renderTable();
      if (window.AdminDashboard) {
        window.AdminDashboard.updateStats();
        window.AdminDashboard.initChart();
      }
    },

    renderTable: function () {
      const bookings = this.getBookings();
      const tbody = document.getElementById('bookings-table-body');
      if (!tbody) return;

      tbody.innerHTML = '';

      // Get filter values
      const searchVal = (document.getElementById('booking-search') ? document.getElementById('booking-search').value.toLowerCase().trim() : '');
      const statusFilter = (document.getElementById('booking-status-filter') ? document.getElementById('booking-status-filter').value : 'all');
      const dateFilter = (document.getElementById('booking-date-filter') ? document.getElementById('booking-date-filter').value : '');
      const vehicleFilter = (document.getElementById('booking-vehicle-filter') ? document.getElementById('booking-vehicle-filter').value : 'all');

      const filtered = bookings.filter(b => {
        // Search filter
        const matchSearch = !searchVal || 
          b.id.toLowerCase().includes(searchVal) ||
          b.customerName.toLowerCase().includes(searchVal) ||
          (b.customerPhone && b.customerPhone.includes(searchVal));

        // Status filter
        let matchStatus = true;
        if (statusFilter !== 'all') {
          if (statusFilter === 'Pending') matchStatus = (b.status === 'Pending' || b.status === 'Requested' || b.status === 'Fare Proposed');
          else if (statusFilter === 'Confirmed') matchStatus = (b.status === 'Confirmed' || b.status === 'Advance Paid' || b.status === 'Driver Assigned' || b.status === 'Trip Started');
          else if (statusFilter === 'Completed') matchStatus = (b.status === 'Completed' || b.status === 'Fully Paid');
          else if (statusFilter === 'Cancelled') matchStatus = b.status === 'Cancelled';
        }

        // Date filter
        const matchDate = !dateFilter || b.travelDate === dateFilter;

        // Vehicle filter
        let matchVehicle = true;
        if (vehicleFilter !== 'all') {
          matchVehicle = b.vehicleType === vehicleFilter;
        }

        return matchSearch && matchStatus && matchDate && matchVehicle;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="13" class="py-8 text-center text-xs text-muted-foreground bg-card">
              No matching bookings found.
            </td>
          </tr>
        `;
        return;
      }

      filtered.forEach(b => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-border hover:bg-muted/30 transition-all text-xs';
        
        // Status Badge Style
        let statusBadge = '';
        if (b.status === 'Requested') {
          statusBadge = '<span class="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">Requested</span>';
        } else if (b.status === 'Fare Proposed') {
          statusBadge = '<span class="bg-purple-100 text-purple-850 font-bold px-2 py-0.5 rounded text-[10px]">Proposed</span>';
        } else if (b.status === 'Pending') {
          statusBadge = '<span class="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">Pending</span>';
        } else if (b.status === 'Cancelled') {
          statusBadge = '<span class="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[10px]">Cancelled</span>';
        } else if (b.status === 'Completed' || b.status === 'Fully Paid') {
          statusBadge = '<span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">Completed</span>';
        } else {
          statusBadge = `<span class="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">${b.status}</span>`;
        }

        // Payment status
        const payStatus = b.status === 'Requested' ? 
          '<span class="bg-slate-100 text-slate-650 font-bold px-2 py-0.5 rounded text-[10px]">Awaiting Fare</span>' : 
          (b.status === 'Fare Proposed' ? 
            '<span class="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[10px]">Awaiting Acceptance</span>' : 
            (b.balanceDue === 0 ? 
              '<span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">Completed</span>' : 
              (b.advancePaid > 0 ? 
                '<span class="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">Advance Paid</span>' : 
                '<span class="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">Unpaid</span>'
              )
            )
          );

        // Actions buttons
        let actions = `
          <button onclick="window.AdminBookings.viewBooking('${b.id}')" class="text-primary hover:text-secondary font-bold text-[10px] px-1 py-0.5">View</button>
          <button onclick="window.AdminBookings.editBooking('${b.id}')" class="text-primary hover:text-secondary font-bold text-[10px] px-1 py-0.5">Edit</button>
        `;

        if (b.status === 'Requested') {
          actions += `<button onclick="window.AdminBookings.openSetFareModal('${b.id}')" class="bg-secondary text-secondary-foreground font-bold px-2 py-1 rounded text-[10px] hover:bg-secondary/90 transition-all ml-1">Set Fare</button>`;
        }
        
        if (b.status === 'Pending') {
          actions += `<button onclick="window.AdminBookings.confirmBooking('${b.id}')" class="text-emerald-600 hover:underline font-bold text-[10px] px-1 py-0.5">Confirm</button>`;
        }
        
        if (b.status !== 'Cancelled' && b.status !== 'Completed' && b.status !== 'Fully Paid' && b.status !== 'Requested' && b.status !== 'Fare Proposed') {
          actions += `<button onclick="window.AdminBookings.cancelBooking('${b.id}')" class="text-red-600 hover:underline font-bold text-[10px] px-1 py-0.5">Cancel</button>`;
          actions += `<button onclick="window.AdminBookings.completeTrip('${b.id}')" class="text-emerald-600 hover:underline font-bold text-[10px] px-1 py-0.5">Complete</button>`;
          if (b.balanceDue > 0) {
            actions += `<button onclick="window.AdminPayments.openCollectModal('${b.id}')" class="bg-secondary text-secondary-foreground font-bold px-2 py-1 rounded text-[10px] hover:bg-secondary/90 transition-all ml-1">Collect Balance</button>`;
          }
        } else if (b.status === 'Fare Proposed') {
          actions += `<button onclick="window.AdminBookings.cancelBooking('${b.id}')" class="text-red-600 hover:underline font-bold text-[10px] px-1 py-0.5">Cancel</button>`;
        }

        if (b.status === 'Completed' || b.status === 'Fully Paid' || (b.status !== 'Requested' && b.status !== 'Fare Proposed' && b.balanceDue === 0)) {
          actions += `<button onclick="window.AdminInvoice.showInvoice('${b.id}')" class="bg-primary text-primary-foreground font-bold px-2 py-1 rounded text-[10px] hover:bg-primary/95 transition-all ml-1">Invoice</button>`;
        }

        const advPaidDisplay = b.status === 'Requested' || b.status === 'Fare Proposed' ? '--' : `₹${b.advancePaid}`;
        const balDueDisplay = b.status === 'Requested' || b.status === 'Fare Proposed' ? '--' : `₹${b.balanceDue}`;

        tr.innerHTML = `
          <td class="py-3 px-4 font-bold text-primary">${b.id}</td>
          <td class="py-3 px-4 font-semibold">${b.customerName}</td>
          <td class="py-3 px-4 text-muted-foreground">${b.customerPhone || 'N/A'}</td>
          <td class="py-3 px-4 truncate max-w-[100px]">${b.pickup.split(',')[0]}</td>
          <td class="py-3 px-4 truncate max-w-[100px]">${b.destination.split(',')[0]}</td>
          <td class="py-3 px-4 whitespace-nowrap">${b.travelDate}</td>
          <td class="py-3 px-4">${b.travelTime}</td>
          <td class="py-3 px-4 font-semibold">${b.vehicleName}</td>
          <td class="py-3 px-4 font-semibold text-emerald-600">${advPaidDisplay}</td>
          <td class="py-3 px-4 font-semibold text-slate-700">${balDueDisplay}</td>
          <td class="py-3 px-4">${statusBadge}</td>
          <td class="py-3 px-4">${payStatus}</td>
          <td class="py-3 px-4 text-right whitespace-nowrap">${actions}</td>
        `;
        tbody.appendChild(tr);
      });
    },

    bindFilters: function () {
      const search = document.getElementById('booking-search');
      const status = document.getElementById('booking-status-filter');
      const date = document.getElementById('booking-date-filter');
      const vehicle = document.getElementById('booking-vehicle-filter');

      const triggerSearch = () => this.renderTable();

      if (search) search.addEventListener('input', triggerSearch);
      if (status) status.addEventListener('change', triggerSearch);
      if (date) date.addEventListener('change', triggerSearch);
      if (vehicle) vehicle.addEventListener('change', triggerSearch);
    },

    confirmBooking: async function (id) {
      const b = this.getBookings().find(item => item.id === id);
      if (b) {
        const payload = { status: 'Confirmed' };
        await StateEngine.updateBookingAsync(id, payload);
        if (window.AdminNotifications) {
          window.AdminNotifications.addNotification(`Booking ${id} is Confirmed`, 'success');
        }
        this.renderTable();
        if (window.AdminDashboard) {
          window.AdminDashboard.updateStats();
          window.AdminDashboard.initChart();
        }
        UIUtils.showToast(`Booking ${id} confirmed successfully.`, 'success');
      }
    },

    cancelBooking: async function (id) {
      if (confirm(`Are you sure you want to cancel booking ${id}?`)) {
        const b = this.getBookings().find(item => item.id === id);
        if (b) {
          const payload = { status: 'Cancelled' };
          await StateEngine.updateBookingAsync(id, payload);
          if (window.AdminNotifications) {
            window.AdminNotifications.addNotification(`Booking ${id} was cancelled by administrator`, 'warning');
          }
          this.renderTable();
          if (window.AdminDashboard) {
            window.AdminDashboard.updateStats();
            window.AdminDashboard.initChart();
          }
          UIUtils.showToast(`Booking ${id} has been cancelled.`, 'error');
        }
      }
    },

    completeTrip: async function (id) {
      const b = this.getBookings().find(item => item.id === id);
      if (b) {
        const payload = { status: 'Completed', balanceDue: 0 };
        await StateEngine.updateBookingAsync(id, payload);
        if (window.AdminNotifications) {
          window.AdminNotifications.addNotification(`Trip ${id} completed`, 'success');
        }
        this.renderTable();
        if (window.AdminDashboard) {
          window.AdminDashboard.updateStats();
          window.AdminDashboard.initChart();
        }
        UIUtils.showToast(`Trip ${id} marked as completed!`, 'success');
      }
    },

    viewBooking: function (id) {
      const b = this.getBookings().find(item => item.id === id);
      if (!b) return;

      let modal = document.getElementById('admin-detail-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-detail-modal';
        modal.className = 'fixed inset-0 z-[1000] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-4';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="bg-card w-full max-w-lg rounded-2xl border border-border overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div class="bg-primary text-primary-foreground p-5 flex items-center justify-between border-b border-border">
            <h3 class="font-heading font-bold text-base text-secondary flex items-center gap-1.5">
              <iconify-icon icon="lucide:file-text" class="text-lg"></iconify-icon> Booking Details - ${b.id}
            </h3>
            <button onclick="document.getElementById('admin-detail-modal').remove()" class="text-primary-foreground/80 hover:text-primary-foreground">
              <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
            </button>
          </div>
          <div class="p-6 space-y-4 overflow-y-auto text-xs">
            <div class="grid grid-cols-2 gap-4">
              <div><span class="text-muted-foreground">Customer Name:</span> <p class="font-bold">${b.customerName}</p></div>
              <div><span class="text-muted-foreground">Email:</span> <p class="font-bold">${b.customerEmail || 'N/A'}</p></div>
              <div><span class="text-muted-foreground">Phone:</span> <p class="font-bold">${b.customerPhone || 'N/A'}</p></div>
              <div><span class="text-muted-foreground">Vehicle:</span> <p class="font-bold">${b.vehicleName} (${b.vehicleType.toUpperCase()})</p></div>
              <div><span class="text-muted-foreground">Pickup Location:</span> <p class="font-semibold">${b.pickup}</p></div>
              <div><span class="text-muted-foreground">Destination:</span> <p class="font-semibold">${b.destination}</p></div>
              <div><span class="text-muted-foreground">Travel Date & Time:</span> <p class="font-bold text-primary">${b.travelDate} @ ${b.travelTime}</p></div>
              <div><span class="text-muted-foreground">Driver Pilot:</span> <p class="font-bold">${b.driverName || 'Not Assigned'} (${b.driverPhone || ''})</p></div>
            </div>
            <hr class="border-border">
            <div class="grid grid-cols-3 gap-2 bg-muted p-3 rounded-lg text-center font-bold">
              <div><span class="text-[10px] text-muted-foreground block font-medium">Base Fare</span> ₹${b.baseFare}</div>
              <div><span class="text-[10px] text-muted-foreground block font-medium">Discount</span> -₹${b.discount || 0}</div>
              <div><span class="text-[10px] text-muted-foreground block font-medium">Advance Paid</span> ₹${b.advancePaid}</div>
              <div class="col-span-full border-t border-border/80 pt-2 mt-1 text-primary text-sm flex justify-between px-4">
                <span>Remaining Balance:</span>
                <span>₹${b.balanceDue}</span>
              </div>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span>Status: <strong class="text-primary">${b.status}</strong></span>
            </div>
          </div>
          <div class="p-4 bg-muted/30 border-t border-border flex justify-end">
            <button onclick="document.getElementById('admin-detail-modal').remove()" class="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg hover:bg-primary/95 transition-all">Close</button>
          </div>
        </div>
      `;
    },

    editBooking: function (id) {
      const bookings = this.getBookings();
      const b = bookings.find(item => item.id === id);
      if (!b) return;

      let modal = document.getElementById('admin-edit-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-edit-modal';
        modal.className = 'fixed inset-0 z-[1000] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-4';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="bg-card w-full max-w-md rounded-2xl border border-border overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div class="bg-primary text-primary-foreground p-5 flex items-center justify-between border-b border-border">
            <h3 class="font-heading font-bold text-base text-secondary flex items-center gap-1.5">
              <iconify-icon icon="lucide:edit-3" class="text-lg"></iconify-icon> Edit Booking - ${b.id}
            </h3>
            <button onclick="document.getElementById('admin-edit-modal').remove()" class="text-primary-foreground/80 hover:text-primary-foreground">
              <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
            </button>
          </div>
          <form id="admin-booking-edit-form" class="p-6 space-y-3 overflow-y-auto text-xs">
            <div class="space-y-1">
              <label class="font-bold text-muted-foreground">CUSTOMER NAME</label>
              <input type="text" id="edit-cust-name" value="${b.customerName}" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
            </div>
            <div class="space-y-1">
              <label class="font-bold text-muted-foreground">PHONE</label>
              <input type="text" id="edit-cust-phone" value="${b.customerPhone || ''}" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
            </div>
            <div class="space-y-1">
              <label class="font-bold text-muted-foreground">TRAVEL DATE</label>
              <input type="date" id="edit-cust-date" value="${b.travelDate}" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
            </div>
            <div class="space-y-1">
              <label class="font-bold text-muted-foreground">TRAVEL TIME</label>
              <input type="text" id="edit-cust-time" value="${b.travelTime}" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-muted-foreground">PROPOSED FARE (₹)</label>
                <input type="number" id="edit-final-fare" value="${b.finalFare || ''}" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
              </div>
              <div class="space-y-1">
                <label class="font-bold text-muted-foreground">ADVANCE REQ (₹)</label>
                <input type="number" id="edit-advance-req" value="${b.advanceRequired || ''}" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
              </div>
            </div>
            <div class="space-y-1">
              <label class="font-bold text-muted-foreground">DRIVER PILOT</label>
              <input type="text" id="edit-driver-name" value="${b.driverName || ''}" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
            </div>
            <div class="space-y-1">
              <label class="font-bold text-muted-foreground">STATUS</label>
              <select id="edit-status" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
                <option value="Requested" ${b.status === 'Requested' ? 'selected' : ''}>Requested (Reviewing Fare)</option>
                <option value="Fare Proposed" ${b.status === 'Fare Proposed' ? 'selected' : ''}>Fare Proposed</option>
                <option value="Pending" ${b.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Confirmed" ${b.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="Advance Paid" ${b.status === 'Advance Paid' ? 'selected' : ''}>Advance Paid</option>
                <option value="Driver Assigned" ${b.status === 'Driver Assigned' ? 'selected' : ''}>Driver Assigned</option>
                <option value="Trip Started" ${b.status === 'Trip Started' ? 'selected' : ''}>Trip Started</option>
                <option value="Completed" ${b.status === 'Completed' ? 'selected' : ''}>Completed</option>
                <option value="Cancelled" ${b.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </div>
            <div class="pt-4 flex gap-3">
              <button type="button" onclick="document.getElementById('admin-edit-modal').remove()" class="flex-1 bg-muted hover:bg-muted/80 text-primary font-bold py-2 rounded-lg">Cancel</button>
              <button type="submit" class="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2 rounded-lg">Save Changes</button>
            </div>
          </form>
        </div>
      `;

      document.getElementById('admin-booking-edit-form').onsubmit = async (e) => {
        e.preventDefault();
        
        const fFare = parseInt(document.getElementById('edit-final-fare').value);
        const aReq = parseInt(document.getElementById('edit-advance-req').value);
        const status = document.getElementById('edit-status').value;
        
        const payload = {
          customerName: document.getElementById('edit-cust-name').value.trim(),
          customerPhone: document.getElementById('edit-cust-phone').value.trim(),
          travelDate: document.getElementById('edit-cust-date').value,
          travelTime: document.getElementById('edit-cust-time').value.trim(),
          driverName: document.getElementById('edit-driver-name').value.trim(),
          status: status
        };

        if (!isNaN(fFare)) payload.finalFare = fFare;
        if (!isNaN(aReq)) payload.advanceRequired = aReq;
        
        if (status === 'Advance Paid' && !isNaN(fFare) && !isNaN(aReq)) {
          payload.advancePaid = aReq;
          payload.balanceDue = fFare - aReq;
        }

        await StateEngine.updateBookingAsync(id, payload);
        
        document.getElementById('admin-edit-modal').remove();
        this.renderTable();
        if (window.AdminDashboard) {
          window.AdminDashboard.updateStats();
          window.AdminDashboard.initChart();
        }
        UIUtils.showToast(`Booking ${id} updated successfully.`, 'success');
      };
    },

    openSetFareModal: function(id) {
      const bookings = this.getBookings();
      const b = bookings.find(item => item.id === id);
      if (!b) return;

      let modal = document.getElementById('admin-set-fare-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-set-fare-modal';
        modal.className = 'fixed inset-0 z-[1000] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-4';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="bg-card w-full max-w-md rounded-2xl border border-border overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div class="bg-primary text-primary-foreground p-5 flex items-center justify-between border-b border-border">
            <h3 class="font-heading font-bold text-base text-secondary flex items-center gap-1.5">
              <iconify-icon icon="lucide:tag" class="text-lg"></iconify-icon> Propose Fare - ${b.id}
            </h3>
            <button onclick="document.getElementById('admin-set-fare-modal').remove()" class="text-primary-foreground/80 hover:text-primary-foreground">
              <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
            </button>
          </div>
          <form id="admin-set-fare-form" class="p-6 space-y-4 overflow-y-auto text-xs">
            <div class="bg-muted p-3 rounded-lg space-y-2">
              <p><strong>Route:</strong> ${b.pickup} ⇄ ${b.destination}</p>
              <p><strong>Date & Time:</strong> ${b.travelDate} @ ${b.travelTime}</p>
            </div>
            
            <div class="space-y-1">
              <label class="font-bold text-muted-foreground">PROPOSED TOTAL FARE (₹)</label>
              <input type="number" id="propose-final-fare" placeholder="e.g. 5500" required class="w-full bg-muted border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-ring focus:outline-none">
            </div>
 
            <div class="space-y-1">
              <label class="font-bold text-muted-foreground">REQUIRED ADVANCE AMOUNT (₹)</label>
              <input type="number" id="propose-advance-req" placeholder="e.g. 1500" required class="w-full bg-muted border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-ring focus:outline-none">
              <p class="text-[10px] text-muted-foreground mt-0.5">Recommended 25% advance payment to confirm request.</p>
            </div>
 
            <div class="space-y-1">
              <label class="font-bold text-muted-foreground">COORDINATOR INTERNAL NOTES</label>
              <textarea id="propose-admin-notes" placeholder="Optional notes visible only to admins" class="w-full bg-muted border border-input rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-ring focus:outline-none h-20"></textarea>
            </div>
 
            <div class="pt-4 flex gap-3">
              <button type="button" onclick="document.getElementById('admin-set-fare-modal').remove()" class="flex-1 bg-muted hover:bg-muted/80 text-primary font-bold py-2.5 rounded-lg">Cancel</button>
              <button type="submit" class="flex-1 bg-secondary hover:bg-secondary/95 text-secondary-foreground font-bold py-2.5 rounded-lg">Send Proposed Fare</button>
            </div>
          </form>
        </div>
      `;
 
      const fareInput = document.getElementById('propose-final-fare');
      const advanceInput = document.getElementById('propose-advance-req');
      
      if (fareInput && advanceInput) {
        fareInput.addEventListener('input', () => {
          const val = parseFloat(fareInput.value);
          if (!isNaN(val)) {
            advanceInput.value = Math.round(val * 0.25);
          }
        });
      }
 
      document.getElementById('admin-set-fare-form').onsubmit = async (e) => {
        e.preventDefault();
        const finalFareVal = parseInt(document.getElementById('propose-final-fare').value);
        const advanceReqVal = parseInt(document.getElementById('propose-advance-req').value);
        const notesVal = document.getElementById('propose-admin-notes').value.trim();
 
        const payload = {
          finalFare: finalFareVal,
          advanceRequired: advanceReqVal,
          adminNotes: notesVal,
          status: 'Fare Proposed',
          balanceDue: finalFareVal
        };
 
        await StateEngine.updateBookingAsync(id, payload);
        document.getElementById('admin-set-fare-modal').remove();
        this.renderTable();
        if (window.AdminDashboard) {
          window.AdminDashboard.updateStats();
          window.AdminDashboard.initChart();
        }
        
        if (window.AdminNotifications) {
          window.AdminNotifications.addNotification(`Proposed fare of ₹${finalFareVal} for booking ${id}`, 'success');
        }
 
        UIUtils.showToast(`Fare proposed for booking ${id}! Customer notified.`, 'success');
      };
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.AdminBookings.init();
  });
})();
