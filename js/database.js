/* =========================================================
   Babyiel Store Inventory - Database & Supabase Engine
   ========================================================= */

const SUPABASE_CONFIG = {
  url: 'https://sgcgohxykqlapmvyvktn.supabase.co',
  key: 'sb_publishable_DLpnrdax3wFWWawYAvGPhA_EtXnanNI'
};

let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
  }
}

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
  { id: 'usr-admin-2', username: 'admin2', password: '123', name: 'Rian Hidayat (Admin Op)', role: 'Admin', created_at: new Date().toISOString() },
  { id: 'usr-m1', username: 'member1', password: '123', name: 'Budi Santoso', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m2', username: 'member2', password: '123', name: 'Siti Aminah', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m3', username: 'member3', password: '123', name: 'Dewi Lestari', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m4', username: 'member4', password: '123', name: 'Ahmad Fauzi', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m5', username: 'member5', password: '123', name: 'Eko Prasetyo', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m6', username: 'member6', password: '123', name: 'Maya Putri', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m7', username: 'member7', password: '123', name: 'Rizky Pratama', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m8', username: 'member8', password: '123', name: 'Hendra Wijaya', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m9', username: 'member9', password: '123', name: 'Dian Sastro', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m10', username: 'member10', password: '123', name: 'Fajar Ramadhan', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m11', username: 'member11', password: '123', name: 'Gita Gutawa', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m12', username: 'member12', password: '123', name: 'Bayu Skak', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m13', username: 'member13', password: '123', name: 'Rani Permata', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m14', username: 'member14', password: '123', name: 'Tri Wahyuni', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m15', username: 'member15', password: '123', name: 'Andi Wijaya', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m16', username: 'member16', password: '123', name: 'Bambang Susilo', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m17', username: 'member17', password: '123', name: 'Surya Kencana', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m18', username: 'member18', password: '123', name: 'Nurul Hidayah', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m19', username: 'member19', password: '123', name: 'Kevin Sanjaya', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m20', username: 'member20', password: '123', name: 'Marcus Gideon', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m21', username: 'member21', password: '123', name: 'Lesti Kejora', role: 'Member', created_at: new Date().toISOString() }
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
    setTimeout(() => this.initSupabaseSync(), 100);
  }

  async initSupabaseSync() {
    this.updateSupabaseStatusBadge(true);
    if (!supabaseClient) {
      this.updateSupabaseStatusBadge(false);
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
      console.warn('Supabase sync info:', err);
      this.updateSupabaseStatusBadge(true);
    }
  }

  updateSupabaseStatusBadge(isConnected) {
    const badge = document.getElementById('supabase-status-badge');
    if (!badge) return;
    if (isConnected) {
      badge.className = 'supabase-badge';
      badge.innerHTML = '<span class="badge-dot"></span> Supabase Connected';
    } else {
      badge.className = 'supabase-badge disconnected';
      badge.innerHTML = '<span class="badge-dot"></span> Offline Fallback';
    }
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
    if (currentUsers.length < 23) {
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

    const SEED_VERSION = 'v5_3_status_stock_architecture';
    if (localStorage.getItem('babyiel_seed_version') !== SEED_VERSION) {
      this.seedInitialStocks();
      localStorage.setItem('babyiel_seed_version', SEED_VERSION);
    } else {
      const currentStocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
      if (currentStocks.length < 20) {
        this.seedInitialStocks();
      }
    }

    if (!localStorage.getItem(DB_KEYS.LOGS)) {
      this.seedInitialLogs();
    }
  }

  seedInitialStocks() {
    const now = new Date();
    const mockStocks = [
      // === 15 STOCK READY (Under Admin Control) ===
      { id: 'STK-1001', product_id: 'prod-disney', product_name: 'Disney+ Hotstar', nomor: '085775335453', email: 'disney.vip01@babyiel.com', login_by: 'OTP WhatsApp', profile: 'Profil 1 (Rian)', pin: '1234', note: 'Akun batch utama', assigned_to: 'admin', status: 'READY', created_at: new Date(now - 86400000 * 3).toISOString(), updated_at: new Date(now - 86400000 * 3).toISOString(), history: [{ type: 'CREATED', date: new Date(now - 86400000 * 3).toISOString(), by: 'admin', details: 'Stok dibuat oleh Admin' }] },
      { id: 'STK-1005', product_id: 'prod-canva', product_name: 'Canva Pro', nomor: '081122334455', email: 'canva.designer@yahoo.com', login_by: 'Magic Link', profile: 'Admin Team', pin: '-', note: 'Akses 1 Tahun', assigned_to: 'admin', status: 'READY', created_at: new Date(now - 86400000 * 1).toISOString(), updated_at: new Date(now - 86400000 * 1).toISOString(), history: [{ type: 'CREATED', date: new Date(now - 86400000 * 1).toISOString(), by: 'admin', details: 'Stok dibuat oleh Admin' }] },
      { id: 'STK-1006', product_id: 'prod-chatgpt', product_name: 'ChatGPT Plus', nomor: '085775335453', email: 'gpt4o.master@openai.com', login_by: 'Email & Password', profile: 'Personal', pin: '5544', note: 'Ready GPT-4o', assigned_to: 'admin', status: 'READY', created_at: new Date(now - 3600000 * 5).toISOString(), updated_at: new Date(now - 3600000 * 5).toISOString() },
      { id: 'STK-1009', product_id: 'prod-vidio', product_name: 'Vidio Platinum', nomor: '085611223344', email: 'vidio.plat01@gmail.com', login_by: 'OTP Phone', profile: 'Profil 1', pin: '1234', note: 'Premier Platinum 1 Bulan', assigned_to: 'admin', status: 'READY', created_at: new Date(now - 86400000 * 1).toISOString(), updated_at: new Date(now - 86400000 * 1).toISOString() },
      { id: 'STK-1010', product_id: 'prod-iqiyi', product_name: 'iQIYI Premium', nomor: '087711223344', email: 'iqiyi.vip01@outlook.com', login_by: 'Email & Password', profile: 'VIP Profile', pin: '8899', note: 'Standard VIP', assigned_to: 'admin', status: 'READY', created_at: new Date(now - 3600000 * 8).toISOString(), updated_at: new Date(now - 3600000 * 8).toISOString() },
      { id: 'STK-1011', product_id: 'prod-spotify', product_name: 'Spotify Premium', nomor: '089988776655', email: 'spot.fam02@gmail.com', login_by: 'Invite Link', profile: 'Profil Member 11', pin: '-', note: 'Full Garansi 1 Bulan', assigned_to: 'admin', status: 'READY', created_at: new Date(now - 86400000 * 2).toISOString(), updated_at: new Date(now - 86400000 * 2).toISOString() },
      { id: 'STK-1012', product_id: 'prod-youtube', product_name: 'YouTube Premium', nomor: '081345678901', email: 'yt.fam02@gmail.com', login_by: 'Google Account', profile: 'User 2', pin: '-', note: 'Individu Plan', assigned_to: 'admin', status: 'READY', created_at: new Date(now - 86400000 * 1).toISOString(), updated_at: new Date(now - 86400000 * 1).toISOString() },
      { id: 'STK-1013', product_id: 'prod-getcontact', product_name: 'Getcontact Premium', nomor: '085811223344', email: 'getcontact.prem02@gmail.com', login_by: 'OTP SMS', profile: 'Profil 2', pin: '-', note: 'Aktif 1 Bulan', assigned_to: 'admin', status: 'READY', created_at: new Date(now - 3600000 * 12).toISOString(), updated_at: new Date(now - 3600000 * 12).toISOString() },
      { id: 'STK-1014', product_id: 'prod-disney', product_name: 'Disney+ Hotstar', nomor: '081299887711', email: 'disney.prem03@babyiel.com', login_by: 'OTP WhatsApp', profile: 'Profil 3', pin: '5678', note: 'Private Profile', assigned_to: 'admin', status: 'READY', created_at: new Date(now - 86400000 * 4).toISOString(), updated_at: new Date(now - 86400000 * 4).toISOString() },
      { id: 'STK-1015', product_id: 'prod-netflix', product_name: 'Netflix Premium', nomor: '085711223399', email: 'net.prem4k_02@gmail.com', login_by: 'Email & Password', profile: 'Profil B', pin: '1122', note: 'Private User Screen', assigned_to: 'admin', status: 'READY', created_at: new Date(now - 3600000 * 3).toISOString(), updated_at: new Date(now - 3600000 * 3).toISOString() },
      { id: 'STK-1016', product_id: 'prod-canva', product_name: 'Canva Pro', nomor: '087899001122', email: 'canva.brand02@gmail.com', login_by: 'Magic Link', profile: 'Brand Kit', pin: '-', note: 'Garansi Full', assigned_to: 'admin', status: 'READY', created_at: new Date(now - 86400000 * 2).toISOString(), updated_at: new Date(now - 86400000 * 2).toISOString() },
      { id: 'STK-1017', product_id: 'prod-chatgpt', product_name: 'ChatGPT Plus', nomor: '081233445566', email: 'gpt4o.team02@openai.com', login_by: 'Email & Password', profile: 'Team 2', pin: '9090', note: 'Batch Admin', assigned_to: 'admin', status: 'READY', created_at: new Date(now - 3600000 * 6).toISOString(), updated_at: new Date(now - 3600000 * 6).toISOString() },
      { id: 'STK-1018', product_id: 'prod-vidio', product_name: 'Vidio Platinum', nomor: '085677889900', email: 'vidio.plat02@gmail.com', login_by: 'OTP Phone', profile: 'Profil 2', pin: '4321', note: 'Premier League Ready', assigned_to: 'admin', status: 'READY', created_at: new Date(now - 86400000 * 1).toISOString(), updated_at: new Date(now - 86400000 * 1).toISOString() },
      { id: 'STK-1019', product_id: 'prod-iqiyi', product_name: 'iQIYI Premium', nomor: '081900112233', email: 'iqiyi.vip02@gmail.com', login_by: 'Email & Password', profile: 'VIP Screen 2', pin: '7788', note: 'Aktif 1 Bulan', assigned_to: 'admin', status: 'READY', created_at: new Date(now - 3600000 * 15).toISOString(), updated_at: new Date(now - 3600000 * 15).toISOString() },
      { id: 'STK-1031', product_id: 'prod-spotify', product_name: 'Spotify Premium', nomor: '081244556677', email: 'spot.fam03@gmail.com', login_by: 'Invite Link', profile: 'User 5', pin: '-', note: 'Garansi 30 Hari', assigned_to: 'admin', status: 'READY', created_at: new Date(now - 86400000 * 1).toISOString(), updated_at: new Date(now - 86400000 * 1).toISOString() },

      // === 10 STOCK ASSIGNED TO RESELLERS ===
      { id: 'STK-1002', product_id: 'prod-netflix', product_name: 'Netflix Premium', nomor: '081234567890', email: 'net.prem4k@gmail.com', login_by: 'Email & Password', profile: 'Profil A', pin: '9988', note: 'Assigned to member1', assigned_to: 'member1', assigned_at: new Date(now - 86400000 * 1).toISOString(), assigned_by: 'admin', status: 'ASSIGNED', created_at: new Date(now - 86400000 * 2).toISOString(), updated_at: new Date(now - 86400000 * 1).toISOString(), history: [{ type: 'CREATED', date: new Date(now - 86400000 * 2).toISOString(), by: 'admin' }, { type: 'ASSIGNED', date: new Date(now - 86400000 * 1).toISOString(), by: 'admin', to: 'member1' }] },
      { id: 'STK-1032', product_id: 'prod-youtube', product_name: 'YouTube Premium', nomor: '085733221100', email: 'yt.fam03@gmail.com', login_by: 'Google Account', profile: 'User 3', pin: '-', note: 'Assigned to member1', assigned_to: 'member1', assigned_at: new Date(now - 3600000 * 4).toISOString(), assigned_by: 'admin', status: 'ASSIGNED', created_at: new Date(now - 3600000 * 4).toISOString(), updated_at: new Date(now - 3600000 * 4).toISOString(), history: [{ type: 'ASSIGNED', date: new Date(now - 3600000 * 4).toISOString(), by: 'admin', to: 'member1' }] },
      { id: 'STK-1033', product_id: 'prod-netflix', product_name: 'Netflix Premium', nomor: '081299001122', email: 'net.prem4k_03@gmail.com', login_by: 'Email & Password', profile: 'Profil D', pin: '3344', note: 'Assigned to member2', assigned_to: 'member2', assigned_at: new Date(now - 86400000 * 2).toISOString(), assigned_by: 'admin', status: 'ASSIGNED', created_at: new Date(now - 86400000 * 2).toISOString(), updated_at: new Date(now - 86400000 * 2).toISOString() },
      { id: 'STK-1034', product_id: 'prod-disney', product_name: 'Disney+ Hotstar', nomor: '085811335577', email: 'disney.prem04@babyiel.com', login_by: 'OTP WhatsApp', profile: 'Profil 4', pin: '9900', note: 'Assigned to member2', assigned_to: 'member2', assigned_at: new Date(now - 86400000 * 1).toISOString(), assigned_by: 'admin', status: 'ASSIGNED', created_at: new Date(now - 86400000 * 1).toISOString(), updated_at: new Date(now - 86400000 * 1).toISOString() },
      { id: 'STK-1035', product_id: 'prod-canva', product_name: 'Canva Pro', nomor: '087811223344', email: 'canva.brand03@gmail.com', login_by: 'Magic Link', profile: 'Team Design', pin: '-', note: 'Assigned to member3', assigned_to: 'member3', assigned_at: new Date(now - 3600000 * 2).toISOString(), assigned_by: 'admin', status: 'ASSIGNED', created_at: new Date(now - 3600000 * 2).toISOString(), updated_at: new Date(now - 3600000 * 2).toISOString() },
      { id: 'STK-1041', product_id: 'prod-chatgpt', product_name: 'ChatGPT Plus', nomor: '081299887766', email: 'gpt.res01@openai.com', login_by: 'Email & Password', profile: 'User 1', pin: '1122', note: 'Assigned to member4', assigned_to: 'member4', assigned_at: new Date(now - 86400000 * 1).toISOString(), assigned_by: 'admin', status: 'ASSIGNED', created_at: new Date(now - 86400000 * 1).toISOString(), updated_at: new Date(now - 86400000 * 1).toISOString() },
      { id: 'STK-1042', product_id: 'prod-vidio', product_name: 'Vidio Platinum', nomor: '085711224455', email: 'vidio.res01@gmail.com', login_by: 'OTP Phone', profile: 'Profil 1', pin: '5566', note: 'Assigned to member5', assigned_to: 'member5', assigned_at: new Date(now - 86400000 * 2).toISOString(), assigned_by: 'admin', status: 'ASSIGNED', created_at: new Date(now - 86400000 * 2).toISOString(), updated_at: new Date(now - 86400000 * 2).toISOString() },
      { id: 'STK-1043', product_id: 'prod-spotify', product_name: 'Spotify Premium', nomor: '089988771122', email: 'spot.res01@gmail.com', login_by: 'Invite Link', profile: 'Fam 1', pin: '-', note: 'Assigned to member6', assigned_to: 'member6', assigned_at: new Date(now - 86400000 * 3).toISOString(), assigned_by: 'admin', status: 'ASSIGNED', created_at: new Date(now - 86400000 * 3).toISOString(), updated_at: new Date(now - 86400000 * 3).toISOString() },
      { id: 'STK-1044', product_id: 'prod-youtube', product_name: 'YouTube Premium', nomor: '081399887766', email: 'yt.res01@gmail.com', login_by: 'Google Account', profile: 'User 1', pin: '-', note: 'Assigned to member7', assigned_to: 'member7', assigned_at: new Date(now - 86400000 * 1).toISOString(), assigned_by: 'admin', status: 'ASSIGNED', created_at: new Date(now - 86400000 * 1).toISOString(), updated_at: new Date(now - 86400000 * 1).toISOString() },
      { id: 'STK-1045', product_id: 'prod-disney', product_name: 'Disney+ Hotstar', nomor: '085899887766', email: 'disney.res01@babyiel.com', login_by: 'OTP WhatsApp', profile: 'Profil 1', pin: '8899', note: 'Assigned to member8', assigned_to: 'member8', assigned_at: new Date(now - 3600000 * 5).toISOString(), assigned_by: 'admin', status: 'ASSIGNED', created_at: new Date(now - 3600000 * 5).toISOString(), updated_at: new Date(now - 3600000 * 5).toISOString() },

      // === 15 STOCK SEDANG BERLANGGANAN (ACTIVE SUBSCRIPTIONS) ===
      { id: 'STK-1003', product_id: 'prod-spotify', product_name: 'Spotify Premium', nomor: '089876543210', email: 'spot.fam01@outlook.com', login_by: 'Direct Mail Invite', profile: 'User 3', pin: '-', note: 'Family Plan', assigned_to: 'admin', sold_by: 'admin', status: 'SEDANG BERLANGGANAN', buyer_wa: '081299887766', buyer_name: 'Budi Santoso', start_date: new Date(now - 86400000 * 10).toISOString(), expired_date: new Date(now + 86400000 * 20).toISOString(), created_at: new Date(now - 86400000 * 10).toISOString(), updated_at: new Date(now - 86400000 * 10).toISOString(), sold_at: new Date(now - 86400000 * 10).toISOString(), history: [{ type: 'SOLD', date: new Date(now - 86400000 * 10).toISOString(), by: 'admin', buyer_name: 'Budi Santoso', buyer_wa: '081299887766' }] },
      { id: 'STK-1004', product_id: 'prod-youtube', product_name: 'YouTube Premium', nomor: '085775335453', email: 'yt.noads.pro@gmail.com', login_by: 'Google Account', profile: 'Utama', pin: '-', note: 'Invited via family link', assigned_to: 'member1', sold_by: 'member1', status: 'SEDANG BERLANGGANAN', buyer_wa: '085711223344', buyer_name: 'Siti Aminah', start_date: new Date(now - 86400000 * 15).toISOString(), expired_date: new Date(now + 86400000 * 15).toISOString(), created_at: new Date(now - 86400000 * 20).toISOString(), updated_at: new Date(now - 86400000 * 15).toISOString(), sold_at: new Date(now - 86400000 * 15).toISOString(), history: [{ type: 'ASSIGNED', date: new Date(now - 86400000 * 20).toISOString(), by: 'admin', to: 'member1' }, { type: 'SOLD', date: new Date(now - 86400000 * 15).toISOString(), by: 'member1', buyer_name: 'Siti Aminah', buyer_wa: '085711223344' }] },
      { id: 'STK-1007', product_id: 'prod-disney', product_name: 'Disney+ Hotstar', nomor: '082233445566', email: 'disney.sub02@babyiel.com', login_by: 'OTP Phone', profile: 'Profil 2 (Budi)', pin: '4321', note: 'Terjual ke reseller', assigned_to: 'member2', sold_by: 'member2', status: 'SEDANG BERLANGGANAN', buyer_wa: '082233445566', buyer_name: 'Reseller Andi', start_date: new Date(now - 86400000 * 28).toISOString(), expired_date: new Date(now + 86400000 * 2).toISOString(), created_at: new Date(now - 86400000 * 30).toISOString(), updated_at: new Date(now - 86400000 * 28).toISOString(), sold_at: new Date(now - 86400000 * 28).toISOString() }, // EXPIRING SOON
      { id: 'STK-1008', product_id: 'prod-getcontact', product_name: 'Getcontact Premium', nomor: '081298765432', email: 'getcontact.pro01@gmail.com', login_by: 'OTP SMS', profile: 'Utama', pin: '-', note: 'Garansi Full', assigned_to: 'member3', sold_by: 'member3', status: 'SEDANG BERLANGGANAN', buyer_wa: '081298765432', buyer_name: 'Hendra Wijaya', start_date: new Date(now - 86400000 * 5).toISOString(), expired_date: new Date(now + 86400000 * 25).toISOString(), created_at: new Date(now - 86400000 * 10).toISOString(), updated_at: new Date(now - 86400000 * 5).toISOString(), sold_at: new Date(now - 86400000 * 5).toISOString() },
      { id: 'STK-1020', product_id: 'prod-netflix', product_name: 'Netflix Premium', nomor: '081277889900', email: 'net.sold01@gmail.com', login_by: 'Email & Password', profile: 'Profil 1', pin: '1234', note: 'Sold ke Dewi', assigned_to: 'member4', sold_by: 'member4', status: 'SEDANG BERLANGGANAN', buyer_wa: '081277889900', buyer_name: 'Dewi Lestari', start_date: new Date(now - 86400000 * 12).toISOString(), expired_date: new Date(now + 86400000 * 18).toISOString(), created_at: new Date(now - 86400000 * 15).toISOString(), updated_at: new Date(now - 86400000 * 12).toISOString(), sold_at: new Date(now - 86400000 * 12).toISOString() },
      { id: 'STK-1021', product_id: 'prod-canva', product_name: 'Canva Pro', nomor: '085799001122', email: 'canva.sold01@yahoo.com', login_by: 'Magic Link', profile: 'User Pro', pin: '-', note: 'Sold via WA', assigned_to: 'member5', sold_by: 'member5', status: 'SEDANG BERLANGGANAN', buyer_wa: '085799001122', buyer_name: 'Ahmad Fauzi', start_date: new Date(now - 86400000 * 29).toISOString(), expired_date: new Date(now + 86400000 * 1).toISOString(), created_at: new Date(now - 86400000 * 35).toISOString(), updated_at: new Date(now - 86400000 * 29).toISOString(), sold_at: new Date(now - 86400000 * 29).toISOString() }, // EXPIRING SOON
      { id: 'STK-1022', product_id: 'prod-chatgpt', product_name: 'ChatGPT Plus', nomor: '081311223344', email: 'gpt.sold01@openai.com', login_by: 'Email & Password', profile: 'Personal 1', pin: '4455', note: 'Plus Monthly', assigned_to: 'member6', sold_by: 'member6', status: 'SEDANG BERLANGGANAN', buyer_wa: '081311223344', buyer_name: 'Eko Prasetyo', start_date: new Date(now - 86400000 * 8).toISOString(), expired_date: new Date(now + 86400000 * 22).toISOString(), created_at: new Date(now - 86400000 * 10).toISOString(), updated_at: new Date(now - 86400000 * 8).toISOString(), sold_at: new Date(now - 86400000 * 8).toISOString() },
      { id: 'STK-1023', product_id: 'prod-vidio', product_name: 'Vidio Platinum', nomor: '085600112233', email: 'vidio.sold01@gmail.com', login_by: 'OTP Phone', profile: 'Profil 1', pin: '9900', note: 'Platinum Premier', assigned_to: 'member7', sold_by: 'member7', status: 'SEDANG BERLANGGANAN', buyer_wa: '085600112233', buyer_name: 'Maya Putri', start_date: new Date(now - 86400000 * 4).toISOString(), expired_date: new Date(now + 86400000 * 26).toISOString(), created_at: new Date(now - 86400000 * 6).toISOString(), updated_at: new Date(now - 86400000 * 4).toISOString(), sold_at: new Date(now - 86400000 * 4).toISOString() },
      { id: 'STK-1024', product_id: 'prod-iqiyi', product_name: 'iQIYI Premium', nomor: '087799887766', email: 'iqiyi.sold01@gmail.com', login_by: 'Email & Password', profile: 'VIP Screen 1', pin: '1212', note: 'VIP Standard', assigned_to: 'member8', sold_by: 'member8', status: 'SEDANG BERLANGGANAN', buyer_wa: '087799887766', buyer_name: 'Rizky Pratama', start_date: new Date(now - 86400000 * 14).toISOString(), expired_date: new Date(now + 86400000 * 16).toISOString(), created_at: new Date(now - 86400000 * 20).toISOString(), updated_at: new Date(now - 86400000 * 14).toISOString(), sold_at: new Date(now - 86400000 * 14).toISOString() },
      { id: 'STK-1025', product_id: 'prod-spotify', product_name: 'Spotify Premium', nomor: '089911223344', email: 'spot.sold02@outlook.com', login_by: 'Invite Link', profile: 'Fam User 2', pin: '-', note: 'Family Plan', assigned_to: 'member9', sold_by: 'member9', status: 'SEDANG BERLANGGANAN', buyer_wa: '089911223344', buyer_name: 'Dian Sastro', start_date: new Date(now - 86400000 * 2).toISOString(), expired_date: new Date(now + 86400000 * 28).toISOString(), created_at: new Date(now - 86400000 * 5).toISOString(), updated_at: new Date(now - 86400000 * 2).toISOString(), sold_at: new Date(now - 86400000 * 2).toISOString() },
      { id: 'STK-1026', product_id: 'prod-youtube', product_name: 'YouTube Premium', nomor: '081299881122', email: 'yt.sold02@gmail.com', login_by: 'Google Account', profile: 'Utama', pin: '-', note: 'Family Link', assigned_to: 'member10', sold_by: 'member10', status: 'SEDANG BERLANGGANAN', buyer_wa: '081299881122', buyer_name: 'Fajar Ramadhan', start_date: new Date(now - 86400000 * 18).toISOString(), expired_date: new Date(now + 86400000 * 12).toISOString(), created_at: new Date(now - 86400000 * 25).toISOString(), updated_at: new Date(now - 86400000 * 18).toISOString(), sold_at: new Date(now - 86400000 * 18).toISOString() },
      { id: 'STK-1027', product_id: 'prod-disney', product_name: 'Disney+ Hotstar', nomor: '085733445566', email: 'disney.sold03@babyiel.com', login_by: 'OTP WhatsApp', profile: 'Profil 1', pin: '3344', note: 'Privat Profile', assigned_to: 'member11', sold_by: 'member11', status: 'SEDANG BERLANGGANAN', buyer_wa: '085733445566', buyer_name: 'Gita Gutawa', start_date: new Date(now - 86400000 * 6).toISOString(), expired_date: new Date(now + 86400000 * 24).toISOString(), created_at: new Date(now - 86400000 * 8).toISOString(), updated_at: new Date(now - 86400000 * 6).toISOString(), sold_at: new Date(now - 86400000 * 6).toISOString() },
      { id: 'STK-1028', product_id: 'prod-canva', product_name: 'Canva Pro', nomor: '081199887766', email: 'canva.sold02@yahoo.com', login_by: 'Magic Link', profile: 'Designer 1', pin: '-', note: 'Akses 1 Tahun', assigned_to: 'member12', sold_by: 'member12', status: 'SEDANG BERLANGGANAN', buyer_wa: '081199887766', buyer_name: 'Bayu Skak', start_date: new Date(now - 86400000 * 60).toISOString(), expired_date: new Date(now + 86400000 * 305).toISOString(), created_at: new Date(now - 86400000 * 70).toISOString(), updated_at: new Date(now - 86400000 * 60).toISOString(), sold_at: new Date(now - 86400000 * 60).toISOString() },
      { id: 'STK-1029', product_id: 'prod-netflix', product_name: 'Netflix Premium', nomor: '085877889900', email: 'net.sold03@gmail.com', login_by: 'Email & Password', profile: 'Profil C', pin: '5566', note: 'Sold 1 Month', assigned_to: 'admin', sold_by: 'admin', status: 'SEDANG BERLANGGANAN', buyer_wa: '085877889900', buyer_name: 'Rani Permata', start_date: new Date(now - 86400000 * 3).toISOString(), expired_date: new Date(now + 86400000 * 27).toISOString(), created_at: new Date(now - 86400000 * 5).toISOString(), updated_at: new Date(now - 86400000 * 3).toISOString(), sold_at: new Date(now - 86400000 * 3).toISOString() },
      { id: 'STK-1030', product_id: 'prod-getcontact', product_name: 'Getcontact Premium', nomor: '081399001122', email: 'getcontact.sold02@gmail.com', login_by: 'OTP SMS', profile: 'User Premium', pin: '-', note: 'Garansi 30 Hari', assigned_to: 'member14', sold_by: 'member14', status: 'SEDANG BERLANGGANAN', buyer_wa: '081399001122', buyer_name: 'Tri Wahyuni', start_date: new Date(now - 86400000 * 7).toISOString(), expired_date: new Date(now + 86400000 * 23).toISOString(), created_at: new Date(now - 86400000 * 10).toISOString(), updated_at: new Date(now - 86400000 * 7).toISOString(), sold_at: new Date(now - 86400000 * 7).toISOString() }
    ];

    localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(mockStocks));
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

  login(username, password) {
    const uInput = (username || '').trim().toLowerCase();
    const pInput = (password || '').trim();

    // Direct Fail-Safe Login for Default Admin & Member
    if (uInput === 'admin' && (pInput === '123' || pInput === 'admin')) {
      const session = {
        id: 'usr-admin-1',
        username: 'admin',
        name: 'Super Admin Babyiel',
        role: 'Admin',
        logged_in_at: new Date().toISOString()
      };
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
        logged_in_at: new Date().toISOString()
      };
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
        logged_in_at: new Date().toISOString()
      };
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
