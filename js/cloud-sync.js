/**
 * RMHome Cloud Sync Engine (Firebase Realtime Database)
 * ซิงค์ข้อมูลแดชบอร์ดและหน้าเว็บหลักแบบ Real-time ทั่วโลก
 */

(function () {
  const CLOUD_CONFIG_KEY = 'rm_cloud_db_url';
  
  // URL เริ่มต้น
  let cloudDbUrl = localStorage.getItem(CLOUD_CONFIG_KEY) || '';

  function cleanUrl(url) {
    if (!url) return '';
    return url.trim().replace(/\/+$/, '');
  }

  const CloudSync = {
    getUrl: function () {
      return cleanUrl(cloudDbUrl || localStorage.getItem(CLOUD_CONFIG_KEY) || '');
    },

    setUrl: function (url) {
      cloudDbUrl = cleanUrl(url);
      localStorage.setItem(CLOUD_CONFIG_KEY, cloudDbUrl);
    },

    isConnected: function () {
      const url = this.getUrl();
      return Boolean(url && (url.includes('firebase') || url.startsWith('http')));
    },

    /**
     * ดึงข้อมูลทั้งหมดจาก Cloud Database ลงมาอัปเดตเครื่อง
     */
    fetchAll: async function () {
      const baseUrl = this.getUrl();
      if (!baseUrl) return null;

      try {
        const res = await fetch(`${baseUrl}/rmhome.json?timeout=6s`);
        if (!res.ok) throw new Error('Cloud fetch failed');
        const data = await res.json();
        if (data && typeof data === 'object') {
          // อัปเดตลง local storage
          Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
              const val = typeof data[key] === 'object' ? JSON.stringify(data[key]) : String(data[key]);
              originalSetItem(key, val);
            }
          });
          return data;
        }
      } catch (err) {
        console.warn('[CloudSync] Fetch failed, using local cache:', err);
      }
      return null;
    },

    /**
     * ส่งข้อมูล 1 รายการขึ้น Cloud Database
     */
    saveItem: async function (key, value) {
      const baseUrl = this.getUrl();
      if (!baseUrl) return;

      try {
        await fetch(`${baseUrl}/rmhome/${key}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value)
        });
      } catch (err) {
        console.warn(`[CloudSync] Save failed for ${key}:`, err);
      }
    },

    /**
     * ส่งข้อมูล local ทั้งหมดขึ้น Cloud
     */
    pushAllLocalToCloud: async function () {
      const baseUrl = this.getUrl();
      if (!baseUrl) return false;

      const keys = [
        'rm_portfolio_items',
        'rm_reviews',
        'rm_services',
        'rm_standards',
        'rm_why_us',
        'rm_workflow',
        'rm_site_info',
        'rm_calculator_settings',
        'rm_service_areas',
        'rm_leads'
      ];

      const payload = {};
      keys.forEach(k => {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            payload[k] = JSON.parse(raw);
          } catch (e) {
            payload[k] = raw;
          }
        }
      });

      try {
        const res = await fetch(`${baseUrl}/rmhome.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return res.ok;
      } catch (err) {
        console.error('[CloudSync] pushAllLocalToCloud error:', err);
        return false;
      }
    }
  };

  // Auto-sync Interceptor: เมื่อมีการเซฟ rm_ ใดๆ จะส่งขึ้น Cloud อัตโนมัติทันที
  const originalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (key, value) {
    originalSetItem(key, value);
    if (key && key.startsWith('rm_') && !key.includes('session') && !key.includes('cloud_db') && !key.includes('page_views') && !key.includes('sessions')) {
      if (CloudSync.isConnected()) {
        try {
          const parsed = JSON.parse(value);
          CloudSync.saveItem(key, parsed);
        } catch (e) {
          CloudSync.saveItem(key, value);
        }
      }
    }
  };

  // Cloud Sync Admin Modal UI Wiring
  function setupAdminCloudSyncUI() {
    const btnCloudSync = document.getElementById('btnCloudSync');
    const cloudSyncModal = document.getElementById('cloudSyncModal');
    const closeCloudSyncModal = document.getElementById('closeCloudSyncModal');
    const cloudDbUrlInput = document.getElementById('cloudDbUrlInput');
    const btnSaveCloudDbUrl = document.getElementById('btnSaveCloudDbUrl');
    const cloudDbStatusBadge = document.getElementById('cloudDbStatusBadge');

    function updateBadge() {
      if (!cloudDbStatusBadge) return;
      if (CloudSync.isConnected()) {
        cloudDbStatusBadge.innerHTML = '<span style="color:#16a34a; font-weight:700;">🟢 เชื่อมต่อ Cloud DB สำเร็จ (ออนไลน์ทั่วโลก)</span>';
        if (btnCloudSync) btnCloudSync.innerHTML = '<span>🟢 Cloud DB ทำงานอยู่</span>';
      } else {
        cloudDbStatusBadge.innerHTML = '<span style="color:#ca8a04; font-weight:600;">🟡 ยังไม่ได้เชื่อมต่อ Cloud</span>';
        if (btnCloudSync) btnCloudSync.innerHTML = '<span>☁️ ตั้งค่า Cloud DB</span>';
      }
    }

    if (btnCloudSync && cloudSyncModal) {
      updateBadge();
      btnCloudSync.onclick = function () {
        if (cloudDbUrlInput) cloudDbUrlInput.value = CloudSync.getUrl();
        cloudSyncModal.classList.add('open');
        updateBadge();
      };
    }

    if (closeCloudSyncModal && cloudSyncModal) {
      closeCloudSyncModal.onclick = function () {
        cloudSyncModal.classList.remove('open');
      };
    }

    if (btnSaveCloudDbUrl && cloudDbUrlInput) {
      btnSaveCloudDbUrl.onclick = async function () {
        const val = cloudDbUrlInput.value.trim();
        if (!val) {
          alert('กรุณากรอก Firebase Realtime Database URL ก่อนครับ');
          return;
        }

        btnSaveCloudDbUrl.disabled = true;
        btnSaveCloudDbUrl.textContent = '⏳ กำลังส่งข้อมูลขึ้น Cloud...';

        CloudSync.setUrl(val);
        const success = await CloudSync.pushAllLocalToCloud();

        btnSaveCloudDbUrl.disabled = false;
        btnSaveCloudDbUrl.textContent = '💾 บันทึกและซิงค์ข้อมูลขึ้น Cloud ทันที';
        updateBadge();

        if (success) {
          alert('🎉 ยอดเยี่ยมมากครับ! เชื่อมต่อฐานข้อมูล Cloud สำเร็จ 100%!\n\nต่อจากนี้ไม่ว่าคุณจะแก้ข้อความหรือเพิ่มผลงานอะไรในแดชบอร์ด ข้อมูลจะเด้งไปแสดงผลบนมือถือและคอมของลูกค้าทุกคนในโลกทันทีครับ!');
          cloudSyncModal.classList.remove('open');
        } else {
          alert('บันทึก URL เรียบร้อยแล้วครับ!\n\n⚠️ คำแนะนำ: หากยังส่งข้อมูลไม่ผ่าน ให้ตรวจสอบใน Firebase Console ว่าได้ตั้งค่า Rules เป็น "read: true, write: true" แล้วหรือยังครับ');
          cloudSyncModal.classList.remove('open');
        }
      };
    }
  }

  window.CloudSync = CloudSync;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAdminCloudSyncUI);
  } else {
    setupAdminCloudSyncUI();
  }
})();
