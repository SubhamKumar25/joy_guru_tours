// Joy Guru - Admin Fleet / Vehicle Management Module
(function () {
  const STORAGE_KEY = 'jg_admin_vehicles';

  window.AdminFleet = {
    init: async function () {
      await this.syncVehicles();
      this.renderFleet();
    },

    syncVehicles: async function () {
      try {
        const vehicles = await StateEngine.getVehiclesAsync();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
      } catch (err) {
        console.warn('Failed to sync fleet from server:', err);
      }
    },

    getVehicles: function () {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    },

    saveVehicles: function (vehicles) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
      this.renderFleet();
    },

    renderFleet: function () {
      const vehicles = this.getVehicles();
      const listEl = document.getElementById('fleet-list-container');
      if (!listEl) return;

      listEl.innerHTML = '';

      if (vehicles.length === 0) {
        listEl.innerHTML = `
          <div class="col-span-full py-8 text-center text-xs text-muted-foreground bg-card rounded-xl border border-border">
            No vehicles registered in the fleet yet.
          </div>
        `;
        return;
      }

      vehicles.forEach(v => {
        const item = document.createElement('div');
        item.className = 'bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs';
        
        let statusBadge = '';
        if (v.status === 'Available') {
          statusBadge = '<span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">Available</span>';
        } else if (v.status === 'Booked') {
          statusBadge = '<span class="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">Booked</span>';
        } else {
          statusBadge = '<span class="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">Maintenance</span>';
        }

        item.innerHTML = `
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <strong class="text-sm font-bold text-primary">${v.name}</strong>
              <span class="text-[9px] uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-bold">${v.type}</span>
            </div>
            <p class="text-muted-foreground">Licence: <strong>${v.number}</strong> | Seats: <strong>${v.capacity}</strong></p>
            <div class="flex items-center gap-2 pt-1">
              <span>Rate: <strong>₹${v.price}/km</strong></span>
              <span>•</span>
              ${statusBadge}
            </div>
          </div>
          <div class="flex gap-2">
            <button onclick="window.AdminFleet.editVehicle(${v.id})" class="text-primary hover:text-secondary font-bold text-[10px] px-2 py-1 bg-muted rounded">Edit</button>
            <button onclick="window.AdminFleet.deleteVehicle(${v.id})" class="text-red-500 hover:text-red-700 font-bold text-[10px] px-2 py-1 bg-red-50 rounded">Delete</button>
          </div>
        `;
        listEl.appendChild(item);
      });
    },

    openAddModal: function () {
      let modal = document.getElementById('admin-fleet-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-fleet-modal';
        modal.className = 'fixed inset-0 z-[1000] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-4';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="bg-card w-full max-w-md rounded-2xl border border-border overflow-hidden shadow-2xl flex flex-col">
          <div class="bg-primary text-primary-foreground p-5 flex items-center justify-between border-b border-border">
            <h3 class="font-heading font-bold text-base text-secondary flex items-center gap-1.5">
              <iconify-icon icon="lucide:plus" class="text-lg"></iconify-icon> Add New Vehicle
            </h3>
            <button onclick="document.getElementById('admin-fleet-modal').remove()" class="text-primary-foreground/80 hover:text-primary-foreground">
              <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
            </button>
          </div>
          <form id="admin-fleet-add-form" class="p-6 space-y-3 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-muted-foreground">VEHICLE NAME</label>
              <input type="text" id="add-v-name" required placeholder="Toyota Innova Crysta" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-muted-foreground">VEHICLE TYPE</label>
                <select id="add-v-type" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
                  <option value="suv">SUV</option>
                  <option value="sedan">Sedan</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="tempo">Tempo Traveller</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="font-bold text-muted-foreground">SEAT CAPACITY</label>
                <input type="number" id="add-v-capacity" required min="1" max="20" placeholder="7" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
              </div>
            </div>
            <div class="space-y-1">
              <label class="font-bold text-muted-foreground">LICENSE NUMBER</label>
              <input type="text" id="add-v-number" required placeholder="AS-11-XX-9999" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-muted-foreground">RATE PER KM (₹)</label>
                <input type="number" id="add-v-price" required placeholder="18" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
              </div>
              <div class="space-y-1">
                <label class="font-bold text-muted-foreground">STATUS</label>
                <select id="add-v-status" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <div class="pt-4 flex gap-3">
              <button type="button" onclick="document.getElementById('admin-fleet-modal').remove()" class="flex-1 bg-muted hover:bg-muted/80 text-primary font-bold py-2 rounded-lg">Cancel</button>
              <button type="submit" class="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2 rounded-lg">Add Vehicle</button>
            </div>
          </form>
        </div>
      `;

      document.getElementById('admin-fleet-add-form').onsubmit = async (e) => {
        e.preventDefault();
        const payload = {
          name: document.getElementById('add-v-name').value.trim(),
          type: document.getElementById('add-v-type').value,
          capacity: parseInt(document.getElementById('add-v-capacity').value),
          number: document.getElementById('add-v-number').value.trim(),
          price: parseFloat(document.getElementById('add-v-price').value),
          status: document.getElementById('add-v-status').value
        };

        try {
          await StateEngine.addVehicleAsync(payload);
          await this.syncVehicles();
          this.renderFleet();
          document.getElementById('admin-fleet-modal').remove();
          UIUtils.showToast(`Vehicle ${payload.name} added successfully.`, 'success');
        } catch (err) {
          UIUtils.showToast('Failed to add vehicle: ' + err.message, 'error');
        }
      };
    },

    editVehicle: function (id) {
      const vehicles = this.getVehicles();
      const v = vehicles.find(item => item.id === id);
      if (!v) return;

      let modal = document.getElementById('admin-fleet-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-fleet-modal';
        modal.className = 'fixed inset-0 z-[1000] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-4';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="bg-card w-full max-w-md rounded-2xl border border-border overflow-hidden shadow-2xl flex flex-col">
          <div class="bg-primary text-primary-foreground p-5 flex items-center justify-between border-b border-border">
            <h3 class="font-heading font-bold text-base text-secondary flex items-center gap-1.5">
              <iconify-icon icon="lucide:edit-2" class="text-lg"></iconify-icon> Edit Vehicle
            </h3>
            <button onclick="document.getElementById('admin-fleet-modal').remove()" class="text-primary-foreground/80 hover:text-primary-foreground">
              <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
            </button>
          </div>
          <form id="admin-fleet-edit-form" class="p-6 space-y-3 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-muted-foreground">VEHICLE NAME</label>
              <input type="text" id="edit-v-name" value="${v.name}" required class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-muted-foreground">VEHICLE TYPE</label>
                <select id="edit-v-type" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
                  <option value="suv" ${v.type === 'suv' ? 'selected' : ''}>SUV</option>
                  <option value="sedan" ${v.type === 'sedan' ? 'selected' : ''}>Sedan</option>
                  <option value="hatchback" ${v.type === 'hatchback' ? 'selected' : ''}>Hatchback</option>
                  <option value="tempo" ${v.type === 'tempo' ? 'selected' : ''}>Tempo Traveller</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="font-bold text-muted-foreground">SEAT CAPACITY</label>
                <input type="number" id="edit-v-capacity" value="${v.capacity}" required min="1" max="20" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
              </div>
            </div>
            <div class="space-y-1">
              <label class="font-bold text-muted-foreground">LICENSE NUMBER</label>
              <input type="text" id="edit-v-number" value="${v.number}" required class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-muted-foreground">RATE PER KM (₹)</label>
                <input type="number" id="edit-v-price" value="${v.price}" required class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
              </div>
              <div class="space-y-1">
                <label class="font-bold text-muted-foreground">STATUS</label>
                <select id="edit-v-status" class="w-full bg-muted border border-input rounded-lg px-3 py-2 focus:ring-1 focus:ring-ring focus:outline-none">
                  <option value="Available" ${v.status === 'Available' ? 'selected' : ''}>Available</option>
                  <option value="Booked" ${v.status === 'Booked' ? 'selected' : ''}>Booked</option>
                  <option value="Maintenance" ${v.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
                </select>
              </div>
            </div>
            <div class="pt-4 flex gap-3">
              <button type="button" onclick="document.getElementById('admin-fleet-modal').remove()" class="flex-1 bg-muted hover:bg-muted/80 text-primary font-bold py-2 rounded-lg">Cancel</button>
              <button type="submit" class="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2 rounded-lg">Save Changes</button>
            </div>
          </form>
        </div>
      `;

      document.getElementById('admin-fleet-edit-form').onsubmit = async (e) => {
        e.preventDefault();
        const payload = {
          name: document.getElementById('edit-v-name').value.trim(),
          type: document.getElementById('edit-v-type').value,
          capacity: parseInt(document.getElementById('edit-v-capacity').value),
          number: document.getElementById('edit-v-number').value.trim(),
          price: parseFloat(document.getElementById('edit-v-price').value),
          status: document.getElementById('edit-v-status').value
        };

        try {
          await StateEngine.updateVehicleAsync(v.id, payload);
          await this.syncVehicles();
          this.renderFleet();
          document.getElementById('admin-fleet-modal').remove();
          UIUtils.showToast(`Vehicle ${payload.name} updated successfully.`, 'success');
        } catch (err) {
          UIUtils.showToast('Failed to update vehicle: ' + err.message, 'error');
        }
      };
    },

    deleteVehicle: async function (id) {
      if (confirm('Are you sure you want to delete this vehicle?')) {
        try {
          await StateEngine.deleteVehicleAsync(id);
          await this.syncVehicles();
          this.renderFleet();
          UIUtils.showToast('Vehicle deleted successfully.', 'success');
        } catch (err) {
          UIUtils.showToast('Failed to delete vehicle: ' + err.message, 'error');
        }
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.AdminFleet.init();
  });
})();
