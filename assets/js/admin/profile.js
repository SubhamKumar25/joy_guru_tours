// Joy Guru - Admin Profile Module
(function () {
  const STORAGE_KEY = 'jg_admin_profile';

  window.AdminProfile = {
    getProfile: function () {
      const defaults = {
        name: 'Administrator',
        phone: '+91 94350 XXXXX',
        email: 'admin@joygurutravels.com',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
      };
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaults;
    },

    saveProfile: function (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      this.populateForm();
      this.updateHeader();
    },

    updateHeader: function () {
      const profile = this.getProfile();
      const headerName = document.querySelector('header div.flex.items-center.gap-2 span.text-primary');
      if (headerName) {
        headerName.textContent = profile.name;
      }
    },

    populateForm: function () {
      const profile = this.getProfile();
      
      const setField = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
      };

      setField('profile-name-input', profile.name);
      setField('profile-phone-input', profile.phone);
      setField('profile-email-input', profile.email);

      const avatarImg = document.getElementById('profile-avatar-preview');
      if (avatarImg) {
        avatarImg.src = profile.photo;
      }
    },

    bindFormSubmit: function () {
      const form = document.getElementById('admin-profile-form');
      if (!form) return;

      form.onsubmit = (e) => {
        e.preventDefault();
        const profile = this.getProfile();
        
        profile.name = document.getElementById('profile-name-input').value.trim();
        profile.phone = document.getElementById('profile-phone-input').value.trim();
        profile.email = document.getElementById('profile-email-input').value.trim();

        // Handle password update if typed
        const pass = document.getElementById('profile-pass-input').value.trim();
        if (pass.length > 0) {
          profile.password = pass;
          UIUtils.showToast('Profile password updated successfully.', 'success');
        }

        // Handle custom photo link if supplied
        const photoEl = document.getElementById('profile-photo-url-input');
        if (photoEl && photoEl.value.trim().length > 0) {
          profile.photo = photoEl.value.trim();
        }

        this.saveProfile(profile);
        UIUtils.showToast('Profile details updated successfully.', 'success');
        
        // Notify
        if (window.AdminNotifications) {
          window.AdminNotifications.addNotification('Admin profile details updated', 'info');
        }
      };
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      window.AdminProfile.saveProfile(window.AdminProfile.getProfile());
    }
    window.AdminProfile.populateForm();
    window.AdminProfile.updateHeader();
    window.AdminProfile.bindFormSubmit();
  });
})();
