/**
 * RM Home Admin Dashboard & Multi-Admin Auth Logic
 * Supports Master Admin (z4xy123) and dynamically adding more admin accounts
 * Fully deploy-ready: Cleans old dummy data, waits for live website reports
 */

// Master Admin initial account (ไม่แสดงข้อมูลนี้บนหน้าจอทั่วไป)
const INITIAL_ADMINS = [
  {
    username: 'z4xy123',
    password: '321z4xy',
    role: 'ผู้ดูแลระบบ',
    isMaster: true,
    createdAt: '2026-11-02'
  }
];

const DEFAULT_LEADS = [];

let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  if (window.CloudSync && window.CloudSync.isConnected()) {
    try {
      await window.CloudSync.fetchAll();
    } catch (e) {}
  }
  purgeLegacyDummyData();
  initAuth();
  initDashboard();

  // ฟังสัญญาณเมื่อมี Lead ใหม่ส่งมาจากหน้าเว็บ หรือมีการแก้ไขจากเครื่องอื่น
  if (window.CloudSync && typeof window.CloudSync.startRealtimeListener === 'function') {
    window.CloudSync.startRealtimeListener(() => {
      try {
        _cachedPortfolioItems = null;
        if (typeof renderMetrics === 'function') renderMetrics();
        if (typeof renderLeadsList === 'function') renderLeadsList();
        if (typeof renderAdminPortfolioList === 'function') renderAdminPortfolioList();
        if (typeof renderLeadsTabList === 'function') renderLeadsTabList();
        if (typeof renderAdminReviewsList === 'function') renderAdminReviewsList();
        if (typeof renderAdminServicesList === 'function') renderAdminServicesList();
        if (typeof renderAdminStandardsList === 'function') renderAdminStandardsList();
        if (typeof renderAdminWhyUsList === 'function') renderAdminWhyUsList();
        if (typeof renderAdminWorkflowList === 'function') renderAdminWorkflowList();
      } catch (err) {}
    });
  }
});

/* ---------------------------------------------------------
   0. Purge Legacy Dummy Data (ลบข้อมูลเก่าและข้อมูลตัวอย่างออก)
   --------------------------------------------------------- */
function purgeLegacyDummyData() {
  try {
    const isCleaned = localStorage.getItem('rm_deploy_clean_v2');
    if (!isCleaned) {
      // First clean run: reset leads and demo counters cleanly
      localStorage.removeItem('rm_leads');
      localStorage.setItem('rm_page_views', '0');
      localStorage.setItem('rm_sessions', '0');
      localStorage.setItem('rm_deploy_clean_v2', 'true');
    } else {
      // Remove any leftover test items with QA/dummy names or dummy phone numbers
      const raw = localStorage.getItem('rm_leads');
      if (raw) {
        let leads = JSON.parse(raw);
        if (Array.isArray(leads)) {
          const filtered = leads.filter(l => {
            const name = (l.name || '').toLowerCase();
            const phone = (l.phone || '');
            return !(name.includes('qa') || name === 'test' || phone === '0899999999' || phone === '0999999999');
          });
          if (filtered.length !== leads.length) {
            localStorage.setItem('rm_leads', JSON.stringify(filtered));
          }
        }
      }
    }
  } catch (e) {
    console.error('Error purging legacy data:', e);
  }
}

/* ---------------------------------------------------------
   1. Multi-Admin Authentication & Account Management
   --------------------------------------------------------- */
function isMasterAdmin(u) {
  if (!u) return false;
  const name = (u.username || '').toLowerCase();
  return u.isMaster === true || name === 'z4xy123' || name === '123z4xy' || u.role === 'ผู้ดูแลระบบหลัก';
}

function getAdminUsers() {
  try {
    const raw = localStorage.getItem('rm_admin_users');
    if (!raw) {
      localStorage.setItem('rm_admin_users', JSON.stringify(INITIAL_ADMINS));
      return INITIAL_ADMINS;
    }
    const parsed = JSON.parse(raw);
    let hasMaster = false;
    parsed.forEach(u => {
      // Auto-sanitize master accounts (123z4xy / z4xy123)
      if (isMasterAdmin(u)) {
        hasMaster = true;
        u.role = 'ผู้ดูแลระบบหลัก';
        u.isMaster = true;
      }
    });
    if (!hasMaster) {
      parsed.unshift(INITIAL_ADMINS[0]);
    }
    localStorage.setItem('rm_admin_users', JSON.stringify(parsed));
    return parsed;
  } catch (e) {
    return INITIAL_ADMINS;
  }
}

function saveAdminUsers(users) {
  try {
    localStorage.setItem('rm_admin_users', JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save admin users:', e);
  }
}

function getActiveSession() {
  try {
    const raw = localStorage.getItem('rm_admin_session') || sessionStorage.getItem('rm_admin_session');
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user && isMasterAdmin(user)) {
      user.role = 'ผู้ดูแลระบบหลัก';
      user.isMaster = true;
    }
    return user;
  } catch (e) {
    return null;
  }
}

function setActiveSession(user) {
  try {
    const safeUser = { ...user, role: user.isMaster ? 'ผู้ดูแลระบบ' : (user.role || 'ผู้ดูแลระบบ') };
    const str = JSON.stringify(safeUser);
    localStorage.setItem('rm_admin_session', str);
    sessionStorage.setItem('rm_admin_session', str);
  } catch (e) {}
}

function clearActiveSession() {
  try {
    localStorage.removeItem('rm_admin_session');
    sessionStorage.removeItem('rm_admin_session');
  } catch (e) {}
}

function initAuth() {
  const loginScreen = document.getElementById('adminLoginScreen');
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('loginPassword');
  const errorMsg = document.getElementById('loginErrorMsg');
  const togglePwBtn = document.getElementById('togglePasswordBtn');
  const btnLogout = document.getElementById('btnLogout');

  // Toggle Password visibility
  if (togglePwBtn && passwordInput) {
    togglePwBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePwBtn.textContent = isPassword ? '🙈 ซ่อน' : '👁️ ดู';
    });
  }

  // Check current session
  const currentSession = getActiveSession();
  if (currentSession) {
    if (loginScreen) {
      loginScreen.classList.add('hidden');
      loginScreen.style.display = 'none';
    }
    updateUserInterface(currentSession);
  } else {
    if (loginScreen) {
      loginScreen.classList.remove('hidden');
      loginScreen.style.display = 'flex';
    }
  }

  function doLogin() {
    const username = (usernameInput ? usernameInput.value : '').trim();
    const password = (passwordInput ? passwordInput.value : '').trim();

    if (!username || !password) {
      if (errorMsg) {
        errorMsg.textContent = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน';
        errorMsg.classList.add('show');
      }
      return;
    }

    const users = getAdminUsers();
    // Direct match for master credentials (supports both z4xy123 / 123z4xy) or registered admin
    const inputUname = username.toLowerCase();
    const isMasterMatch = (
      (inputUname === 'z4xy123' || inputUname === '123z4xy') && 
      (password === '321z4xy' || password === '123z4xy')
    );
    const matchedUser = isMasterMatch
      ? (users.find(u => isMasterAdmin(u)) || INITIAL_ADMINS[0])
      : users.find(u => u.username.toLowerCase() === inputUname && u.password === password);

    if (matchedUser) {
      if (errorMsg) errorMsg.classList.remove('show');
      setActiveSession(matchedUser);
      updateUserInterface(matchedUser);

      // Instant & reliable transition to dashboard
      if (loginScreen) {
        loginScreen.classList.add('hidden');
        loginScreen.style.display = 'none';
      }

      // Refresh metrics and leads on dashboard
      renderMetrics();
      renderLeadsList();
    } else {
      if (errorMsg) {
        errorMsg.textContent = '❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
        errorMsg.classList.add('show');
      }
      if (passwordInput) {
        passwordInput.focus();
        passwordInput.select();
      }
    }
  }

  // Handle Login submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      doLogin();
    });
  }

  const submitBtn = document.getElementById('btnLoginSubmit');
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      if (e.target.type !== 'submit') {
        e.preventDefault();
        doLogin();
      }
    });
  }

  // Handle Logout
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('คุณต้องการออกจากระบบผู้ดูแลใช่หรือไม่?')) {
        clearActiveSession();
        if (passwordInput) passwordInput.value = '';
        if (loginScreen) {
          loginScreen.classList.remove('hidden');
          loginScreen.style.display = 'flex';
        }
      }
    });
  }

  initUsersManagement();
}

function updateUserInterface(user) {
  const greetingEl = document.getElementById('adminUserGreeting');
  const sidebarEmailEl = document.getElementById('sidebarUserEmail');

  const roleText = user.role || 'ผู้ดูแลระบบ';
  if (greetingEl) {
    greetingEl.textContent = `สวัสดี, ${user.username} (${roleText})`;
  }
  if (sidebarEmailEl) {
    sidebarEmailEl.textContent = `${user.username} • ${roleText}`;
    sidebarEmailEl.title = `${user.username} (${roleText})`;
  }
}

/* ---------------------------------------------------------
   2. Admin Users Management Modal (+เพิ่มรหัสแอดมินได้เรื่อยๆ)
   --------------------------------------------------------- */
function initUsersManagement() {
  const btnOpenUsers = document.getElementById('btnManageUsers');
  const navUsers = document.getElementById('navUsers');
  const modalUsers = document.getElementById('adminUsersModal');
  const btnCloseUsers = document.getElementById('modalUsersCloseBtn');
  const addUserForm = document.getElementById('addNewAdminForm');

  function openModal() {
    switchAdminTab('users');
  }

  if (btnOpenUsers) btnOpenUsers.addEventListener('click', openModal);
  if (navUsers) {
    navUsers.addEventListener('click', (e) => {
      e.preventDefault();
      switchAdminTab('users');
    });
  }

  if (btnCloseUsers && modalUsers) {
    btnCloseUsers.addEventListener('click', () => modalUsers.classList.remove('open'));
    modalUsers.addEventListener('click', (e) => {
      if (e.target === modalUsers) modalUsers.classList.remove('open');
    });
  }

  // Handle Adding New Admin Account
  if (addUserForm) {
    addUserForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newUsername = document.getElementById('newAdminUsername').value.trim();
      const newPassword = document.getElementById('newAdminPassword').value.trim();
      const newRole = document.getElementById('newAdminRole').value.trim() || 'แอดมินทั่วไป';

      if (!newUsername || !newPassword) {
        alert('กรุณากรอกชื่อบัญชีและรหัสผ่านให้ครบถ้วน');
        return;
      }

      const users = getAdminUsers();
      if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase())) {
        alert(`ชื่อผู้ใช้ "${newUsername}" มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`);
        return;
      }

      users.push({
        username: newUsername,
        password: newPassword,
        role: newRole,
        isMaster: false,
        createdAt: new Date().toLocaleDateString('th-TH')
      });

      saveAdminUsers(users);
      addUserForm.reset();
      renderAdminUsersList();
      alert(`✅ เพิ่มบัญชีแอดมิน "${newUsername}" เรียบร้อยแล้ว! สามารถใช้ล็อกอินได้ทันที`);
    });
  }
}

function renderAdminUsersList() {
  const tbody = document.getElementById('adminUsersTableBody');
  if (!tbody) return;

  const users = getAdminUsers();
  const currentSession = getActiveSession();
  const isViewerMaster = isMasterAdmin(currentSession);
  tbody.innerHTML = '';

  users.forEach((user, idx) => {
    const tr = document.createElement('tr');
    const isTargetMaster = isMasterAdmin(user);

    const roleBadge = isTargetMaster
      ? `<span class="user-role-badge super">👑 ผู้ดูแลระบบหลัก (Master)</span>`
      : `<span class="user-role-badge normal">👤 ${escapeHtml(user.role || 'แอดมินทั่วไป')}</span>`;

    const actionHtml = isTargetMaster
      ? `<span style="font-size:0.75rem; color:#94a3b8; font-weight:600;">🔒 บัญชีหลัก</span>`
      : `<button class="btn-delete-user" data-username="${escapeHtml(user.username)}">🗑️ ลบ</button>`;

    // ยศต่ำกว่า 123z4xy ห้ามดูรหัส 123z4xy โดยเด็ดขาด (ไม่ใส่ data-pw ลงใน DOM เพื่อความปลอดภัย 100%)
    let pwCellHtml = '';
    if (isTargetMaster && !isViewerMaster) {
      pwCellHtml = `
        <span style="color:#ef4444; font-size:0.75rem; font-weight:600; background:#fef2f2; border:1px solid #fee2e2; padding:0.2rem 0.5rem; border-radius:6px; display:inline-flex; align-items:center; gap:0.25rem;" title="เฉพาะ 123z4xy เท่านั้นที่มีสิทธิ์ดูรหัสผ่านนี้">
          🔒 สงวนสิทธิ์เฉพาะ 123z4xy
        </span>
      `;
    } else {
      // นอกนั้นดูได้ปกติ (ทั้ง Master ดูเอง หรือดูรหัสของบัญชีอื่นๆ ทั่วไป)
      pwCellHtml = `
        <span class="pw-masked" data-pw="${escapeHtml(user.password)}">••••••••</span>
        <button type="button" class="btn-show-single-pw" style="background:none; border:none; color:#64748b; font-size:0.75rem; cursor:pointer; margin-left:0.35rem;" title="แสดงรหัสผ่าน">👁️</button>
      `;
    }

    tr.innerHTML = `
      <td>
        <strong>${escapeHtml(user.username)}</strong>
        ${isTargetMaster ? '<span style="color:#d4af37; font-size:0.8rem; margin-left:4px;">★</span>' : ''}
      </td>
      <td>${pwCellHtml}</td>
      <td>${roleBadge}</td>
      <td>${actionHtml}</td>
    `;

    // Toggle reveal password
    const btnToggle = tr.querySelector('.btn-show-single-pw');
    const maskedSpan = tr.querySelector('.pw-masked');
    if (btnToggle && maskedSpan) {
      btnToggle.onclick = () => {
        if (maskedSpan.textContent === '••••••••') {
          maskedSpan.textContent = maskedSpan.getAttribute('data-pw');
          btnToggle.textContent = '🙈';
        } else {
          maskedSpan.textContent = '••••••••';
          btnToggle.textContent = '👁️';
        }
      };
    }

    // Delete user button
    const btnDelete = tr.querySelector('.btn-delete-user');
    if (btnDelete) {
      btnDelete.onclick = () => {
        const targetUsername = btnDelete.getAttribute('data-username');
        if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีแอดมิน "${targetUsername}" ?`)) {
          let currentUsers = getAdminUsers();
          currentUsers = currentUsers.filter(u => u.username !== targetUsername);
          saveAdminUsers(currentUsers);
          renderAdminUsersList();
        }
      };
    }

    tbody.appendChild(tr);
  });
}

/* ---------------------------------------------------------
   3. Dashboard Metrics, Live Reports & Leads Functionality
   --------------------------------------------------------- */
const THAI_MONTHS_SHORT_LEAD = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function formatLeadDateTime(lead) {
  if (!lead) return '-';
  let d = null;
  if (lead.createdAt && !isNaN(Date.parse(lead.createdAt))) {
    d = new Date(lead.createdAt);
  } else if (lead.id && typeof lead.id === 'string' && lead.id.startsWith('lead_')) {
    const ts = parseInt(lead.id.replace('lead_', ''), 10);
    if (!isNaN(ts) && ts > 1000000000000) {
      d = new Date(ts);
    }
  }

  if (!d) {
    d = new Date();
  }

  const day = d.getDate();
  const month = THAI_MONTHS_SHORT_LEAD[d.getMonth()] || '';
  const year = d.getFullYear(); // ค.ศ.
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `เวลา ${hours}:${minutes} น. วันที่ ${day} ${month} ${year}`;
}

function getStoredLeads() {
  try {
    const raw = localStorage.getItem('rm_leads');
    if (!raw) return [];
    const leads = JSON.parse(raw) || [];
    let updated = false;
    leads.forEach(l => {
      const correctTime = formatLeadDateTime(l);
      if (l.time !== correctTime) {
        l.time = correctTime;
        updated = true;
      }
    });
    if (updated) {
      try {
        localStorage.setItem('rm_leads', JSON.stringify(leads));
      } catch (err) {}
    }
    return leads;
  } catch (e) {
    return [];
  }
}

function saveLeads(leads) {
  try {
    localStorage.setItem('rm_leads', JSON.stringify(leads));
  } catch (e) {
    console.error('Failed to save leads:', e);
  }
}

function initDashboard() {
  renderMetrics();
  renderLeadsList();
  initActionButtons();
  initFilterButtons();
  initPortfolioManager();
  initEditHouseModal();
  initTabNavigation();
  initReviewsCMS();
  initServicesCMS();
  initStandardsCMS();
  initTikTokCMS();
  initWorkflowCMS();
  initSiteContentCMS();
  initCalculatorCMS();
  initAreasCMS();
  initTabAdminUsers();
  initTabLeads();
  initSiteTrackerAdmin();
}

function renderMetrics() {
  const views = parseInt(localStorage.getItem('rm_page_views') || '0', 10);
  const pageViewsEl = document.getElementById('metricPageViews');
  if (pageViewsEl) pageViewsEl.textContent = views;

  const leads = getStoredLeads();
  const leadsCountEl = document.getElementById('metricTotalLeads');
  if (leadsCountEl) leadsCountEl.textContent = leads.length;

  const sidebarBadge = document.getElementById('sidebarLeadsBadge');
  if (sidebarBadge) sidebarBadge.textContent = leads.length;

  const newLeads = leads.filter(l => l.status === 'new').length;
  const newLeadsText = document.getElementById('metricNewLeadsText');
  if (newLeadsText) {
    newLeadsText.textContent = leads.length > 0 ? `ใหม่ ${newLeads} รายการ` : 'รอรับรายงานสด';
  }

  const badgeLeadsStatus = document.getElementById('badgeLeadsStatus');
  if (badgeLeadsStatus) {
    badgeLeadsStatus.textContent = leads.length > 0 ? `🟢 มีข้อมูลรายงาน ${leads.length} รายการ` : '🟢 พร้อมรับข้อมูล Real-time';
  }

  const sessions = parseInt(localStorage.getItem('rm_sessions') || '0', 10);
  const sessionsText = document.getElementById('metricSessionsText');
  if (sessionsText) {
    sessionsText.textContent = sessions > 0 ? `${sessions} Session` : 'Session สด';
  }
}

function renderLeadsList() {
  const container = document.getElementById('leadsContainer');
  if (!container) return;

  const allLeads = getStoredLeads();

  // Update counts on filter tags
  const countAll = allLeads.length;
  const countNew = allLeads.filter(l => l.status === 'new').length;
  const countContacted = allLeads.filter(l => l.status === 'contacted').length;
  const countDone = allLeads.filter(l => l.status === 'done').length;

  const elAll = document.getElementById('countFilterAll');
  const elNew = document.getElementById('countFilterNew');
  const elContacted = document.getElementById('countFilterContacted');
  const elDone = document.getElementById('countFilterDone');

  if (elAll) elAll.textContent = countAll;
  if (elNew) elNew.textContent = countNew;
  if (elContacted) elContacted.textContent = countContacted;
  if (elDone) elDone.textContent = countDone;

  // Filter leads
  let displayLeads = allLeads;
  if (currentFilter !== 'all') {
    displayLeads = allLeads.filter(l => l.status === currentFilter);
  }

  container.innerHTML = '';

  // Clean Empty State (Ready for Deploy)
  if (displayLeads.length === 0) {
    if (allLeads.length === 0) {
      container.innerHTML = `
        <div class="empty-leads-notice">
          <div class="empty-icon">📭</div>
          <h4>ลบข้อมูลเก่าเรียบร้อย พร้อมรับรายงานตัวใหม่</h4>
          <p>ระบบอยู่ในสถานะ Standby พร้อมรับรายงานจริง เมื่อมีลูกค้ากรอกแบบฟอร์มหน้าเว็บไซต์ รายงานจะบันทึกและแสดงที่นี่ทันทีแบบอัตโนมัติ</p>
          <button class="btn-action-outline" id="btnQuickTestLead" style="margin-top:0.4rem; font-size:0.8rem; padding:0.4rem 0.9rem;">
            + ทดลองส่งข้อมูลจำลอง 1 รายการ
          </button>
        </div>
      `;
      const quickBtn = document.getElementById('btnQuickTestLead');
      if (quickBtn) {
        quickBtn.addEventListener('click', () => {
          promptAndAddTestLead();
        });
      }
    } else {
      container.innerHTML = `
        <div style="text-align:center; padding:2rem; color:#94a3b8; font-size:0.9rem;">
          ไม่มีรายการในหมวดที่เลือก
        </div>
      `;
    }
    return;
  }

  displayLeads.forEach((lead) => {
    const row = document.createElement('div');
    row.className = 'lead-row';
    
    let statusText = '⏳ รอติดต่อ';
    let statusClass = 'new';
    let nextStatusHint = 'คลิกเปลี่ยนเป็น ➔ ติดต่อแล้ว';

    if (lead.status === 'contacted') {
      statusText = '📞 ติดต่อแล้ว';
      statusClass = 'contacted';
      nextStatusHint = 'คลิกเปลี่ยนเป็น ➔ สำเร็จ';
    } else if (lead.status === 'done') {
      statusText = '✅ สำเร็จ';
      statusClass = 'done';
      nextStatusHint = 'คลิกวนกลับเป็น ➔ รอติดต่อ';
    }

    const leadTime = formatLeadDateTime(lead);

    row.innerHTML = `
      <div class="lead-info-col">
        <span class="lead-name">${escapeHtml(lead.name)}</span>
        <span class="lead-phone">${escapeHtml(lead.phone)}</span>
        <span style="font-size:0.75rem; color:#94a3b8; margin-left:0.5rem;">📍 ${escapeHtml(lead.location || 'ระยอง')}</span>
        <span style="font-size:0.74rem; color:#64748b; margin-left:0.35rem;">🕒 ${escapeHtml(leadTime)}</span>
      </div>
      <button class="lead-status-pill ${statusClass}" title="${nextStatusHint} (${statusText})">${statusText} ⇄</button>
    `;

    const pill = row.querySelector('.lead-status-pill');
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLeadStatus(lead.id);
    });

    row.addEventListener('click', () => {
      openLeadDetail(lead);
    });

    container.appendChild(row);
  });
}

function initFilterButtons() {
  const filterBtns = document.querySelectorAll('.btn-filter-tag');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter') || 'all';
      renderLeadsList();
      if (typeof renderLeadsTabList === 'function') renderLeadsTabList();
    });
  });
}

function toggleLeadStatus(leadId) {
  const leads = getStoredLeads();
  const target = leads.find(l => l.id === leadId);
  if (!target) return;

  if (target.status === 'new') {
    target.status = 'contacted';
  } else if (target.status === 'contacted') {
    target.status = 'done';
  } else {
    target.status = 'new';
  }

  saveLeads(leads);
  renderMetrics();
  renderLeadsList();
  if (typeof renderLeadsTabList === 'function') renderLeadsTabList();

  if (currentDetailLead && currentDetailLead.id === leadId) {
    currentDetailLead = target;
    updateModalStatusUI(target.status);
  }
}

let currentDetailLead = null;

function updateModalStatusUI(status) {
  const badge = document.getElementById('modalCurrentStatusBadge');
  const btnNew = document.getElementById('btnModalStatusNew');
  const btnContacted = document.getElementById('btnModalStatusContacted');
  const btnDone = document.getElementById('btnModalStatusDone');

  const statusMap = {
    new: { text: '⏳ รอติดต่อ', cls: 'new' },
    contacted: { text: '📞 ติดต่อแล้ว', cls: 'contacted' },
    done: { text: '✅ สำเร็จ', cls: 'done' }
  };
  const info = statusMap[status] || statusMap.new;

  if (badge) {
    badge.className = `lead-status-pill ${info.cls}`;
    badge.textContent = info.text;
  }

  [btnNew, btnContacted, btnDone].forEach(btn => {
    if (btn) {
      if (btn.getAttribute('data-status') === status) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });
}

function openLeadDetail(lead) {
  const modal = document.getElementById('leadDetailModal');
  if (!modal) return;

  currentDetailLead = lead;

  document.getElementById('modalLeadName').textContent = lead.name || '-';
  document.getElementById('modalLeadPhone').textContent = lead.phone || '-';
  document.getElementById('modalLeadLocation').textContent = lead.location || 'ระยอง';
  document.getElementById('modalLeadBudget').textContent = lead.budget || 'ไม่ระบุ';
  document.getElementById('modalLeadMessage').textContent = lead.message || 'ไม่มีข้อความเพิ่มเติม';
  document.getElementById('modalLeadTime').textContent = formatLeadDateTime(lead);

  updateModalStatusUI(lead.status || 'new');

  modal.classList.add('open');

  const callBtn = document.getElementById('modalCallBtn');
  if (callBtn) {
    callBtn.onclick = () => {
      // Auto-update to contacted if status was new
      if (currentDetailLead && currentDetailLead.status === 'new') {
        const leads = getStoredLeads();
        const target = leads.find(l => l.id === currentDetailLead.id);
        if (target) {
          target.status = 'contacted';
          saveLeads(leads);
          currentDetailLead = target;
          updateModalStatusUI('contacted');
          renderMetrics();
          renderLeadsList();
          if (typeof renderLeadsTabList === 'function') renderLeadsTabList();
        }
      }
      window.location.href = `tel:${lead.phone}`;
    };
  }

  const deleteBtn = document.getElementById('modalDeleteBtn');
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      if (confirm(`ต้องการลบข้อมูล Lead ของคุณ ${lead.name} หรือไม่?`)) {
        let leads = getStoredLeads();
        leads = leads.filter(l => l.id !== lead.id);
        saveLeads(leads);
        currentDetailLead = null;
        modal.classList.remove('open');
        renderMetrics();
        renderLeadsList();
        if (typeof renderLeadsTabList === 'function') renderLeadsTabList();
      }
    };
  }
}

function promptAndAddTestLead() {
  const name = prompt('กรอกชื่อลูกค้าจำลอง:', 'คุณลูกค้าใหม่ (ระยอง)');
  if (!name) return;
  const phone = prompt('กรอกเบอร์โทรศัพท์:', '091-299-8797');
  if (!phone) return;

  const leads = getStoredLeads();
  const now = new Date();
  const newLeadObj = {
    id: 'lead_' + now.getTime(),
    name,
    phone,
    location: 'อำเภอเมืองระยอง',
    budget: '3.5 - 5 ล้านบาท',
    message: 'สนใจสร้างบ้านพูลวิลล่าสไตล์โมเดิร์น',
    status: 'new',
    createdAt: now.toISOString()
  };
  newLeadObj.time = formatLeadDateTime(newLeadObj);

  leads.unshift(newLeadObj);
  saveLeads(leads);
  renderMetrics();
  renderLeadsList();
  if (typeof renderLeadsTabList === 'function') renderLeadsTabList();
}

function exportLeadsToCsv() {
  const leads = getStoredLeads();
  if (leads.length === 0) {
    alert('⚠️ ขณะนี้ยังไม่มีข้อมูล Leads ในระบบสำหรับส่งออก');
    return;
  }

  let csvContent = '\uFEFF'; // UTF-8 BOM for Excel Thai language support
  csvContent += 'ลำดับ,ชื่อ-นามสกุล,เบอร์โทรศัพท์,ทำเลที่ดิน,งบประมาณ,สถานะ,ข้อความเพิ่มเติม,เวลาที่ส่งเข้ามา\n';

  leads.forEach((l, index) => {
    const statusLabel = l.status === 'new' ? 'รอติดต่อ' : (l.status === 'contacted' ? 'ติดต่อแล้ว' : 'สำเร็จ');
    const safeName = `"${(l.name || '').replace(/"/g, '""')}"`;
    const safePhone = `"${(l.phone || '').replace(/"/g, '""')}"`;
    const safeLoc = `"${(l.location || '').replace(/"/g, '""')}"`;
    const safeBudget = `"${(l.budget || '').replace(/"/g, '""')}"`;
    const safeMsg = `"${(l.message || '').replace(/"/g, '""')}"`;
    const safeTime = `"${(formatLeadDateTime(l)).replace(/"/g, '""')}"`;

    csvContent += `${index + 1},${safeName},${safePhone},${safeLoc},${safeBudget},${statusLabel},${safeMsg},${safeTime}\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `RMHome_Leads_Report_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function initActionButtons() {
  const closeBtn = document.getElementById('modalCloseBtn');
  const modal = document.getElementById('leadDetailModal');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }

  // Lead Modal Status Change Buttons
  ['btnModalStatusNew', 'btnModalStatusContacted', 'btnModalStatusDone'].forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', () => {
        if (!currentDetailLead) return;
        const newStatus = btn.getAttribute('data-status');
        const leads = getStoredLeads();
        const target = leads.find(l => l.id === currentDetailLead.id);
        if (target) {
          target.status = newStatus;
          saveLeads(leads);
          currentDetailLead = target;
          updateModalStatusUI(newStatus);
          renderMetrics();
          renderLeadsList();
          if (typeof renderLeadsTabList === 'function') renderLeadsTabList();
        }
      });
    }
  });

  // Refresh Button
  const refreshBtn = document.getElementById('btnRefresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.style.opacity = '0.6';
      setTimeout(() => {
        renderMetrics();
        renderLeadsList();
        refreshBtn.style.opacity = '1';
      }, 250);
    });
  }

  // Clear Old Data & Reset to 0 (พร้อมเริ่ม Deploy รายงานตัวใหม่)
  const clearOldDataBtn = document.getElementById('btnClearOldData');
  if (clearOldDataBtn) {
    clearOldDataBtn.addEventListener('click', () => {
      if (confirm('คุณต้องการลบข้อมูล Leads เก่าทั้งหมด และรีเซ็ตตัวเลขเป็น 0 ใช่หรือไม่?\n\n(เพื่อเตรียมพร้อมรับ Deploy รายงานตัวใหม่จากหน้าเว็บ)')) {
        localStorage.removeItem('rm_leads');
        localStorage.setItem('rm_page_views', '0');
        localStorage.setItem('rm_sessions', '0');
        renderMetrics();
        renderLeadsList();
        alert('✅ ลบข้อมูลเก่าในแดชบอร์ดออกเรียบร้อยแล้ว!\n\nแดชบอร์ดอยู่ในสถานะ Standby พร้อมรับรายงานตัวใหม่ทันที');
      }
    });
  }

  // Export CSV
  const exportBtn = document.getElementById('btnExportCsv');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportLeadsToCsv();
    });
  }

  // Add Test Lead Button
  const addLeadBtn = document.getElementById('btnAddTestLead');
  if (addLeadBtn) {
    addLeadBtn.addEventListener('click', () => {
      promptAndAddTestLead();
    });
  }

  // Manage Admins from topic row
  const topicManageAdmins = document.getElementById('btnTopicManageAdmins');
  if (topicManageAdmins) {
    topicManageAdmins.addEventListener('click', () => {
      const modalUsers = document.getElementById('adminUsersModal');
      if (modalUsers) {
        renderAdminUsersList();
        modalUsers.classList.add('open');
      }
    });
  }
}

/* ---------------------------------------------------------
   4. Portfolio & Warm Home Projects Management (บ้านอบอุ่นที่เรามอบให้คุณ)
   --------------------------------------------------------- */
const DEFAULT_PORTFOLIO_HOUSES = [
  {
    id: 'house_contem_01',
    title: 'RM-Contem Harmony',
    category: 'Contem',
    categorySlug: 'contem',
    budget: '4.25 ล้านบาท',
    type: 'แบบบ้าน (ยังไม่สร้าง)',
    area: '260',
    floors: '2',
    bedrooms: '3',
    bathrooms: '3',
    parking: '2',
    location: 'อ.บ้านค่าย จ.ระยอง',
    cover: 'assets/images/hero-winter-villa.jpg',
    gallery: [
      'assets/images/hero-winter-villa.jpg',
      'assets/images/luxury-interior.jpg',
      'assets/images/hero-villa.jpg',
      'assets/images/plan-nordic-fl1.svg',
      'assets/images/plan-nordic-fl2.svg',
      'assets/images/quality-engineer.jpg'
    ],
    description: 'แบบบ้านสไตล์คอนเทมโพรารี (Contemporary) ผสมผสานความร่วมสมัยและกลิ่นอายธรรมชาติเมืองระยอง อบอุ่น เรียบหรู ฟังก์ชันลงตัวคุ้มค่าทุกตารางเมตร',
    features: [
      'โครงสร้างคอนกรีตเสริมเหล็ก ต้านแผ่นดินไหวตาม มยผ.',
      'หลังคา SCG Prestige พร้อมฉนวนสะท้อนความร้อน Stay Cool',
      'แปลนชั้น 1: Living Area เพดานสูง + Dining + ครัวไทยแยกส่วน + ห้องนอนผู้สูงอายุ',
      'แปลนชั้น 2: Master Bedroom กว้างขวางพร้อม Walk-in Closet และระเบียงรับลม',
      'สุขภัณฑ์ Cotto / American Standard ประหยัดน้ำระดับพรีเมียม',
      'รับประกันงานโครงสร้าง 20 ปี และงานสถาปัตยกรรม 2 ปีเต็ม'
    ],
    tall: false,
    createdAt: '2026-11-01'
  },
  {
    id: 'house_modern_02',
    title: 'RM-Modern Villa Resort',
    category: 'Modern',
    categorySlug: 'modern',
    budget: '4.95 ล้านบาท',
    type: 'ผลงานสร้างเสร็จแล้ว',
    area: '290',
    floors: '1',
    bedrooms: '3',
    bathrooms: '3',
    parking: '2',
    location: 'อ.แกลง จ.ระยอง',
    cover: 'assets/images/house-tropical.jpg',
    gallery: [
      'assets/images/house-tropical.jpg',
      'assets/images/hero-villa.jpg',
      'assets/images/hero-winter-villa.jpg',
      'assets/images/luxury-interior.jpg',
      'assets/images/plan-tropical-fl1.svg',
      'assets/images/quality-engineer.jpg'
    ],
    description: 'บ้านพักตากอากาศสไตล์โมเดิร์น พร้อมสระว่ายน้ำระบบเกลือในตัว ออกแบบเส้นสายคมชัด โปร่งโล่ง เชื่อมต่อพื้นที่ใช้สอยภายในและภายนอกได้อย่างลงตัว',
    features: [
      'สระว่ายน้ำระบบเกลือ Overflow ขนาด 3.5 x 8 เมตร พร้อมระบบไฟ LED ใต้น้ำ',
      'แปลนวิลล่าสไตล์รีสอร์ต: ทุกห้องนอนเปิดก้าวสู่ขอบสระว่ายน้ำได้โดยตรง',
      'พื้นระเบียงไม้เทียม WPC เกรดพรีเมียม ทนแดด ทนฝน ไม่ผุกร่อน',
      'ดีไซน์เชื่อมต่อ Indoor-Outdoor ด้วยประตูกระจกบานเลื่อนขนาดยักษ์',
      'ระบบบำบัดน้ำเสียและระบายน้ำรอบตัวบ้าน ออกแบบป้องกันน้ำท่วมขัง',
      'บริการยื่นขออนุญาตปลูกสร้างและขอน้ำ-ไฟให้ฟรีครบวงจร'
    ],
    tall: false,
    createdAt: '2026-11-01'
  },
  {
    id: 'house_nordic_03',
    title: 'RM-Nordic Grand',
    category: 'Nordic',
    categorySlug: 'nordic',
    budget: '3.89 ล้านบาท',
    type: 'แบบบ้าน (ยังไม่สร้าง)',
    area: '245',
    floors: '2',
    bedrooms: '3',
    bathrooms: '4',
    parking: '2 (EV)',
    location: 'อ.เมืองระยอง จ.ระยอง',
    cover: 'assets/images/house-nordic.jpg',
    gallery: [
      'assets/images/house-nordic.jpg',
      'assets/images/hero-winter-villa.jpg',
      'assets/images/hero-villa.jpg',
      'assets/images/luxury-interior.jpg',
      'assets/images/plan-nordic-fl1.svg',
      'assets/images/plan-nordic-fl2.svg',
      'assets/images/quality-engineer.jpg'
    ],
    description: 'แบบบ้านสไตล์นอร์ดิกกลิ่นอายสแกนดิเนเวียน ดีไซน์หลังคาจั่วสูงโปร่ง โอ่โถง พร้อมกระจกบานใหญ่รับแสงธรรมชาติและวิวสวน เหมาะสำหรับครอบครัวคนรุ่นใหม่ในระยองที่ต้องการความสงบ อบอุ่น และฟังก์ชันครบครัน',
    features: [
      'โครงสร้างคอนกรีตเสริมเหล็ก ต้านแผ่นดินไหวตาม มยผ.',
      'หลังคา SCG Shingle Roof พร้อมฉนวนกันความร้อน Stay Cool 3 นิ้ว',
      'กระจกเขียวตัดแสงหนา 6 มม. กรอบอะลูมิเนียมเกรดพรีเมียม Powder Coat',
      'แปลนชั้น 1: โถง Living เพดานสูง 3.2 ม. + ครัวเปิดสไตล์ยุโรป + ห้องนอนผู้สูงอายุ',
      'แปลนชั้น 2: Master Penthouse Suite พร้อม Walk-in Closet + ระเบียงชมวิวหน้าบ้าน',
      'ระบบไฟฟ้ารองรับ EV Charger และ Smart Home Control',
      'รับประกันงานโครงสร้าง 20 ปี และงานสถาปัตยกรรม 2 ปีเต็ม'
    ],
    tall: false,
    createdAt: '2026-11-01'
  },
  {
    id: 'house_luxury_04',
    title: 'RM-Luxury Mansion Elite',
    category: 'Luxury',
    categorySlug: 'luxury',
    budget: '6.95 ล้านบาท',
    type: 'แบบบ้าน (ยังไม่สร้าง)',
    area: '380',
    floors: '2',
    bedrooms: '4',
    bathrooms: '5',
    parking: '3',
    location: 'อ.บ้านฉาง จ.ระยอง',
    cover: 'assets/images/house-mansion.jpg',
    gallery: [
      'assets/images/house-mansion.jpg',
      'assets/images/hero-winter-villa.jpg',
      'assets/images/hero-villa.jpg',
      'assets/images/luxury-interior.jpg',
      'assets/images/plan-mansion-fl1.svg',
      'assets/images/plan-mansion-fl2.svg',
      'assets/images/quality-engineer.jpg'
    ],
    description: 'คฤหาสน์หรูระดับ Luxury โดดเด่นด้วย Façade หินอ่อนและเส้นสายสีทองแชมเปญ โถง Double Volume สูง 6.5 เมตร พร้อมระเบียง Sky Terrace ชั้นบน ตอบโจทย์การใช้ชีวิตเหนือระดับในระยอง',
    features: [
      'ฐานรากตอกเสาเข็มลึกถึงชั้นดินดาน วิศวกรสามัญเซ็นรับรองทุกจุด',
      'แปลนชั้น 1: โถง Grand Foyer สูง 6.5 ม. + Dining 10 ที่นั่ง + ครัวไทย & ครัวฝรั่ง + ห้องแม่บ้าน',
      'แปลนชั้น 2: Penthouse Master Suite + Sky Terrace ระเบียงใหญ่ + ทุกห้องนอนมีห้องน้ำในตัว',
      'ผนังอิฐมวลเบา Q-CON ป้องกันเสียงและความร้อน 2 ชั้น',
      'ระบบ Smart Home ควบคุมไฟ แอร์ และความปลอดภัยผ่านสมาร์ตโฟน',
      'สุขภัณฑ์อัตโนมัติ TOTO Neorest ในห้อง Master Bedroom',
      'ฟรี จัดสวน Landscape สไตล์ Modern Luxury รอบบ้าน'
    ],
    tall: false,
    createdAt: '2026-11-01'
  }
];

function getCategorySlug(cat) {
  if (!cat) return 'modern';
  const c = cat.toLowerCase().trim();
  if (c.includes('contem') || c.includes('คอนเทม')) return 'contem';
  if (c.includes('nordic') || c.includes('นอร์ดิก')) return 'nordic';
  if (c.includes('luxury') || c.includes('ลักชัวรี') || c.includes('mansion') || c.includes('คฤหาสน์')) return 'luxury';
  if (c.includes('modern') || c.includes('โมเดิร์น') || c.includes('tropical') || c.includes('ทรอปิคอล') || c.includes('pool') || c.includes('พูลวิลล่า') || c.includes('minimal') || c.includes('มินิมอล')) return 'modern';
  return 'modern';
}

function normalizeCategoryName(cat) {
  const slug = getCategorySlug(cat);
  if (slug === 'contem') return 'Contem';
  if (slug === 'modern') return 'Modern';
  if (slug === 'nordic') return 'Nordic';
  if (slug === 'luxury') return 'Luxury';
  return 'Modern';
}

let _cachedPortfolioItems = null;

function getStoredPortfolio() {
  if (_cachedPortfolioItems && Array.isArray(_cachedPortfolioItems) && _cachedPortfolioItems.length > 0) {
    return _cachedPortfolioItems;
  }
  try {
    const raw = localStorage.getItem('rm_portfolio_items');
    if (!raw) {
      _cachedPortfolioItems = [...DEFAULT_PORTFOLIO_HOUSES];
      try { localStorage.setItem('rm_portfolio_items', JSON.stringify(DEFAULT_PORTFOLIO_HOUSES)); } catch (e) {}
      return _cachedPortfolioItems;
    }
    let parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      _cachedPortfolioItems = [...DEFAULT_PORTFOLIO_HOUSES];
      try { localStorage.setItem('rm_portfolio_items', JSON.stringify(DEFAULT_PORTFOLIO_HOUSES)); } catch (e) {}
      return _cachedPortfolioItems;
    }
    let updated = false;
    parsed = parsed.map(item => {
      const newSlug = getCategorySlug(item.categorySlug || item.category);
      const newCat = normalizeCategoryName(item.category || item.categorySlug);
      if (item.categorySlug !== newSlug || item.category !== newCat) {
        updated = true;
        return { ...item, categorySlug: newSlug, category: newCat };
      }
      return item;
    });

    // Ensure Contem house is present
    const hasContem = parsed.some(item => getCategorySlug(item.categorySlug || item.category) === 'contem');
    if (!hasContem && DEFAULT_PORTFOLIO_HOUSES[0]) {
      parsed.unshift(DEFAULT_PORTFOLIO_HOUSES[0]);
      updated = true;
    }

    if (updated) {
      try { localStorage.setItem('rm_portfolio_items', JSON.stringify(parsed)); } catch (e) {}
    }

    _cachedPortfolioItems = parsed;
    return parsed;
  } catch (e) {
    _cachedPortfolioItems = [...DEFAULT_PORTFOLIO_HOUSES];
    return _cachedPortfolioItems;
  }
}

async function savePortfolio(items) {
  _cachedPortfolioItems = items;
  try {
    localStorage.setItem('rm_portfolio_items', JSON.stringify(items));
  } catch (e) {
    console.warn('LocalStorage save warning, proceeding with cloud sync:', e);
  }
  window.dispatchEvent(new Event('portfolioUpdated'));

  // Direct sync to Firebase Realtime Database
  if (window.CloudSync && typeof window.CloudSync.saveItem === 'function') {
    try {
      await window.CloudSync.saveItem('rm_portfolio_items', items);
    } catch (err) {
      console.warn('CloudSync direct save failed:', err);
    }
  }
}

function compressImageFile(file, maxDim = 900, quality = 0.72) {
  return new Promise((resolve) => {
    if (!file) return resolve('');
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        let result = canvas.toDataURL('image/jpeg', quality);
        if (result.length > 180000) {
          const smallCanvas = document.createElement('canvas');
          const factor = 680 / Math.max(w, h);
          smallCanvas.width = Math.max(1, Math.round(w * factor));
          smallCanvas.height = Math.max(1, Math.round(h * factor));
          const sCtx = smallCanvas.getContext('2d');
          sCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
          result = smallCanvas.toDataURL('image/jpeg', 0.62);
        }
        resolve(result);
      };
      img.onerror = () => resolve(e.target.result || '');
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

function initPortfolioManager() {
  const addForm = document.getElementById('portfolioAddForm');
  const coverInput = document.getElementById('projCover');
  const btnUploadCover = document.getElementById('btnUploadCover');
  const coverFileInput = document.getElementById('coverFileInput');
  const coverPreviewBox = document.getElementById('coverPreviewBox');
  const coverPreviewImg = document.getElementById('coverPreviewImg');

  const btnAddGalleryPhotos = document.getElementById('btnAddGalleryPhotos');
  const btnQuickAddPlans = document.getElementById('btnQuickAddPlans');
  const galleryFileInput = document.getElementById('galleryFileInput');
  const galleryPreviewStrip = document.getElementById('galleryPreviewStrip');

  let currentGalleryPhotos = [];

  function renderAddGalleryPreview() {
    if (!galleryPreviewStrip) return;
    galleryPreviewStrip.innerHTML = '';
    currentGalleryPhotos.forEach((src, idx) => {
      const isPlan = src.toLowerCase().includes('plan') || src.toLowerCase().includes('แปลน') || src.toLowerCase().endsWith('.svg');
      const card = document.createElement('div');
      card.className = 'gallery-editor-card';
      card.innerHTML = `
        <img src="${src}" alt="preview ${idx + 1}">
        <button type="button" class="btn-remove-photo" data-idx="${idx}" title="ลบรูปนี้">✕</button>
        <span class="badge-plan-tag">${isPlan ? '📐 แปลนบ้าน' : `📷 รูปที่ ${idx + 1}`}</span>
      `;
      const btnDel = card.querySelector('.btn-remove-photo');
      if (btnDel) {
        btnDel.addEventListener('click', () => {
          currentGalleryPhotos.splice(idx, 1);
          renderAddGalleryPreview();
        });
      }
      galleryPreviewStrip.appendChild(card);
    });
  }

  // Initial render
  renderAdminPortfolioList();

  // Handle Cover File Upload via disk selector
  if (btnUploadCover && coverFileInput) {
    btnUploadCover.addEventListener('click', () => {
      coverFileInput.click();
    });

    coverFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        btnUploadCover.textContent = '⏳ กำลังประมวลผล...';
        const dataUrl = await compressImageFile(file);
        if (coverInput) coverInput.value = dataUrl;
        if (coverPreviewImg && coverPreviewBox) {
          coverPreviewImg.src = dataUrl;
          coverPreviewBox.style.display = 'block';
        }
        btnUploadCover.textContent = '↑ อัพโหลด';
      }
    });
  }

  // Handle Cover text change for URL
  if (coverInput) {
    coverInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val && coverPreviewImg && coverPreviewBox) {
        coverPreviewImg.src = val;
        coverPreviewBox.style.display = 'block';
      }
    });
  }

  // Handle Gallery Photos Upload
  if (btnAddGalleryPhotos && galleryFileInput) {
    btnAddGalleryPhotos.addEventListener('click', () => {
      galleryFileInput.click();
    });

    galleryFileInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      btnAddGalleryPhotos.textContent = '⏳ กำลังอัปโหลด...';
      for (const file of files) {
        const dataUrl = await compressImageFile(file);
        currentGalleryPhotos.push(dataUrl);
      }
      btnAddGalleryPhotos.textContent = '+ อัปโหลดรูปภาพ / แปลนบ้านจากเครื่อง';
      renderAddGalleryPreview();
    });
  }

  // Quick Preset: ใส่แปลนมาตรฐาน RMHome อัตโนมัติ
  if (btnQuickAddPlans) {
    btnQuickAddPlans.addEventListener('click', () => {
      const defaultPlans = [
        'assets/images/plan-nordic-fl1.svg',
        'assets/images/plan-nordic-fl2.svg'
      ];
      defaultPlans.forEach(p => {
        if (!currentGalleryPhotos.includes(p)) {
          currentGalleryPhotos.push(p);
        }
      });
      renderAddGalleryPreview();
      alert('📐 เพิ่มชุดแปลนสถาปัตยกรรมมาตรฐาน RMHome (ชั้น 1 & 2) เรียบร้อยแล้ว!');
    });
  }

  // Handle Form Submission: เพิ่มผลงานใหม่
  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btnSubmit = document.getElementById('btnSubmitPortfolio');
      const origBtnText = btnSubmit ? btnSubmit.innerHTML : '+ เพิ่มผลงาน';

      const titleInput = document.getElementById('projTitle');
      const title = titleInput ? titleInput.value.trim() : '';
      if (!title) {
        alert('กรุณากรอกชื่อโปรเจกต์ / แบบบ้าน');
        if (titleInput) titleInput.focus();
        return;
      }

      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '⏳ กำลังบันทึกผลงานขึ้นระบบ...';
      }

      const category = document.getElementById('projCategory').value;
      const budgetRaw = document.getElementById('projBudget').value.trim();
      const budget = budgetRaw 
        ? (budgetRaw.includes('ล้าน') ? budgetRaw : budgetRaw + ' ล้านบาท')
        : 'ตามงบประมาณลูกค้า';
      const type = document.getElementById('projType').value;
      const area = document.getElementById('projArea').value.trim() || '200';
      const floors = document.getElementById('projFloors').value.trim() || '1';
      const bedrooms = document.getElementById('projBeds').value.trim() || '2';
      const bathrooms = document.getElementById('projBaths').value.trim() || '2';
      const parking = document.getElementById('projParking').value.trim() || '1';
      const location = document.getElementById('projLocation').value.trim() || 'จ.ระยอง';

      let cover = coverInput ? coverInput.value.trim() : '';
      if (!cover && currentGalleryPhotos.length > 0) {
        cover = currentGalleryPhotos[0];
      }
      if (!cover) {
        cover = 'assets/images/house-nordic.jpg';
      }
      const description = document.getElementById('projDescription').value.trim() || 'ผลงานสร้างบ้านคุณภาพโดย RMHome ระยอง ฟังก์ชันครบครัน คุมงบได้จริง';
      
      const featuresRaw = document.getElementById('projFeatures') ? document.getElementById('projFeatures').value.trim() : '';
      let features = featuresRaw ? featuresRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];
      if (features.length === 0) {
        features = [
          'โครงสร้างคอนกรีตเสริมเหล็ก ต้านแผ่นดินไหวตาม มยผ.',
          'วัสดุมาตรฐาน มอก. แบรนด์ชั้นนำ SCG / Cotto',
          'ควบคุมงานโดยวิศวกร กว. ทุกขั้นตอน',
          'รับประกันงานโครงสร้าง 20 ปี และสถาปัตยกรรม 2 ปี'
        ];
      }

      const tall = document.getElementById('projTallCard') ? document.getElementById('projTallCard').checked : false;

      let gallery = currentGalleryPhotos.length > 0 ? [...currentGalleryPhotos] : [
        cover,
        'assets/images/hero-winter-villa.jpg',
        'assets/images/luxury-interior.jpg',
        'assets/images/plan-nordic-fl1.svg',
        'assets/images/plan-nordic-fl2.svg',
        'assets/images/quality-engineer.jpg'
      ];

      // Ensure cover is in gallery
      if (!gallery.includes(cover)) {
        gallery.unshift(cover);
      }

      const newHouse = {
        id: 'house_' + Date.now(),
        title,
        category,
        categorySlug: getCategorySlug(category),
        category: normalizeCategoryName(category),
        budget,
        type,
        area,
        floors,
        bedrooms,
        bathrooms,
        parking,
        location,
        cover,
        gallery,
        description,
        features,
        tall,
        createdAt: new Date().toLocaleDateString('th-TH')
      };

      const items = [...getStoredPortfolio()];
      items.unshift(newHouse);
      await savePortfolio(items);

      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = origBtnText;
      }

      // Reset form
      addForm.reset();
      currentGalleryPhotos = [];
      if (galleryPreviewStrip) galleryPreviewStrip.innerHTML = '';
      if (coverPreviewBox) coverPreviewBox.style.display = 'none';

      renderAdminPortfolioList();
      alert(`🎉 เพิ่มผลงาน "${title}" สำเร็จเรียบร้อยแล้ว!\n\nผลงานใหม่พร้อมรูปภาพจะแสดงผลบนหน้าเว็บหลักทันทีแบบเรียลไทม์ (สามารถเพิ่มกี่หลังก็ได้ไม่จำกัด)`);
    });
  }
}

function renderAdminPortfolioList() {
  const grid = document.getElementById('adminPortfolioGrid');
  const countBadge = document.getElementById('portfolioHeaderCountBadge');
  const sidebarBadge = document.getElementById('sidebarPortfolioBadge');
  const topicCount = document.getElementById('topicHousesCount');

  const items = getStoredPortfolio();

  if (countBadge) countBadge.textContent = `${items.length} หลังในระบบ`;
  if (sidebarBadge) sidebarBadge.textContent = items.length;
  if (topicCount) topicCount.textContent = `${items.length} แบบบ้าน`;

  if (!grid) return;
  grid.innerHTML = '';

  if (items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:2.5rem; color:#94a3b8; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">
        ยังไม่มีผลงานในระบบ กรุณากรอกแบบฟอร์มด้านบนเพื่อเพิ่มผลงานบ้าน
      </div>
    `;
    return;
  }

  items.forEach((house) => {
    const card = document.createElement('div');
    card.className = 'admin-house-card';
    const galleryCount = (house.gallery && house.gallery.length) || 1;

    card.innerHTML = `
      <div class="admin-house-img-wrap">
        <img src="${escapeHtml(house.cover)}" alt="${escapeHtml(house.title)}" onerror="this.src='assets/images/house-nordic.jpg'">
        <span class="admin-house-badge">${escapeHtml(house.type || 'แบบบ้าน')}</span>
        <span class="admin-house-category">${escapeHtml(house.category || 'โมเดิร์น')}</span>
      </div>
      <div class="admin-house-body">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
          <div class="admin-house-title" style="margin-bottom:0;">${escapeHtml(house.title)}</div>
          <span style="font-size:0.75rem; color:#0e3d29; background:#dcfce7; padding:0.2rem 0.5rem; border-radius:4px; font-weight:700;">
            🖼️ ${galleryCount} รูป &amp; แปลน
          </span>
        </div>
        <div class="admin-house-price">฿ ${escapeHtml(house.budget)}</div>
        <div class="admin-house-specs-grid">
          <div>📐 พื้นที่: ${escapeHtml(house.area)} ตร.ม.</div>
          <div>🏢 ชั้น: ${escapeHtml(house.floors || '1')} ชั้น</div>
          <div>🛏️ นอน: ${escapeHtml(house.bedrooms)} ห้อง</div>
          <div>🚿 น้ำ: ${escapeHtml(house.bathrooms)} ห้อง</div>
          <div>🚗 จอดรถ: ${escapeHtml(house.parking)} คัน</div>
          <div>📍 ${escapeHtml(house.location || 'ระยอง')}</div>
        </div>
        <div class="admin-house-desc">${escapeHtml(house.description || '')}</div>
        <div class="admin-house-footer" style="display:flex; gap:0.5rem; justify-content:space-between; align-items:center; flex-wrap:wrap;">
          <a href="index.html#models" target="_blank" style="font-size:0.78rem; color:#0d5c3a; text-decoration:none; font-weight:600;">
            ดูบนหน้าเว็บ ↗
          </a>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn-action-outline btn-edit-house" data-id="${escapeHtml(house.id)}" style="background:#0e3d29; color:#fff; border:1px solid #d4af37; padding:0.4rem 0.85rem; border-radius:6px; font-size:0.8rem; font-weight:600; cursor:pointer;" title="แก้ไขสเปก แปลนบ้าน และรูปหลายมุม">
              ✏️ แก้ไขสเปก &amp; รูป/แปลน
            </button>
            <button class="btn-delete-house" data-id="${escapeHtml(house.id)}" data-title="${escapeHtml(house.title)}">
              🗑️ ลบ
            </button>
          </div>
        </div>
      </div>
    `;

    // Handle Edit house click
    const btnEdit = card.querySelector('.btn-edit-house');
    if (btnEdit) {
      btnEdit.addEventListener('click', () => {
        const targetId = btnEdit.getAttribute('data-id');
        openEditHouseModal(targetId);
      });
    }

    // Handle delete house
    const btnDel = card.querySelector('.btn-delete-house');
    if (btnDel) {
      btnDel.addEventListener('click', async () => {
        const targetId = btnDel.getAttribute('data-id');
        const targetTitle = btnDel.getAttribute('data-title');
        if (confirm(`คุณต้องการลบผลงาน "${targetTitle}" ออกจากเว็บไซต์ใช่หรือไม่?\n\n(ผลงานจะหายไปจากหน้าเว็บทันทีแบบเรียลไทม์)`)) {
          let currentItems = getStoredPortfolio();
          currentItems = currentItems.filter(h => h.id !== targetId);
          await savePortfolio(currentItems);
          renderAdminPortfolioList();
        }
      });
    }

    grid.appendChild(card);
  });
}

/* ==========================================================================
   4.1 Edit House Modal Logic (จัดการสเปก, แปลนบ้าน และรูปภาพหลายมุม)
   ========================================================================== */
let currentEditGallery = [];

function openEditHouseModal(houseId) {
  const modal = document.getElementById('editHouseModal');
  if (!modal) return;

  const items = getStoredPortfolio();
  const house = items.find(h => h.id === houseId);
  if (!house) {
    alert('ไม่พบข้อมูลแบบบ้านนี้ในระบบ');
    return;
  }

  document.getElementById('editProjId').value = house.id;
  document.getElementById('editProjTitle').value = house.title || '';
  document.getElementById('editProjCategory').value = normalizeCategoryName(house.category || 'Modern');
  document.getElementById('editProjBudget').value = house.budget || '';
  document.getElementById('editProjType').value = house.type || 'แบบบ้าน (ยังไม่สร้าง)';
  document.getElementById('editProjArea').value = house.area || '';
  document.getElementById('editProjFloors').value = house.floors || '1';
  document.getElementById('editProjBeds').value = house.bedrooms || '2';
  document.getElementById('editProjBaths').value = house.bathrooms || '2';
  document.getElementById('editProjParking').value = house.parking || '1';
  document.getElementById('editProjLocation').value = house.location || 'จ.ระยอง';
  
  const coverInput = document.getElementById('editProjCover');
  const coverPreviewImg = document.getElementById('editCoverPreviewImg');
  const coverVal = house.cover || 'assets/images/house-nordic.jpg';
  if (coverInput) coverInput.value = coverVal;
  if (coverPreviewImg) coverPreviewImg.src = coverVal;

  document.getElementById('editProjDescription').value = house.description || '';
  
  const features = house.features && Array.isArray(house.features) ? house.features : [];
  document.getElementById('editProjFeatures').value = features.join('\n');

  currentEditGallery = (house.gallery && Array.isArray(house.gallery) && house.gallery.length > 0) 
    ? [...house.gallery] 
    : [coverVal];

  renderEditGalleryGrid();

  modal.classList.add('open');
}

function renderEditGalleryGrid() {
  const grid = document.getElementById('editGalleryGrid');
  const badge = document.getElementById('editGalleryCountBadge');
  const coverInput = document.getElementById('editProjCover');
  const currentCover = coverInput ? coverInput.value.trim() : '';

  if (badge) badge.textContent = `มี ${currentEditGallery.length} รูป & แปลนในหลังนี้`;
  if (!grid) return;

  grid.innerHTML = '';

  if (currentEditGallery.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#94a3b8; padding:1.5rem;">ยังไม่มีรูปภาพเพิ่มเติม กรุณากดปุ่มด้านบนเพื่อเพิ่มรูปภาพหรือแปลนบ้าน</div>';
    return;
  }

  currentEditGallery.forEach((src, idx) => {
    const isPlan = src.toLowerCase().includes('plan') || src.toLowerCase().includes('แปลน') || src.toLowerCase().endsWith('.svg');
    const isCover = (src === currentCover);

    const card = document.createElement('div');
    card.className = 'gallery-editor-card';
    if (isCover) {
      card.style.borderColor = '#d4af37';
      card.style.boxShadow = '0 0 10px rgba(212,175,55,0.6)';
    }

    card.innerHTML = `
      <img src="${src}" alt="photo ${idx + 1}">
      <button type="button" class="btn-set-cover" data-idx="${idx}" title="ตั้งรูปนี้เป็นรูปหน้าปก">
        ${isCover ? '★ หน้าปก' : '☆ ตั้งเป็นปก'}
      </button>
      <button type="button" class="btn-remove-photo" data-idx="${idx}" title="ลบรูปนี้">✕</button>
      <span class="badge-plan-tag">${isPlan ? '📐 แปลนบ้าน' : `📷 มุมที่ ${idx + 1}`}</span>
    `;

    // Handle delete photo
    const btnRemove = card.querySelector('.btn-remove-photo');
    if (btnRemove) {
      btnRemove.addEventListener('click', (e) => {
        e.stopPropagation();
        currentEditGallery.splice(idx, 1);
        renderEditGalleryGrid();
      });
    }

    // Handle set as cover
    const btnSetCover = card.querySelector('.btn-set-cover');
    if (btnSetCover) {
      btnSetCover.addEventListener('click', (e) => {
        e.stopPropagation();
        if (coverInput) coverInput.value = src;
        const previewImg = document.getElementById('editCoverPreviewImg');
        if (previewImg) previewImg.src = src;
        renderEditGalleryGrid();
      });
    }

    grid.appendChild(card);
  });
}

function initEditHouseModal() {
  const modal = document.getElementById('editHouseModal');
  const btnClose = document.getElementById('closeEditHouseModal');
  const btnCancel = document.getElementById('btnCancelEditHouse');
  const form = document.getElementById('editHouseForm');

  const btnUploadCover = document.getElementById('btnEditUploadCover');
  const fileInputCover = document.getElementById('editCoverFileInput');
  const coverInput = document.getElementById('editProjCover');
  const coverPreviewImg = document.getElementById('editCoverPreviewImg');

  const btnAddGallery = document.getElementById('btnEditAddGallery');
  const fileInputGallery = document.getElementById('editGalleryFileInput');
  const btnAddUrl = document.getElementById('btnEditAddUrlPrompt');
  const btnQuickPlans = document.getElementById('btnEditQuickAddPlans');

  function closeModal() {
    if (modal) modal.classList.remove('open');
  }

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Cover image upload
  if (btnUploadCover && fileInputCover) {
    btnUploadCover.addEventListener('click', () => fileInputCover.click());
    fileInputCover.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        btnUploadCover.textContent = '⏳ กำลังประมวลผล...';
        const dataUrl = await compressImageFile(file);
        if (coverInput) coverInput.value = dataUrl;
        if (coverPreviewImg) coverPreviewImg.src = dataUrl;
        if (!currentEditGallery.includes(dataUrl)) {
          currentEditGallery.unshift(dataUrl);
        }
        renderEditGalleryGrid();
        btnUploadCover.textContent = '↑ อัพโหลดรูปปก';
      }
    });
  }

  // Gallery multi-upload
  if (btnAddGallery && fileInputGallery) {
    btnAddGallery.addEventListener('click', () => fileInputGallery.click());
    fileInputGallery.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      btnAddGallery.textContent = '⏳ กำลังอัปโหลด...';
      for (const file of files) {
        const dataUrl = await compressImageFile(file);
        currentEditGallery.push(dataUrl);
      }
      btnAddGallery.textContent = '+ เพิ่มรูปภาพ / แปลนจากเครื่อง';
      renderEditGalleryGrid();
    });
  }

  // Add via URL Prompt
  if (btnAddUrl) {
    btnAddUrl.addEventListener('click', () => {
      const url = prompt('วางลิงก์รูปภาพหรือไฟล์แปลนบ้าน (URL):');
      if (url && url.trim()) {
        currentEditGallery.push(url.trim());
        renderEditGalleryGrid();
      }
    });
  }

  // Add default RMHome architectural plan set
  if (btnQuickPlans) {
    btnQuickPlans.addEventListener('click', () => {
      const cat = document.getElementById('editProjCategory').value || '';
      let plansToAdd = [];
      if (cat.includes('คฤหาสน์') || cat.includes('mansion')) {
        plansToAdd = ['assets/images/plan-mansion-fl1.svg', 'assets/images/plan-mansion-fl2.svg'];
      } else if (cat.includes('พูลวิลล่า') || cat.includes('ทรอปิคอล')) {
        plansToAdd = ['assets/images/plan-tropical-fl1.svg'];
      } else {
        plansToAdd = ['assets/images/plan-nordic-fl1.svg', 'assets/images/plan-nordic-fl2.svg'];
      }

      plansToAdd.forEach(p => {
        if (!currentEditGallery.includes(p)) {
          currentEditGallery.push(p);
        }
      });
      renderEditGalleryGrid();
      alert('📐 เพิ่มชุดแปลนสถาปัตยกรรมมาตรฐาน RMHome เรียบร้อยแล้ว!');
    });
  }

  // Handle Edit Form Submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btnSave = form.querySelector('button[type="submit"]');
      const origText = btnSave ? btnSave.innerHTML : '💾 บันทึกการแก้ไข';
      if (btnSave) {
        btnSave.disabled = true;
        btnSave.innerHTML = '⏳ กำลังบันทึกการแก้ไข...';
      }

      const houseId = document.getElementById('editProjId').value;
      const title = document.getElementById('editProjTitle').value.trim();
      const category = document.getElementById('editProjCategory').value;
      const budget = document.getElementById('editProjBudget').value.trim();
      const type = document.getElementById('editProjType').value;
      const area = document.getElementById('editProjArea').value.trim();
      const floors = document.getElementById('editProjFloors').value.trim() || '1';
      const bedrooms = document.getElementById('editProjBeds').value.trim() || '2';
      const bathrooms = document.getElementById('editProjBaths').value.trim() || '2';
      const parking = document.getElementById('editProjParking').value.trim() || '1';
      const location = document.getElementById('editProjLocation').value.trim() || 'จ.ระยอง';
      let cover = coverInput ? coverInput.value.trim() : '';

      if (currentEditGallery.length > 0 && !cover) {
        cover = currentEditGallery[0];
      }
      if (!cover) {
        cover = 'assets/images/house-nordic.jpg';
      }

      // Ensure cover is in gallery
      if (!currentEditGallery.includes(cover)) {
        currentEditGallery.unshift(cover);
      }

      const description = document.getElementById('editProjDescription').value.trim() || 'ผลงานสร้างบ้านคุณภาพโดย RMHome ระยอง ฟังก์ชันครบครัน คุมงบได้จริง';
      
      const featuresRaw = document.getElementById('editProjFeatures').value.trim();
      const features = featuresRaw ? featuresRaw.split('\n').map(s => s.trim()).filter(Boolean) : [
        'โครงสร้างคอนกรีตเสริมเหล็ก ต้านแผ่นดินไหวตาม มยผ.',
        'ควบคุมงานก่อสร้างโดยทีมวิศวกร กว. ทุกขั้นตอน',
        'รับประกันงานโครงสร้าง 20 ปี และงานสถาปัตยกรรม 2 ปีเต็ม'
      ];

      const items = [...getStoredPortfolio()];
      const idx = items.findIndex(h => h.id === houseId);
      if (idx === -1) {
        alert('เกิดข้อผิดพลาด: ไม่พบแบบบ้านนี้ในระบบ');
        if (btnSave) { btnSave.disabled = false; btnSave.innerHTML = origText; }
        return;
      }

      items[idx] = {
        ...items[idx],
        title,
        category,
        categorySlug: getCategorySlug(category),
        category: normalizeCategoryName(category),
        budget: budget.includes('ล้าน') ? budget : budget + ' ล้านบาท',
        type,
        area,
        floors,
        bedrooms,
        bathrooms,
        parking,
        location,
        cover,
        gallery: [...currentEditGallery],
        description,
        features
      };

      await savePortfolio(items);

      if (btnSave) {
        btnSave.disabled = false;
        btnSave.innerHTML = origText;
      }

      closeModal();
      renderAdminPortfolioList();

      alert(`✅ บันทึกการแก้ไขแบบบ้าน "${title}" เรียบร้อยแล้ว!\n\nรายละเอียด สเปก และรูปแปลนทั้งหมดอัปเดตไปแสดงผลบนหน้าแรกทันทีแบบเรียลไทม์`);
    });
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================================================
   5. In-Place CMS Tab Switching System (No External Page Jumps)
   ========================================================================== */
function notifyContentUpdated(type) {
  try {
    window.dispatchEvent(new CustomEvent('contentUpdated', { detail: { type } }));
    localStorage.setItem('rm_last_sync_timestamp', Date.now().toString());
  } catch (e) {}
}

function initTabNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-tab]');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = item.getAttribute('data-tab');
      switchAdminTab(tabName);
    });
  });

  // Buttons inside widgets or pages that open a tab
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-tab]');
    if (btn) {
      e.preventDefault();
      const tabName = btn.getAttribute('data-open-tab');
      switchAdminTab(tabName);
    }
  });

  // Check initial hash
  if (window.location.hash) {
    const rawHash = window.location.hash.replace('#', '');
    const validTabs = ['overview', 'leads', 'portfolio', 'reviews', 'services', 'standards', 'tiktok', 'why-us', 'workflow', 'site-tracker', 'site-content', 'calculator', 'areas', 'users'];
    if (validTabs.includes(rawHash)) {
      switchAdminTab(rawHash);
    }
  }
}

function switchAdminTab(tabName) {
  if (!tabName) return;

  let targetTabId = 'tabOverview';
  let targetNavTab = tabName;

  if (tabName === 'overview') targetTabId = 'tabOverview';
  else if (tabName === 'leads') targetTabId = 'tabLeads';
  else if (tabName === 'portfolio') targetTabId = 'tabPortfolio';
  else if (tabName === 'reviews') targetTabId = 'tabReviews';
  else if (tabName === 'services') targetTabId = 'tabServices';
  else if (tabName === 'standards') targetTabId = 'tabStandards';
  else if (tabName === 'tiktok' || tabName === 'why-us') targetTabId = 'tabTikTok';
  else if (tabName === 'workflow') targetTabId = 'tabWorkflow';
  else if (tabName === 'site-tracker' || tabName === 'tracker') targetTabId = 'tabSiteTracker';
  else if (tabName === 'site-content') targetTabId = 'tabSiteContent';
  else if (tabName === 'calculator') targetTabId = 'tabCalculator';
  else if (tabName === 'areas') targetTabId = 'tabAreas';
  else if (tabName === 'users') targetTabId = 'tabUsers';

  // Update nav item active state
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-tab') === targetNavTab) {
      item.classList.add('active');
    }
  });

  // Hide all tab panes, show target pane
  document.querySelectorAll('.admin-tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });

  const activePane = document.getElementById(targetTabId);
  if (activePane) {
    activePane.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  try {
    history.replaceState(null, null, `#${targetNavTab}`);
  } catch (e) {}

  // Trigger relevant renders
  if (targetTabId === 'tabReviews') renderAdminReviewsList();
  else if (targetTabId === 'tabServices') renderAdminServicesList();
  else if (targetTabId === 'tabStandards') renderAdminStandardsList();
  else if (targetTabId === 'tabWhyUs') renderAdminWhyUsList();
  else if (targetTabId === 'tabWorkflow') renderAdminWorkflowList();
  else if (targetTabId === 'tabSiteContent') loadSiteContentForm();
  else if (targetTabId === 'tabCalculator') loadCalculatorSettingsForm();
  else if (targetTabId === 'tabAreas') loadAreasSettingsForm();
  else if (targetTabId === 'tabUsers') renderTabAdminUsersList();
  else if (targetTabId === 'tabLeads') renderLeadsTabList();
  else if (targetTabId === 'tabPortfolio') renderAdminPortfolioList();
  else if (targetTabId === 'tabSiteTracker') renderSiteTrackerAdmin();
}

/* ==========================================================================
   6. Dedicated Leads Tab
   ========================================================================== */
function initTabLeads() {
  const exportBtn = document.getElementById('btnExportCsvTabLeads');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => exportLeadsToCsv());
  }

  const addLeadBtn = document.getElementById('btnAddLeadTabLeads');
  if (addLeadBtn) {
    addLeadBtn.addEventListener('click', () => promptAndAddTestLead());
  }

  const filterButtons = document.querySelectorAll('#tabLeads .btn-filter-tag');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter') || 'all';
      renderLeadsTabList();
    });
  });

  renderLeadsTabList();
}

function renderLeadsTabList() {
  const container = document.getElementById('leadsTabContainer');
  if (!container) return;

  const allLeads = getStoredLeads();

  const countAll = allLeads.length;
  const countNew = allLeads.filter(l => l.status === 'new').length;
  const countContacted = allLeads.filter(l => l.status === 'contacted').length;
  const countDone = allLeads.filter(l => l.status === 'done').length;

  const fAll = document.getElementById('leadsTabFilterAll');
  const fNew = document.getElementById('leadsTabFilterNew');
  const fContacted = document.getElementById('leadsTabFilterContacted');
  const fDone = document.getElementById('leadsTabFilterDone');
  if (fAll) fAll.textContent = countAll;
  if (fNew) fNew.textContent = countNew;
  if (fContacted) fContacted.textContent = countContacted;
  if (fDone) fDone.textContent = countDone;

  const filtered = allLeads.filter(lead => {
    if (currentFilter === 'all') return true;
    return lead.status === currentFilter;
  });

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="leads-empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-title">ยังไม่มีข้อมูล Leads ในหมวดนี้</div>
        <div class="empty-desc">ข้อมูลผู้ติดต่อสร้างบ้านที่ส่งเข้ามาจะปรากฏที่นี่แบบเรียลไทม์</div>
      </div>
    `;
    return;
  }

  filtered.forEach(lead => {
    const row = document.createElement('div');
    row.className = `lead-row ${lead.status === 'new' ? 'unread' : ''}`;

    let statusText = '⏳ รอติดต่อ';
    let statusClass = 'new';
    let nextStatusHint = 'คลิกเปลี่ยนเป็น ➔ ติดต่อแล้ว';

    if (lead.status === 'contacted') {
      statusText = '📞 ติดต่อแล้ว';
      statusClass = 'contacted';
      nextStatusHint = 'คลิกเปลี่ยนเป็น ➔ สำเร็จ';
    } else if (lead.status === 'done') {
      statusText = '✅ สำเร็จ';
      statusClass = 'done';
      nextStatusHint = 'คลิกวนกลับเป็น ➔ รอติดต่อ';
    }

    row.innerHTML = `
      <div class="lead-avatar">${escapeHtml((lead.name || 'ค').charAt(0))}</div>
      <div class="lead-info" style="cursor:pointer;">
        <div class="lead-name-row">
          <span class="lead-name">${escapeHtml(lead.name)}</span>
          <button class="lead-status-pill ${statusClass}" title="${nextStatusHint} (${statusText})">${statusText} ⇄</button>
        </div>
        <div class="lead-phone">📞 ${escapeHtml(lead.phone)} • ${escapeHtml(lead.location || 'ระยอง')}</div>
        <div class="lead-meta-row">
          <span>💰 ${escapeHtml(lead.budget || 'ไม่ระบุงบ')}</span>
          <span>•</span>
          <span>🕒 ${escapeHtml(formatLeadDateTime(lead))}</span>
        </div>
      </div>
      <div class="lead-actions">
        <button class="btn-lead-view" data-id="${lead.id}">ดูข้อมูล</button>
      </div>
    `;

    const pill = row.querySelector('.lead-status-pill');
    if (pill) {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLeadStatus(lead.id);
      });
    }

    const viewBtn = row.querySelector('.btn-lead-view');
    if (viewBtn) {
      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openLeadDetail(lead);
      });
    }

    row.addEventListener('click', () => {
      openLeadDetail(lead);
    });

    container.appendChild(row);
  });
}

/* ==========================================================================
   7. Reviews CMS (Testimonials - Matching media_1793614452976_4a6202cb.png)
   ========================================================================== */
const DEFAULT_REVIEWS = [
  {
    id: 'rev_01',
    name: 'คุณก้อย',
    role: 'เจ้าของบ้าน',
    image: 'assets/images/quality-engineer.jpg',
    text: 'ลูกค้าประทับใจในความเป็นมืออาชีพของทีม RM HOME ทั้งเรื่องความสะอาด ความเรียบร้อยของหน้างาน ทีมช่างสุภาพ และการแก้ไขปัญหาที่รวดเร็ว ทำให้มั่นใจและไว้วางใจในการดูแลบ้านทุกขั้นตอน',
    fullDetail: 'ประทับใจการทำงานของวิศวกรและช่างประจำโครงการ ดูแลเอาใจใส่ทุกขั้นตอน',
    rating: 5,
    createdAt: '2026-11-01'
  },
  {
    id: 'rev_02',
    name: 'คุณธีรศักดิ์ วิจิตรจินดา',
    role: 'บ้านเดี่ยว 2 ชั้น • อ.เมืองระยอง',
    image: 'assets/images/luxury-interior.jpg',
    text: 'ประทับใจทีมงาน RMHome มากครับ ทำงานมืออาชีพจริงๆ สัญญาชัดเจน งวดงานตรงไปตรงมา ตอนแรกกลัวเรื่องผู้รับเหมาทิ้งงานมาก แต่ที่นี่มีวิศวกรส่งรูปให้ดูทุกวัน บ้านเสร็จเร็วกว่ากำหนด 2 สัปดาห์ แนะนำเลยครับ',
    fullDetail: 'บ้านเดี่ยว 2 ชั้นในระยอง คุมงบได้ ไม่มีบานปลาย',
    rating: 5,
    createdAt: '2026-10-28'
  },
  {
    id: 'rev_03',
    name: 'พญ. นภัสวรรณ รัตนศิลป์',
    role: 'พูลวิลล่าตากอากาศ • อ.บ้านฉาง ระยอง',
    image: 'assets/images/house-tropical.jpg',
    text: 'จ้าง RMHome สร้างบ้านพูลวิลล่าสไตล์โมเดิร์นที่บ้านฉาง สวยตรงปกเหมือนรูป 3D ทุกประการเลยค่ะ สเปกวัสดุใช้ของ SCG แท้ทุกชิ้น ทีมงานสุภาพ เก็บงานเนี้ยบมาก บริการเรื่องยื่นกู้ธนาคารผ่านฉลุยเลยค่ะ',
    fullDetail: 'บ้านสวยตรงปก วัสดุเกรดพรีเมียม SCG แท้',
    rating: 5,
    createdAt: '2026-10-25'
  },
  {
    id: 'rev_04',
    name: 'คุณวรัญญู เอกอนันต์',
    role: 'แบบบ้านนอร์ดิก • อ.นิคมพัฒนา ระยอง',
    image: 'assets/images/house-nordic.jpg',
    text: 'ผมเป็นวิศวกรโรงงานในมาบตาพุด ค่อนข้างละเอียดเรื่องโครงสร้าง พอได้เห็นขั้นตอนการตอกเสาเข็มและการผูกเหล็กของ RMHome แล้วยอมรับเลยว่าได้มาตรฐานจริง คุมงบได้ไม่มีบานปลายแม้แต่บาทเดียวครับ',
    fullDetail: 'งานโครงสร้างมาตรฐานวิศวกรรมสากล มั่นคง แข็งแรง',
    rating: 5,
    createdAt: '2026-10-20'
  }
];

function getStoredReviews() {
  try {
    const raw = localStorage.getItem('rm_reviews');
    if (!raw) {
      localStorage.setItem('rm_reviews', JSON.stringify(DEFAULT_REVIEWS));
      return DEFAULT_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('rm_reviews', JSON.stringify(DEFAULT_REVIEWS));
      return DEFAULT_REVIEWS;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_REVIEWS;
  }
}

function saveReviews(items) {
  try {
    localStorage.setItem('rm_reviews', JSON.stringify(items));
    notifyContentUpdated('reviews');
  } catch (e) {
    console.error('Failed to save reviews:', e);
  }
}

function initReviewsCMS() {
  const form = document.getElementById('reviewAddForm');
  const fileInput = document.getElementById('reviewFileInput');
  const btnUpload = document.getElementById('btnUploadReviewImg');
  const imgInput = document.getElementById('newReviewImg');
  const previewBox = document.getElementById('newReviewPreviewBox');
  const previewImg = document.getElementById('newReviewPreviewImg');

  if (btnUpload && fileInput) {
    btnUpload.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          if (imgInput) imgInput.value = dataUrl;
          if (previewImg && previewBox) {
            previewImg.src = dataUrl;
            previewBox.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (imgInput) {
    imgInput.addEventListener('input', () => {
      const val = imgInput.value.trim();
      if (val && previewImg && previewBox) {
        previewImg.src = val;
        previewBox.style.display = 'block';
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('newReviewName').value.trim();
      const role = document.getElementById('newReviewRole').value.trim();
      let image = imgInput ? imgInput.value.trim() : '';
      if (!image) image = 'assets/images/quality-engineer.jpg';
      const text = document.getElementById('newReviewText').value.trim();
      const fullDetail = document.getElementById('newReviewFull') ? document.getElementById('newReviewFull').value.trim() : '';

      const newRev = {
        id: 'rev_' + Date.now(),
        name,
        role,
        image,
        text,
        fullDetail: fullDetail || text,
        rating: 5,
        createdAt: new Date().toLocaleDateString('th-TH')
      };

      const list = getStoredReviews();
      list.unshift(newRev);
      saveReviews(list);

      form.reset();
      if (previewBox) previewBox.style.display = 'none';

      renderAdminReviewsList();
      alert(`✅ เพิ่มรีวิวของ "${name}" เรียบร้อยแล้ว!\n\nรีวิวจะปรากฏบนหน้าแรกของเว็บไซต์ทันทีแบบเรียลไทม์`);
    });
  }

  renderAdminReviewsList();
}

function saveSingleReviewFromCard(card, revId, isAutoSave = false) {
  const nameInput = card.querySelector('.edit-rev-name');
  const roleInput = card.querySelector('.edit-rev-role');
  const imgInput = card.querySelector('.edit-rev-image');
  const textInput = card.querySelector('.edit-rev-text');
  const statusSpan = card.querySelector('.rev-save-status');

  const list = getStoredReviews();
  const target = list.find(r => r.id === revId);
  if (!target) return;

  target.name = nameInput ? nameInput.value.trim() : target.name;
  target.role = roleInput ? roleInput.value.trim() : target.role;
  target.image = imgInput ? imgInput.value.trim() : target.image;
  target.text = textInput ? textInput.value.trim() : target.text;

  saveReviews(list);

  if (statusSpan) {
    statusSpan.textContent = isAutoSave ? 'บันทึกอัตโนมัติแล้ว ✓' : 'บันทึกสำเร็จ ✅';
    setTimeout(() => {
      statusSpan.textContent = '';
    }, 2000);
  }
}

function renderAdminReviewsList() {
  const container = document.getElementById('adminReviewsList');
  const badge = document.getElementById('reviewsCountBadge');
  const sidebarBadge = document.getElementById('sidebarReviewsBadge');
  const reviews = getStoredReviews();

  if (badge) badge.textContent = `${reviews.length} รีวิวในระบบ`;
  if (sidebarBadge) sidebarBadge.textContent = reviews.length;
  if (!container) return;

  container.innerHTML = '';
  if (reviews.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:2rem; color:#94a3b8; background:#f8fafc; border-radius:12px;">ยังไม่มีรีวิวในระบบ</div>`;
    return;
  }

  reviews.forEach((rev, idx) => {
    const card = document.createElement('div');
    card.className = 'review-edit-card';
    card.setAttribute('data-id', rev.id);

    card.innerHTML = `
      <div class="review-avatar-wrap">
        <img src="${escapeHtml(rev.image || 'assets/images/quality-engineer.jpg')}" alt="${escapeHtml(rev.name)}" class="review-avatar-img-el" onerror="this.src='assets/images/quality-engineer.jpg'">
      </div>
      <div class="review-edit-body">
        <div class="review-top-row">
          <div class="form-group">
            <label class="form-label">ชื่อ</label>
            <input type="text" class="form-control edit-rev-name" value="${escapeHtml(rev.name)}">
          </div>
          <div class="form-group">
            <label class="form-label">ตำแหน่ง</label>
            <input type="text" class="form-control edit-rev-role" value="${escapeHtml(rev.role)}">
          </div>
          <div class="review-order-del-box">
            <span class="review-order-badge">${idx + 1}</span>
            <button type="button" class="btn-trash-item btn-del-review" data-id="${rev.id}" data-name="${escapeHtml(rev.name)}" title="ลบรีวิวนี้">🗑️</button>
          </div>
        </div>

        <div class="form-group" style="margin-top:0.4rem;">
          <label class="form-label">รูปภาพ</label>
          <div class="input-with-button">
            <input type="text" class="form-control edit-rev-image" value="${escapeHtml(rev.image || '')}">
            <button type="button" class="btn-upload-file btn-upload-item-img">↑ อัพโหลด</button>
            <input type="file" class="file-upload-rev-hidden" accept="image/*" style="display:none;">
          </div>
        </div>

        <div class="review-thumb-preview">
          <img src="${escapeHtml(rev.image || 'assets/images/quality-engineer.jpg')}" alt="Preview" class="review-thumb-preview-el" onerror="this.src='assets/images/quality-engineer.jpg'">
        </div>

        <div class="form-group" style="margin-top:0.4rem;">
          <label class="form-label">รีวิว</label>
          <textarea class="form-control edit-rev-text" rows="3">${escapeHtml(rev.text)}</textarea>
        </div>

        <div class="review-bottom-actions">
          <span class="save-status-indicator rev-save-status"></span>
          <button type="button" class="btn-save-inline btn-save-single-review" data-id="${rev.id}">
            💾 บันทึกการแก้ไข
          </button>
        </div>
      </div>
    `;

    const btnUpload = card.querySelector('.btn-upload-item-img');
    const fileInput = card.querySelector('.file-upload-rev-hidden');
    const imgInput = card.querySelector('.edit-rev-image');
    const avatarEl = card.querySelector('.review-avatar-img-el');
    const thumbEl = card.querySelector('.review-thumb-preview-el');

    if (btnUpload && fileInput) {
      btnUpload.onclick = () => fileInput.click();
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target.result;
            if (imgInput) imgInput.value = dataUrl;
            if (avatarEl) avatarEl.src = dataUrl;
            if (thumbEl) thumbEl.src = dataUrl;
            saveSingleReviewFromCard(card, rev.id);
          };
          reader.readAsDataURL(file);
        }
      };
    }

    if (imgInput) {
      imgInput.oninput = () => {
        const val = imgInput.value.trim();
        if (avatarEl) avatarEl.src = val;
        if (thumbEl) thumbEl.src = val;
      };
    }

    const btnSave = card.querySelector('.btn-save-single-review');
    if (btnSave) {
      btnSave.onclick = () => {
        saveSingleReviewFromCard(card, rev.id);
      };
    }

    const inputs = card.querySelectorAll('input, textarea');
    inputs.forEach(inp => {
      inp.onblur = () => {
        saveSingleReviewFromCard(card, rev.id, true);
      };
    });

    const btnDel = card.querySelector('.btn-del-review');
    if (btnDel) {
      btnDel.onclick = () => {
        if (confirm(`คุณต้องการลบรีวิวของ "${rev.name}" ใช่หรือไม่?\n\n(รีวิวจะหายไปจากหน้าเว็บทันทีแบบเรียลไทม์)`)) {
          let list = getStoredReviews().filter(r => r.id !== rev.id);
          saveReviews(list);
          renderAdminReviewsList();
        }
      };
    }

    container.appendChild(card);
  });
}

/* ==========================================================================
   8. Services CMS (บริการครบวงจร)
   ========================================================================== */
const DEFAULT_SERVICES = [
  {
    id: 'srv_01',
    title: 'บริการ สำรวจหน้างาน',
    freeTag: 'ฟรี',
    desc: 'สำรวจฟรีไม่มีค่าใช้จ่าย'
  },
  {
    id: 'srv_02',
    title: 'บริการ ยื่นกู้',
    freeTag: 'ฟรี',
    desc: 'ลดความยุ่งยาก ประหยัดเวลา พร้อมดูแลจนดำเนินการเสร็จ'
  },
  {
    id: 'srv_03',
    title: 'บริการ ขออนุญาตปลูกสร้าง',
    freeTag: 'ฟรี',
    desc: 'อำนวยความสะดวกทุกขั้นตอน พร้อมยื่นเอกสารตามกฎหมาย'
  },
  {
    id: 'srv_04',
    title: 'บริการ ยื่นขอน้ำปะปา-ไฟฟ้า(ชั่วคราว)',
    freeTag: 'ฟรี',
    desc: 'ดำเนินการยื่นเอกสารและประสานงานกับหน่วยงานราชการให้ครบ จบในที่เดียว'
  }
];

function getStoredServices() {
  try {
    const raw = localStorage.getItem('rm_services');
    if (!raw) {
      localStorage.setItem('rm_services', JSON.stringify(DEFAULT_SERVICES));
      return DEFAULT_SERVICES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('rm_services', JSON.stringify(DEFAULT_SERVICES));
      return DEFAULT_SERVICES;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_SERVICES;
  }
}

function saveServices(items) {
  try {
    localStorage.setItem('rm_services', JSON.stringify(items));
    notifyContentUpdated('services');
  } catch (e) {
    console.error('Failed to save services:', e);
  }
}

function initServicesCMS() {
  const form = document.getElementById('serviceAddForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('newServiceTitle').value.trim();
      const tag = document.getElementById('newServiceTag').value.trim() || 'ฟรี';
      const desc = document.getElementById('newServiceDesc').value.trim();

      const newSrv = {
        id: 'srv_' + Date.now(),
        title,
        freeTag: tag,
        desc
      };

      const items = getStoredServices();
      items.push(newSrv);
      saveServices(items);

      form.reset();
      renderAdminServicesList();
      alert(`✅ เพิ่มบริการ "${title}" เรียบร้อยแล้ว!`);
    });
  }

  renderAdminServicesList();
}

function renderAdminServicesList() {
  const container = document.getElementById('adminServicesList');
  const badge = document.getElementById('servicesCountBadge');
  const services = getStoredServices();

  if (badge) badge.textContent = `${services.length} บริการ`;
  if (!container) return;

  container.innerHTML = '';
  services.forEach((srv, idx) => {
    const card = document.createElement('div');
    card.className = 'cms-item-card';

    card.innerHTML = `
      <div class="cms-item-header">
        <span class="cms-item-header-title">🛠️ บริการที่ ${idx + 1}</span>
        <button type="button" class="btn-trash-item btn-del-srv" data-id="${srv.id}" title="ลบบริการนี้">🗑️</button>
      </div>
      <div class="form-grid-2col" style="margin-bottom:0.75rem;">
        <div class="form-group">
          <label class="form-label">ชื่อบริการ</label>
          <input type="text" class="form-control edit-srv-title" value="${escapeHtml(srv.title)}">
        </div>
        <div class="form-group">
          <label class="form-label">ป้ายกำกับ</label>
          <input type="text" class="form-control edit-srv-tag" value="${escapeHtml(srv.freeTag || 'ฟรี')}">
        </div>
        <div class="form-group full-width">
          <label class="form-label">รายละเอียดบริการ</label>
          <textarea class="form-control edit-srv-desc" rows="2">${escapeHtml(srv.desc)}</textarea>
        </div>
      </div>
      <div class="review-bottom-actions">
        <span class="save-status-indicator srv-save-status"></span>
        <button type="button" class="btn-save-inline btn-save-srv" data-id="${srv.id}">
          💾 บันทึกบริการนี้
        </button>
      </div>
    `;

    const btnSave = card.querySelector('.btn-save-srv');
    if (btnSave) {
      btnSave.onclick = () => saveSingleService(card, srv.id);
    }

    const inputs = card.querySelectorAll('input, textarea');
    inputs.forEach(inp => {
      inp.onblur = () => saveSingleService(card, srv.id, true);
    });

    const btnDel = card.querySelector('.btn-del-srv');
    if (btnDel) {
      btnDel.onclick = () => {
        if (confirm(`คุณต้องการลบบริการ "${srv.title}" ใช่หรือไม่?`)) {
          let list = getStoredServices().filter(s => s.id !== srv.id);
          saveServices(list);
          renderAdminServicesList();
        }
      };
    }

    container.appendChild(card);
  });
}

function saveSingleService(card, srvId, isAutoSave = false) {
  const titleInput = card.querySelector('.edit-srv-title');
  const tagInput = card.querySelector('.edit-srv-tag');
  const descInput = card.querySelector('.edit-srv-desc');
  const statusSpan = card.querySelector('.srv-save-status');

  const list = getStoredServices();
  const target = list.find(s => s.id === srvId);
  if (!target) return;

  target.title = titleInput ? titleInput.value.trim() : target.title;
  target.freeTag = tagInput ? tagInput.value.trim() : target.freeTag;
  target.desc = descInput ? descInput.value.trim() : target.desc;

  saveServices(list);

  if (statusSpan) {
    statusSpan.textContent = isAutoSave ? 'บันทึกอัตโนมัติแล้ว ✓' : 'บันทึกสำเร็จ ✅';
    setTimeout(() => { statusSpan.textContent = ''; }, 2000);
  }
}

/* ==========================================================================
   9. Standards CMS (มาตรฐานวิศวกรรม)
   ========================================================================== */
const DEFAULT_STANDARDS = [
  {
    id: 'std_01',
    title: 'ฐานรากตอกเสาเข็มลึกถึงชั้นดินดาน (Solid Soil Layer)',
    desc: 'คำนวณกำลังรับน้ำหนักตามผลเจาะสำรวจดินในระยอง มั่นใจบ้านไม่ทรุดตัว'
  },
  {
    id: 'std_02',
    title: 'คอนกรีตผสมเสร็จแบรนด์ชั้นนำ (CPAC / SCG Standard)',
    desc: 'ควบคุมความข้นเหลวและค่าความแข็งแรง (Cylinder Strength) มีใบรับรองทุกคันรถ'
  },
  {
    id: 'std_03',
    title: 'ระบบท่อและสายไฟร้อยท่อฝังผนัง 100%',
    desc: 'ใช้อุปกรณ์สายไฟมาตรฐาน มอก. (Thai Yazaki / BCC) พร้อมระบบตัดไฟรั่วอัตโนมัติ Safe-T-Cut'
  },
  {
    id: 'std_04',
    title: 'รายงานความคืบหน้าแบบเรียลไทม์ผ่าน Mobile Cloud',
    desc: 'ลูกค้าไม่ต้องลางานมาดูไซต์งานเอง เราอัปเดตภาพและวิดีโอ 360 องศาทุกสัปดาห์'
  }
];

function getStoredStandards() {
  try {
    const raw = localStorage.getItem('rm_standards');
    if (!raw) {
      localStorage.setItem('rm_standards', JSON.stringify(DEFAULT_STANDARDS));
      return DEFAULT_STANDARDS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('rm_standards', JSON.stringify(DEFAULT_STANDARDS));
      return DEFAULT_STANDARDS;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_STANDARDS;
  }
}

function saveStandards(items) {
  try {
    localStorage.setItem('rm_standards', JSON.stringify(items));
    notifyContentUpdated('standards');
  } catch (e) {
    console.error('Failed to save standards:', e);
  }
}

function initStandardsCMS() {
  const form = document.getElementById('standardAddForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('newStandardTitle').value.trim();
      const desc = document.getElementById('newStandardDesc').value.trim();

      const newStd = {
        id: 'std_' + Date.now(),
        title,
        desc
      };

      const items = getStoredStandards();
      items.push(newStd);
      saveStandards(items);

      form.reset();
      renderAdminStandardsList();
      alert(`✅ เพิ่มมาตรฐาน "${title}" เรียบร้อยแล้ว!`);
    });
  }

  renderAdminStandardsList();
}

function renderAdminStandardsList() {
  const container = document.getElementById('adminStandardsList');
  const badge = document.getElementById('standardsCountBadge');
  const standards = getStoredStandards();

  if (badge) badge.textContent = `${standards.length} รายการ`;
  if (!container) return;

  container.innerHTML = '';
  standards.forEach((std, idx) => {
    const card = document.createElement('div');
    card.className = 'cms-item-card';

    card.innerHTML = `
      <div class="cms-item-header">
        <span class="cms-item-header-title">🏗️ มาตรฐานที่ ${idx + 1}</span>
        <button type="button" class="btn-trash-item btn-del-std" data-id="${std.id}" title="ลบมาตรฐานนี้">🗑️</button>
      </div>
      <div class="form-grid-2col" style="margin-bottom:0.75rem;">
        <div class="form-group full-width">
          <label class="form-label">หัวข้อมาตรฐาน</label>
          <input type="text" class="form-control edit-std-title" value="${escapeHtml(std.title)}">
        </div>
        <div class="form-group full-width">
          <label class="form-label">รายละเอียดและเกณฑ์ QC</label>
          <textarea class="form-control edit-std-desc" rows="2">${escapeHtml(std.desc)}</textarea>
        </div>
      </div>
      <div class="review-bottom-actions">
        <span class="save-status-indicator std-save-status"></span>
        <button type="button" class="btn-save-inline btn-save-std" data-id="${std.id}">
          💾 บันทึกมาตรฐานนี้
        </button>
      </div>
    `;

    const btnSave = card.querySelector('.btn-save-std');
    if (btnSave) {
      btnSave.onclick = () => saveSingleStandard(card, std.id);
    }

    const inputs = card.querySelectorAll('input, textarea');
    inputs.forEach(inp => {
      inp.onblur = () => saveSingleStandard(card, std.id, true);
    });

    const btnDel = card.querySelector('.btn-del-std');
    if (btnDel) {
      btnDel.onclick = () => {
        if (confirm(`คุณต้องการลบมาตรฐาน "${std.title}" ใช่หรือไม่?`)) {
          let list = getStoredStandards().filter(s => s.id !== std.id);
          saveStandards(list);
          renderAdminStandardsList();
        }
      };
    }

    container.appendChild(card);
  });
}

function saveSingleStandard(card, stdId, isAutoSave = false) {
  const titleInput = card.querySelector('.edit-std-title');
  const descInput = card.querySelector('.edit-std-desc');
  const statusSpan = card.querySelector('.std-save-status');

  const list = getStoredStandards();
  const target = list.find(s => s.id === stdId);
  if (!target) return;

  target.title = titleInput ? titleInput.value.trim() : target.title;
  target.desc = descInput ? descInput.value.trim() : target.desc;

  saveStandards(list);

  if (statusSpan) {
    statusSpan.textContent = isAutoSave ? 'บันทึกอัตโนมัติแล้ว ✓' : 'บันทึกสำเร็จ ✅';
    setTimeout(() => { statusSpan.textContent = ''; }, 2000);
  }
}

/* ==========================================================================
   10. TikTok Video Showcase CMS (จัดการคลิป TikTok & วิดีโอผลงานจริง)
   ========================================================================== */
const DEFAULT_TIKTOK_CLIPS = [
  {
    id: 'tiktok_01',
    title: '🏡 พาชมแบบบ้านสไตล์นอร์ดิกสร้างเสร็จจริง อ.ปลวกแดง ระยอง คุมงบได้ 100% สเปกวิศวกร กว.',
    url: 'https://www.tiktok.com/@rm.home.design.co/video/7312345678901234567',
    videoId: '7312345678901234567',
    tag: 'พาชมบ้านจริง',
    author: '@rm.home.design.co',
    createdAt: '2026-11-01'
  },
  {
    id: 'tiktok_02',
    title: '🌴 ส่งมอบบ้านพูลวิลล่าสไตล์โมเดิร์น พร้อมสระว่ายน้ำระบบเกลือ อ.แกลง ระยอง สวยตรงปก 100%',
    url: 'https://www.tiktok.com/@rm.home.design.co/video/7323456789012345678',
    videoId: '7323456789012345678',
    tag: 'ส่งมอบบ้าน',
    author: '@rm.home.design.co',
    createdAt: '2026-11-02'
  },
  {
    id: 'tiktok_03',
    title: '👷‍♂️ วิศวกรตรวจงานตอกเสาเข็มลึกถึงชั้นดินดาน (Solid Soil Layer) มั่นใจบ้านไม่ทรุดตัวในระยอง',
    url: 'https://www.tiktok.com/@rm.home.design.co/video/7334567890123456789',
    videoId: '7334567890123456789',
    tag: 'งานวิศวกรรม',
    author: '@rm.home.design.co',
    createdAt: '2026-11-03'
  }
];

function extractTikTokVideoId(url) {
  if (!url) return '';
  url = url.trim();
  if (/^\d{15,22}$/.test(url)) return url;
  const matchVideo = url.match(/\/video\/(\d+)/);
  if (matchVideo && matchVideo[1]) return matchVideo[1];
  const matchItem = url.match(/item_id=(\d+)/);
  if (matchItem && matchItem[1]) return matchItem[1];
  const matchV = url.match(/\/v\/(\d+)/);
  if (matchV && matchV[1]) return matchV[1];
  return '';
}

function getStoredTikTokClips() {
  try {
    const raw = localStorage.getItem('rm_tiktok_clips');
    if (!raw) {
      localStorage.setItem('rm_tiktok_clips', JSON.stringify(DEFAULT_TIKTOK_CLIPS));
      return DEFAULT_TIKTOK_CLIPS;
    }
    let parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('rm_tiktok_clips', JSON.stringify(DEFAULT_TIKTOK_CLIPS));
      return DEFAULT_TIKTOK_CLIPS;
    }
    return parsed.map(c => {
      if (c.author === '@RMHomeRayong') c.author = '@rm.home.design.co';
      if (c.url && c.url.includes('rmhomerayong')) c.url = c.url.replace('rmhomerayong', 'rm.home.design.co');
      return c;
    });
  } catch (e) {
    return DEFAULT_TIKTOK_CLIPS;
  }
}

function saveTikTokClips(clips) {
  try {
    localStorage.setItem('rm_tiktok_clips', JSON.stringify(clips));
    notifyContentUpdated('tiktok');
    window.dispatchEvent(new CustomEvent('tiktokUpdated', { detail: { clips } }));
    if (window.CloudSync && typeof window.CloudSync.syncAll === 'function') {
      window.CloudSync.syncAll();
    }
  } catch (e) {
    console.error('Failed to save tiktok clips:', e);
  }
}

function initTikTokCMS() {
  const form = document.getElementById('tiktokAddForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const urlInput = document.getElementById('newTikTokUrl');
      const titleInput = document.getElementById('newTikTokTitle');
      const tagInput = document.getElementById('newTikTokTag');
      const authorInput = document.getElementById('newTikTokAuthor');

      const rawUrl = urlInput ? urlInput.value.trim() : '';
      const title = titleInput ? titleInput.value.trim() : '';
      const tag = (tagInput && tagInput.value.trim()) ? tagInput.value.trim() : 'คลิปผลงานจริง';
      const author = (authorInput && authorInput.value.trim()) ? authorInput.value.trim() : '@rm.home.design.co';

      if (!rawUrl) {
        alert('กรุณากรอกลิงก์คลิป TikTok');
        return;
      }
      if (!title) {
        alert('กรุณากรอกชื่อคลิปหรือคำอธิบาย');
        return;
      }

      const videoId = extractTikTokVideoId(rawUrl);

      const newClip = {
        id: 'tiktok_' + Date.now(),
        title,
        url: rawUrl,
        videoId: videoId,
        tag,
        author,
        createdAt: new Date().toISOString().split('T')[0]
      };

      const list = getStoredTikTokClips();
      list.unshift(newClip);
      saveTikTokClips(list);

      form.reset();
      if (authorInput) authorInput.value = '@rm.home.design.co';
      renderAdminTikTokList();
      alert(`✅ เพิ่มคลิป TikTok "${title}" เรียบร้อยแล้ว! อัปเดตขึ้นหน้าแรกแบบ Real-time ทันที`);
    });
  }

  // Cross-tab real-time sync
  window.addEventListener('storage', (e) => {
    if (e.key === 'rm_tiktok_clips') {
      renderAdminTikTokList();
    }
  });

  renderAdminTikTokList();
}

function renderAdminTikTokList() {
  const container = document.getElementById('adminTikTokList');
  const badge = document.getElementById('tiktokCountBadge');
  const sidebarBadge = document.getElementById('sidebarTikTokBadge');
  const clips = getStoredTikTokClips();

  if (badge) badge.textContent = `${clips.length} คลิป`;
  if (sidebarBadge) sidebarBadge.textContent = clips.length.toString();
  if (!container) return;

  container.innerHTML = '';

  if (clips.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; color: #64748b;">
        <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📱</div>
        <p style="font-size: 1rem; font-weight: 600; color: #334155; margin-bottom: 0.25rem;">ยังไม่มีคลิป TikTok ในระบบ</p>
        <p style="font-size: 0.85rem;">คุณสามารถคัดลอกลิงก์จากแอป TikTok แล้วนำมาวางในแบบฟอร์มด้านบนเพื่อเพิ่มคลิปได้ทันที</p>
      </div>
    `;
    return;
  }

  clips.forEach((clip, idx) => {
    const card = document.createElement('div');
    card.className = 'portfolio-admin-card';
    card.style.cssText = 'border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; background:#fff; display:flex; flex-direction:column; box-shadow:0 2px 6px rgba(0,0,0,0.04);';

    const videoId = clip.videoId || extractTikTokVideoId(clip.url);
    const clipUrl = clip.url || (videoId ? `https://www.tiktok.com/@rm.home.design.co/video/${videoId}` : '#');
    const previewSrc = videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : '';

    card.innerHTML = `
      <div style="background:#092518; color:#fff; padding:0.75rem 1rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(212,175,55,0.2);">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:0.85rem; font-weight:700; color:#d4af37;">คลิปที่ ${idx + 1}</span>
          <span style="background:rgba(34,211,238,0.15); color:#22d3ee; font-size:0.72rem; padding:0.15rem 0.5rem; border-radius:10px; border:1px solid rgba(34,211,238,0.3);">
            ${escapeHtml(clip.tag || 'คลิปผลงาน')}
          </span>
        </div>
        <button type="button" class="btn-trash-item btn-del-tiktok" data-id="${clip.id}" title="ลบคลิปนี้ออกจากหน้าเว็บ" style="background:#ef4444; color:#fff; border:none; padding:0.25rem 0.6rem; border-radius:6px; cursor:pointer; font-size:0.78rem; font-weight:600;">
          🗑️ ลบคลิป
        </button>
      </div>
      
      <div style="padding:1rem; flex:1; display:flex; flex-direction:column; gap:0.75rem;">
        ${videoId ? `
          <div style="width:100%; height:260px; background:#000; border-radius:8px; overflow:hidden; position:relative;">
            <iframe 
              src="${previewSrc}" 
              title="${escapeHtml(clip.title)}" 
              loading="lazy" 
              style="width:100%; height:100%; border:none;" 
              allowfullscreen>
            </iframe>
          </div>
        ` : `
          <div style="padding:1.5rem 1rem; background:#f1f5f9; border-radius:8px; text-align:center; color:#64748b; font-size:0.85rem;">
            🔗 ลิงก์คลิป: <a href="${clipUrl}" target="_blank" rel="noopener" style="color:#0284c7; word-break:break-all;">${clipUrl}</a>
          </div>
        `}

        <div class="form-group" style="margin:0;">
          <label class="form-label" style="font-size:0.8rem; margin-bottom:0.25rem;">ชื่อคลิป / แคปชัน</label>
          <input type="text" class="form-control edit-tiktok-title" value="${escapeHtml(clip.title)}" style="font-size:0.88rem;">
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
          <div class="form-group" style="margin:0;">
            <label class="form-label" style="font-size:0.78rem; margin-bottom:0.25rem;">แท็ก / หมวดหมู่</label>
            <input type="text" class="form-control edit-tiktok-tag" value="${escapeHtml(clip.tag || '')}" style="font-size:0.82rem;">
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label" style="font-size:0.78rem; margin-bottom:0.25rem;">เครดิตผู้ลง</label>
            <input type="text" class="form-control edit-tiktok-author" value="${escapeHtml(clip.author || '@rm.home.design.co')}" style="font-size:0.82rem;">
          </div>
        </div>

        <div class="form-group" style="margin:0;">
          <label class="form-label" style="font-size:0.78rem; margin-bottom:0.25rem;">URL คลิป TikTok</label>
          <input type="text" class="form-control edit-tiktok-url" value="${escapeHtml(clip.url || '')}" style="font-size:0.82rem; font-family:monospace;">
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:0.5rem; border-top:1px solid #f1f5f9;">
          <a href="${clipUrl}" target="_blank" rel="noopener" style="font-size:0.78rem; color:#0d5c3a; text-decoration:none; font-weight:600;">
            ▶ ทดสอบเปิดบน TikTok
          </a>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="save-status-indicator tiktok-save-status" style="font-size:0.75rem; color:#10b981;"></span>
            <button type="button" class="btn-save-inline btn-save-tiktok" data-id="${clip.id}" style="background:#0e3d29; color:#fff; border:none; padding:0.35rem 0.85rem; border-radius:6px; font-size:0.8rem; cursor:pointer; font-weight:600;">
              💾 บันทึกแก้ไข
            </button>
          </div>
        </div>
      </div>
    `;

    const btnSave = card.querySelector('.btn-save-tiktok');
    if (btnSave) {
      btnSave.onclick = () => saveSingleTikTokClip(card, clip.id);
    }

    const inputs = card.querySelectorAll('input');
    inputs.forEach(inp => {
      inp.onblur = () => saveSingleTikTokClip(card, clip.id, true);
    });

    const btnDel = card.querySelector('.btn-del-tiktok');
    if (btnDel) {
      btnDel.onclick = () => {
        if (confirm(`คุณต้องการลบคลิป TikTok "${clip.title}" ใช่หรือไม่?\n(ระบบจะลบออกจากหน้าแรกของเว็บทันทีแบบ Real-time)`)) {
          let list = getStoredTikTokClips().filter(item => item.id !== clip.id);
          saveTikTokClips(list);
          renderAdminTikTokList();
        }
      };
    }

    container.appendChild(card);
  });
}

function saveSingleTikTokClip(card, clipId, isAutoSave = false) {
  const titleInput = card.querySelector('.edit-tiktok-title');
  const tagInput = card.querySelector('.edit-tiktok-tag');
  const authorInput = card.querySelector('.edit-tiktok-author');
  const urlInput = card.querySelector('.edit-tiktok-url');
  const statusSpan = card.querySelector('.tiktok-save-status');

  const list = getStoredTikTokClips();
  const target = list.find(item => item.id === clipId);
  if (!target) return;

  target.title = titleInput ? titleInput.value.trim() : target.title;
  target.tag = tagInput ? tagInput.value.trim() : target.tag;
  target.author = authorInput ? authorInput.value.trim() : target.author;
  if (urlInput && urlInput.value.trim() !== target.url) {
    target.url = urlInput.value.trim();
    target.videoId = extractTikTokVideoId(target.url);
  }

  saveTikTokClips(list);

  if (statusSpan) {
    statusSpan.textContent = isAutoSave ? 'บันทึกแล้ว ✓' : 'บันทึกสำเร็จ ✅';
    setTimeout(() => { statusSpan.textContent = ''; }, 2000);
  }
}

/* ==========================================================================
   11. Workflow CMS (ขั้นตอนงานสร้าง)
   ========================================================================== */
const DEFAULT_WORKFLOW = [
  {
    id: 'wf_01',
    step: '01',
    title: 'ปรึกษา & สำรวจที่ดินระยอง ฟรี',
    desc: 'ทีมสถาปนิกและวิศวกรเข้าสำรวจสภาพดิน ทิศทางแดด ลม และผังเมืองระยอง เพื่อประเมินความเป็นไปได้'
  },
  {
    id: 'wf_02',
    step: '02',
    title: 'ออกแบบ 3D & ปรับฟังก์ชัน',
    desc: 'เขียนแบบบ้าน 3D เสมือนจริง ปรับแก้ตามความพึงพอใจและฟังก์ชันการใช้งานของครอบครัวคุณ'
  },
  {
    id: 'wf_03',
    step: '03',
    title: 'ทำใบเสนอราคา BOQ ละเอียด',
    desc: 'แจกแจงรายการวัสดุและค่าแรงชัดเจนทุกตารางนิ้ว ไม่มีหมกเม็ด ก่อนลงนามทำสัญญามาตรฐาน'
  },
  {
    id: 'wf_04',
    step: '04',
    title: 'ยื่นขออนุญาต & ยื่นกู้ธนาคาร',
    desc: 'ทีมงานจัดการเอกสารราชการ ยื่นขออนุญาตก่อสร้าง และยื่นกู้สถาบันการเงินให้จนผ่านอนุมัติ'
  },
  {
    id: 'wf_05',
    step: '05',
    title: 'ลงมือก่อสร้างตามมาตรฐาน QC',
    desc: 'วิศวกรและโฟร์แมนควบคุมงานทุกวัน ส่งรายงานความคืบหน้าภาพถ่ายและวิดีโอ 360 องศาให้ท่านทราบ'
  },
  {
    id: 'wf_06',
    step: '06',
    title: 'ตรวจรับ & ส่งมอบบ้านพร้อมอยู่',
    desc: 'ทำความสะอาดแบบ Big Cleaning ส่งมอบกุญแจ ใบรับประกันโครงสร้าง 20 ปี และของขวัญขึ้นบ้านใหม่'
  }
];

function getStoredWorkflow() {
  try {
    const raw = localStorage.getItem('rm_workflow');
    if (!raw) {
      localStorage.setItem('rm_workflow', JSON.stringify(DEFAULT_WORKFLOW));
      return DEFAULT_WORKFLOW;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('rm_workflow', JSON.stringify(DEFAULT_WORKFLOW));
      return DEFAULT_WORKFLOW;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_WORKFLOW;
  }
}

function saveWorkflow(items) {
  try {
    localStorage.setItem('rm_workflow', JSON.stringify(items));
    notifyContentUpdated('workflow');
  } catch (e) {
    console.error('Failed to save workflow:', e);
  }
}

function initWorkflowCMS() {
  renderAdminWorkflowList();
}

function renderAdminWorkflowList() {
  const container = document.getElementById('adminWorkflowList');
  const badge = document.getElementById('workflowCountBadge');
  const workflow = getStoredWorkflow();

  if (badge) badge.textContent = `${workflow.length} ขั้นตอน`;
  if (!container) return;

  container.innerHTML = '';
  workflow.forEach((wf, idx) => {
    const card = document.createElement('div');
    card.className = 'cms-item-card';

    card.innerHTML = `
      <div class="cms-item-header">
        <span class="cms-item-header-title">📋 ขั้นตอนที่ ${escapeHtml(wf.step || (idx + 1).toString())}</span>
      </div>
      <div class="form-grid-2col" style="margin-bottom:0.75rem;">
        <div class="form-group">
          <label class="form-label">หมายเลขสเต็ป</label>
          <input type="text" class="form-control edit-wf-step" value="${escapeHtml(wf.step || (idx + 1).toString())}">
        </div>
        <div class="form-group">
          <label class="form-label">ชื่อขั้นตอน</label>
          <input type="text" class="form-control edit-wf-title" value="${escapeHtml(wf.title)}">
        </div>
        <div class="form-group full-width">
          <label class="form-label">รายละเอียดขั้นตอน</label>
          <textarea class="form-control edit-wf-desc" rows="2">${escapeHtml(wf.desc)}</textarea>
        </div>
      </div>
      <div class="review-bottom-actions">
        <span class="save-status-indicator wf-save-status"></span>
        <button type="button" class="btn-save-inline btn-save-wf" data-id="${wf.id}">
          💾 บันทึกขั้นตอนนี้
        </button>
      </div>
    `;

    const btnSave = card.querySelector('.btn-save-wf');
    if (btnSave) {
      btnSave.onclick = () => saveSingleWorkflow(card, wf.id);
    }

    const inputs = card.querySelectorAll('input, textarea');
    inputs.forEach(inp => {
      inp.onblur = () => saveSingleWorkflow(card, wf.id, true);
    });

    container.appendChild(card);
  });
}

function saveSingleWorkflow(card, wfId, isAutoSave = false) {
  const stepInput = card.querySelector('.edit-wf-step');
  const titleInput = card.querySelector('.edit-wf-title');
  const descInput = card.querySelector('.edit-wf-desc');
  const statusSpan = card.querySelector('.wf-save-status');

  const list = getStoredWorkflow();
  const target = list.find(w => w.id === wfId);
  if (!target) return;

  target.step = stepInput ? stepInput.value.trim() : target.step;
  target.title = titleInput ? titleInput.value.trim() : target.title;
  target.desc = descInput ? descInput.value.trim() : target.desc;

  saveWorkflow(list);

  if (statusSpan) {
    statusSpan.textContent = isAutoSave ? 'บันทึกอัตโนมัติแล้ว ✓' : 'บันทึกสำเร็จ ✅';
    setTimeout(() => { statusSpan.textContent = ''; }, 2000);
  }
}

/* ==========================================================================
   12. Site Content CMS (แถบโปรโมชั่น & ข้อความหน้าเว็บหลัก)
   ========================================================================== */
const DEFAULT_SITE_INFO = {
  promoText: 'จองสร้างบ้านระยองวันนี้ ฟรี! ออกแบบ 3D + ค่าขออนุญาตก่อสร้าง + ส่วนลดสูงสุด 300,000 บ.',
  promoPill: 'PROMOTION 2026',
  phone: '091-299-8797',
  hours: 'เปิดบริการ: จันทร์ - เสาร์ (09:00 - 18:00 น.)',
  heroBadge: 'บริษัทรับสร้างบ้านอันดับ 1 ในจังหวัดระยอง และพื้นที่เศรษฐกิจ EEC',
  heroTitle: 'สร้างบ้านในฝันของคุณ<br><span class="hero-brand-gold">สร้างบ้านระยอง RMHome</span>',
  heroSubtitle: 'เนรมิตบ้านคุณภาพระดับพรีเมียม ผสานความหรูหราและอบอุ่นต้อนรับเทศกาลแห่งความสุข ออกแบบเฉพาะเพื่อชีวิตคุณ คุมงบได้ ไม่บานปลาย หมดปัญหาทิ้งงาน 100% พร้อมบริการยื่นกู้และขออนุญาตครบวงจร',
  navModelsLabel: 'บ้านอบอุ่นที่เรามอบให้คุณ',
  address: '41/5 หมู่ 4 หมู่บ้านหนองตะแบก ต.ตาขัน อ.บ้านค่าย จ.ระยอง 21120',
  lineId: 'sunny_anavin',
  lineUrl: 'https://line.me/ti/p/~sunny_anavin'
};

function getStoredSiteInfo() {
  try {
    const raw = localStorage.getItem('rm_site_info');
    if (!raw) {
      localStorage.setItem('rm_site_info', JSON.stringify(DEFAULT_SITE_INFO));
      return DEFAULT_SITE_INFO;
    }
    return { ...DEFAULT_SITE_INFO, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SITE_INFO;
  }
}

function saveSiteInfo(info) {
  try {
    localStorage.setItem('rm_site_info', JSON.stringify(info));
    notifyContentUpdated('site_info');
  } catch (e) {
    console.error('Failed to save site info:', e);
  }
}

function initSiteContentCMS() {
  const form = document.getElementById('siteContentForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const info = {
        promoText: document.getElementById('editPromoText').value.trim(),
        promoPill: document.getElementById('editPromoPill').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        hours: document.getElementById('editHours').value.trim(),
        lineId: (document.getElementById('editLineId') ? document.getElementById('editLineId').value.trim() : 'sunny_anavin'),
        lineUrl: (document.getElementById('editLineUrl') ? document.getElementById('editLineUrl').value.trim() : 'https://line.me/ti/p/~sunny_anavin'),
        navModelsLabel: document.getElementById('editNavModelsLabel').value.trim(),
        heroBadge: document.getElementById('editHeroBadge').value.trim(),
        heroTitle: document.getElementById('editHeroTitle').value.trim(),
        heroSubtitle: document.getElementById('editHeroSubtitle').value.trim()
      };

      saveSiteInfo(info);

      const feedback = document.getElementById('siteContentSaveFeedback');
      if (feedback) {
        feedback.style.display = 'inline';
        setTimeout(() => { feedback.style.display = 'none'; }, 2500);
      }
      alert('✅ บันทึกข้อความหน้าเว็บหลักและแถบโปรโมชั่นเรียบร้อยแล้ว!\n\nหน้าแรกจะแสดงข้อความใหม่ทันทีแบบเรียลไทม์');
    });
  }

  loadSiteContentForm();
}

function loadSiteContentForm() {
  const info = getStoredSiteInfo();
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setVal('editPromoText', info.promoText);
  setVal('editPromoPill', info.promoPill);
  setVal('editPhone', info.phone);
  setVal('editHours', info.hours);
  let currentLineId = info.lineId || 'sunny_anavin';
  let currentLineUrl = info.lineUrl || 'https://line.me/ti/p/~sunny_anavin';
  if (currentLineId === '@sunny_anavin') currentLineId = 'sunny_anavin';
  if (currentLineUrl.includes('@sunny_anavin')) currentLineUrl = 'https://line.me/ti/p/~sunny_anavin';
  setVal('editLineId', currentLineId);
  setVal('editLineUrl', currentLineUrl);
  setVal('editNavModelsLabel', info.navModelsLabel);
  setVal('editHeroBadge', info.heroBadge);
  setVal('editHeroTitle', info.heroTitle);
  setVal('editHeroSubtitle', info.heroSubtitle);
}

/* ==========================================================================
   13. Calculator Settings CMS (อัตราค่าก่อสร้าง)
   ========================================================================== */
const DEFAULT_CALC_SETTINGS = {
  standard: 15500,
  premium: 18500,
  luxury: 22500,
  pool: 450000,
  smart: 220000,
  interior: 3500
};

function getStoredCalculatorSettings() {
  try {
    const raw = localStorage.getItem('rm_calculator_settings');
    if (!raw) {
      localStorage.setItem('rm_calculator_settings', JSON.stringify(DEFAULT_CALC_SETTINGS));
      return DEFAULT_CALC_SETTINGS;
    }
    return { ...DEFAULT_CALC_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_CALC_SETTINGS;
  }
}

function saveCalculatorSettings(settings) {
  try {
    localStorage.setItem('rm_calculator_settings', JSON.stringify(settings));
    notifyContentUpdated('calculator');
  } catch (e) {
    console.error('Failed to save calc settings:', e);
  }
}

function initCalculatorCMS() {
  const form = document.getElementById('calculatorSettingsForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const settings = {
        standard: parseInt(document.getElementById('calcRateStandard').value, 10) || 15500,
        premium: parseInt(document.getElementById('calcRatePremium').value, 10) || 18500,
        luxury: parseInt(document.getElementById('calcRateLuxury').value, 10) || 22500,
        pool: parseInt(document.getElementById('calcCostPool').value, 10) || 450000,
        smart: parseInt(document.getElementById('calcCostSmart').value, 10) || 220000,
        interior: parseInt(document.getElementById('calcRateInterior').value, 10) || 3500
      };

      saveCalculatorSettings(settings);

      const feedback = document.getElementById('calcSettingsSaveFeedback');
      if (feedback) {
        feedback.style.display = 'inline';
        setTimeout(() => { feedback.style.display = 'none'; }, 2500);
      }
      alert('✅ บันทึกอัตราคำนวณงบก่อสร้างเรียบร้อยแล้ว!');
    });
  }

  loadCalculatorSettingsForm();
}

function loadCalculatorSettingsForm() {
  const s = getStoredCalculatorSettings();
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };
  setVal('calcRateStandard', s.standard);
  setVal('calcRatePremium', s.premium);
  setVal('calcRateLuxury', s.luxury);
  setVal('calcCostPool', s.pool);
  setVal('calcCostSmart', s.smart);
  setVal('calcRateInterior', s.interior);
}

/* ==========================================================================
   14. Service Areas CMS (พื้นที่ให้บริการ)
   ========================================================================== */
const DEFAULT_SERVICE_AREAS = {
  provinces: 'ชลบุรี · จันทบุรี · ตราด · ปราจีนบุรี · ฉะเชิงเทรา · สระแก้ว',
  districts: [
    'อำเภอเมืองระยอง (เนินพระ, เชิงเนิน, ตะพง, เพ)',
    'อำเภอบ้านฉาง (ใกล้สนามบินอู่ตะเภา)',
    'อำเภอปลวกแดง (โซนนิคมอีสเทิร์นซีบอร์ด)',
    'อำเภอนิคมพัฒนา (โซนนิคม WHA, อมตะ)',
    'อำเภอแกลง (โซนแหลมแม่พิมพ์, ปากน้ำประแส)',
    'อำเภอบ้านค่าย',
    'อำเภอวังจันทร์',
    'โซนหาดแม่รำพึง & สวนสน'
  ]
};

function getStoredServiceAreas() {
  try {
    const raw = localStorage.getItem('rm_service_areas');
    if (!raw) {
      localStorage.setItem('rm_service_areas', JSON.stringify(DEFAULT_SERVICE_AREAS));
      return DEFAULT_SERVICE_AREAS;
    }
    return { ...DEFAULT_SERVICE_AREAS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SERVICE_AREAS;
  }
}

function saveServiceAreas(areas) {
  try {
    localStorage.setItem('rm_service_areas', JSON.stringify(areas));
    notifyContentUpdated('areas');
  } catch (e) {
    console.error('Failed to save service areas:', e);
  }
}

function initAreasCMS() {
  const form = document.getElementById('areasSettingsForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const provinces = document.getElementById('editAreasProvinces').value.trim();
      const rawDistricts = document.getElementById('editAreasDistricts').value.trim();
      const districts = rawDistricts.split('\n').map(d => d.trim()).filter(d => d.length > 0);

      saveServiceAreas({
        provinces,
        districts
      });

      const feedback = document.getElementById('areasSaveFeedback');
      if (feedback) {
        feedback.style.display = 'inline';
        setTimeout(() => { feedback.style.display = 'none'; }, 2500);
      }
      alert('✅ บันทึกข้อมูลพื้นที่ให้บริการเรียบร้อยแล้ว!');
    });
  }

  loadAreasSettingsForm();
}

function loadAreasSettingsForm() {
  const a = getStoredServiceAreas();
  const provEl = document.getElementById('editAreasProvinces');
  const distEl = document.getElementById('editAreasDistricts');
  if (provEl) provEl.value = a.provinces || '';
  if (distEl) distEl.value = Array.isArray(a.districts) ? a.districts.join('\n') : '';
}

/* ==========================================================================
   15. Tab Admin Users Integration
   ========================================================================== */
function initTabAdminUsers() {
  const form = document.getElementById('tabAddNewAdminForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('tabNewAdminUsername');
      const passwordInput = document.getElementById('tabNewAdminPassword');
      const roleSelect = document.getElementById('tabNewAdminRole');

      const username = usernameInput ? usernameInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';
      const role = roleSelect ? roleSelect.value : 'แอดมินทั่วไป';

      if (!username || !password) {
        alert('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
        return;
      }

      const currentUsers = getAdminUsers();
      if (currentUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        alert(`ชื่อผู้ใช้ "${username}" มีอยู่ในระบบแล้ว กรุณาเลือกชื่ออื่น`);
        return;
      }

      currentUsers.push({
        username,
        password,
        role,
        isMaster: false,
        createdAt: new Date().toLocaleDateString('th-TH')
      });

      saveAdminUsers(currentUsers);
      form.reset();
      renderTabAdminUsersList();
      alert(`✅ เพิ่มบัญชีแอดมิน "${username}" สำเร็จเรียบร้อยแล้ว!`);
    });
  }

  renderTabAdminUsersList();
}

function renderTabAdminUsersList() {
  const tbody = document.getElementById('tabAdminUsersTableBody');
  if (!tbody) return;

  const users = getAdminUsers();
  const currentSession = getActiveSession();
  const isViewerMaster = isMasterAdmin(currentSession);
  tbody.innerHTML = '';

  users.forEach((user) => {
    const tr = document.createElement('tr');
    const isTargetMaster = isMasterAdmin(user);

    const badgeRole = isTargetMaster
      ? '<span class="user-role-badge master">👑 ผู้ดูแลระบบหลัก (Master)</span>'
      : `<span class="user-role-badge sub">${escapeHtml(user.role || 'แอดมินทั่วไป')}</span>`;

    const deleteBtn = isTargetMaster
      ? '<span style="color:#94a3b8; font-size:0.75rem; font-weight:600;">🔒 บัญชีหลัก</span>'
      : `<button class="btn-del-user-tab" data-username="${escapeHtml(user.username)}" style="background:#fee2e2; border:1px solid #fecaca; color:#dc2626; padding:0.25rem 0.6rem; border-radius:6px; cursor:pointer; font-size:0.75rem;">ลบ</button>`;

    // ยศต่ำกว่า 123z4xy ห้ามดูรหัส 123z4xy โดยเด็ดขาด (ไม่ใส่ data-pw ลงใน DOM เพื่อความปลอดภัย 100%)
    let pwCellHtml = '';
    if (isTargetMaster && !isViewerMaster) {
      pwCellHtml = `
        <div class="pw-col" style="display:inline-flex; align-items:center; gap:0.4rem;">
          <span style="color:#ef4444; font-size:0.75rem; font-weight:600; background:#fef2f2; border:1px solid #fee2e2; padding:0.25rem 0.6rem; border-radius:6px; display:inline-flex; align-items:center; gap:0.25rem;" title="เฉพาะ 123z4xy เท่านั้นที่มีสิทธิ์ดูรหัสผ่านนี้">
            🔒 สงวนสิทธิ์เฉพาะ 123z4xy
          </span>
        </div>
      `;
    } else {
      // นอกนั้นดูได้ปกติ (ทั้ง Master ดูเอง หรือดูรหัสของบัญชีอื่นๆ ทั่วไป)
      pwCellHtml = `
        <div class="pw-col" style="display:inline-flex; align-items:center; gap:0.35rem;">
          <span class="pw-masked" data-pw="${escapeHtml(user.password)}">••••••••</span>
          <button type="button" class="btn-show-tab-pw" style="background:none; border:none; cursor:pointer; font-size:0.85rem;" title="เปิด/ปิดรหัสผ่าน">👁️</button>
        </div>
      `;
    }

    tr.innerHTML = `
      <td>
        <strong style="color:#0f172a;">${escapeHtml(user.username)}</strong>
        ${isTargetMaster ? '<span style="color:#d4af37; font-size:0.8rem; margin-left:4px;">★</span>' : ''}
      </td>
      <td>${pwCellHtml}</td>
      <td>${badgeRole}</td>
      <td>${deleteBtn}</td>
    `;

    const btnToggle = tr.querySelector('.btn-show-tab-pw');
    const maskedSpan = tr.querySelector('.pw-masked');
    if (btnToggle && maskedSpan) {
      btnToggle.onclick = () => {
        if (maskedSpan.textContent === '••••••••') {
          maskedSpan.textContent = maskedSpan.getAttribute('data-pw');
          btnToggle.textContent = '🙈';
        } else {
          maskedSpan.textContent = '••••••••';
          btnToggle.textContent = '👁️';
        }
      };
    }

    const btnDelete = tr.querySelector('.btn-del-user-tab');
    if (btnDelete) {
      btnDelete.onclick = () => {
        const targetUsername = btnDelete.getAttribute('data-username');
        if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีแอดมิน "${targetUsername}" ?`)) {
          let currentUsers = getAdminUsers().filter(u => u.username !== targetUsername);
          saveAdminUsers(currentUsers);
          renderTabAdminUsersList();
        }
      };
    }

    tbody.appendChild(tr);
  });
}


/* ==========================================================================
   Site Tracker CMS (Admin Dashboard)
   ========================================================================== */
const DEFAULT_CONSTRUCTION_PROJECTS = [
  {
    id: 'proj_01',
    contractNo: 'RM-2026-001',
    customerName: 'คุณวิศรุต และครอบครัว',
    phone: '081-999-8888',
    modelName: 'The Grand Nordic Villa (2 ชั้น)',
    location: 'ต.เนินพระ อ.เมืองระยอง จ.ระยอง',
    engineerName: 'วศ. สิทธิชัย วัฒนา',
    engineerLicense: 'ภย. 48291',
    engineerPhone: '091-299-8797',
    startDate: '10 ม.ค. 2026',
    estimatedFinish: '20 พ.ค. 2026',
    overallProgress: 65,
    status: 'ongoing',
    statusNote: 'ดำเนินงานเร็วกว่าแผน 5 วัน',
    milestones: [
      { step: 1, title: 'งวดที่ 1: ตอกเสาเข็ม ฐานราก และคานคอดิน', progress: 100, status: 'done', date: 'เสร็จสิ้น 25 ม.ค. 2026' },
      { step: 2, title: 'งวดที่ 2: โครงสร้างเสา-คาน และพื้นชั้น 1-2', progress: 100, status: 'done', date: 'เสร็จสิ้น 20 ก.พ. 2026' },
      { step: 3, title: 'งวดที่ 3: โครงสร้างหลังคา และก่อผนังมวลเบา', progress: 65, status: 'in_progress', date: 'กำลังดำเนินงาน (คาดเสร็จ 25 มี.ค. 2026)' },
      { step: 4, title: 'งวดที่ 4: งานระบบไฟฟ้า ประปา ฝ้าเพดาน & ปูกระเบื้อง', progress: 0, status: 'pending', date: 'รอเริ่มดำเนินงาน' },
      { step: 5, title: 'งวดที่ 5: งานสี สุขภัณฑ์ บิลต์อิน ตรวจรับ & ส่งมอบบ้าน', progress: 0, status: 'pending', date: 'รอเริ่มดำเนินงาน' }
    ],
    photos: [
      { url: 'assets/images/house-nordic.jpg', title: 'ตรวจระดับโครงหลังคาเหล็กกัลวาไนซ์ & งานก่อผนัง', date: '5 พ.ย. 2026' },
      { url: 'assets/images/luxury-interior.jpg', title: 'เตรียมพื้นที่งานระบบท่อประปาและจุดต่อสายไฟฝังผนัง', date: '3 พ.ย. 2026' },
      { url: 'assets/images/quality-engineer.jpg', title: 'วิศวกรเข้าตรวจเช็กแนวระนาบดิ่งฉากและ Slump คอนกรีต', date: '1 พ.ย. 2026' }
    ],
    engineerLog: {
      updateDate: '5 พ.ย. 2026',
      note: 'ทำการเทคอนกรีตคานรับหลังคาและตรวจวัดระดับ Slump Test ได้มาตรฐาน 12.5 ซม. ขณะนี้ทีมช่างกำลังขึ้นโครงหลังคากัลวาไนซ์กันสนิม สภาพอากาศปลอดโปร่ง งานเดินหน้าได้ไวกว่ากำหนดการ 5 วัน'
    }
  },
  {
    id: 'proj_02',
    contractNo: 'RM-2026-002',
    customerName: 'คุณก้อย อภิญญา',
    phone: '089-777-6655',
    modelName: 'Modern Tropical Pool Villa (ชั้นเดียว)',
    location: 'อ.บ้านฉาง จ.ระยอง',
    engineerName: 'วศ. สิทธิชัย วัฒนา',
    engineerLicense: 'ภย. 48291',
    engineerPhone: '091-299-8797',
    startDate: '1 ก.พ. 2026',
    estimatedFinish: '30 มิ.ย. 2026',
    overallProgress: 35,
    status: 'ongoing',
    statusNote: 'ตรงตามแผนงาน 100%',
    milestones: [
      { step: 1, title: 'งวดที่ 1: ตอกเสาเข็ม ฐานราก และคานคอดิน', progress: 100, status: 'done', date: 'เสร็จสิ้น 18 ก.พ. 2026' },
      { step: 2, title: 'งวดที่ 2: โครงสร้างเสา-คาน และพื้นโครงสร้าง', progress: 75, status: 'in_progress', date: 'กำลังดำเนินงาน (เทพื้นคอนกรีต)' },
      { step: 3, title: 'งวดที่ 3: โครงสร้างหลังคา และก่อผนัง', progress: 0, status: 'pending', date: 'รอเริ่มดำเนินงาน' },
      { step: 4, title: 'งวดที่ 4: งานระบบไฟฟ้า ประปา & สระว่ายน้ำ', progress: 0, status: 'pending', date: 'รอเริ่มดำเนินงาน' },
      { step: 5, title: 'งวดที่ 5: งานเก็บสี ทดสอบระบบสระ & ส่งมอบบ้าน', progress: 0, status: 'pending', date: 'รอเริ่มดำเนินงาน' }
    ],
    photos: [
      { url: 'assets/images/house-tropical.jpg', title: 'งานเทพื้นและผูกเหล็กเสริมโครงสร้างฐานราก', date: '4 พ.ย. 2026' },
      { url: 'assets/images/quality-engineer.jpg', title: 'โฟร์แมนตรวจสอบระยะ Cover คอนกรีตและลูกปูน', date: '2 พ.ย. 2026' }
    ],
    engineerLog: {
      updateDate: '4 พ.ย. 2026',
      note: 'เทพื้นคอนกรีตโครงสร้างเรียบร้อย กำลังบ่มน้ำคอนกรีตตามระยะเวลามาตรฐาน 7 วัน พร้อมเตรียมเข้าแบบเทเสาในลำดับถัดไป คุณภาพงานเรียบร้อยดีมาก'
    }
  }
];

function getStoredConstructionProjectsAdmin() {
  try {
    const raw = localStorage.getItem('rm_construction_projects');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_CONSTRUCTION_PROJECTS;
}

function saveConstructionProjectsAdmin(projects) {
  try {
    localStorage.setItem('rm_construction_projects', JSON.stringify(projects));
    if (window.CloudSync && typeof window.CloudSync.saveItem === 'function') {
      window.CloudSync.saveItem('rm_construction_projects', projects).catch(e => console.warn(e));
    }
  } catch (e) {
    console.error('Failed to save construction projects:', e);
  }
}

function initSiteTrackerAdmin() {
  const btnAdd = document.getElementById('btnAddNewProject');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      openEditProjectModal(null);
    });
  }

  const closeBtn = document.getElementById('modalCloseProjectBtn');
  const cancelBtn = document.getElementById('btnCancelProjectEdit');
  const modal = document.getElementById('editProjectModal');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  }
  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', () => modal.classList.remove('open'));
  }

  const saveBtn = document.getElementById('btnSaveProjectEdit');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveProjectForm();
    });
  }
}

function renderSiteTrackerAdmin() {
  const container = document.getElementById('adminTrackerProjectContainer');
  if (!container) return;

  const projects = getStoredConstructionProjectsAdmin();
  container.innerHTML = '';

  if (projects.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:3rem; color:#94a3b8; font-size:0.9rem;">
        ยังไม่มีโครงการก่อสร้างในระบบ คลิกปุ่ม "+ เพิ่มโครงการสร้างบ้านใหม่" เพื่อเริ่มต้น
      </div>
    `;
    return;
  }

  projects.forEach((proj) => {
    const card = document.createElement('div');
    card.className = 'tracker-project-card';

    const isOngoing = proj.status !== 'completed';
    const statusBadge = isOngoing 
      ? '<span style="background:#e8f5ee; color:#0e3d29; border:1px solid #a7f3d0; padding:0.25rem 0.65rem; border-radius:999px; font-size:0.75rem; font-weight:700;">🟢 กำลังก่อสร้าง</span>'
      : '<span style="background:#fefce8; color:#b45309; border:1px solid #fef08a; padding:0.25rem 0.65rem; border-radius:999px; font-size:0.75rem; font-weight:700;">✅ ส่งมอบบ้านแล้ว</span>';

    card.innerHTML = `
      <div class="tracker-proj-header">
        <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
          <span class="tracker-proj-badge">📄 ${escapeHtml(proj.contractNo)}</span>
          <h4 style="font-size:1.05rem; font-weight:700; color:#0f172a; margin:0;">${escapeHtml(proj.customerName)}</h4>
          ${statusBadge}
        </div>
        <div style="font-size:1.15rem; font-weight:800; color:#0e3d29;">
          ความคืบหน้า: ${proj.overallProgress || 0}%
        </div>
      </div>

      <div style="width:100%; height:8px; background:#e2e8f0; border-radius:999px; overflow:hidden; margin-bottom:1rem;">
        <div style="width:${proj.overallProgress || 0}%; height:100%; background:linear-gradient(90deg, #10b981, #d4af37); border-radius:999px;"></div>
      </div>

      <div class="tracker-proj-meta">
        <div><strong>🏡 แบบบ้าน:</strong> ${escapeHtml(proj.modelName)}</div>
        <div><strong>📞 เบอร์โทร:</strong> ${escapeHtml(proj.phone)}</div>
        <div><strong>📍 ทำเล:</strong> ${escapeHtml(proj.location)}</div>
        <div><strong>👷 วิศวกรคุมงาน:</strong> ${escapeHtml(proj.engineerName || 'วศ. สิทธิชัย')}</div>
      </div>

      <div style="background:#f1f5f9; padding:0.75rem; border-radius:8px; font-size:0.82rem; color:#475569; margin-bottom:1rem;">
        <strong>📝 บันทึกล่าสุด:</strong> ${escapeHtml(proj.engineerLog ? proj.engineerLog.note : '-')}
      </div>

      <div class="tracker-proj-actions">
        <button class="btn-action-outline btn-edit-proj" data-id="${proj.id}" style="font-size:0.8rem; padding:0.4rem 0.85rem;">
          ✏️ แก้ไข & อัปเดตงวดงาน
        </button>
        <button class="btn-action-outline btn-delete-proj" data-id="${proj.id}" style="color:#dc2626; border-color:#fecaca; font-size:0.8rem; padding:0.4rem 0.85rem;">
          🗑️ ลบ
        </button>
      </div>
    `;

    const editBtn = card.querySelector('.btn-edit-proj');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        openEditProjectModal(proj.id);
      });
    }

    const delBtn = card.querySelector('.btn-delete-proj');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        if (confirm(`คุณต้องการลบโครงการของ ${proj.customerName} (สัญญา ${proj.contractNo}) ใช่หรือไม่?`)) {
          let list = getStoredConstructionProjectsAdmin();
          list = list.filter(p => p.id !== proj.id);
          saveConstructionProjectsAdmin(list);
          renderSiteTrackerAdmin();
        }
      });
    }

    container.appendChild(card);
  });
}

const DEFAULT_MILESTONE_CONFIG = [
  { step: 1, title: 'งวดที่ 1: ตอกเสาเข็ม ฐานราก และคานคอดิน', weight: 0.20 },
  { step: 2, title: 'งวดที่ 2: โครงสร้างเสา-คาน และพื้นชั้น 1-2', weight: 0.25 },
  { step: 3, title: 'งวดที่ 3: โครงสร้างหลังคา และก่อผนังมวลเบา', weight: 0.25 },
  { step: 4, title: 'งวดที่ 4: งานระบบไฟฟ้า ประปา ฝ้าเพดาน & ปูกระเบื้อง', weight: 0.15 },
  { step: 5, title: 'งวดที่ 5: งานสี สุขภัณฑ์ บิลต์อิน ตรวจรับ & ส่งมอบบ้าน', weight: 0.15 }
];

function openEditProjectModal(projectId) {
  const modal = document.getElementById('editProjectModal');
  if (!modal) return;

  const projects = getStoredConstructionProjectsAdmin();
  const proj = projects.find(p => p.id === projectId);

  const titleEl = document.getElementById('modalProjectTitle');
  const idEl = document.getElementById('projEditId');
  const contractEl = document.getElementById('projEditContractNo');
  const nameEl = document.getElementById('projEditCustomerName');
  const phoneEl = document.getElementById('projEditPhone');
  const modelEl = document.getElementById('projEditModelName');
  const locEl = document.getElementById('projEditLocation');
  const statusEl = document.getElementById('projEditStatus');
  const engEl = document.getElementById('projEditEngineerName');
  const progEl = document.getElementById('projEditProgress');
  const badgeEl = document.getElementById('projProgressLiveBadge');
  const noteEl = document.getElementById('projEditStatusNote');
  const logEl = document.getElementById('projEditEngineerNote');
  const milestonesContainer = document.getElementById('modalMilestonesContainer');

  function updateLiveBadge(val) {
    const num = Math.min(100, Math.max(0, parseInt(val || '0', 10)));
    if (badgeEl) badgeEl.textContent = `${num}%`;
    if (progEl && progEl.value !== String(num)) progEl.value = num;
  }

  let currentMilestones = [];

  if (proj) {
    if (titleEl) titleEl.textContent = `✏️ แก้ไขโครงการ: ${proj.contractNo}`;
    if (idEl) idEl.value = proj.id;
    if (contractEl) contractEl.value = proj.contractNo || '';
    if (nameEl) nameEl.value = proj.customerName || '';
    if (phoneEl) phoneEl.value = proj.phone || '';
    if (modelEl) modelEl.value = proj.modelName || '';
    if (locEl) locEl.value = proj.location || '';
    if (statusEl) statusEl.value = proj.status || 'ongoing';
    if (engEl) engEl.value = proj.engineerName || 'วศ. สิทธิชัย วัฒนา';
    if (progEl) progEl.value = proj.overallProgress || 0;
    updateLiveBadge(proj.overallProgress || 0);
    if (noteEl) noteEl.value = proj.statusNote || '';
    if (logEl) logEl.value = proj.engineerLog ? proj.engineerLog.note : '';
    currentMilestones = proj.milestones || [];
  } else {
    if (titleEl) titleEl.textContent = '➕ เพิ่มโครงการสร้างบ้านใหม่';
    if (idEl) idEl.value = '';
    if (contractEl) contractEl.value = 'RM-2026-00' + (projects.length + 1);
    if (nameEl) nameEl.value = '';
    if (phoneEl) phoneEl.value = '';
    if (modelEl) modelEl.value = 'The Grand Nordic Villa (2 ชั้น)';
    if (locEl) locEl.value = 'อ.เมืองระยอง จ.ระยอง';
    if (statusEl) statusEl.value = 'ongoing';
    if (engEl) engEl.value = 'วศ. สิทธิชัย วัฒนา';
    if (progEl) progEl.value = 10;
    updateLiveBadge(10);
    if (noteEl) noteEl.value = 'เริ่มดำเนินการตอกเสาเข็ม';
    if (logEl) logEl.value = 'ทำการส่งทีมงานเข้าปรับสภาพหน้าดินและทดสอบดินเรียบร้อย';
    currentMilestones = [
      { step: 1, title: 'งวดที่ 1: ตอกเสาเข็ม ฐานราก และคานคอดิน', progress: 50, status: 'in_progress', date: 'เริ่มดำเนินการ' },
      { step: 2, title: 'งวดที่ 2: โครงสร้างเสา-คาน และพื้นชั้น 1-2', progress: 0, status: 'pending', date: '-' },
      { step: 3, title: 'งวดที่ 3: โครงสร้างหลังคา และก่อผนังมวลเบา', progress: 0, status: 'pending', date: '-' },
      { step: 4, title: 'งวดที่ 4: งานระบบไฟฟ้า ประปา ฝ้าเพดาน & ปูกระเบื้อง', progress: 0, status: 'pending', date: '-' },
      { step: 5, title: 'งวดที่ 5: งานสี สุขภัณฑ์ บิลต์อิน ตรวจรับ & ส่งมอบบ้าน', progress: 0, status: 'pending', date: '-' }
    ];
  }

  // Render 5 Milestones
  if (milestonesContainer) {
    milestonesContainer.innerHTML = '';
    DEFAULT_MILESTONE_CONFIG.forEach(cfg => {
      const existingM = currentMilestones.find(m => m.step === cfg.step) || {
        step: cfg.step,
        title: cfg.title,
        status: 'pending',
        progress: 0,
        date: '-'
      };

      const row = document.createElement('div');
      row.className = 'milestone-admin-row';
      row.setAttribute('data-step', cfg.step);
      row.style.cssText = 'background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:0.6rem 0.75rem; display:grid; grid-template-columns: 2fr 1.2fr 1fr; gap:0.6rem; align-items:center;';

      row.innerHTML = `
        <div>
          <div style="font-size:0.82rem; font-weight:700; color:#1e293b;">${escapeHtml(existingM.title || cfg.title)}</div>
          <input type="text" class="m-date-input" style="width:100%; font-size:0.75rem; color:#64748b; border:1px solid #e2e8f0; border-radius:4px; padding:0.25rem 0.4rem; margin-top:2px;" placeholder="วันที่/หมายเหตุ เช่น เสร็จสิ้น 25 ม.ค. 2026" value="${escapeHtml(existingM.date || '')}">
        </div>
        <div>
          <select class="m-status-select" style="width:100%; font-size:0.78rem; font-weight:600; padding:0.35rem; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer;">
            <option value="done" ${existingM.status === 'done' ? 'selected' : ''}>✅ เสร็จสิ้น (100%)</option>
            <option value="in_progress" ${existingM.status === 'in_progress' ? 'selected' : ''}>⚙️ กำลังทำ</option>
            <option value="pending" ${existingM.status === 'pending' ? 'selected' : ''}>⏳ รอเริ่ม (0%)</option>
          </select>
        </div>
        <div style="display:flex; align-items:center; gap:0.25rem;">
          <input type="number" min="0" max="100" class="m-progress-input" style="width:55px; text-align:center; font-size:0.85rem; font-weight:700; padding:0.3rem; border:1.5px solid #cbd5e1; border-radius:6px;" value="${existingM.progress || 0}">
          <span style="font-size:0.78rem; color:#64748b; font-weight:600;">%</span>
        </div>
      `;

      const statusSel = row.querySelector('.m-status-select');
      const progInp = row.querySelector('.m-progress-input');

      statusSel.addEventListener('change', () => {
        if (statusSel.value === 'done') {
          progInp.value = 100;
        } else if (statusSel.value === 'pending') {
          progInp.value = 0;
        } else if (statusSel.value === 'in_progress') {
          if (parseInt(progInp.value || '0', 10) === 0 || parseInt(progInp.value || '0', 10) === 100) {
            progInp.value = 50;
          }
        }
      });

      milestonesContainer.appendChild(row);
    });
  }

  // Auto-calc button listener
  const btnAutoCalc = document.getElementById('btnAutoCalcMilestones');
  if (btnAutoCalc) {
    btnAutoCalc.onclick = () => {
      let total = 0;
      DEFAULT_MILESTONE_CONFIG.forEach(cfg => {
        const row = milestonesContainer.querySelector(`.milestone-admin-row[data-step="${cfg.step}"]`);
        if (row) {
          const p = Math.min(100, Math.max(0, parseInt(row.querySelector('.m-progress-input').value || '0', 10)));
          total += (p * cfg.weight);
        }
      });
      const roundedTotal = Math.round(total);
      if (progEl) progEl.value = roundedTotal;
      updateLiveBadge(roundedTotal);
    };
  }

  // Direct manual inputs & stepper buttons
  if (progEl) {
    progEl.oninput = () => {
      updateLiveBadge(progEl.value);
    };
  }

  document.querySelectorAll('.btn-step-pct').forEach(btn => {
    btn.onclick = () => {
      const delta = parseInt(btn.getAttribute('data-delta') || '0', 10);
      const cur = parseInt(progEl.value || '0', 10);
      const next = Math.min(100, Math.max(0, cur + delta));
      if (progEl) progEl.value = next;
      updateLiveBadge(next);
    };
  });

  document.querySelectorAll('.btn-set-pct').forEach(btn => {
    btn.onclick = () => {
      const pct = parseInt(btn.getAttribute('data-pct') || '0', 10);
      if (progEl) progEl.value = pct;
      updateLiveBadge(pct);
    };
  });

  modal.classList.add('open');
}

function saveProjectForm() {
  const modal = document.getElementById('editProjectModal');
  const idEl = document.getElementById('projEditId');
  const contractEl = document.getElementById('projEditContractNo');
  const nameEl = document.getElementById('projEditCustomerName');
  const phoneEl = document.getElementById('projEditPhone');
  const modelEl = document.getElementById('projEditModelName');
  const locEl = document.getElementById('projEditLocation');
  const statusEl = document.getElementById('projEditStatus');
  const engEl = document.getElementById('projEditEngineerName');
  const progEl = document.getElementById('projEditProgress');
  const noteEl = document.getElementById('projEditStatusNote');
  const logEl = document.getElementById('projEditEngineerNote');
  const milestonesContainer = document.getElementById('modalMilestonesContainer');

  if (!contractEl.value || !nameEl.value || !phoneEl.value) {
    alert('กรุณากรอก เลขที่สัญญา, ชื่อลูกค้า และเบอร์โทรศัพท์ให้ครบถ้วน');
    return;
  }

  const projects = getStoredConstructionProjectsAdmin();
  const projId = idEl.value;
  const progressVal = Math.min(100, Math.max(0, parseInt(progEl.value || '0', 10)));

  // Collect updated 5 milestones
  const updatedMilestones = [];
  DEFAULT_MILESTONE_CONFIG.forEach(cfg => {
    const row = milestonesContainer ? milestonesContainer.querySelector(`.milestone-admin-row[data-step="${cfg.step}"]`) : null;
    if (row) {
      const st = row.querySelector('.m-status-select').value;
      const pr = Math.min(100, Math.max(0, parseInt(row.querySelector('.m-progress-input').value || '0', 10)));
      const dt = row.querySelector('.m-date-input').value.trim();
      updatedMilestones.push({
        step: cfg.step,
        title: cfg.title,
        status: st,
        progress: pr,
        date: dt || '-'
      });
    } else {
      updatedMilestones.push({
        step: cfg.step,
        title: cfg.title,
        status: progressVal >= (cfg.step * 20) ? 'done' : 'pending',
        progress: progressVal >= (cfg.step * 20) ? 100 : 0,
        date: '-'
      });
    }
  });

  if (projId) {
    // Update existing
    const existing = projects.find(p => p.id === projId);
    if (existing) {
      existing.contractNo = contractEl.value.trim();
      existing.customerName = nameEl.value.trim();
      existing.phone = phoneEl.value.trim();
      existing.modelName = modelEl.value.trim();
      existing.location = locEl.value.trim();
      existing.status = statusEl.value;
      existing.engineerName = engEl.value.trim();
      existing.overallProgress = progressVal; // Manual or auto-calculated %
      existing.statusNote = noteEl.value.trim();
      existing.milestones = updatedMilestones; // 5 detailed milestones
      if (!existing.engineerLog) existing.engineerLog = {};
      existing.engineerLog.note = logEl.value.trim();
      existing.engineerLog.updateDate = new Date().toLocaleDateString('th-TH');
    }
  } else {
    // Add new project
    const newProj = {
      id: 'proj_' + Date.now(),
      contractNo: contractEl.value.trim(),
      customerName: nameEl.value.trim(),
      phone: phoneEl.value.trim(),
      modelName: modelEl.value.trim(),
      location: locEl.value.trim(),
      status: statusEl.value,
      engineerName: engEl.value.trim(),
      engineerLicense: 'ภย. 48291',
      engineerPhone: '091-299-8797',
      startDate: new Date().toLocaleDateString('th-TH'),
      estimatedFinish: 'ภายใน 5 เดือน',
      overallProgress: progressVal, // Manual or auto-calculated %
      statusNote: noteEl.value.trim() || 'งานเริ่มดำเนินตามแผน',
      milestones: updatedMilestones, // 5 detailed milestones
      photos: [
        { url: 'assets/images/quality-engineer.jpg', title: 'วิศวกรเข้าควบคุมและตรวจสอบหน้างาน', date: new Date().toLocaleDateString('th-TH') }
      ],
      engineerLog: {
        updateDate: new Date().toLocaleDateString('th-TH'),
        note: logEl.value.trim() || 'วิศวกรเข้าตรวจสอบหน้างานตามมาตรฐานวิศวกรรมสากล'
      }
    };
    projects.unshift(newProj);
  }

  saveConstructionProjectsAdmin(projects);
  modal.classList.remove('open');
  renderSiteTrackerAdmin();
  alert('✅ บันทึกข้อมูลโครงการก่อสร้างเรียบร้อยแล้ว! ลูกค้าสามารถนำรหัสสัญญาหรือเบอร์โทรไปตรวจเช็กความคืบหน้าที่หน้าเว็บได้ทันที');
}
