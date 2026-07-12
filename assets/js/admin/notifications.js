// Joy Guru - Admin Notifications Module
(function () {
  const STORAGE_KEY = 'jg_admin_notifications';

  window.AdminNotifications = {
    getNotifications: function () {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
        { id: 1, text: 'New booking JG-2025-4829 received', time: '10 mins ago', type: 'info', read: false },
        { id: 2, text: 'Advance payment collected for JG-2025-4830', time: '1 hour ago', type: 'success', read: false }
      ];
    },

    saveNotifications: function (notifs) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
      this.updateUI();
    },

    addNotification: function (text, type = 'info') {
      const notifs = this.getNotifications();
      notifs.unshift({
        id: Date.now(),
        text: text,
        time: 'Just now',
        type: type,
        read: false
      });
      this.saveNotifications(notifs);
    },

    markAllRead: function () {
      const notifs = this.getNotifications();
      notifs.forEach(n => n.read = true);
      this.saveNotifications(notifs);
    },

    updateUI: function () {
      const notifs = this.getNotifications();
      const unreadCount = notifs.filter(n => !n.read).length;
      
      // Update badge
      const badgeEl = document.getElementById('admin-notification-badge');
      if (badgeEl) {
        if (unreadCount > 0) {
          badgeEl.innerHTML = `<iconify-icon icon="lucide:bell"></iconify-icon> ${unreadCount} New Alerts`;
          badgeEl.classList.remove('hidden');
        } else {
          badgeEl.innerHTML = `<iconify-icon icon="lucide:bell"></iconify-icon> No New Alerts`;
          badgeEl.classList.remove('animate-pulse');
        }
      }

      // If there is an alerts modal or list (we'll implement click on badge to view notifications)
      const listEl = document.getElementById('admin-notifications-list');
      if (listEl) {
        listEl.innerHTML = '';
        if (notifs.length === 0) {
          listEl.innerHTML = '<p class="text-xs text-muted-foreground p-3 text-center">No notifications yet.</p>';
        } else {
          notifs.forEach(n => {
            const item = document.createElement('div');
            item.className = `p-3 rounded-lg text-xs flex justify-between items-start gap-2 border-b border-border/50 ${n.read ? 'opacity-70' : 'font-bold bg-primary/5'}`;
            item.innerHTML = `
              <div class="space-y-0.5">
                <p class="text-primary">${n.text}</p>
                <span class="text-[10px] text-muted-foreground block">${n.time}</span>
              </div>
            `;
            listEl.appendChild(item);
          });
        }
      }
    }
  };

  // Run initial UI sync
  document.addEventListener('DOMContentLoaded', () => {
    // If not initialized, set defaults
    if (!localStorage.getItem(STORAGE_KEY)) {
      window.AdminNotifications.saveNotifications(window.AdminNotifications.getNotifications());
    }
    window.AdminNotifications.updateUI();

    // Make notification badge clickable to open a quick popover
    const badgeEl = document.getElementById('admin-notification-badge');
    if (badgeEl) {
      badgeEl.style.cursor = 'pointer';
      badgeEl.addEventListener('click', (e) => {
        e.stopPropagation();
        
        let container = document.getElementById('admin-notifications-popover');
        if (!container) {
          container = document.createElement('div');
          container.id = 'admin-notifications-popover';
          container.className = 'absolute right-6 top-16 w-80 bg-card border border-border shadow-xl rounded-xl p-4 z-[999] flex flex-col text-left text-slate-800';
          container.innerHTML = `
            <div class="flex items-center justify-between border-b border-border pb-2 mb-3">
              <span class="font-bold text-xs text-primary uppercase tracking-wide">Notifications</span>
              <button id="admin-mark-read-btn" class="text-[10px] text-secondary font-bold hover:underline">Mark all read</button>
            </div>
            <div id="admin-notifications-list" class="space-y-2 max-h-60 overflow-y-auto"></div>
          `;
          badgeEl.parentNode.appendChild(container);
          
          document.getElementById('admin-mark-read-btn').onclick = () => {
            window.AdminNotifications.markAllRead();
          };
          
          // Click outside to close
          document.addEventListener('click', function closeNotif(ev) {
            if (!container.contains(ev.target) && ev.target !== badgeEl) {
              container.classList.add('hidden');
              document.removeEventListener('click', closeNotif);
            }
          });
        } else {
          container.classList.toggle('hidden');
        }
        window.AdminNotifications.updateUI();
      });
    }
  });
})();
