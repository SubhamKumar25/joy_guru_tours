/**
 * Joy Guru Tours & Travels - Profile Avatar & Dropdown Logic
 */

(function initProfileLogic() {
  document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('jg_logged_in') === 'true';

    // Find login buttons across the navbars
    const loginBtns = document.querySelectorAll('#login-btn, button, a');
    loginBtns.forEach(el => {
      // Only target the primary login buttons
      if (el.id === 'login-btn' || el.textContent.includes('Portal Login') || el.textContent.includes('Login')) {
        
        if (isLoggedIn) {
          // Clear inline onclick that redirects to login page
          el.removeAttribute('onclick');
          el.onclick = null;

          const rawName = localStorage.getItem('jg_user_name') || 'User';
          const names = rawName.trim().split(' ');
          
          let initials = names[0].charAt(0).toUpperCase();
          if (names.length > 1) {
             initials += names[names.length - 1].charAt(0).toUpperCase();
          }

          // Desktop & Mobile BOTH use Initials (as requested)
          el.innerHTML = `
            <span class="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs shadow-sm ring-1 ring-primary/30">
              ${initials}
            </span>
          `;
          
          // Adjust classes for circle
          el.classList.remove('px-5', 'py-2.5', 'bg-primary', 'text-primary-foreground');
          el.classList.add('p-1', 'rounded-full', 'relative', 'hover:bg-transparent', 'bg-transparent', 'shadow-none');
          
          // Add CSS custom property for pointer so mobile browsers register clicks reliably
          el.style.cursor = 'pointer';
          el.style.webkitTapHighlightColor = 'transparent';

          // Build dropdown for mobile/desktop
          let profileDropdown = el.querySelector('.profile-dropdown-menu');
          if (!profileDropdown) {
             profileDropdown = document.createElement('div');
             profileDropdown.className = 'profile-dropdown-menu absolute right-0 top-full mt-3 w-56 bg-card border border-border shadow-xl rounded-xl py-2 z-[100] hidden flex-col text-left text-foreground cursor-default animate-fade-in';
             profileDropdown.innerHTML = `
               <div class="px-4 py-3 border-b border-border/50 mb-1 bg-muted/30">
                 <p class="text-xs text-muted-foreground uppercase tracking-widest mb-1">Signed in as</p>
                 <p class="text-sm font-bold text-primary truncate">${rawName}</p>
               </div>
               <a href="javascript:void(0)" class="w-full block text-left px-4 py-2.5 text-sm font-semibold hover:bg-muted text-foreground transition-all flex items-center gap-3" data-target="profile">
                 <iconify-icon icon="lucide:user" class="text-lg text-muted-foreground"></iconify-icon> My Profile
               </a>
               <a href="javascript:void(0)" class="w-full block text-left px-4 py-2.5 text-sm font-semibold hover:bg-muted text-foreground transition-all flex items-center gap-3" data-target="trips">
                 <iconify-icon icon="lucide:briefcase" class="text-lg text-muted-foreground"></iconify-icon> My Trips
               </a>
               <a href="javascript:void(0)" class="w-full block text-left px-4 py-2.5 text-sm font-semibold hover:bg-muted text-foreground transition-all flex items-center gap-3" data-target="payments">
                 <iconify-icon icon="lucide:credit-card" class="text-lg text-muted-foreground"></iconify-icon> Payments
               </a>
               <div class="border-t border-border mt-1 pt-1">
                 <a href="javascript:void(0)" class="w-full block text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-all flex items-center gap-3" id="profile-logout-btn">
                   <iconify-icon icon="lucide:log-out" class="text-lg"></iconify-icon> Logout
                 </a>
               </div>
             `;
             el.appendChild(profileDropdown);
          }

          // Robust click/touch handler
          const toggleDropdown = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (profileDropdown.classList.contains('hidden')) {
              profileDropdown.classList.remove('hidden');
              profileDropdown.classList.add('flex');
            } else {
              profileDropdown.classList.add('hidden');
              profileDropdown.classList.remove('flex');
            }
          };

          // Use both touchend and click for maximum compatibility on iOS/Android
          el.addEventListener('click', toggleDropdown);

          // Handle dropdown clicks
          profileDropdown.addEventListener('click', function(e) {
            e.stopPropagation(); // keep open if clicking inside
            const btn = e.target.closest('a');
            if (!btn) return;
            
            if (btn.id === 'profile-logout-btn') {
               localStorage.removeItem('jg_logged_in');
               localStorage.removeItem('jg_user_name');
               window.location.href = 'index.html';
               return;
            }
            
            const target = btn.getAttribute('data-target');
            if (target) {
               // Store target to open tab on dashboard
               localStorage.setItem('jg_dashboard_tab', target);
               window.location.href = 'user-dashboard.html';
            }
          });

          // Close dropdown when clicking outside (mobile & desktop)
          document.addEventListener('click', function(e) {
            if (!el.contains(e.target)) {
              profileDropdown.classList.add('hidden');
              profileDropdown.classList.remove('flex');
            }
          });
          
          document.addEventListener('touchstart', function(e) {
            if (!el.contains(e.target)) {
              profileDropdown.classList.add('hidden');
              profileDropdown.classList.remove('flex');
            }
          }, {passive: true});

        } else {
          // Not logged in
          el.innerHTML = `<iconify-icon icon="lucide:user" class="text-lg"></iconify-icon> Login`;
          el.onclick = function (e) {
            e.preventDefault();
            window.location.href = "login-signup.html";
          };
        }
      }
    });
    // Customer Dashboard Profile Editing Handler
    const editBtn = document.getElementById('edit-profile-btn');
    const cancelBtn = document.getElementById('cancel-profile-btn');
    const actionGroup = document.getElementById('edit-actions-group');
    const profileForm = document.getElementById('custom-profile-form');
    
    const fields = ['profile-disp-name', 'profile-disp-phone', 'profile-disp-email', 'profile-disp-password', 'profile-photo-url'];
    
    const initProfileFormValues = () => {
      const rawName = localStorage.getItem('jg_user_name') || '';
      const rawEmail = localStorage.getItem('jg_user_email') || '';
      const rawPhone = localStorage.getItem('jg_user_phone') || '+91 94350 12345';
      const rawAvatar = localStorage.getItem('jg_user_avatar') || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
      
      const nameEl = document.getElementById('profile-disp-name');
      const phoneEl = document.getElementById('profile-disp-phone');
      const emailEl = document.getElementById('profile-disp-email');
      const photoEl = document.getElementById('profile-photo-url');
      const imgEl = document.getElementById('profile-avatar-img');
      
      if (nameEl) nameEl.value = rawName;
      if (phoneEl) phoneEl.value = rawPhone;
      if (emailEl) emailEl.value = rawEmail;
      if (photoEl) photoEl.value = rawAvatar;
      if (imgEl) imgEl.src = rawAvatar;
    };

    if (editBtn) {
      initProfileFormValues();
      
      editBtn.addEventListener('click', () => {
        fields.forEach(id => {
          const el = document.getElementById(id);
          if (el && id !== 'profile-disp-email') {
            el.removeAttribute('disabled');
            el.classList.remove('bg-muted');
          }
        });
        editBtn.classList.add('hidden');
        if (actionGroup) actionGroup.classList.remove('hidden');
      });
    }

    const disableForm = () => {
      fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.setAttribute('disabled', 'true');
          el.classList.add('bg-muted');
        }
      });
      if (editBtn) editBtn.classList.remove('hidden');
      if (actionGroup) actionGroup.classList.add('hidden');
    };

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        disableForm();
        initProfileFormValues();
      });
    }

    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
          name: document.getElementById('profile-disp-name').value.trim(),
          phone: document.getElementById('profile-disp-phone').value.trim(),
          avatarUrl: document.getElementById('profile-photo-url').value.trim()
        };
        
        const passwordVal = document.getElementById('profile-disp-password').value;
        if (passwordVal && passwordVal !== '••••••••') {
          payload.password = passwordVal;
        }
        
        try {
          const result = await StateEngine.apiFetch('/auth/me', {
            method: 'PUT',
            body: JSON.stringify(payload)
          });
          
          if (result && result.success) {
            localStorage.setItem('jg_user_name', result.data.name);
            localStorage.setItem('jg_user_phone', result.data.phone);
            localStorage.setItem('jg_user_avatar', result.data.avatarUrl);
            
            UIUtils.showToast('Profile updated successfully!', 'success');
            disableForm();
            initProfileFormValues();
            
            if (window.updateUserDisplay) window.updateUserDisplay();
          }
        } catch (err) {
          UIUtils.showToast(err.message || 'Failed to save profile', 'error');
        }
      });
    }
  });
})();
