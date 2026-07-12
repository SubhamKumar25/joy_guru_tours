// Joy Guru - Admin Settings Module
(function () {
  const STORAGE_KEY = 'jg_admin_settings';

  window.AdminSettings = {
    getSettings: function () {
      const defaults = {
        companyName: 'Joy Guru Tours & Travels',
        supportPhone: '+91 94350 XXXXX',
        whatsapp: '+91 94350 XXXXX',
        email: 'info@joygurutravels.com',
        address: 'Club Road, Silchar, Assam, 788001',
        refundPolicy: '100% refund up to 24 hours before trip start. 50% refund within 24 hours.',
        couponCode: 'JOYGURU500',
        couponDiscount: 500,
        advancePercent: 20
      };
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaults;
    },

    saveSettings: function (settings) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      this.populateForm();
    },

    populateForm: function () {
      const settings = this.getSettings();
      
      const setField = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
      };

      setField('settings-company', settings.companyName);
      setField('settings-phone', settings.supportPhone);
      setField('settings-whatsapp', settings.whatsapp);
      setField('settings-email', settings.email);
      setField('settings-address', settings.address);
      setField('settings-refund', settings.refundPolicy);
      setField('settings-coupon', settings.couponCode);
      setField('settings-advance', settings.advancePercent);
    },

    bindFormSubmit: function () {
      const form = document.getElementById('admin-settings-form');
      if (!form) return;

      form.onsubmit = (e) => {
        e.preventDefault();
        const settings = {
          companyName: document.getElementById('settings-company').value.trim(),
          supportPhone: document.getElementById('settings-phone').value.trim(),
          whatsapp: document.getElementById('settings-whatsapp').value.trim(),
          email: document.getElementById('settings-email').value.trim(),
          address: document.getElementById('settings-address').value.trim(),
          refundPolicy: document.getElementById('settings-refund').value.trim(),
          couponCode: document.getElementById('settings-coupon').value.trim().toUpperCase(),
          couponDiscount: 500, // static default
          advancePercent: parseInt(document.getElementById('settings-advance').value)
        };

        this.saveSettings(settings);
        UIUtils.showToast('System settings saved successfully.', 'success');
        
        // Notify
        if (window.AdminNotifications) {
          window.AdminNotifications.addNotification('System settings updated by administrator', 'info');
        }
      };
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      window.AdminSettings.saveSettings(window.AdminSettings.getSettings());
    }
    window.AdminSettings.populateForm();
    window.AdminSettings.bindFormSubmit();
  });
})();
