/* =========================================================
   Babyiel Store Inventory - Main Application Controller & UI
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  currentPage: 'dashboard',
  stockFilters: {
    status: 'READY',
    product_id: 'ALL',
    search: '',
    page: 1,
    limit: 10
  },
  reportFilter: 'ALL',
  salesChart: null,
  productsChart: null,

  init() {
    this.checkAuth();
    this.bindEvents();
    this.startClock();
  },

  checkAuth() {
    const auth = db.getAuth();
    const loginWrapper = document.getElementById('login-screen');
    const mainApp = document.getElementById('app-main');

    if (!auth) {
      loginWrapper.style.display = 'flex';
      mainApp.style.display = 'none';
    } else {
      loginWrapper.style.display = 'none';
      mainApp.style.display = 'flex';
      this.updateAdminHeader(auth);
      this.navigate(this.currentPage);
    }
  },

  updateAdminHeader(auth) {
    const adminNameEl = document.getElementById('header-admin-name');
    const adminRoleEl = document.querySelector('.user-info .role');
    const avatarEl = document.querySelector('.user-avatar');

    const displayName = auth ? (auth.name || auth.username) : 'Admin';
    const displayRole = auth ? auth.role : 'Admin';

    if (adminNameEl) adminNameEl.textContent = displayName;
    if (adminRoleEl) adminRoleEl.textContent = `● ${displayRole}`;
    if (avatarEl) avatarEl.textContent = (displayName[0] || 'A').toUpperCase();

    // Restrict Admin-only controls & sidebar navigation
    const isAdmin = displayRole === 'Admin';
    document.querySelectorAll('.admin-only-btn').forEach(btn => {
      btn.style.display = isAdmin ? 'inline-flex' : 'none';
    });
    document.querySelectorAll('.admin-only-nav').forEach(nav => {
      nav.style.display = isAdmin ? 'flex' : 'none';
    });
  },

  startClock() {
    const clockEl = document.getElementById('clock-display');
    const updateTime = () => {
      const now = new Date();
      const options = { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      };
      if (clockEl) clockEl.textContent = now.toLocaleDateString('id-ID', options);
    };
    updateTime();
    setInterval(updateTime, 1000);
  },

  bindEvents() {
    // Login Form Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('login-username').value;
        const pass = document.getElementById('login-password').value;
        const res = db.login(user, pass);
        if (res.success) {
          this.showToast('Login Berhasil', 'Selamat datang di Babyiel Store Inventory!', 'success');
          this.checkAuth();
        } else {
          this.showToast('Login Gagal', res.message, 'error');
        }
      });
    }

    // Logout Button
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.showConfirm(
          'Konfirmasi Logout',
          'Apakah Anda yakin ingin keluar dari aplikasi?',
          () => {
            db.logout();
            this.checkAuth();
            this.showToast('Logout', 'Anda telah keluar dari aplikasi.', 'info');
          }
        );
      });
    }

    // Navigation Links
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        this.navigate(page);

        // Close mobile drawer if open
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
      });
    });

    // Mobile Sidebar Toggle & Overlay
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('open');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
      });
    }

    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
      });
    }

    // Quick Add Stock Form Submit (Modal)
    const addStockForm = document.getElementById('add-stock-form');
    if (addStockForm) {
      addStockForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddStock();
      });
    }

    // Add Product Form Submit (Modal)
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
      addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddProduct();
      });
    }

    // User Form Submit (Modal)
    const userForm = document.getElementById('user-form');
    if (userForm) {
      userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveUser();
      });
    }

    // Transfer Stock Form Submit (Modal)
    const transferForm = document.getElementById('transfer-form');
    if (transferForm) {
      transferForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleTransferStock();
      });
    }

    // Realtime Stock Search
    const searchInput = document.getElementById('stock-search-input');
    const searchClear = document.getElementById('stock-search-clear');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.stockFilters.search = e.target.value;
        this.stockFilters.page = 1;
        if (searchClear) searchClear.style.display = e.target.value ? 'block' : 'none';
        this.renderStockTable();
      });
    }
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.stockFilters.search = '';
        this.stockFilters.page = 1;
        searchClear.style.display = 'none';
        this.renderStockTable();
      });
    }

    // Stock Tab Switching (Stock Ready vs Terjual)
    document.querySelectorAll('.stock-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.stock-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.stockFilters.status = btn.getAttribute('data-status');
        this.stockFilters.page = 1;
        this.renderStockTable();
      });
    });

    // Stock Filter Product Dropdown
    const filterProdSelect = document.getElementById('filter-product-select');
    if (filterProdSelect) {
      filterProdSelect.addEventListener('change', (e) => {
        this.stockFilters.product_id = e.target.value;
        this.stockFilters.page = 1;
        this.renderStockTable();
      });
    }

    // Report Filter Pills
    document.querySelectorAll('.report-filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.report-filter-pill').forEach(b => b.classList.remove('btn-primary'));
        document.querySelectorAll('.report-filter-pill').forEach(b => b.classList.add('btn-secondary'));
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');

        this.reportFilter = btn.getAttribute('data-range');
        this.renderReportView();
      });
    });

    // Settings Form
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveSettings();
      });
    }

    // Export Data Button
    const btnExport = document.getElementById('btn-export-json');
    if (btnExport) {
      btnExport.addEventListener('click', () => this.exportBackupJSON());
    }

    // Import Data Input
    const fileImport = document.getElementById('file-import-json');
    if (fileImport) {
      fileImport.addEventListener('change', (e) => this.importBackupJSON(e));
    }

    // Reset Demo Data Button
    const btnResetDemo = document.getElementById('btn-reset-demo');
    if (btnResetDemo) {
      btnResetDemo.addEventListener('click', () => {
        this.showConfirm(
          'Reset Data Demo',
          'Apakah Anda yakin ingin mengembalikan seluruh data ke data demo bawaan? Data baru Anda akan terhapus.',
          () => {
            db.resetToDemoData();
            this.showToast('Reset Berhasil', 'Sistem telah diset ke data demo.', 'success');
            this.navigate(this.currentPage);
          },
          'danger'
        );
      });
    }
  },

  navigate(page) {
    this.currentPage = page;

    // Update active navbar
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-page') === page) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Hide all view pages
    document.querySelectorAll('.view-page').forEach(p => p.style.display = 'none');

    // Show active page
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
      targetPage.style.display = 'block';
    }

    // Update page title in top bar
    const titleEl = document.getElementById('page-title');
    const descEl = document.getElementById('page-desc');

    const titles = {
      dashboard: { title: 'Dashboard Analytics', desc: 'Ringkasan performa stok dan penjualan akun digital.' },
      stock: { title: 'Kelola Stok Akun', desc: 'Daftar stok akun ready dan terjual.' },
      products: { title: 'Master Produk & Template', desc: 'Manajemen daftar produk dan format template WA.' },
      report: { title: 'Laporan Penjualan', desc: 'Analisis akun terjual berdasarkan periode dan produk.' },
      activity: { title: 'Activity Log', desc: 'Riwayat seluruh aktivitas sistem secara realtime.' },
      settings: { title: 'Pengaturan Sistem', desc: 'Kelola akun admin, kontak support, dan backup data.' }
    };

    if (titles[page]) {
      if (titleEl) titleEl.textContent = titles[page].title;
      if (descEl) descEl.textContent = titles[page].desc;
    }

    // Trigger page-specific renders
    if (page === 'dashboard') this.renderDashboardView();
    if (page === 'stock') this.renderStockView();
    if (page === 'products') this.renderProductsView();
    if (page === 'report') this.renderReportView();
    if (page === 'activity') this.renderActivityView();
    if (page === 'settings') this.renderSettingsView();
  },

  // =========================================================
  // DASHBOARD VIEW
  // =========================================================
  renderDashboardView() {
    const stats = db.getDashboardStats();

    // Update Stat Cards
    document.getElementById('stat-total-stock').textContent = stats.totalStock;
    document.getElementById('stat-ready-stock').textContent = stats.ready;
    document.getElementById('stat-sold-stock').textContent = stats.sold;

    // Update Sales Counter Cards
    document.getElementById('sales-today').textContent = `${stats.salesToday} Akun`;
    document.getElementById('sales-month').textContent = `${stats.salesMonth} Akun`;
    document.getElementById('sales-alltime').textContent = `${stats.salesAllTime} Akun`;

    // Render Charts
    this.renderDashboardCharts();
  },

  renderDashboardCharts() {
    const stocks = db.getStocks();
    const soldStocks = stocks.filter(s => s.status === 'SOLD' && s.sold_at);

    // Chart 1: Sales Per Day (Last 7 Days)
    const days = [];
    const salesPerDay = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      days.push(dayLabel);

      const count = soldStocks.filter(s => s.sold_at && s.sold_at.startsWith(dateStr)).length;
      salesPerDay.push(count);
    }

    const ctx1 = document.getElementById('chart-sales-daily');
    if (ctx1) {
      if (this.salesChart) this.salesChart.destroy();
      this.salesChart = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [{
            label: 'Akun Terjual',
            data: salesPerDay,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: '#3b82f6',
            borderWidth: 2,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1, color: '#94a3b8' },
              grid: { color: 'rgba(255,255,255,0.05)' }
            },
            x: {
              ticks: { color: '#94a3b8' },
              grid: { display: false }
            }
          }
        }
      });
    }

    // Chart 2: Top Selling Products
    const products = db.getProducts();
    const productLabels = [];
    const productCounts = [];
    const productColors = [];

    products.forEach(p => {
      const count = soldStocks.filter(s => s.product_id === p.id).length;
      productLabels.push(p.name);
      productCounts.push(count);
      productColors.push(p.color || '#3b82f6');
    });

    const ctx2 = document.getElementById('chart-top-products');
    if (ctx2) {
      if (this.productsChart) this.productsChart.destroy();
      this.productsChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: productLabels,
          datasets: [{
            data: productCounts,
            backgroundColor: productColors,
            borderColor: '#0f1420',
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: '#f8fafc', font: { family: 'Plus Jakarta Sans', size: 12 } }
            }
          }
        }
      });
    }
  },

  // =========================================================
  // STOCK VIEW
  // =========================================================
  renderStockView() {
    this.updateStockTabCounts();

    // Populate Product Filter Dropdown
    const prodSelect = document.getElementById('filter-product-select');
    if (prodSelect) {
      const products = db.getProducts();
      let html = '<option value="ALL">Semua Produk</option>';
      products.forEach(p => {
        html += `<option value="${p.id}" ${this.stockFilters.product_id === p.id ? 'selected' : ''}>${p.name}</option>`;
      });
      prodSelect.innerHTML = html;
    }

    this.renderStockTable();
  },

  updateStockTabCounts() {
    const allStocks = db.getStocks();
    const readyCount = allStocks.filter(s => s.status === 'READY').length;
    const soldCount = allStocks.filter(s => s.status === 'SOLD').length;

    const badgeReady = document.getElementById('badge-count-ready');
    const badgeSold = document.getElementById('badge-count-sold');
    if (badgeReady) badgeReady.textContent = readyCount;
    if (badgeSold) badgeSold.textContent = soldCount;
  },

  renderStockTable() {
    this.updateStockTabCounts();

    const tableBody = document.getElementById('stock-table-body');
    const paginationContainer = document.getElementById('stock-pagination');
    if (!tableBody) return;

    // Show Skeleton Loader first
    tableBody.innerHTML = `
      <tr>
        <td colspan="3">
          <div style="padding: 1rem 0;">
            <div class="skeleton" style="width: 100%; height: 40px; margin-bottom: 0.5rem;"></div>
            <div class="skeleton" style="width: 100%; height: 40px; margin-bottom: 0.5rem;"></div>
            <div class="skeleton" style="width: 100%; height: 40px;"></div>
          </div>
        </td>
      </tr>
    `;

    setTimeout(() => {
      const allFiltered = db.getStocks(this.stockFilters);
      const totalItems = allFiltered.length;
      const totalPages = Math.ceil(totalItems / this.stockFilters.limit) || 1;

      if (this.stockFilters.page > totalPages) this.stockFilters.page = totalPages;

      const startIndex = (this.stockFilters.page - 1) * this.stockFilters.limit;
      const paginatedItems = allFiltered.slice(startIndex, startIndex + this.stockFilters.limit);

      if (paginatedItems.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="3">
              <div class="empty-state">
                <i class="fa-solid fa-box-open empty-icon"></i>
                <h3>Stok Tidak Ditemukan</h3>
                <p>Tidak ada data stok ${this.stockFilters.status === 'READY' ? 'ready' : 'terjual'} yang sesuai dengan kriteria filter.</p>
                <button class="btn btn-primary" onclick="App.openAddStockModal()">
                  <i class="fa-solid fa-plus"></i> Tambah Stock Baru
                </button>
              </div>
            </td>
          </tr>
        `;
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
      }

      const currentAuth = db.getAuth();
      const isAdmin = currentAuth && currentAuth.role === 'Admin';

      let html = '';
      paginatedItems.forEach(item => {
        const prod = db.getProductById(item.product_id);
        const iconClass = prod ? prod.icon : 'fa-box';
        const prodColor = prod ? prod.color : '#3b82f6';

        const soldDateFormatted = item.sold_at ? new Date(item.sold_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : '';

        const renewalNum = db.getRenewalNumber(item.id);
        const isAssignedToAdmin = item.assigned_to === (currentAuth ? currentAuth.username : 'admin');

        html += `
          <tr>
            <td>
              <div class="product-pill">
                <i class="fa-solid ${iconClass}" style="color: ${prodColor};"></i>
                <span>${item.product_name}</span>
              </div>
            </td>
            <td>
              <div class="email-display">
                <div class="email-main-row">
                  <span class="email-text">${item.email}</span>
                  ${item.profile && item.profile !== '-' ? `
                    <span class="profile-pill-tag"><i class="fa-solid fa-user-tag"></i> ${item.profile}</span>
                  ` : ''}
                </div>
                ${isAdmin ? `
                  <span class="assigned-user-tag"><i class="fa-solid fa-user-circle"></i> Assigned: <b>${item.assigned_to || 'Belum di-assign'}</b></span>
                ` : ''}
                ${item.status === 'SOLD' && soldDateFormatted ? `
                  <span class="sold-date-tag"><i class="fa-solid fa-clock-rotate-left"></i> Terjual: ${soldDateFormatted}</span>
                ` : ''}
                ${renewalNum > 0 ? `
                  <span class="badge-renewal"><i class="fa-solid fa-rotate-right"></i> Perpanjang ${renewalNum}x</span>
                ` : ''}
              </div>
            </td>
            <td>
              <div class="action-btn-group" style="justify-content: flex-end;">
                ${isAdmin ? `
                  <button class="act-btn act-btn-transfer" onclick="App.openTransferModal('${item.id}')" title="Transfer stok ini ke Member">
                    <i class="fa-solid fa-share-nodes"></i> Transfer
                  </button>
                ` : ''}

                ${(isAdmin && !isAssignedToAdmin) ? `
                  <button class="act-btn act-btn-take" onclick="App.claimStock('${item.id}')" title="Ambil/Klaim stok ini ke Admin">
                    <i class="fa-solid fa-hand-holding"></i> Ambil Stock
                  </button>
                ` : `
                  <button class="act-btn act-btn-copy" onclick="App.copyTemplate('${item.id}')" title="Copy Template WA">
                    <i class="fa-solid fa-copy"></i> Copy
                  </button>

                  ${item.status === 'READY' ? `
                    <button class="act-btn act-btn-sold" onclick="App.changeStockStatus('${item.id}', 'SOLD')" title="Mark as Sold">
                      <i class="fa-solid fa-circle-check"></i> Sold
                    </button>
                    <button class="act-btn act-btn-delete" onclick="App.deleteStock('${item.id}')" title="Hapus Stock">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  ` : `
                    <button class="act-btn act-btn-renew" onclick="App.renewStock('${item.id}')" title="Perpanjang Akun Ini">
                      <i class="fa-solid fa-rotate-right"></i> Perpanjang
                    </button>
                    <button class="act-btn act-btn-ready" onclick="App.changeStockStatus('${item.id}', 'READY')" title="Kembalikan ke Ready">
                      <i class="fa-solid fa-rotate-left"></i> Ready
                    </button>
                  `}
                `}
              </div>
            </td>
          </tr>
        `;
      });

      tableBody.innerHTML = html;

      // Render Pagination Controls
      if (paginationContainer) {
        let pagHtml = `
          <div>Menampilkan <b>${startIndex + 1}</b> - <b>${Math.min(startIndex + this.stockFilters.limit, totalItems)}</b> dari <b>${totalItems}</b> stok</div>
          <div class="pagination-controls">
            <button class="page-btn" ${this.stockFilters.page === 1 ? 'disabled' : ''} onclick="App.setPage(${this.stockFilters.page - 1})">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
        `;

        for (let p = 1; p <= totalPages; p++) {
          pagHtml += `
            <button class="page-btn ${p === this.stockFilters.page ? 'active' : ''}" onclick="App.setPage(${p})">${p}</button>
          `;
        }

        pagHtml += `
            <button class="page-btn" ${this.stockFilters.page === totalPages ? 'disabled' : ''} onclick="App.setPage(${this.stockFilters.page + 1})">
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        `;
        paginationContainer.innerHTML = pagHtml;
      }
    }, 150);
  },

  setPage(pageNum) {
    this.stockFilters.page = pageNum;
    this.renderStockTable();
  },

  // --- ADD STOCK ---
  openAddStockModal() {
    const modal = document.getElementById('modal-add-stock');
    const select = document.getElementById('stock-product-id');
    const products = db.getProducts();

    if (select) {
      select.innerHTML = products.map(p => `<option value="${p.id}">${p.name} (${p.duration})</option>`).join('');
    }

    if (modal) modal.classList.add('active');
  },

  closeAddStockModal() {
    const modal = document.getElementById('modal-add-stock');
    if (modal) modal.classList.remove('active');
  },

  handleAddStock() {
    const product_id = document.getElementById('stock-product-id').value;
    const nomor = document.getElementById('stock-nomor').value;
    const email = document.getElementById('stock-email').value;
    const login_by = document.getElementById('stock-login-by').value;
    const profile = document.getElementById('stock-profile').value;
    const pin = document.getElementById('stock-pin').value;
    const note = document.getElementById('stock-note').value;

    if (!email || !nomor) {
      this.showToast('Input Kurang', 'Nomor HP dan Email wajib diisi!', 'warning');
      return;
    }

    db.addStock({ product_id, nomor, email, login_by, profile, pin, note });
    this.closeAddStockModal();
    document.getElementById('add-stock-form').reset();
    this.showToast('Stock Berhasil Ditambah', 'Akun telah tersimpan di database dengan status READY.', 'success');

    if (this.currentPage === 'stock') this.renderStockTable();
    if (this.currentPage === 'dashboard') this.renderDashboardView();
  },

  // --- COPY TEMPLATE ---
  copyTemplate(stockId) {
    const text = db.generateTemplate(stockId);
    if (!text) {
      this.showToast('Gagal Copy', 'Data akun tidak ditemukan.', 'error');
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Template berhasil dicopy.', 'Format order WhatsApp siap dikirimkan ke pembeli.', 'success');
    }).catch(err => {
      console.error('Clipboard error:', err);
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.showToast('Template berhasil dicopy.', 'Format order WhatsApp siap dikirimkan.', 'success');
    });
  },

  // --- CHANGE STATUS & DELETE ---
  changeStockStatus(id, newStatus) {
    const stock = db.getStockById(id);
    if (!stock) return;

    let confirmTitle = 'Konfirmasi Ubah Status';
    let confirmMsg = `Ubah status akun ${stock.email} menjadi ${newStatus}?`;

    if (newStatus === 'SOLD') {
      confirmTitle = 'Konfirmasi Penjualan (SOLD)';
      confirmMsg = `Apakah akun ${stock.product_name} (${stock.email}) sudah resmi terjual? Status akan diubah menjadi SOLD dengan timestamp saat ini.`;
    }

    this.showConfirm(
      confirmTitle,
      confirmMsg,
      () => {
        db.updateStockStatus(id, newStatus);
        this.showToast('Status Diperbarui', `Status akun diubah menjadi ${newStatus}.`, 'success');
        this.renderStockTable();
        if (this.currentPage === 'dashboard') this.renderDashboardView();
      },
      newStatus === 'SOLD' ? 'success' : 'primary'
    );
  },

  deleteStock(id) {
    const stock = db.getStockById(id);
    if (!stock) return;

    this.showConfirm(
      'Hapus Stok Akun',
      `Apakah Anda yakin ingin menghapus akun ${stock.product_name} (${stock.email})? Tindakan ini tidak dapat dibatalkan.`,
      () => {
        db.deleteStock(id);
        this.showToast('Stok Dihapus', 'Data stok telah dihapus.', 'info');
        this.renderStockTable();
        if (this.currentPage === 'dashboard') this.renderDashboardView();
      },
      'danger'
    );
  },

  renewStock(id) {
    const stock = db.getStockById(id);
    if (!stock) return;

    this.showConfirm(
      'Konfirmasi Perpanjang Akun',
      `Apakah Anda yakin ingin memperpanjang akun ${stock.product_name} (${stock.email})? Sistem akan membuat transaksi stok terjual baru dengan ID berbeda.`,
      () => {
        const newStock = db.renewStock(id);
        if (newStock) {
          const count = db.getRenewalNumber(newStock.id);
          this.showToast('Perpanjang Berhasil', `Stok terjual baru #${newStock.id} (Tag: Perpanjang ${count}x) telah dibuat.`, 'success');
          this.renderStockTable();
          if (this.currentPage === 'dashboard') this.renderDashboardView();
        }
      },
      'primary'
    );
  },

  openTransferModal(stockId) {
    const stock = db.getStockById(stockId);
    if (!stock) return;

    const modal = document.getElementById('modal-transfer');
    const idInput = document.getElementById('transfer-stock-id');
    const infoEl = document.getElementById('transfer-stock-info');
    const selectEl = document.getElementById('transfer-target-user');

    if (idInput) idInput.value = stock.id;
    if (infoEl) infoEl.textContent = `${stock.product_name} - ${stock.email} (${stock.profile || 'No Profile'}) [Assigned: ${stock.assigned_to || 'Belum di-assign'}]`;

    const users = db.getUsers();
    let optionsHtml = '';
    users.forEach(u => {
      const isSelected = u.username === stock.assigned_to ? 'selected' : '';
      optionsHtml += `<option value="${u.username}" ${isSelected}>${u.name || u.username} (${u.role}) - ${u.username}</option>`;
    });
    if (selectEl) selectEl.innerHTML = optionsHtml;

    if (modal) modal.classList.add('active');
  },

  closeTransferModal() {
    const modal = document.getElementById('modal-transfer');
    if (modal) modal.classList.remove('active');
  },

  handleTransferStock() {
    const stockId = document.getElementById('transfer-stock-id').value;
    const targetUsername = document.getElementById('transfer-target-user').value;

    if (!stockId || !targetUsername) return;

    const res = db.transferStock(stockId, targetUsername);
    if (res) {
      const targetUser = db.getUsers().find(u => u.username === targetUsername);
      const name = targetUser ? (targetUser.name || targetUser.username) : targetUsername;
      this.showToast('Transfer Berhasil', `Stok ${res.product_name} (${res.email}) berhasil ditransfer ke ${name}.`, 'success');
      this.closeTransferModal();
      this.renderStockTable();
      if (this.currentPage === 'dashboard') this.renderDashboardView();
    }
  },

  claimStock(stockId) {
    const currentAuth = db.getAuth();
    if (!currentAuth) return;

    const res = db.transferStock(stockId, currentAuth.username);
    if (res) {
      this.showToast('Stok Diambil', `Stok ${res.product_name} (${res.email}) telah di-assign ke Admin. Tombol Copy & Sold sekarang aktif!`, 'success');
      this.renderStockTable();
      if (this.currentPage === 'dashboard') this.renderDashboardView();
    }
  },

  // =========================================================
  // MASTER PRODUK VIEW
  // =========================================================
  renderProductsView() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    const products = db.getProducts();
    let html = '';

    products.forEach(p => {
      html += `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: ${p.color};">
                  <i class="fa-solid ${p.icon}"></i>
                </div>
                <div>
                  <h3 style="font-size: 1.1rem; color: #fff;">${p.name}</h3>
                  <span style="font-size: 0.8rem; color: var(--primary); font-weight: 600;">Masa Aktif: ${p.duration}</span>
                </div>
              </div>
            </div>

            <div style="margin-bottom: 1.25rem;">
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.4rem;">Preview Template WA:</span>
              <pre style="background: rgba(10, 14, 22, 0.9); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.75rem; font-size: 0.75rem; color: var(--text-muted); max-height: 140px; overflow-y: auto; white-space: pre-wrap; font-family: monospace;">${p.template}</pre>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
            <button class="btn btn-secondary btn-sm btn-block" onclick="App.openEditProductModal('${p.id}')">
              <i class="fa-solid fa-pen-to-square"></i> Edit Product & Template
            </button>
            <button class="btn btn-danger btn-sm" onclick="App.deleteProduct('${p.id}')" title="Hapus Produk">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  openAddProductModal() {
    const modal = document.getElementById('modal-product');
    document.getElementById('product-form-title').textContent = 'Tambah Produk Baru';
    document.getElementById('edit-product-id').value = '';
    document.getElementById('add-product-form').reset();
    if (modal) modal.classList.add('active');
  },

  openEditProductModal(id) {
    const prod = db.getProductById(id);
    if (!prod) return;

    document.getElementById('product-form-title').textContent = 'Edit Produk & Template';
    document.getElementById('edit-product-id').value = prod.id;
    document.getElementById('prod-name').value = prod.name;
    document.getElementById('prod-icon').value = prod.icon;
    document.getElementById('prod-color').value = prod.color;
    document.getElementById('prod-duration').value = prod.duration;
    document.getElementById('prod-template').value = prod.template;

    const modal = document.getElementById('modal-product');
    if (modal) modal.classList.add('active');
  },

  closeProductModal() {
    const modal = document.getElementById('modal-product');
    if (modal) modal.classList.remove('active');
  },

  handleAddProduct() {
    const id = document.getElementById('edit-product-id').value;
    const name = document.getElementById('prod-name').value;
    const icon = document.getElementById('prod-icon').value;
    const color = document.getElementById('prod-color').value;
    const duration = document.getElementById('prod-duration').value;
    const template = document.getElementById('prod-template').value;

    if (!name) {
      this.showToast('Input Kurang', 'Nama Produk wajib diisi!', 'warning');
      return;
    }

    if (id) {
      db.updateProduct(id, { name, icon, color, duration, template });
      this.showToast('Produk Diperbarui', 'Data produk dan template telah berhasil disimpan.', 'success');
    } else {
      db.addProduct({ name, icon, color, duration, template });
      this.showToast('Produk Ditambah', 'Produk baru telah ditambahkan ke database.', 'success');
    }

    this.closeProductModal();
    this.renderProductsView();
  },

  deleteProduct(id) {
    const prod = db.getProductById(id);
    if (!prod) return;

    this.showConfirm(
      'Hapus Produk Master',
      `Apakah Anda yakin ingin menghapus produk master "${prod.name}"?`,
      () => {
        db.deleteProduct(id);
        this.showToast('Produk Dihapus', `Produk ${prod.name} telah dihapus.`, 'info');
        this.renderProductsView();
      },
      'danger'
    );
  },

  // =========================================================
  // REPORT VIEW
  // =========================================================
  renderReportView() {
    const reportData = db.getReportData(this.reportFilter);

    // Update Summary Header
    document.getElementById('report-total-count').textContent = `${reportData.total} akun`;

    // Render Product Summary Grid
    const gridContainer = document.getElementById('report-product-grid');
    if (gridContainer) {
      let html = '';
      const products = db.getProducts();

      products.forEach(p => {
        const count = reportData.byProduct[p.name] || 0;
        html += `
          <div class="report-prod-item" onclick="App.openReportDetailModal('${p.name}')">
            <div class="report-prod-info">
              <h5><i class="fa-solid ${p.icon}" style="color: ${p.color}; margin-right: 6px;"></i> ${p.name}</h5>
              <span>Klik untuk lihat detail akun terjual</span>
            </div>
            <div class="report-prod-count">${count}</div>
          </div>
        `;
      });

      gridContainer.innerHTML = html;
    }
  },

  openReportDetailModal(productName) {
    const reportData = db.getReportData(this.reportFilter);
    const filteredSold = reportData.soldItems.filter(s => s.product_name === productName);

    document.getElementById('report-detail-title').textContent = `Detail Penjualan: ${productName}`;
    const tbody = document.getElementById('report-detail-tbody');

    if (filteredSold.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">
            Tidak ada akun ${productName} yang terjual pada periode ini.
          </td>
        </tr>
      `;
    } else {
      let html = '';
      filteredSold.forEach(item => {
        const soldDate = new Date(item.sold_at || item.updated_at);
        const tgl = soldDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        const jam = soldDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        html += `
          <tr>
            <td><span style="color: #fff; font-weight: 600;">${tgl}</span></td>
            <td><span style="color: var(--primary); font-family: monospace;">${jam}</span></td>
            <td style="font-weight: 600;">${item.email}</td>
            <td>${item.profile}</td>
            <td>${item.nomor}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    }

    const modal = document.getElementById('modal-report-detail');
    if (modal) modal.classList.add('active');
  },

  closeReportDetailModal() {
    const modal = document.getElementById('modal-report-detail');
    if (modal) modal.classList.remove('active');
  },

  // =========================================================
  // ACTIVITY LOG VIEW
  // =========================================================
  renderActivityView() {
    const container = document.getElementById('activity-log-container');
    if (!container) return;

    const logs = db.getActivityLogs();
    if (logs.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>Belum ada riwayat aktivitas.</p></div>`;
      return;
    }

    let html = '';
    logs.forEach(log => {
      const timeStr = new Date(log.created_at).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      let icon = 'fa-info-circle';
      if (log.type === 'add') icon = 'fa-plus-circle';
      if (log.type === 'copy') icon = 'fa-copy';
      if (log.type === 'reserve') icon = 'fa-clock';
      if (log.type === 'sold') icon = 'fa-check-circle';
      if (log.type === 'login') icon = 'fa-user-shield';
      if (log.type === 'delete') icon = 'fa-trash';

      html += `
        <div class="activity-item">
          <div class="activity-badge ${log.type}">
            <i class="fa-solid ${icon}"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">${log.activity}</div>
            <div class="activity-time"><i class="fa-regular fa-clock"></i> ${timeStr}</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  // =========================================================
  // SETTINGS VIEW & USER MANAGEMENT
  // =========================================================
  renderSettingsView() {
    const settings = db.getSettings();
    const phoneInput = document.getElementById('setting-phone');
    if (phoneInput) phoneInput.value = settings.support_phone || '';

    this.renderUsersTable();
  },

  renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    const users = db.getUsers();
    const currentAuth = db.getAuth();
    const isAdmin = currentAuth && currentAuth.role === 'Admin';

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Belum ada user.</td></tr>`;
      return;
    }

    let html = '';
    users.forEach(u => {
      const isSelf = currentAuth && currentAuth.id === u.id;
      const badgeClass = u.role === 'Admin' ? 'ready' : 'sold';

      html += `
        <tr>
          <td style="font-weight: 700; color: #fff;">${u.username} ${isSelf ? '<small style="color: var(--primary);">(Anda)</small>' : ''}</td>
          <td>${u.name || u.username}</td>
          <td>
            <span class="badge-status ${badgeClass}">
              <span class="badge-dot"></span>
              ${u.role}
            </span>
          </td>
          <td>
            <div class="action-btn-group" style="justify-content: flex-end;">
              ${isAdmin ? `
                <button class="act-btn act-btn-copy" onclick="App.openUserModal('${u.id}')" title="Edit User">
                  <i class="fa-solid fa-pen-to-square"></i> Edit
                </button>
                <button class="act-btn act-btn-delete" onclick="App.deleteUser('${u.id}')" title="Hapus User">
                  <i class="fa-solid fa-trash"></i>
                </button>
              ` : `
                <span style="font-size: 0.775rem; color: var(--text-dim);">Akses terbatas</span>
              `}
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  openUserModal(userId = null) {
    const currentAuth = db.getAuth();
    if (currentAuth && currentAuth.role !== 'Admin') {
      this.showToast('Akses Dibatasi', 'Hanya Admin yang dapat mengelola user!', 'warning');
      return;
    }

    const modal = document.getElementById('modal-user');
    const titleEl = document.getElementById('user-modal-title');
    const idInput = document.getElementById('user-id');
    const usernameInput = document.getElementById('user-username');
    const nameInput = document.getElementById('user-name');
    const passwordInput = document.getElementById('user-password');
    const roleSelect = document.getElementById('user-role');

    if (userId) {
      const user = db.getUserById(userId);
      if (!user) return;
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i> Edit User`;
      if (idInput) idInput.value = user.id;
      if (usernameInput) usernameInput.value = user.username;
      if (nameInput) nameInput.value = user.name || user.username;
      if (passwordInput) passwordInput.value = user.password;
      if (roleSelect) roleSelect.value = user.role;
    } else {
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-user-plus" style="color: var(--primary);"></i> Tambah User Baru`;
      if (idInput) idInput.value = '';
      const userForm = document.getElementById('user-form');
      if (userForm) userForm.reset();
    }

    if (modal) modal.classList.add('active');
  },

  closeUserModal() {
    const modal = document.getElementById('modal-user');
    if (modal) modal.classList.remove('active');
  },

  handleSaveUser() {
    const id = document.getElementById('user-id').value;
    const username = document.getElementById('user-username').value;
    const name = document.getElementById('user-name').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;

    if (!username || !password) {
      this.showToast('Input Kurang', 'Username dan Password wajib diisi!', 'warning');
      return;
    }

    let res;
    if (id) {
      res = db.updateUser(id, { username, name, password, role });
      if (res.success) {
        this.showToast('User Diperbarui', `Data user ${username} berhasil disimpan.`, 'success');
      }
    } else {
      res = db.addUser({ username, name, password, role });
      if (res.success) {
        this.showToast('User Ditambahkan', `User ${username} (${role}) berhasil dibuat.`, 'success');
      }
    }

    if (!res.success) {
      this.showToast('Gagal Menyimpan', res.message, 'error');
      return;
    }

    this.closeUserModal();
    this.renderUsersTable();
    this.updateAdminHeader(db.getAuth());
  },

  deleteUser(userId) {
    const user = db.getUserById(userId);
    if (!user) return;

    this.showConfirm(
      'Hapus User System',
      `Apakah Anda yakin ingin menghapus user "${user.username}" (${user.role})?`,
      () => {
        const res = db.deleteUser(userId);
        if (res.success) {
          this.showToast('User Dihapus', `User ${user.username} telah dihapus.`, 'info');
          this.renderUsersTable();
        } else {
          this.showToast('Gagal Hapus', res.message, 'error');
        }
      },
      'danger'
    );
  },

  handleSaveSettings() {
    const support_phone = document.getElementById('setting-phone').value;

    if (!support_phone) {
      this.showToast('Input Kurang', 'Nomor support WhatsApp wajib diisi!', 'warning');
      return;
    }

    db.saveSettings({ support_phone });
    this.showToast('Pengaturan Disimpan', 'Kontak support WhatsApp berhasil diperbarui.', 'success');
  },

  exportBackupJSON() {
    const jsonStr = db.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Babyiel_Store_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast('Export Berhasil', 'File backup JSON berhasil di-download.', 'success');
  },

  importBackupJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const success = db.importBackup(content);
      if (success) {
        this.showToast('Import Berhasil', 'Seluruh data telah dipulihkan dari file JSON.', 'success');
        this.navigate(this.currentPage);
      } else {
        this.showToast('Import Gagal', 'Format file JSON tidak valid.', 'error');
      }
    };
    reader.readAsText(file);
  },

  // =========================================================
  // TOAST & CONFIRM MODAL DIALOG ENGINE
  // =========================================================
  showToast(title, desc, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    if (type === 'error') icon = 'fa-circle-xmark';

    toast.innerHTML = `
      <div class="toast-icon"><i class="fa-solid ${icon}"></i></div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${desc}</div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  showConfirm(title, message, onConfirm, type = 'primary') {
    const modal = document.getElementById('modal-confirm');
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;

    const btnOk = document.getElementById('confirm-btn-ok');
    btnOk.className = `btn btn-${type}`;

    // Clone button to clear old event listeners
    const newBtnOk = btnOk.cloneNode(true);
    btnOk.parentNode.replaceChild(newBtnOk, btnOk);

    newBtnOk.addEventListener('click', () => {
      modal.classList.remove('active');
      if (typeof onConfirm === 'function') onConfirm();
    });

    modal.classList.add('active');
  },

  closeConfirmModal() {
    const modal = document.getElementById('modal-confirm');
    if (modal) modal.classList.remove('active');
  }
};
