/**
 * Joy Guru Tours & Travels - Notification Management & Alerts Script
 */

(function() {
  const DEFAULT_NOTIFICATIONS = [
    {
      id: 'noti-1',
      title: 'Booking Confirmed',
      message: 'Your outstation trip request to Shillong has been successfully confirmed.',
      time: 'Just now',
      type: 'success',
      read: false
    },
    {
      id: 'noti-2',
      title: 'Advance Payment Received',
      message: 'Advance deposit of ₹1,500 has been verified and processed via Razorpay.',
      time: '10 mins ago',
      type: 'success',
      read: false
    },
    {
      id: 'noti-3',
      title: 'Invoice Ready',
      message: 'Travel invoice for Booking Ref JG-2025-4829 has been generated.',
      time: '2 hours ago',
      type: 'info',
      read: true
    },
    {
      id: 'noti-4',
      title: 'Remaining Payment Pending',
      message: 'Remaining balance of ₹4,499 to be paid to the driver in cash or UPI at trip end.',
      time: '1 day ago',
      type: 'warning',
      read: true
    }
  ];

  document.addEventListener('DOMContentLoaded', function() {
    initNotifications();
  });

  function initNotifications() {
    const bellBtn = document.getElementById('notification-bell-btn');
    const dropdown = document.getElementById('notification-dropdown');
    const list = document.getElementById('notifications-list');
    const badge = document.getElementById('notification-unread-badge');
    const markReadBtn = document.getElementById('mark-all-read-btn');

    if (!bellBtn || !dropdown || !list) return;

    // Load or seed notifications
    let notifications = getNotifications();
    if (notifications.length === 0) {
      notifications = DEFAULT_NOTIFICATIONS;
      saveNotifications(notifications);
    }

    // Initial render
    renderNotificationsList(notifications, list, badge);

    // Toggle dropdown visibility
    bellBtn.onclick = function(e) {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
      
      if (!dropdown.classList.contains('hidden')) {
        document.addEventListener('click', outsideClickListener);
      }
    };

    function outsideClickListener(e) {
      if (dropdown && !bellBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
        document.removeEventListener('click', outsideClickListener);
      }
    }

    // Mark all read button click
    if (markReadBtn) {
      markReadBtn.onclick = function() {
        notifications.forEach(n => n.read = true);
        saveNotifications(notifications);
        renderNotificationsList(notifications, list, badge);
        UIUtils.showToast('All notifications marked as read', 'success');
      };
    }
  }

  function getNotifications() {
    try {
      const stored = localStorage.getItem('jg_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveNotifications(notis) {
    try {
      localStorage.setItem('jg_notifications', JSON.stringify(notis));
    } catch (e) {
      console.error('Error saving notifications:', e);
    }
  }

  function renderNotificationsList(notis, listEl, badgeEl) {
    listEl.innerHTML = '';
    
    let unreadCount = 0;

    notis.forEach(n => {
      if (!n.read) unreadCount++;

      const item = document.createElement('div');
      item.className = `p-3 rounded-lg border text-xs transition-all space-y-1 ${n.read ? 'bg-background border-border opacity-70' : 'bg-muted border-secondary/20 shadow-sm'}`;

      let typeIcon = 'lucide:bell';
      let iconColor = 'text-primary';
      if (n.type === 'success') {
        typeIcon = 'lucide:check-circle';
        iconColor = 'text-emerald-500';
      } else if (n.type === 'warning') {
        typeIcon = 'lucide:alert-circle';
        iconColor = 'text-amber-500';
      } else if (n.type === 'info') {
        typeIcon = 'lucide:info';
        iconColor = 'text-blue-500';
      }

      item.innerHTML = `
        <div class="flex items-center justify-between font-bold">
          <span class="flex items-center gap-1 text-primary">
            <iconify-icon icon="${typeIcon}" class="${iconColor} text-sm"></iconify-icon>
            ${n.title}
          </span>
          <span class="text-[9px] text-muted-foreground font-normal">${n.time}</span>
        </div>
        <p class="text-muted-foreground leading-relaxed">${n.message}</p>
      `;

      listEl.appendChild(item);
    });

    // Update unread count badge on bell icon
    if (badgeEl) {
      if (unreadCount > 0) {
        badgeEl.classList.remove('hidden');
      } else {
        badgeEl.classList.add('hidden');
      }
    }
  }
})();
