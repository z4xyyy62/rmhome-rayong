/**
 * RMHome Cloud Sync Engine (Firebase Realtime Database)
 * เธเธดเธเธเนเธเนเธญเธกเธนเธฅเนเธ”เธเธเธญเธฃเนเธ”เนเธฅเธฐเธซเธเนเธฒเน€เธงเนเธเธซเธฅเธฑเธเนเธเธ Real-time เธ—เธฑเนเธงเนเธฅเธ
 */

(function () {
  const CLOUD_CONFIG_KEY = 'rm_cloud_db_url';
  const DEFAULT_CLOUD_URL = 'https://rmhome-35591-default-rtdb.asia-southeast1.firebasedatabase.app';
  
  // URL เน€เธฃเธดเนเธกเธ•เนเธเน€เธเธทเนเธญเธกเธ•เนเธญเธเธฑเธ Firebase Realtime Database เธเธญเธเธเธธเธ“เธญเธฑเธ•เนเธเธกเธฑเธ•เธด
  let cloudDbUrl = localStorage.getItem(CLOUD_CONFIG_KEY) || DEFAULT_CLOUD_URL;

  function cleanUrl(url) {
    if (!url) return '';
    return url.trim().replace(/\/+$/, '');
  }

  const CloudSync = {
    getUrl: function () {
      return cleanUrl(cloudDbUrl || localStorage.getItem(CLOUD_CONFIG_KEY) || DEFAULT_CLOUD_URL);
    },

    setUrl: function (url) {
      cloudDbUrl = cleanUrl(url) || DEFAULT_CLOUD_URL;
      localStorage.setItem(CLOUD_CONFIG_KEY, cloudDbUrl);
    },

    isConnected: function () {
      const url = this.getUrl();
      return Boolean(url && (url.includes('firebase') || url.startsWith('http')));
    },

    /**
     * เธ”เธถเธเธเนเธญเธกเธนเธฅเธ—เธฑเนเธเธซเธกเธ”เธเธฒเธ Cloud Database เธฅเธเธกเธฒเธญเธฑเธเน€เธ”เธ•เน€เธเธฃเธทเนเธญเธ
     */
    fetchAll: async function () {
      const baseUrl = this.getUrl();
      if (!baseUrl) return null;

      try {
        const res = await fetch(`${baseUrl}/rmhome.json?timeout=6s`);
        if (!res.ok) throw new Error('Cloud fetch failed');
        const data = await res.json();
        if (data && typeof data === 'object') {
          // เธญเธฑเธเน€เธ”เธ•เธฅเธ local storage
          Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
              const val = typeof data[key] === 'object' ? JSON.stringify(data[key]) : String(data[key]);
              try {
                originalSetItem(key, val);
              } catch (qErr) {
                console.warn(`[CloudSync] LocalStorage quota skipped for ${key}`);
              }
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
     * เธชเนเธเธเนเธญเธกเธนเธฅ 1 เธฃเธฒเธขเธเธฒเธฃเธเธถเนเธ Cloud Database
     */
    saveItem: async function (key, value) {
      const baseUrl = this.getUrl();
      if (!baseUrl) return;

      try {
        const res = await fetch(`${baseUrl}/rmhome/${key}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value)
        });

        // เธญเธฑเธเน€เธ”เธ• timestamp เธเธฅเธฒเธ เน€เธเธทเนเธญเนเธซเนเธ—เธธเธเน€เธเธฃเธทเนเธญเธเธ—เธตเนเน€เธเธดเธ”เน€เธงเนเธเธญเธขเธนเนเธฃเธนเนเธงเนเธฒเธกเธตเธเนเธญเธกเธนเธฅเนเธซเธกเน
        if (key !== 'rm_last_sync_timestamp') {
          const now = Date.now();
          try {
            originalSetItem('rm_last_sync_timestamp', String(now));
          } catch (e) {}
          await fetch(`${baseUrl}/rmhome/rm_last_sync_timestamp.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(now)
          });
        }
      } catch (err) {
        console.warn(`[CloudSync] Save failed for ${key}:`, err);
        return false;
      }
    },

    /**
     * เธเธฑเธเธเธฒเธฃเน€เธเธฅเธตเนเธขเธเนเธเธฅเธเธเนเธญเธกเธนเธฅเนเธเธ Real-time เธเนเธฒเธกเธ—เธธเธเน€เธเธฃเธทเนเธญเธ (Polling Timestamp เนเธเธเธเธฃเธฐเธซเธขเธฑเธ”เน€เธเนเธ•)
     */
    startRealtimeListener: function (callback) {
      const baseUrl = this.getUrl();
      if (!baseUrl) return;

      let lastTs = parseInt(localStorage.getItem('rm_last_sync_timestamp') || '0', 10);

      setInterval(async () => {
        try {
          const res = await fetch(`${baseUrl}/rmhome/rm_last_sync_timestamp.json?_t=${Date.now()}`);
          if (!res.ok) return;
          const cloudTs = await res.json();
          if (cloudTs && typeof cloudTs === 'number' && cloudTs > lastTs) {
            lastTs = cloudTs;
            const updatedData = await CloudSync.fetchAll();
            if (updatedData && typeof callback === 'function') {
              callback(updatedData);
            }
          }
        } catch (e) {
          // ignore network hiccups
        }
      }, 7000);
    },

    /**
     * เธชเนเธเธเนเธญเธกเธนเธฅ local เธ—เธฑเนเธเธซเธกเธ”เธเธถเนเธ Cloud
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

  // Auto-sync Interceptor: เน€เธกเธทเนเธญเธกเธตเธเธฒเธฃเน€เธเธ rm_ เนเธ”เน เธเธฐเธชเนเธเธเธถเนเธ Cloud เธญเธฑเธ•เนเธเธกเธฑเธ•เธดเธ—เธฑเธเธ—เธต

  // BroadcastChannel: sync real-time ข้ามแท็บทันที (ไม่ต้องรอ Firebase polling)
  let _bc = null;
  try { _bc = new BroadcastChannel('rmhome_sync'); } catch (e) {}

  function broadcastUpdate(key) {
    try { if (_bc) _bc.postMessage({ key, ts: Date.now() }); } catch (e) {}
  }

  // syncAll alias
  CloudSync.syncAll = function () { return CloudSync.pushAllLocalToCloud(); };

  // onUpdate: ให้ index.html ฟัง BroadcastChannel
  CloudSync.onUpdate = function (callback) {
    try { const bc = new BroadcastChannel('rmhome_sync'); bc.onmessage = function (e) { if (typeof callback === 'function') callback(e.data); }; } catch (e) {}
  };

  const originalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (key, value) {
    try {
      originalSetItem(key, value);
    } catch (quotaErr) {
      console.warn(`[CloudSync] LocalStorage quota skipped for ${key}, continuing Cloud DB sync.`);
    }
    if (key && key.startsWith('rm_') && !key.includes('session') && !key.includes('cloud_db') && !key.includes('page_views') && !key.includes('sessions')) {
      broadcastUpdate(key);
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
        cloudDbStatusBadge.innerHTML = '<span style="color:#16a34a; font-weight:700;">๐ข เน€เธเธทเนเธญเธกเธ•เนเธญ Cloud DB เธชเธณเน€เธฃเนเธ (เธญเธญเธเนเธฅเธเนเธ—เธฑเนเธงเนเธฅเธ)</span>';
        if (btnCloudSync) btnCloudSync.innerHTML = '<span>๐ข Cloud DB เธ—เธณเธเธฒเธเธญเธขเธนเน</span>';
      } else {
        cloudDbStatusBadge.innerHTML = '<span style="color:#ca8a04; font-weight:600;">๐ก เธขเธฑเธเนเธกเนเนเธ”เนเน€เธเธทเนเธญเธกเธ•เนเธญ Cloud</span>';
        if (btnCloudSync) btnCloudSync.innerHTML = '<span>โ๏ธ เธ•เธฑเนเธเธเนเธฒ Cloud DB</span>';
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
          alert('เธเธฃเธธเธ“เธฒเธเธฃเธญเธ Firebase Realtime Database URL เธเนเธญเธเธเธฃเธฑเธ');
          return;
        }

        btnSaveCloudDbUrl.disabled = true;
        btnSaveCloudDbUrl.textContent = 'โณ เธเธณเธฅเธฑเธเธชเนเธเธเนเธญเธกเธนเธฅเธเธถเนเธ Cloud...';

        CloudSync.setUrl(val);
        const success = await CloudSync.pushAllLocalToCloud();

        btnSaveCloudDbUrl.disabled = false;
        btnSaveCloudDbUrl.textContent = '๐’พ เธเธฑเธเธ—เธถเธเนเธฅเธฐเธเธดเธเธเนเธเนเธญเธกเธนเธฅเธเธถเนเธ Cloud เธ—เธฑเธเธ—เธต';
        updateBadge();

        if (success) {
          alert('๐ เธขเธญเธ”เน€เธขเธตเนเธขเธกเธกเธฒเธเธเธฃเธฑเธ! เน€เธเธทเนเธญเธกเธ•เนเธญเธเธฒเธเธเนเธญเธกเธนเธฅ Cloud เธชเธณเน€เธฃเนเธ 100%!\n\nเธ•เนเธญเธเธฒเธเธเธตเนเนเธกเนเธงเนเธฒเธเธธเธ“เธเธฐเนเธเนเธเนเธญเธเธงเธฒเธกเธซเธฃเธทเธญเน€เธเธดเนเธกเธเธฅเธเธฒเธเธญเธฐเนเธฃเนเธเนเธ”เธเธเธญเธฃเนเธ” เธเนเธญเธกเธนเธฅเธเธฐเน€เธ”เนเธเนเธเนเธชเธ”เธเธเธฅเธเธเธกเธทเธญเธ–เธทเธญเนเธฅเธฐเธเธญเธกเธเธญเธเธฅเธนเธเธเนเธฒเธ—เธธเธเธเธเนเธเนเธฅเธเธ—เธฑเธเธ—เธตเธเธฃเธฑเธ!');
          cloudSyncModal.classList.remove('open');
        } else {
          alert('เธเธฑเธเธ—เธถเธ URL เน€เธฃเธตเธขเธเธฃเนเธญเธขเนเธฅเนเธงเธเธฃเธฑเธ!\n\nโ ๏ธ เธเธณเนเธเธฐเธเธณ: เธซเธฒเธเธขเธฑเธเธชเนเธเธเนเธญเธกเธนเธฅเนเธกเนเธเนเธฒเธ เนเธซเนเธ•เธฃเธงเธเธชเธญเธเนเธ Firebase Console เธงเนเธฒเนเธ”เนเธ•เธฑเนเธเธเนเธฒ Rules เน€เธเนเธ "read: true, write: true" เนเธฅเนเธงเธซเธฃเธทเธญเธขเธฑเธเธเธฃเธฑเธ');
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
