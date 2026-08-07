/* =========================================================
   Babyiel Store Inventory - MySQL Database Engine
   ========================================================= */

let supabaseClient = null; // Supabase disabled in favor of cPanel MySQL Database

const DB_KEYS = {
  USERS: 'babyiel_users',
  PRODUCTS: 'babyiel_products',
  STOCKS: 'babyiel_stocks',
  LOGS: 'babyiel_activity_logs',
  SETTINGS: 'babyiel_settings',
  AUTH: 'babyiel_auth_session',
  NOTIFICATIONS: 'babyiel_notifications'
};

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-netflix',
    name: 'Netflix Premium',
    icon: 'fa-film',
    image_url: 'assets/icons/netflix.svg',
    color: '#ef4444',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '3 Hari', price: 7000, category: '💎 Sharing 1P1U' },
      { label: '7 Hari', price: 14000, category: '💎 Sharing 1P1U' },
      { label: '1 Bulan', price: 35000, category: '💎 Sharing 1P1U' },
      { label: '3 Hari', price: 6000, category: '💎 Sharing 1P2U' },
      { label: '7 Hari', price: 10000, category: '💎 Sharing 1P2U' },
      { label: '1 Bulan', price: 26000, category: '💎 Sharing 1P2U' },
      { label: '1 Bulan', price: 165000, category: '👑 Private' }
    ],
    template: `✨ NETFLIX PREMIUM 4K UHD SHARING ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
💎 DETAIL AKUN
✔️ Sharing (1 Bulan Premium 4K UHD)
✔️ Private Profil & PIN kustom
✔️ Bebas streaming 4K Ultra HD

━━━━━━━━━━━━━━
📌 GARANSI
🛡️ Garansi full 30 hari anti-hold / logout
🛡️ Wajib simpan bukti pembelian

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-canva',
    name: 'Canva Pro',
    icon: 'fa-palette',
    image_url: 'assets/icons/canva.svg',
    color: '#06b6d4',
    duration: '1 Tahun',
    garansi: '✅ Full Garansi Sesuai S&K',
    note: '✨ Designer +Rp2.000',
    prices: [
      { label: '1 Bulan', price: 10000, category: '💎 Member' },
      { label: '2 Bulan', price: 15000, category: '💎 Member' },
      { label: '3 Bulan', price: 20000, category: '💎 Member' },
      { label: '4 Bulan', price: 22000, category: '💎 Member' },
      { label: '6 Bulan', price: 25000, category: '💎 Member' },
      { label: '1 Tahun', price: 27000, category: '💎 Member' }
    ],
    template: `✨ CANVA PRO DESIGNER TEAM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-chatgpt',
    name: 'ChatGPT Plus',
    icon: 'fa-robot',
    image_url: 'assets/icons/chatgpt.svg',
    color: '#10b981',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi GPT-4o',
    prices: [
      { label: '1 Bulan', price: 35000, category: '💎 Sharing 1P' }
    ],
    template: `✨ CHATGPT PLUS GPT-4o ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-getcontact',
    name: 'Getcontact Premium',
    icon: 'fa-address-book',
    image_url: 'assets/icons/getcontact.svg',
    color: '#3b82f6',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    custom_msg: '📩 Hubungi admin untuk pilihan paket terbaru.',
    prices: [],
    template: `✨ GETCONTACT PREMIUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-disney',
    name: 'Disney+ Hotstar',
    icon: 'fa-tv',
    image_url: 'assets/icons/disney.svg',
    color: '#1d4ed8',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: 'Sharing 6 User (1 Bulan)', price: 30000, category: '👑 Premium' },
      { label: 'Sharing 3 User (1 Bulan)', price: 55000, category: '👑 Premium' },
      { label: 'Private (1 Bulan)', price: 150000, category: '👑 Premium' },
      { label: 'Sharing 3 User (1 Bulan)', price: 35000, category: '💎 Basic' },
      { label: 'Sharing 2 User (1 Bulan)', price: 50000, category: '💎 Basic' },
      { label: 'Private (1 Bulan)', price: 80000, category: '💎 Basic' }
    ],
    template: `✨ DISNEY+ HOTSTAR PREMIUM SHARING ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-youtube',
    name: 'YouTube Premium',
    icon: 'fa-play-circle',
    image_url: 'assets/icons/youtube.svg',
    color: '#ff0000',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    note: '✨ Account Store +Rp2.000',
    prices: [
      { label: '1 Bulan', price: 7000, category: '👨‍👩‍👧 Family Plan' },
      { label: '2 Bulan', price: 12000, category: '👨‍👩‍👧 Family Plan' },
      { label: '1 Bulan', price: 10000, category: '👤 Individual Plan' },
      { label: '4 Bulan', price: 25000, category: '👤 Individual Plan' },
      { label: '3 Bulan', price: 20000, category: '🔥 Mix Plan' },
      { label: '6 Bulan', price: 35000, category: '🔥 Mix Plan' }
    ],
    template: `✨ YOUTUBE PREMIUM NO ADS ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-alightmotion',
    name: 'Alight Motion Premium',
    icon: 'fa-video',
    image_url: 'assets/icons/alightmotion.svg',
    color: '#10b981',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    custom_msg: '📩 Hubungi admin untuk pilihan paket terbaru.',
    prices: [],
    template: `✨ ALIGHT MOTION PREMIUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-wetv',
    name: 'WeTV Premium',
    icon: 'fa-circle-play',
    image_url: 'assets/icons/wetv.svg',
    color: '#f97316',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Hari', price: 3000, category: '💎 Sharing' },
      { label: '3 Hari', price: 6000, category: '💎 Sharing' },
      { label: '7 Hari', price: 12000, category: '💎 Sharing' },
      { label: '1 Bulan', price: 22000, category: '💎 Sharing' },
      { label: '1 Bulan', price: 45000, category: '👑 Private' }
    ],
    template: `✨ WETV VIP SHARING ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-spotify',
    name: 'Spotify Premium',
    icon: 'fa-music',
    image_url: 'assets/icons/spotify.svg',
    color: '#10b981',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Music Without Ads',
    note: '✨ Account Store +Rp2.000',
    prices: [
      { label: '1 Bulan', price: 12000, category: '👨‍👩‍👧 Family Plan' },
      { label: '2 Bulan', price: 18000, category: '👨‍👩‍👧 Family Plan' },
      { label: '3 Bulan', price: 23000, category: '👨‍👩‍👧 Family Plan' },
      { label: '1 Bulan', price: 20000, category: '👤 Individual Plan' },
      { label: '2 Bulan', price: 30000, category: '👤 Individual Plan' },
      { label: '3 Bulan', price: 40000, category: '👤 Individual Plan' }
    ],
    template: `✨ SPOTIFY PREMIUM INDIVIDUAL / FAMILY ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-vidio',
    name: 'Vidio Platinum',
    icon: 'fa-tv',
    image_url: 'assets/icons/vidio.svg',
    color: '#ec4899',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '7 Hari', price: 15000, category: '👑 Private' },
      { label: '1 Bulan', price: 30000, category: '👑 Private' },
      { label: '1 Bulan', price: 15000, category: '💎 Sharing' }
    ],
    template: `✨ VIDIO PLATINUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-iqiyi',
    name: 'iQIYI Premium',
    icon: 'fa-clapperboard',
    image_url: 'assets/icons/iqiyi.svg',
    color: '#22c55e',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Hari', price: 3000, category: '💎 Sharing' },
      { label: '3 Hari', price: 6000, category: '💎 Sharing' },
      { label: '7 Hari', price: 12000, category: '💎 Sharing' },
      { label: '1 Bulan', price: 20000, category: '💎 Sharing' },
      { label: '1 Bulan', price: 35000, category: '👑 Private' }
    ],
    template: `✨ IQIYI PREMIUM VIP ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-viu',
    name: 'VIU Premium',
    icon: 'fa-play',
    image_url: 'assets/icons/viu.svg',
    color: '#8b5cf6',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 10000, category: '🛡️ Anti Backfree' },
      { label: '2 Bulan', price: 12000, category: '🛡️ Anti Backfree' },
      { label: '3 Bulan', price: 15000, category: '🛡️ Anti Backfree' },
      { label: '1 Bulan', price: 15000, category: '🚀 Anti Limit' },
      { label: '2 Bulan', price: 18000, category: '🚀 Anti Limit' },
      { label: '3 Bulan', price: 20000, category: '🚀 Anti Limit' }
    ],
    template: `✨ VIU PREMIUM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-amazon',
    name: 'Amazon Prime Video',
    icon: 'fa-brands fa-amazon',
    image_url: 'assets/icons/amazon.svg',
    color: '#f59e0b',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 15000, category: '💎 Sharing' },
      { label: '1 Bulan', price: 25000, category: '👑 Private' }
    ],
    template: `✨ AMAZON PRIME VIDEO ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  }
];

const DEFAULT_USERS = [
  { id: 'usr-admin-1', username: 'admin', password: '123', name: 'Super Admin Babyiel', role: 'Admin', created_at: new Date().toISOString() },
  { id: 'usr-admin-2', username: 'admin2', password: '123', name: 'Admin Operasional', role: 'Admin', created_at: new Date().toISOString() },
  { id: 'usr-m1', username: 'member1', password: '123', name: 'Reseller Budi', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m2', username: 'member2', password: '123', name: 'Reseller Siti', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m3', username: 'member3', password: '123', name: 'Reseller Dewi', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m4', username: 'member4', password: '123', name: 'Reseller Ahmad', role: 'Member', created_at: new Date().toISOString() }
];

const DEFAULT_SETTINGS = {
  admin_username: 'admin',
  admin_password: '123',
  store_name: 'Babyiel Store',
  support_phone: '085775335453'
};

class StoreDB {
  constructor() {
    this.initDatabase();
    setTimeout(() => {
      this.initSupabaseSync();
      this.syncFromBackend();
    }, 100);
  }

  async syncFromBackend() {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.products) && data.products.length > 0) {
          localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(data.products));
          if (typeof App !== 'undefined' && typeof App.renderStorefront === 'function') {
            App.renderStorefront();
          }
        }
      }
    } catch (e) {
      // Ignore if offline
    }
  }

  async initSupabaseSync() {
    this.updateSupabaseStatusBadge(true);
    if (!supabaseClient) {
      this.updateSupabaseStatusBadge(true);
      return;
    }

    try {
      // Test connectivity & sync tables
      const { data: stocksData, error: stocksErr } = await supabaseClient.from('stocks').select('*');
      if (!stocksErr && stocksData) {
        if (stocksData.length > 0) {
          localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocksData));
        } else {
          const localStocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
          if (localStocks.length > 0) {
            await supabaseClient.from('stocks').upsert(localStocks);
          }
        }
      }

      const { data: usersData, error: usersErr } = await supabaseClient.from('users').select('*');
      if (!usersErr && usersData && usersData.length > 0) {
        const localUsers = JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || DEFAULT_USERS;
        usersData.forEach(su => {
          if (su && su.username && !localUsers.some(lu => lu.username.toLowerCase() === su.username.toLowerCase())) {
            localUsers.push(su);
          }
        });
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(localUsers));
      }

      const { data: prodsData, error: prodsErr } = await supabaseClient.from('products').select('*');
      if (!prodsErr && prodsData) {
        if (prodsData.length > 0) {
          localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(prodsData));
        } else {
          const localProds = JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS)) || [];
          if (localProds.length > 0) {
            await supabaseClient.from('products').upsert(localProds);
          }
        }
      }

      this.updateSupabaseStatusBadge(true);
    } catch (err) {
      console.warn('Backend sync info:', err);
      this.updateSupabaseStatusBadge(true);
    }
  }

  async updateSupabaseStatusBadge(isConnected) {
    // Badge element removed from UI per user request
    return;
  }

  async syncSupabaseTable(table, data, action = 'upsert') {
    if (!supabaseClient) return;
    try {
      if (action === 'upsert') {
        await supabaseClient.from(table).upsert(data);
      } else if (action === 'delete') {
        const idVal = typeof data === 'object' ? data.id : data;
        await supabaseClient.from(table).delete().eq('id', idVal);
      } else if (action === 'insert') {
        await supabaseClient.from(table).insert(data);
      }
    } catch (e) {
      console.warn(`Supabase sync ${action} on ${table} failed:`, e);
    }
  }

  initDatabase() {
    const currentUsers = JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
    if (currentUsers.length !== DEFAULT_USERS.length) {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }

    if (!localStorage.getItem(DB_KEYS.SETTINGS)) {
      localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    } else {
      // Migrate existing products to local icons if they use old external URLs or default icons
      try {
        let storedProds = JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS)) || [];
        let updated = false;
        storedProds = storedProds.map(p => {
          const matchDef = DEFAULT_PRODUCTS.find(dp => dp.id === p.id);
          if (matchDef && (!p.image_url || p.image_url.includes('wikimedia.org'))) {
            p.image_url = matchDef.image_url;
            updated = true;
          }
          return p;
        });
        if (updated) {
          localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(storedProds));
        }
      } catch (e) {
        console.warn('Product icon migration error:', e);
      }
    }

    const SEED_VERSION = 'v8_10_ready_per_app_fresh';
    if (localStorage.getItem('babyiel_seed_version') !== SEED_VERSION) {
      this.seedInitialStocks();
      localStorage.setItem('babyiel_seed_version', SEED_VERSION);
    } else {
      const currentStocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
      if (currentStocks.length < 10) {
        this.seedInitialStocks();
      }
    }

    if (!localStorage.getItem(DB_KEYS.LOGS)) {
      this.seedInitialLogs();
    }
  }

  seedInitialStocks() {
    const products = [
      { id: 'prod-netflix', name: 'Netflix Premium', prefix: 'netflix' },
      { id: 'prod-canva', name: 'Canva Pro', prefix: 'canva' },
      { id: 'prod-chatgpt', name: 'ChatGPT Plus', prefix: 'chatgpt' },
      { id: 'prod-getcontact', name: 'Getcontact Premium', prefix: 'getcontact' },
      { id: 'prod-disney', name: 'Disney+ Hotstar', prefix: 'disney' },
      { id: 'prod-youtube', name: 'YouTube Premium', prefix: 'youtube' },
      { id: 'prod-alightmotion', name: 'Alight Motion Premium', prefix: 'alight' },
      { id: 'prod-vidio', name: 'Vidio Platinum', prefix: 'vidio' },
      { id: 'prod-wetv', name: 'WeTV Premium', prefix: 'wetv' },
      { id: 'prod-spotify', name: 'Spotify Premium', prefix: 'spotify' },
      { id: 'prod-amazon', name: 'Amazon Prime Video', prefix: 'prime' }
    ];

    const freshStocks = [];
    const now = new Date();
    let counter = 1001;

    products.forEach(p => {
      for (let i = 1; i <= 10; i++) {
        const id = `STK-${counter++}`;
        const numPadded = String(i).padStart(2, '0');
        freshStocks.push({
          id: id,
          product_id: p.id,
          product_name: p.name,
          nomor: `085775335${numPadded}`,
          email: `${p.prefix}.ready${numPadded}@babyiel.com`,
          password: `pass${p.prefix}${numPadded}`,
          login_by: i % 2 === 0 ? 'Email & Password' : 'OTP WhatsApp',
          profile: `Profil ${(i % 5) + 1}`,
          pin: `${1000 + i}`,
          note: 'Ready Garansi Full 100%',
          assigned_to: 'admin',
          status: 'READY',
          created_at: new Date(now - 3600000 * i).toISOString(),
          updated_at: new Date(now - 3600000 * i).toISOString()
        });
      }
    });

    localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(freshStocks));
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify([]));
    localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify([]));
    localStorage.setItem(DB_KEYS.LOGS, JSON.stringify([]));
  }
  }

  seedInitialLogs() {
    const now = new Date();
    const logs = [
      {
        id: 'log-1',
        type: 'login',
        activity: 'Admin berhasil login ke sistem',
        created_at: new Date(now - 86400000 * 3).toISOString()
      },
      {
        id: 'log-2',
        type: 'add',
        activity: 'Input stock baru: Disney+ Hotstar (disney.vip01@babyiel.com)',
        created_at: new Date(now - 86400000 * 3).toISOString()
      },
      {
        id: 'log-3',
        type: 'copy',
        activity: 'Copy template akun: Netflix (net.prem4k@gmail.com)',
        created_at: new Date(now - 86400000 * 2).toISOString()
      },
      {
        id: 'log-4',
        type: 'add',
        activity: 'Status akun Netflix (net.prem4k@gmail.com) diubah menjadi READY',
        created_at: new Date(now - 86400000 * 1).toISOString()
      },
      {
        id: 'log-5',
        type: 'sold',
        activity: 'Status akun Spotify (spot.fam01@outlook.com) diubah menjadi SOLD',
        created_at: new Date(now - 3600000 * 2).toISOString()
      }
    ];
    localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs));
  }

  // --- USERS & AUTH ---
  getUsers() {
    let users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
    if (!users || !Array.isArray(users) || users.length === 0) {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const hasAdmin = users.some(u => u && u.username && u.username.toLowerCase() === 'admin');
    if (!hasAdmin) {
      users.unshift({ id: 'usr-admin-1', username: 'admin', password: '123', name: 'Super Admin Babyiel', role: 'Admin', created_at: new Date().toISOString() });
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    }
    return users;
  }

  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  }

  addUser(userData) {
    const users = this.getUsers();
    const username = (userData.username || '').trim();
    if (!username || !userData.password) {
      return { success: false, message: 'Username dan Password wajib diisi!' };
    }

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: 'Username sudah digunakan oleh user lain!' };
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      username: username,
      password: userData.password,
      name: userData.name || username,
      role: userData.role || 'Member',
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    this.syncSupabaseTable('users', newUser, 'upsert');
    this.logActivity(`Tambah user baru: ${newUser.username} (${newUser.role})`, 'add');
    return { success: true, user: newUser };
  }

  updateUser(id, userData) {
    let users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return { success: false, message: 'User tidak ditemukan!' };

    const username = (userData.username || '').trim();
    if (users.some(u => u.id !== id && u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: 'Username sudah digunakan oleh user lain!' };
    }

    users[index] = {
      ...users[index],
      username: username || users[index].username,
      password: userData.password || users[index].password,
      name: userData.name || users[index].name,
      role: userData.role || users[index].role,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    this.syncSupabaseTable('users', users[index], 'upsert');

    // Update session if active auth user is modified
    const currentAuth = this.getAuth();
    if (currentAuth && currentAuth.id === id) {
      currentAuth.username = users[index].username;
      currentAuth.name = users[index].name;
      currentAuth.role = users[index].role;
      localStorage.setItem(DB_KEYS.AUTH, JSON.stringify(currentAuth));
    }

    this.logActivity(`Update user: ${users[index].username} (${users[index].role})`, 'add');
    return { success: true, user: users[index] };
  }

  deleteUser(id) {
    let users = this.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return { success: false, message: 'User tidak ditemukan!' };

    const currentAuth = this.getAuth();
    if (currentAuth && currentAuth.id === id) {
      return { success: false, message: 'Tidak dapat menghapus user yang sedang aktif digunakan!' };
    }

    const adminCount = users.filter(u => u.role === 'Admin').length;
    if (user.role === 'Admin' && adminCount <= 1) {
      return { success: false, message: 'Harus ada minimal 1 user ber-role Admin dalam sistem!' };
    }

    users = users.filter(u => u.id !== id);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    this.syncSupabaseTable('users', { id }, 'delete');
    this.logActivity(`Hapus user: ${user.username} (${user.role})`, 'delete');
    return { success: true };
  }

  getSettings() {
    return JSON.parse(localStorage.getItem(DB_KEYS.SETTINGS)) || DEFAULT_SETTINGS;
  }

  saveSettings(settingsData) {
    const current = this.getSettings();
    const updated = { ...current, ...settingsData };
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(updated));
    this.logActivity('Admin mengupdate Pengaturan Sistem', 'login');
    return updated;
  }

  getAuth() {
    return JSON.parse(localStorage.getItem(DB_KEYS.AUTH));
  }

  getAuthHeaders() {
    const auth = this.getAuth();
    const token = (auth && auth.token) ? auth.token : (localStorage.getItem('babyiel_auth_token') || 'byl_token_dev_master_2026');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  login(username, password) {
    const uInput = (username || '').trim().toLowerCase();
    const pInput = (password || '').trim();

    // Default Fallback Session Token
    let token = 'byl_token_dev_master_2026';

    if (uInput === 'admin' && (pInput === '123' || pInput === 'admin')) {
      const session = {
        id: 'usr-admin-1',
        username: 'admin',
        name: 'Super Admin Babyiel',
        role: 'Admin',
        token: token,
        logged_in_at: new Date().toISOString()
      };
      localStorage.setItem('babyiel_auth_token', token);
      localStorage.setItem(DB_KEYS.AUTH, JSON.stringify(session));
      this.logActivity(`User admin (Admin) berhasil login`, 'login');
      return { success: true, session };
    }

    if (uInput === 'member1' && pInput === '123') {
      const session = {
        id: 'usr-m1',
        username: 'member1',
        name: 'Budi Santoso (Member)',
        role: 'Member',
        token: token,
        logged_in_at: new Date().toISOString()
      };
      localStorage.setItem('babyiel_auth_token', token);
      localStorage.setItem(DB_KEYS.AUTH, JSON.stringify(session));
      this.logActivity(`User member1 (Member) berhasil login`, 'login');
      return { success: true, session };
    }

    const users = this.getUsers();
    const user = users.find(u => u && u.username && u.username.toLowerCase() === uInput && String(u.password).trim() === pInput);

    if (user) {
      const session = {
        id: user.id,
        username: user.username,
        name: user.name || user.username,
        role: user.role || 'Member',
        token: token,
        logged_in_at: new Date().toISOString()
      };
      localStorage.setItem('babyiel_auth_token', token);
      localStorage.setItem(DB_KEYS.AUTH, JSON.stringify(session));
      this.logActivity(`User ${user.username} (${user.role}) berhasil login`, 'login');
      return { success: true, session };
    }
    return { success: false, message: 'Username atau Password salah! Default: admin / 123' };
  }

  logout() {
    const auth = this.getAuth();
    if (auth) {
      this.logActivity(`User (${auth.username}) logout dari sistem`, 'login');
    }
    localStorage.removeItem(DB_KEYS.AUTH);
    localStorage.removeItem('babyiel_auth_token');
    localStorage.removeItem('babyiel_auth_session');
  }

  getProducts() {
    let prods = JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS));
    if (!prods || prods.length < 12 || !prods[0].garansi) {
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    let updated = false;
    prods.forEach(p => {
      if (!p.image_url) {
        const def = DEFAULT_PRODUCTS.find(d => d.id === p.id || d.name === p.name);
        if (def && def.image_url) {
          p.image_url = def.image_url;
          updated = true;
        }
      }
    });
    if (updated) {
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(prods));
    }
    return prods;
  }

  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  }

  addProduct(productData) {
    const products = this.getProducts();
    const newProduct = {
      id: 'prod-' + Date.now(),
      name: productData.name,
      icon: productData.icon || 'fa-box',
      image_url: productData.image_url || '',
      color: productData.color || '#3b82f6',
      duration: productData.duration || '1 Bulan',
      garansi: productData.garansi || '✅ Full Garansi Sesuai S&K',
      note: productData.note || '',
      is_active_catalog: productData.is_active_catalog !== undefined ? productData.is_active_catalog : true,
      prices: productData.prices || [],
      template: productData.template || ''
    };
    products.push(newProduct);
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    this.syncSupabaseTable('products', newProduct, 'upsert');
    this.logActivity(`Admin menambahkan produk baru: ${newProduct.name}`, 'add');
    return newProduct;
  }

  updateProduct(id, productData) {
    let products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...productData };
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
      this.syncSupabaseTable('products', products[index], 'upsert');
      this.logActivity(`Admin mengedit produk: ${products[index].name}`, 'add');
      return products[index];
    }
    return null;
  }

  deleteProduct(id) {
    let products = this.getProducts();
    const prod = products.find(p => p.id === id);
    if (prod) {
      products = products.filter(p => p.id !== id);
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
      this.syncSupabaseTable('products', { id }, 'delete');
      this.logActivity(`Admin menghapus produk: ${prod.name}`, 'delete');
      return true;
    }
    return false;
  }

  // --- NOTIFICATIONS ---
  getNotifications(username) {
    const all = JSON.parse(localStorage.getItem(DB_KEYS.NOTIFICATIONS)) || [];
    if (!username) return all;
    return all.filter(n => n.recipient === username || n.recipient === 'ALL');
  }

  getUnreadNotificationCount(username) {
    const notifs = this.getNotifications(username);
    return notifs.filter(n => !n.read).length;
  }

  addNotification(notifData) {
    const notifs = JSON.parse(localStorage.getItem(DB_KEYS.NOTIFICATIONS)) || [];
    const newNotif = {
      id: 'ntf-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      recipient: notifData.recipient || 'admin',
      title: notifData.title || 'Notifikasi Sistem',
      message: notifData.message || '',
      type: notifData.type || 'SYSTEM',
      data: notifData.data || null,
      read: false,
      created_at: new Date().toISOString()
    };
    notifs.unshift(newNotif);
    if (notifs.length > 100) notifs.pop();
    localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    this.syncSupabaseTable('notifications', newNotif, 'insert');
    return newNotif;
  }

  markNotifAsRead(id) {
    let notifs = JSON.parse(localStorage.getItem(DB_KEYS.NOTIFICATIONS)) || [];
    const target = notifs.find(n => n.id === id);
    if (target) {
      target.read = true;
      localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    }
  }

  markAllNotifsAsRead(username) {
    let notifs = JSON.parse(localStorage.getItem(DB_KEYS.NOTIFICATIONS)) || [];
    notifs.forEach(n => {
      if (n.recipient === username || n.recipient === 'ALL') {
        n.read = true;
      }
    });
    localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  // --- SUBSCRIPTION EXPIRATION AUTOMATION ---
  checkSubscriptionExpirations() {
    let stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    const now = new Date();
    let updatedCount = 0;

    stocks.forEach(s => {
      if (s.status === 'SEDANG BERLANGGANAN' && s.expired_date) {
        const expDate = new Date(s.expired_date);
        if (expDate <= now) {
          const prevSeller = s.sold_by || s.assigned_to;
          s.status = 'READY';
          s.assigned_to = 'admin'; // Reverts to Admin control
          s.updated_at = now.toISOString();

          if (!s.history) s.history = [];
          s.history.push({
            type: 'EXPIRED',
            date: now.toISOString(),
            by: 'System Auto-Return',
            details: `Subscription berakhir pada ${expDate.toLocaleDateString('id-ID')}. Stok kembali menjadi READY bawah kontrol Admin.`
          });

          // Send notification to Reseller seller
          if (prevSeller && prevSeller !== 'admin') {
            this.addNotification({
              recipient: prevSeller,
              title: 'Subscription Berakhir',
              message: `Subscription ${s.product_name} (${s.email}) customer ${s.buyer_name || '-'} telah berakhir. Stok telah kembali menjadi READY.`,
              type: 'SUBSCRIPTION_EXPIRED',
              data: { stock_id: s.id, product_name: s.product_name }
            });
          }

          // Send notification to Admin
          this.addNotification({
            recipient: 'admin',
            title: 'Stok Kembali READY (Expired)',
            message: `Subscription ${s.product_name} (${s.email}) customer ${s.buyer_name || '-'} telah berakhir dan otomatis kembali menjadi READY.`,
            type: 'SUBSCRIPTION_EXPIRED',
            data: { stock_id: s.id, product_name: s.product_name }
          });

          this.logActivity(`Subscription ${s.product_name} (${s.email}) berakhir. Stok otomatis kembali ke READY.`, 'add');
          updatedCount++;
        }
      }
    });

    if (updatedCount > 0) {
      localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocks));
    }
  }

  // --- STOCKS ---
  getStocks(filters = {}) {
    this.checkSubscriptionExpirations();
    let stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];

    const auth = this.getAuth();
    if (auth && auth.role === 'Member') {
      const username = auth.username;
      // Reseller strictly sees:
      // 1. Stocks ASSIGNED to this reseller
      // 2. Stocks SEDANG BERLANGGANAN sold by or assigned to this reseller
      stocks = stocks.filter(s => {
        if (s.status === 'ASSIGNED' && s.assigned_to === username) return true;
        if (s.status === 'SEDANG BERLANGGANAN' && (s.sold_by === username || s.assigned_to === username)) return true;
        return false;
      });
    }

    if (filters.status && filters.status !== 'ALL') {
      let reqStatus = filters.status;
      if (reqStatus === 'SOLD') reqStatus = 'SEDANG BERLANGGANAN';
      if (reqStatus === 'EXPIRED') reqStatus = 'READY';
      stocks = stocks.filter(s => s.status === reqStatus);
    }

    if (filters.product_id && filters.product_id !== 'ALL') {
      stocks = stocks.filter(s => s.product_id === filters.product_id);
    }

    if (filters.assignment && filters.assignment !== 'ALL') {
      if (filters.assignment === 'UNASSIGNED') {
        stocks = stocks.filter(s => !s.assigned_to || s.assigned_to === 'admin' || s.assigned_to === '-');
      } else if (filters.assignment === 'ASSIGNED') {
        stocks = stocks.filter(s => s.assigned_to && s.assigned_to !== 'admin' && s.assigned_to !== '-');
      } else {
        stocks = stocks.filter(s => s.assigned_to === filters.assignment);
      }
    }

    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      stocks = stocks.filter(s =>
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.nomor && s.nomor.toLowerCase().includes(q)) ||
        (s.profile && s.profile.toLowerCase().includes(q)) ||
        (s.product_name && s.product_name.toLowerCase().includes(q)) ||
        (s.id && s.id.toLowerCase().includes(q)) ||
        (s.assigned_to && s.assigned_to.toLowerCase().includes(q)) ||
        (s.sold_by && s.sold_by.toLowerCase().includes(q)) ||
        (s.buyer_name && s.buyer_name.toLowerCase().includes(q)) ||
        (s.buyer_wa && s.buyer_wa.toLowerCase().includes(q))
      );
    }

    return stocks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getStockById(id) {
    const stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    return stocks.find(s => s.id === id);
  }

  addStock(stockData) {
    const stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    const product = this.getProductById(stockData.product_id);
    const auth = this.getAuth();

    const newStock = {
      id: 'STK-' + Math.floor(1000 + Math.random() * 9000),
      product_id: stockData.product_id,
      product_name: product ? product.name : 'Unknown Product',
      nomor: stockData.nomor || '-',
      email: stockData.email || '-',
      login_by: stockData.login_by || '-',
      profile: stockData.profile || '-',
      pin: stockData.pin || '-',
      note: stockData.note || '',
      assigned_to: 'admin',
      status: 'READY',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      history: [{
        type: 'CREATED',
        date: new Date().toISOString(),
        by: auth ? auth.username : 'admin',
        details: 'Stok dibuat dan berada di bawah kontrol Admin.'
      }]
    };

    stocks.unshift(newStock);
    localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocks));
    this.syncSupabaseTable('stocks', newStock, 'upsert');
    this.logActivity(`Input stock baru: ${newStock.product_name} (${newStock.email})`, 'add');
    return newStock;
  }

  updateStock(stockId, updateData) {
    let stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    const index = stocks.findIndex(s => s.id === stockId);
    if (index === -1) return { success: false, message: 'Stock tidak ditemukan!' };

    const stock = stocks[index];
    const auth = this.getAuth();
    if (!auth || auth.role !== 'Admin') {
      return { success: false, message: 'Hanya Admin yang diizinkan mengedit data akun stok!' };
    }

    if (updateData.product_id) {
      stock.product_id = updateData.product_id;
      const prod = this.getProductById(updateData.product_id);
      if (prod) stock.product_name = prod.name;
    }
    if (updateData.email !== undefined) stock.email = updateData.email;
    if (updateData.password !== undefined) stock.password = updateData.password;
    if (updateData.login_by !== undefined) stock.login_by = updateData.login_by;
    if (updateData.profile !== undefined) stock.profile = updateData.profile;
    if (updateData.pin !== undefined) stock.pin = updateData.pin;
    if (updateData.nomor !== undefined) stock.nomor = updateData.nomor;
    if (updateData.note !== undefined) stock.note = updateData.note;
    if (updateData.status) stock.status = updateData.status;
    if (updateData.assigned_to) stock.assigned_to = updateData.assigned_to;
    stock.updated_at = new Date().toISOString();

    if (!stock.history) stock.history = [];
    stock.history.push({
      type: 'UPDATED',
      date: new Date().toISOString(),
      by: auth.username,
      details: `Data akun stok diperbarui oleh Admin @${auth.username}`
    });

    localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocks));
    this.syncSupabaseTable('stocks', stock, 'upsert');

    // Sync full stock edit to backend server
    try {
      const serverStatus = stock.status === 'SEDANG BERLANGGANAN' ? 'BERLANGGANAN' : (stock.status === 'ASSIGNED' ? 'RESERVED' : 'READY');
      fetch('/api/admin/stocks/update-status', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          id: stock.id,
          product_id: stock.product_id,
          product_name: stock.product_name,
          email: stock.email,
          password: stock.password,
          login_by: stock.login_by,
          profile: stock.profile,
          pin: stock.pin,
          nomor: stock.nomor,
          note: stock.note,
          status: serverStatus,
          assigned_to: stock.assigned_to
        })
      }).catch(e => console.warn('Sync stock edit error:', e));
    } catch (err) {
      console.warn('Sync stock edit error:', err);
    }

    this.logActivity(`Edit data stok ${stock.product_name} (${stock.email})`, 'copy');
    return { success: true, stock };
  }

  assignStock(stockId, targetReseller) {
    let stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    const index = stocks.findIndex(s => s.id === stockId);
    if (index === -1) return { success: false, message: 'Stock tidak ditemukan!' };

    const stock = stocks[index];
    const auth = this.getAuth();

    stock.status = 'ASSIGNED';
    stock.assigned_to = targetReseller;
    stock.assigned_at = new Date().toISOString();
    stock.assigned_by = auth ? auth.username : 'admin';
    stock.updated_at = new Date().toISOString();

    if (!stock.history) stock.history = [];
    stock.history.push({
      type: 'ASSIGNED',
      date: new Date().toISOString(),
      by: auth ? auth.username : 'admin',
      to: targetReseller,
      details: `Stock di-assign ke reseller ${targetReseller}`
    });

    localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocks));
    this.syncSupabaseTable('stocks', stock, 'upsert');

    // Sync status change to backend server
    try {
      fetch('/api/admin/stocks/update-status', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ id: stock.id, email: stock.email, status: 'RESERVED', assigned_to: targetReseller })
      }).catch(e => console.warn('Sync assign error:', e));
    } catch (err) {
      console.warn('Sync assign error:', err);
    }

    if (targetReseller && targetReseller !== 'admin') {
      this.addNotification({
        recipient: targetReseller,
        title: 'Stok Baru Di-assign',
        message: `Admin meng-assign 1 stok ${stock.product_name} (${stock.email}) kepada Anda.`,
        type: 'STOCK_ASSIGNED',
        data: { stock_id: stock.id, product_name: stock.product_name, email: stock.email }
      });
    }

    this.logActivity(`Assign stok ${stock.product_name} (${stock.email}) ke reseller ${targetReseller}`, 'copy');
    return { success: true, stock };
  }

  takeBackStock(stockId) {
    let stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    const index = stocks.findIndex(s => s.id === stockId);
    if (index === -1) return { success: false, message: 'Stock tidak ditemukan!' };

    const stock = stocks[index];
    if (stock.status !== 'ASSIGNED') {
      return { success: false, message: 'Hanya stok berstatus ASSIGNED yang dapat diambil kembali!' };
    }

    const prevReseller = stock.assigned_to;
    const auth = this.getAuth();

    stock.status = 'READY';
    stock.assigned_to = 'admin';
    stock.assigned_at = null;
    stock.assigned_by = null;
    stock.updated_at = new Date().toISOString();

    if (!stock.history) stock.history = [];
    stock.history.push({
      type: 'TAKEN_BACK',
      date: new Date().toISOString(),
      by: auth ? auth.username : 'admin',
      details: `Stok diambil kembali oleh Admin dari reseller ${prevReseller}`
    });

    localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocks));
    this.syncSupabaseTable('stocks', stock, 'upsert');

    // Sync status change to backend server
    try {
      fetch('/api/admin/stocks/update-status', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ id: stock.id, email: stock.email, status: 'READY', assigned_to: 'admin' })
      }).catch(e => console.warn('Sync takeBack error:', e));
    } catch (err) {
      console.warn('Sync takeBack error:', err);
    }

    if (prevReseller && prevReseller !== 'admin') {
      this.addNotification({
        recipient: prevReseller,
        title: 'Stok Diambil Kembali',
        message: `Admin mengambil kembali 1 stok ${stock.product_name} (${stock.email}) yang sebelumnya diassign kepada Anda.`,
        type: 'STOCK_TAKEN_BACK',
        data: { stock_id: stock.id, product_name: stock.product_name, email: stock.email }
      });
    }

    this.logActivity(`Admin mengambil kembali stok ${stock.product_name} (${stock.email}) dari reseller ${prevReseller}`, 'delete');
    return { success: true, stock };
  }

  sellStock(stockId, saleData) {
    let stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    const index = stocks.findIndex(s => s.id === stockId);
    if (index === -1) return { success: false, message: 'Stock tidak ditemukan!' };

    const stock = stocks[index];
    const auth = this.getAuth();
    const now = new Date();
    const durationDays = parseInt(saleData.duration_days || 30, 10);
    const expDate = new Date(now.getTime() + durationDays * 86400000);

    stock.status = 'SEDANG BERLANGGANAN';
    stock.buyer_name = saleData.buyer_name || '-';
    stock.buyer_wa = saleData.buyer_wa || '-';
    stock.sold_by = auth ? auth.username : (stock.assigned_to || 'admin');
    stock.sold_at = now.toISOString();
    stock.start_date = now.toISOString();
    stock.expired_date = expDate.toISOString();
    stock.updated_at = now.toISOString();

    if (!stock.history) stock.history = [];
    stock.history.push({
      type: 'SOLD',
      date: now.toISOString(),
      by: stock.sold_by,
      buyer_name: stock.buyer_name,
      buyer_wa: stock.buyer_wa,
      start_date: stock.start_date,
      expired_date: stock.expired_date,
      details: `Dijual ke ${stock.buyer_name} (${stock.buyer_wa}) — Masa aktif ${durationDays} hari`
    });

    localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocks));
    this.syncSupabaseTable('stocks', stock, 'upsert');
    this.logActivity(`Penjualan stok ${stock.product_name} (${stock.email}) ke ${stock.buyer_name} oleh ${stock.sold_by}`, 'sold');
    return { success: true, stock };
  }

  renewSubscription(stockId, daysToAdd = 30) {
    let stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    const index = stocks.findIndex(s => s.id === stockId);
    if (index === -1) return { success: false, message: 'Stock tidak ditemukan!' };

    const stock = stocks[index];
    const auth = this.getAuth();
    const now = new Date();

    let currentExp = stock.expired_date ? new Date(stock.expired_date) : now;
    if (currentExp < now) currentExp = now;

    const newExp = new Date(currentExp.getTime() + daysToAdd * 86400000);
    stock.expired_date = newExp.toISOString();
    stock.status = 'SEDANG BERLANGGANAN';
    stock.updated_at = now.toISOString();

    if (!stock.history) stock.history = [];
    stock.history.push({
      type: 'RENEWAL',
      date: now.toISOString(),
      by: auth ? auth.username : 'admin',
      extended_days: daysToAdd,
      new_expired_date: stock.expired_date,
      details: `Perpanjangan subscription +${daysToAdd} hari. Expiry baru: ${newExp.toLocaleDateString('id-ID')}`
    });

    localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocks));
    this.syncSupabaseTable('stocks', stock, 'upsert');
    this.logActivity(`Perpanjang subscription ${stock.product_name} (${stock.email}) +${daysToAdd} hari oleh ${auth ? auth.username : 'admin'}`, 'sold');
    return { success: true, stock };
  }

  updateStockStatus(id, newStatus, extraData = {}) {
    if (newStatus === 'ASSIGNED' && extraData.targetReseller) {
      return this.assignStock(id, extraData.targetReseller).stock;
    }
    if (newStatus === 'READY' && extraData.takeBack) {
      return this.takeBackStock(id).stock;
    }
    if (newStatus === 'SOLD' || newStatus === 'SEDANG BERLANGGANAN') {
      return this.sellStock(id, extraData).stock;
    }

    let stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    const index = stocks.findIndex(s => s.id === id);

    if (index !== -1) {
      const stock = stocks[index];
      stock.status = newStatus;
      stock.updated_at = new Date().toISOString();
      localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocks));
      this.syncSupabaseTable('stocks', stock, 'upsert');
      return stock;
    }
    return null;
  }

  bulkAddStocks(itemsArray) {
    if (!Array.isArray(itemsArray) || itemsArray.length === 0) return 0;
    const stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    const products = this.getProducts();
    const auth = this.getAuth();
    let count = 0;

    itemsArray.forEach(item => {
      let matchedProd = products.find(p => p.name.toLowerCase().trim() === (item.product_name || '').toLowerCase().trim());
      if (!matchedProd && item.product_name) {
        matchedProd = products.find(p => p.name.toLowerCase().includes(item.product_name.toLowerCase()) || item.product_name.toLowerCase().includes(p.name.toLowerCase()));
      }
      if (!matchedProd) matchedProd = products[0];

      const newStock = {
        id: 'STK-' + Math.floor(1000 + Math.random() * 9000),
        product_id: matchedProd ? matchedProd.id : 'prod-netflix',
        product_name: matchedProd ? matchedProd.name : (item.product_name || 'Netflix Premium'),
        nomor: item.nomor || '-',
        email: item.email || '-',
        login_by: item.login_by || 'OTP WhatsApp',
        profile: item.profile || 'Profil 1',
        pin: item.pin || '1234',
        note: item.note || 'Import Excel',
        assigned_to: auth ? auth.username : 'admin',
        status: 'READY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sold_at: null
      };

      stocks.unshift(newStock);
      this.syncSupabaseTable('stocks', newStock, 'upsert');
      count++;
    });

    localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocks));
    this.logActivity(`Bulk upload ${count} stok akun dari Excel`, 'add');
    return count;
  }

  renewStock(id) {
    const stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    const sourceStock = stocks.find(s => s.id === id);
    if (!sourceStock) return null;

    const newStock = {
      id: 'STK-' + Math.floor(1000 + Math.random() * 9000),
      product_id: sourceStock.product_id,
      product_name: sourceStock.product_name,
      nomor: sourceStock.nomor || '-',
      email: sourceStock.email || '-',
      login_by: sourceStock.login_by || '-',
      profile: sourceStock.profile || '-',
      pin: sourceStock.pin || '-',
      note: sourceStock.note ? sourceStock.note : 'Perpanjang Akun',
      status: 'SOLD',
      is_renewal: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sold_at: new Date().toISOString()
    };

    stocks.unshift(newStock);
    localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocks));
    this.syncSupabaseTable('stocks', newStock, 'upsert');

    const renewalNum = this.getRenewalNumber(newStock.id);
    this.logActivity(`Perpanjang (${renewalNum}x) stok terjual: ${newStock.product_name} (${newStock.email}) [ID: ${newStock.id}]`, 'sold');
    return newStock;
  }

  getRenewalNumber(stockId) {
    const stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    const target = stocks.find(s => s.id === stockId);
    if (!target) return 0;

    const targetEmail = (target.email || '').toLowerCase().trim();
    const targetProfile = (target.profile || '').toLowerCase().trim();

    const sameAccount = stocks.filter(s => {
      const sEmail = (s.email || '').toLowerCase().trim();
      const sProfile = (s.profile || '').toLowerCase().trim();
      return sEmail === targetEmail &&
             sProfile === targetProfile &&
             s.product_id === target.product_id;
    });

    // Sort chronologically ascending (oldest first)
    sameAccount.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const index = sameAccount.findIndex(s => s.id === target.id);
    return index > 0 ? index : 0;
  }

  deleteStock(id) {
    let stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    const stock = stocks.find(s => s.id === id);
    if (stock) {
      stocks = stocks.filter(s => s.id !== id);
      localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocks));
      this.syncSupabaseTable('stocks', { id }, 'delete');
      this.logActivity(`Delete stock: ${stock.product_name} (${stock.email})`, 'delete');
      return true;
    }
    return false;
  }

  getUserTemplates(username) {
    if (!username) return {};
    const key = `babyiel_user_templates_${username}`;
    return JSON.parse(localStorage.getItem(key)) || {};
  }

  saveUserTemplate(username, productId, template) {
    if (!username) return;
    const key = `babyiel_user_templates_${username}`;
    const userTemplates = this.getUserTemplates(username);
    userTemplates[productId] = template;
    localStorage.setItem(key, JSON.stringify(userTemplates));
    this.logActivity(`Member ${username} mengupdate template khusus produk ID: ${productId}`, 'add');
    return userTemplates;
  }

  // --- TEMPLATE GENERATOR ---
  generateTemplate(stockId) {
    const stock = this.getStockById(stockId);
    if (!stock) return '';

    const product = this.getProductById(stock.product_id);
    const settings = this.getSettings();

    let rawTemplate = product && product.template ? product.template : DEFAULT_PRODUCTS[0].template;

    const auth = this.getAuth();
    if (auth && auth.username) {
      const userTemplates = this.getUserTemplates(auth.username);
      if (userTemplates[stock.product_id]) {
        rawTemplate = userTemplates[stock.product_id];
      }
    }

    let text = rawTemplate
      .replace(/{{nomor}}/g, stock.nomor)
      .replace(/{{email}}/g, stock.email)
      .replace(/{{login}}/g, stock.login_by)
      .replace(/{{profile}}/g, stock.profile)
      .replace(/{{pin}}/g, stock.pin)
      .replace(/{{support_phone}}/g, settings.support_phone)
      .replace(/{{product_name}}/g, stock.product_name);

    this.logActivity(`Copy template ${stock.product_name} (${stock.email})`, 'copy');
    return text;
  }

  // --- DASHBOARD & REPORTS STATS ---
  getDashboardStats() {
    this.checkSubscriptionExpirations();
    let stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];

    const auth = this.getAuth();
    if (auth && auth.role === 'Member') {
      const username = auth.username;
      stocks = stocks.filter(s => (s.status === 'ASSIGNED' && s.assigned_to === username) || (s.status === 'SEDANG BERLANGGANAN' && (s.sold_by === username || s.assigned_to === username)));
    }

    const now = new Date();

    const ready = stocks.filter(s => s.status === 'READY').length;
    const assigned = stocks.filter(s => s.status === 'ASSIGNED').length;
    const subbed = stocks.filter(s => s.status === 'SEDANG BERLANGGANAN').length;
    const totalStock = ready + assigned + subbed;

    const subbedStocks = stocks.filter(s => s.status === 'SEDANG BERLANGGANAN');

    const todayStr = now.toISOString().split('T')[0];
    const salesToday = subbedStocks.filter(s => s.sold_at && s.sold_at.startsWith(todayStr)).length;

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const salesMonth = subbedStocks.filter(s => {
      if (!s.sold_at) return false;
      const d = new Date(s.sold_at);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).length;

    const salesAllTime = subbedStocks.length;

    return {
      totalStock,
      ready,
      assigned,
      subbed,
      sold: subbed,
      salesToday,
      salesMonth,
      salesAllTime
    };
  }

  getReportData(filters = {}) {
    this.checkSubscriptionExpirations();
    const stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    const auth = this.getAuth();
    const now = new Date();

    const range = typeof filters === 'string' ? filters : (filters.range || 'ALL');
    const product_id = typeof filters === 'object' ? (filters.product_id || 'ALL') : 'ALL';
    const search = typeof filters === 'object' && filters.search ? filters.search.toLowerCase().trim() : '';

    let soldItems = stocks.filter(s => s.status === 'SEDANG BERLANGGANAN' || s.status === 'SOLD' || s.sold_at);

    if (auth && auth.role === 'Member') {
      soldItems = soldItems.filter(s => s.sold_by === auth.username || s.assigned_to === auth.username);
    }

    // Range filtering
    if (range === 'TODAY') {
      const todayStr = now.toISOString().split('T')[0];
      soldItems = soldItems.filter(s => s.sold_at && s.sold_at.startsWith(todayStr));
    } else if (range === '7DAYS') {
      const limit = new Date(now - 7 * 86400000);
      soldItems = soldItems.filter(s => s.sold_at && new Date(s.sold_at) >= limit);
    } else if (range === '30DAYS') {
      const limit = new Date(now - 30 * 86400000);
      soldItems = soldItems.filter(s => s.sold_at && new Date(s.sold_at) >= limit);
    } else if (range === 'THIS_MONTH') {
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      soldItems = soldItems.filter(s => {
        if (!s.sold_at) return false;
        const d = new Date(s.sold_at);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });
    }

    // Product filtering
    if (product_id && product_id !== 'ALL') {
      soldItems = soldItems.filter(s => s.product_id === product_id);
    }

    // Search query filtering (Buyer Name, Buyer WA, Email, Product Name)
    if (search !== '') {
      soldItems = soldItems.filter(s =>
        (s.buyer_name && s.buyer_name.toLowerCase().includes(search)) ||
        (s.buyer_wa && s.buyer_wa.toLowerCase().includes(search)) ||
        (s.email && s.email.toLowerCase().includes(search)) ||
        (s.product_name && s.product_name.toLowerCase().includes(search)) ||
        (s.nomor && s.nomor.toLowerCase().includes(search)) ||
        (s.profile && s.profile.toLowerCase().includes(search))
      );
    }

    // Sort by sold_at latest
    soldItems.sort((a, b) => new Date(b.sold_at || b.created_at) - new Date(a.sold_at || a.created_at));

    // Calculate unique buyers count
    const uniqueBuyersSet = new Set();
    soldItems.forEach(s => {
      const identifier = s.buyer_wa || s.buyer_name;
      if (identifier) uniqueBuyersSet.add(identifier);
    });

    // Top selling product in this selection
    const productCounts = {};
    soldItems.forEach(s => {
      productCounts[s.product_name] = (productCounts[s.product_name] || 0) + 1;
    });

    let topProduct = '-';
    let maxCount = 0;
    Object.keys(productCounts).forEach(pName => {
      if (productCounts[pName] > maxCount) {
        maxCount = productCounts[pName];
        topProduct = pName;
      }
    });

    return {
      total: soldItems.length,
      uniqueBuyers: uniqueBuyersSet.size,
      topProduct: topProduct,
      soldItems: soldItems
    };
  }

  // --- ACTIVITY LOGS ---
  getActivityLogs() {
    return JSON.parse(localStorage.getItem(DB_KEYS.LOGS)) || [];
  }

  logActivity(activityText, type = 'add') {
    const logs = this.getActivityLogs();
    const newLog = {
      id: 'log-' + Date.now(),
      type: type,
      activity: activityText,
      created_at: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs));
    this.syncSupabaseTable('activity_logs', newLog, 'insert');
  }

  // --- BACKUP & RESET ---
  exportBackup() {
    const data = {
      products: this.getProducts(),
      stocks: JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [],
      logs: this.getActivityLogs(),
      settings: this.getSettings(),
      exported_at: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importBackup(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.products) localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(data.products));
      if (data.stocks) localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(data.stocks));
      if (data.logs) localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(data.logs));
      if (data.settings) localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(data.settings));
      this.logActivity('Import backup data berhasil', 'login');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  resetToDemoData() {
    localStorage.clear();
    this.initDatabase();
    this.logActivity('Reset sistem ke data demo bawaan', 'delete');
  }
}

// Global DB instance
const db = new StoreDB();
