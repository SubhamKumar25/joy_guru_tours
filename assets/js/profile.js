/**
 * Joy Guru Tours & Travels - User Profile Management Script
 */

(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Only run on dashboard page
    const isDashboard = document.querySelector('[data-page="user-dashboard-invoice"]') || document.getElementById('dashboard') || window.location.pathname.includes('user-dashboard');
    if (!isDashboard) return;

    initProfileManager();
  });

  function initProfileManager() {
    const editBtn = document.getElementById('edit-profile-btn');
    const cancelBtn = document.getElementById('cancel-profile-btn');
    const saveGroup = document.getElementById('edit-actions-group');
    const form = document.getElementById('custom-profile-form');

    const inputs = [
      document.getElementById('profile-photo-url'),
      document.getElementById('profile-disp-name'),
      document.getElementById('profile-disp-phone'),
      document.getElementById('profile-disp-email'),
      document.getElementById('profile-disp-password')
    ];

    const avatarImg = document.getElementById('profile-avatar-img');

    if (!editBtn || !cancelBtn || !saveGroup || !form) return;

    // Load initial values from localStorage
    loadProfileValues();

    // Edit button click
    editBtn.onclick = function() {
      // Toggle inputs state
      inputs.forEach(input => {
        if (input) {
          input.disabled = false;
          input.classList.remove('bg-muted');
          input.classList.add('bg-background');
        }
      });

      // Show/Hide buttons
      editBtn.classList.add('hidden');
      saveGroup.classList.remove('hidden');
    };

    // Cancel button click
    cancelBtn.onclick = function() {
      // Reload initial values (discard edits)
      loadProfileValues();

      // Disable inputs
      inputs.forEach(input => {
        if (input) {
          input.disabled = true;
          input.classList.remove('bg-background');
          input.classList.add('bg-muted');
        }
      });

      // Show/Hide buttons
      editBtn.classList.remove('hidden');
      saveGroup.classList.add('hidden');
    };

    // Form submit click (Save Changes)
    form.onsubmit = function(e) {
      e.preventDefault();

      // Validation
      const photoUrl = document.getElementById('profile-photo-url').value.trim();
      const name = document.getElementById('profile-disp-name').value.trim();
      const phone = document.getElementById('profile-disp-phone').value.trim();
      const email = document.getElementById('profile-disp-email').value.trim();
      const password = document.getElementById('profile-disp-password').value.trim();

      if (!name) {
        UIUtils.showToast('Name is required', 'error');
        return;
      }
      if (!phone || phone.length < 10) {
        UIUtils.showToast('Please enter a valid mobile number', 'error');
        return;
      }
      if (!email || !email.includes('@')) {
        UIUtils.showToast('Please enter a valid email address', 'error');
        return;
      }
      if (password && password.length < 4) {
        UIUtils.showToast('Password must be at least 4 characters long', 'error');
        return;
      }

      // Save to LocalStorage
      localStorage.setItem('jg_user_name', name);
      localStorage.setItem('jg_user_email', email);
      localStorage.setItem('jg_user_phone', phone);
      localStorage.setItem('jg_user_photo', photoUrl);
      if (password && password !== '••••••••') {
        localStorage.setItem('jg_user_password', password);
      }

      // Update avatar preview
      if (avatarImg) {
        avatarImg.src = photoUrl;
      }

      // Update Header Avatar name/initials dynamically
      updateGlobalHeader(name, photoUrl);

      // Disable inputs again
      inputs.forEach(input => {
        if (input) {
          input.disabled = true;
          input.classList.remove('bg-background');
          input.classList.add('bg-muted');
        }
      });

      // Show/Hide buttons
      editBtn.classList.remove('hidden');
      saveGroup.classList.add('hidden');

      UIUtils.showToast('Profile Saved Successfully!', 'success');
    };

    function loadProfileValues() {
      const name = localStorage.getItem('jg_user_name') || 'Rahul Sharma';
      const email = localStorage.getItem('jg_user_email') || 'rahul@example.com';
      const phone = localStorage.getItem('jg_user_phone') || '+91 94350 12345';
      const photo = localStorage.getItem('jg_user_photo') || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
      const pass = localStorage.getItem('jg_user_password') || '••••••••';

      if (document.getElementById('profile-photo-url')) document.getElementById('profile-photo-url').value = photo;
      if (document.getElementById('profile-disp-name')) document.getElementById('profile-disp-name').value = name;
      if (document.getElementById('profile-disp-phone')) document.getElementById('profile-disp-phone').value = phone;
      if (document.getElementById('profile-disp-email')) document.getElementById('profile-disp-email').value = email;
      if (document.getElementById('profile-disp-password')) document.getElementById('profile-disp-password').value = pass;

      if (avatarImg) avatarImg.src = photo;
    }

    function updateGlobalHeader(name, photoUrl) {
      const parts = name.split(' ').filter(Boolean);
      const initials = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();

      // Update navbar avatars
      const navAvatar = document.getElementById('nav-avatar');
      const navName = document.getElementById('nav-user-name');
      const sideAvatar = document.getElementById('sidebar-avatar');
      const sideName = document.getElementById('sidebar-user-name');

      if (navName) navName.textContent = name;
      if (sideName) sideName.textContent = name;

      // If user has a real custom photo URL, we can display image instead of initials!
      if (photoUrl && photoUrl.startsWith('http')) {
        if (navAvatar) {
          navAvatar.innerHTML = `<img src="${photoUrl}" class="w-full h-full object-cover rounded-full">`;
          navAvatar.classList.remove('bg-primary');
        }
        if (sideAvatar) {
          sideAvatar.innerHTML = `<img src="${photoUrl}" class="w-full h-full object-cover rounded-full">`;
          sideAvatar.classList.remove('bg-primary');
        }
      } else {
        if (navAvatar) {
          navAvatar.textContent = initials;
          navAvatar.classList.add('bg-primary');
        }
        if (sideAvatar) {
          sideAvatar.textContent = initials;
          sideAvatar.classList.add('bg-primary');
        }
      }
    }
  }
})();
