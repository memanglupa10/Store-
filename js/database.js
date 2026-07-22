/* =========================================================
   Babyiel Store Inventory - Database & LocalStorage Engine
   ========================================================= */

const DB_KEYS = {
  USERS: 'babyiel_users',
  PRODUCTS: 'babyiel_products',
  STOCKS: 'babyiel_stocks',
  LOGS: 'babyiel_activity_logs',
  SETTINGS: 'babyiel_settings',
  AUTH: 'babyiel_auth_session'
};

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-disney',
    name: 'Disney+ Hotstar',
    icon: 'fa-tv',
    color: '#3b82f6',
    duration: '6 Bulan',
    template: `✨ DISNEY+ HOTSTAR PREMIUM SHARING ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
💎 DETAIL AKUN
✔️ Sharing (6bulan)
✔️ Full akses sesuai profil
✔️ Ready pakai

━━━━━━━━━━━━━━
📌 GARANSI
🛡️ Garansi aktif selama 6 bulan
🛡️ Jika masa akun kurang dari 6 bulan / bermasalah bukan karena user, akan di-follow up sesuai kebijakan admin

━━━━━━━━━━━━━━
📌 T&C (WAJIB DISETUJUI)
⚠️ Dilarang mengubah password / PIN
⚠️ Dilarang otak-atik setting akun
⚠️ Dilarang login di perangkat lain tanpa izin
⚠️ Akun hanya untuk pemakaian sesuai kesepakatan

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-netflix',
    name: 'Netflix',
    icon: 'fa-film',
    color: '#ef4444',
    duration: '1 Bulan',
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
📌 T&C (WAJIB DISETUJUI)
⚠️ Dilarang ganti password / nama profil lain
⚠️ Max 1 device aktif di 1 waktu

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-spotify',
    name: 'Spotify',
    icon: 'fa-music',
    color: '#10b981',
    duration: '2 Bulan',
    template: `✨ SPOTIFY PREMIUM INDIVIDUAL / FAMILY ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
💎 DETAIL AKUN
✔️ Full Garansi Music Without Ads
✔️ Download Offline Playback
✔️ High Quality Audio Streaming

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-youtube',
    name: 'YouTube Premium',
    icon: 'fa-play-circle',
    color: '#ff0000',
    duration: '1 Bulan',
    template: `✨ YOUTUBE PREMIUM NO ADS ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
💎 DETAIL AKUN
✔️ YouTube No Ads + YouTube Music
✔️ Background Playback

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-canva',
    name: 'Canva Pro',
    icon: 'fa-palette',
    color: '#06b6d4',
    duration: '1 Tahun',
    template: `✨ CANVA PRO DESIGNER TEAM ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
💎 DETAIL AKUN
✔️ Akses 100M+ Elemen Premium
✔️ Brand Kit, Magic Resize & Background Remover

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-chatgpt',
    name: 'ChatGPT Plus',
    icon: 'fa-robot',
    color: '#10a37f',
    duration: '1 Bulan',
    template: `✨ CHATGPT PLUS (GPT-4o & DALL-E 3) ✨

📞 Nomor : {{nomor}}
📩 Email : {{email}}
Login By : {{login}}
👤 Profil : {{profile}}
🔐 PIN : {{pin}}

━━━━━━━━━━━━━━
💎 DETAIL AKUN
✔️ Akses Model Tercepat GPT-4o
✔️ DALL-E 3 Image Generator & Advanced Data Analysis

━━━━━━━━━━━━━━
📞 Support:
© Babyiel Store ({{support_phone}})`
  }
];

const DEFAULT_USERS = [
  {
    id: 'usr-1',
    username: 'admin',
    password: '123',
    name: 'Super Admin',
    role: 'Admin',
    created_at: new Date().toISOString()
  },
  {
    id: 'usr-2',
    username: 'member1',
    password: '123',
    name: 'Kasir Member',
    role: 'Member',
    created_at: new Date().toISOString()
  }
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
  }

  initDatabase() {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(DB_KEYS.SETTINGS)) {
      localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem(DB_KEYS.STOCKS)) {
      this.seedInitialStocks();
    } else {
      // Auto-migrate legacy RESERVED stocks and add default assigned_to
      let stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
      let updated = false;
      stocks.forEach(s => {
        if (s.status === 'RESERVED') {
          s.status = 'READY';
          updated = true;
        }
        if (!s.assigned_to) {
          s.assigned_to = 'member1';
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocks));
      }
    }
    if (!localStorage.getItem(DB_KEYS.LOGS)) {
      this.seedInitialLogs();
    }
  }

  seedInitialStocks() {
    const now = new Date();
    const mockStocks = [
      {
        id: 'STK-1001',
        product_id: 'prod-disney',
        product_name: 'Disney+ Hotstar',
        nomor: '085775335453',
        email: 'disney.vip01@babyiel.com',
        login_by: 'OTP WhatsApp',
        profile: 'Profil 1 (Rian)',
        pin: '1234',
        note: 'Akun batch utama',
        status: 'READY',
        created_at: new Date(now - 86400000 * 3).toISOString(),
        updated_at: new Date(now - 86400000 * 3).toISOString(),
        sold_at: null
      },
      {
        id: 'STK-1002',
        product_id: 'prod-netflix',
        product_name: 'Netflix',
        nomor: '081234567890',
        email: 'net.prem4k@gmail.com',
        login_by: 'Email & Password',
        profile: 'Profil A',
        pin: '9988',
        note: 'Garansi 30 hari',
        status: 'READY',
        created_at: new Date(now - 86400000 * 2).toISOString(),
        updated_at: new Date(now - 86400000 * 1).toISOString(),
        sold_at: null
      },
      {
        id: 'STK-1003',
        product_id: 'prod-spotify',
        product_name: 'Spotify',
        nomor: '089876543210',
        email: 'spot.fam01@outlook.com',
        login_by: 'Direct Mail Invite',
        profile: 'User 3',
        pin: '-',
        note: 'Family Plan',
        status: 'SOLD',
        created_at: new Date(now - 86400000 * 4).toISOString(),
        updated_at: new Date(now - 3600000 * 2).toISOString(),
        sold_at: new Date(now - 3600000 * 2).toISOString()
      },
      {
        id: 'STK-1004',
        product_id: 'prod-youtube',
        product_name: 'YouTube Premium',
        nomor: '085775335453',
        email: 'yt.noads.pro@gmail.com',
        login_by: 'Google Account',
        profile: 'Utama',
        pin: '-',
        note: 'Invited via family link',
        status: 'SOLD',
        created_at: new Date(now - 86400000 * 5).toISOString(),
        updated_at: new Date(now - 86400000 * 1).toISOString(),
        sold_at: new Date(now - 86400000 * 1).toISOString()
      },
      {
        id: 'STK-1005',
        product_id: 'prod-canva',
        product_name: 'Canva Pro',
        nomor: '081122334455',
        email: 'canva.designer@yahoo.com',
        login_by: 'Magic Link',
        profile: 'Admin Team',
        pin: '-',
        note: 'Akses 1 Tahun',
        status: 'READY',
        created_at: new Date(now - 86400000 * 1).toISOString(),
        updated_at: new Date(now - 86400000 * 1).toISOString(),
        sold_at: null
      },
      {
        id: 'STK-1006',
        product_id: 'prod-chatgpt',
        product_name: 'ChatGPT Plus',
        nomor: '085775335453',
        email: 'gpt4o.master@openai.com',
        login_by: 'Email & Password',
        profile: 'Personal',
        pin: '5544',
        note: 'Ready GPT-4o',
        status: 'READY',
        created_at: new Date(now - 3600000 * 5).toISOString(),
        updated_at: new Date(now - 3600000 * 5).toISOString(),
        sold_at: null
      },
      {
        id: 'STK-1007',
        product_id: 'prod-disney',
        product_name: 'Disney+ Hotstar',
        nomor: '082233445566',
        email: 'disney.sub02@babyiel.com',
        login_by: 'OTP Phone',
        profile: 'Profil 2 (Budi)',
        pin: '4321',
        note: 'Terjual ke reseller',
        status: 'SOLD',
        created_at: new Date(now - 86400000 * 6).toISOString(),
        updated_at: new Date(now - 3600000 * 6).toISOString(),
        sold_at: new Date(now - 3600000 * 6).toISOString()
      }
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
    return JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || DEFAULT_USERS;
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
    const users = this.getUsers();
    const uInput = (username || '').trim().toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === uInput && u.password === password);

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
    return { success: false, message: 'Username atau Password salah!' };
  }

  logout() {
    const auth = this.getAuth();
    if (auth) {
      this.logActivity(`User (${auth.username}) logout dari sistem`, 'login');
    }
    localStorage.removeItem(DB_KEYS.AUTH);
  }

  // --- PRODUCTS ---
  getProducts() {
    return JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS)) || [];
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
      color: productData.color || '#3b82f6',
      duration: productData.duration || '1 Bulan',
      template: productData.template || ''
    };
    products.push(newProduct);
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    this.logActivity(`Admin menambahkan produk baru: ${newProduct.name}`, 'add');
    return newProduct;
  }

  updateProduct(id, productData) {
    let products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...productData };
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
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
      this.logActivity(`Admin menghapus produk: ${prod.name}`, 'delete');
      return true;
    }
    return false;
  }

  // --- STOCKS ---
  getStocks(filters = {}) {
    let stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];

    const auth = this.getAuth();
    if (auth && auth.role === 'Member') {
      stocks = stocks.filter(s => s.assigned_to === auth.username || s.assigned_to === auth.id);
    }

    if (filters.status && filters.status !== 'ALL') {
      stocks = stocks.filter(s => s.status === filters.status);
    }

    if (filters.product_id && filters.product_id !== 'ALL') {
      stocks = stocks.filter(s => s.product_id === filters.product_id);
    }

    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      stocks = stocks.filter(s => 
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.nomor && s.nomor.toLowerCase().includes(q)) ||
        (s.profile && s.profile.toLowerCase().includes(q)) ||
        (s.product_name && s.product_name.toLowerCase().includes(q)) ||
        (s.id && s.id.toLowerCase().includes(q)) ||
        (s.assigned_to && s.assigned_to.toLowerCase().includes(q))
      );
    }

    // Sort by latest created_at
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
      assigned_to: stockData.assigned_to || (auth ? auth.username : null),
      status: 'READY',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sold_at: null
    };

    stocks.unshift(newStock);
    localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocks));
    this.logActivity(`Input stock baru: ${newStock.product_name} (${newStock.email})`, 'add');
    return newStock;
  }

  transferStock(stockId, targetUsername) {
    let stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    const index = stocks.findIndex(s => s.id === stockId);
    if (index !== -1) {
      stocks[index].assigned_to = targetUsername;
      stocks[index].updated_at = new Date().toISOString();
      localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocks));
      this.logActivity(`Transfer stok ${stocks[index].product_name} (${stocks[index].email}) ke ${targetUsername}`, 'copy');
      return stocks[index];
    }
    return null;
  }

  updateStockStatus(id, newStatus) {
    let stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    const index = stocks.findIndex(s => s.id === id);

    if (index !== -1) {
      const stock = stocks[index];
      stock.status = newStatus;
      stock.updated_at = new Date().toISOString();

      if (newStatus === 'SOLD') {
        stock.sold_at = new Date().toISOString();
        this.logActivity(`Status akun ${stock.product_name} (${stock.email}) menjadi SOLD`, 'sold');
      } else {
        stock.sold_at = null;
        this.logActivity(`Status akun ${stock.product_name} (${stock.email}) menjadi READY`, 'add');
      }

      localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocks));
      return stock;
    }
    return null;
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
      this.logActivity(`Delete stock: ${stock.product_name} (${stock.email})`, 'delete');
      return true;
    }
    return false;
  }

  // --- TEMPLATE GENERATOR ---
  generateTemplate(stockId) {
    const stock = this.getStockById(stockId);
    if (!stock) return '';

    const product = this.getProductById(stock.product_id);
    const settings = this.getSettings();

    let rawTemplate = product && product.template ? product.template : DEFAULT_PRODUCTS[0].template;

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
    let stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];

    const auth = this.getAuth();
    if (auth && auth.role === 'Member') {
      stocks = stocks.filter(s => s.assigned_to === auth.username || s.assigned_to === auth.id);
    }

    const now = new Date();

    const ready = stocks.filter(s => s.status === 'READY').length;
    const sold = stocks.filter(s => s.status === 'SOLD').length;
    const totalStock = ready + sold; // Strictly Ready + Sold

    // Filter sold items
    const soldStocks = stocks.filter(s => s.status === 'SOLD' && s.sold_at);

    // Sales Today
    const todayStr = now.toISOString().split('T')[0];
    const salesToday = soldStocks.filter(s => s.sold_at.startsWith(todayStr)).length;

    // Sales This Month
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const salesMonth = soldStocks.filter(s => {
      const d = new Date(s.sold_at);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).length;

    // Sales All Time
    const salesAllTime = sold;

    return {
      totalStock,
      ready,
      sold,
      salesToday,
      salesMonth,
      salesAllTime
    };
  }

  getReportData(range = 'ALL') {
    const stocks = JSON.parse(localStorage.getItem(DB_KEYS.STOCKS)) || [];
    const products = this.getProducts();
    const now = new Date();

    let soldItems = stocks.filter(s => s.status === 'SOLD' && s.sold_at);

    if (range === 'TODAY') {
      const todayStr = now.toISOString().split('T')[0];
      soldItems = soldItems.filter(s => s.sold_at.startsWith(todayStr));
    } else if (range === '7DAYS') {
      const limit = new Date(now - 7 * 86400000);
      soldItems = soldItems.filter(s => new Date(s.sold_at) >= limit);
    } else if (range === '30DAYS') {
      const limit = new Date(now - 30 * 86400000);
      soldItems = soldItems.filter(s => new Date(s.sold_at) >= limit);
    } else if (range === 'THIS_MONTH') {
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      soldItems = soldItems.filter(s => {
        const d = new Date(s.sold_at);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });
    }

    // Group count per product
    const summary = {};
    products.forEach(p => {
      summary[p.name] = 0;
    });

    soldItems.forEach(item => {
      if (summary[item.product_name] !== undefined) {
        summary[item.product_name]++;
      } else {
        summary[item.product_name] = 1;
      }
    });

    return {
      total: soldItems.length,
      byProduct: summary,
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
