/* =========================================================
   Babyiel Store Inventory - Main Application Controller & UI
   ========================================================= */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

const App = {
  currentPage: 'dashboard',
  stockFilters: {
    status: 'READY',
    product_id: 'ALL',
    assignment: 'ALL',
    search: '',
    page: 1,
    limit: 10
  },
  reportFilters: {
    range: 'ALL',
    product_id: 'ALL',
    search: '',
    page: 1,
    limit: 10
  },
  salesChart: null,
  productsChart: null,

  init() {
    this.bindEvents();
    this.startClock();
    try {
      this.checkAuth();
    } catch (e) {
      console.error('[App.init] checkAuth error:', e);
    }
    // Expiration & Notification auto-checker interval
    setInterval(() => {
      try {
        if (typeof db !== 'undefined' && db.checkSubscriptionExpirations) {
          db.checkSubscriptionExpirations();
          this.updateNotificationBadge();
          if (this.currentPage === 'stock') this.renderStockTable();
        }
      } catch (e) {
        console.error('[App] interval error:', e);
      }
    }, 30000);
  },

  checkAuth() {
    const auth = db.getAuth();
    const loginWrapper = document.getElementById('login-screen');
    const mainApp = document.getElementById('app-main');
    const storefront = document.getElementById('storefront-screen');

    if (!auth) {
      if (storefront) {
        storefront.classList.remove('active');
        storefront.style.display = 'none';
      }
      if (mainApp) {
        mainApp.classList.remove('active');
        mainApp.style.display = 'none';
      }
      if (loginWrapper) {
        loginWrapper.classList.add('active');
        loginWrapper.style.display = 'flex';
      }
    } else {
      if (storefront) {
        storefront.classList.remove('active');
        storefront.style.display = 'none';
      }
      if (loginWrapper) {
        loginWrapper.classList.remove('active');
        loginWrapper.style.display = 'none';
      }
      if (mainApp) {
        mainApp.classList.add('active');
        mainApp.style.display = 'flex';
      }
      this.updateAdminHeader(auth);
      this.updateNotificationBadge();
      this.navigate(this.currentPage);
    }
  },

  goToStorefront() {
    const storefront = document.getElementById('storefront-screen');
    const loginWrapper = document.getElementById('login-screen');
    const mainApp = document.getElementById('app-main');

    if (loginWrapper) {
      loginWrapper.classList.remove('active');
      loginWrapper.style.display = 'none';
    }
    if (mainApp) {
      mainApp.classList.remove('active');
      mainApp.style.display = 'none';
    }
    if (storefront) {
      storefront.classList.add('active');
      storefront.style.display = 'block';
    }

    this.renderStorefront();
    // Update WA links from settings
    const settings = db.getSettings();
    const waNum = settings.support_phone ? settings.support_phone.replace(/\D/g, '') : '6285775335453';
    const waLink = `https://wa.me/${waNum.startsWith('0') ? '62' + waNum.slice(1) : waNum}`;
    const waHero = document.getElementById('wa-hero-link');
    const waFloat = document.getElementById('wa-float-btn');
    if (waHero) waHero.href = waLink;
    if (waFloat) waFloat.href = waLink;
  },

  handleStorefrontNavAuth() {
    const auth = db.getAuth();
    if (auth) {
      // User is already logged in, return to dashboard without logging out!
      const storefront = document.getElementById('storefront-screen');
      const mainApp = document.getElementById('app-main');
      if (storefront) {
        storefront.classList.remove('active');
        storefront.style.display = 'none';
      }
      if (mainApp) {
        mainApp.classList.add('active');
        mainApp.style.display = 'flex';
      }
      this.navigate('dashboard');
    } else {
      // User is guest, show login screen
      const storefront = document.getElementById('storefront-screen');
      const loginWrapper = document.getElementById('login-screen');
      if (storefront) {
        storefront.classList.remove('active');
        storefront.style.display = 'none';
      }
      if (loginWrapper) {
        loginWrapper.classList.add('active');
        loginWrapper.style.display = 'flex';
      }
    }
  },

  currentStorefrontCategory: 'Semua',
  selectedPackageData: null,

  filterStorefrontCategory(cat, btn) {
    this.currentStorefrontCategory = cat;
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.renderStorefront();
  },

  getProductCategory(p) {
    const name = (p.name || '').toLowerCase();
    if (name.includes('spotify') || name.includes('music') || name.includes('apple music')) return 'Music';
    if (name.includes('canva') || name.includes('chatgpt') || name.includes('gpt') || name.includes('capcut') || name.includes('office') || name.includes('zoom') || name.includes('claude') || name.includes('notion')) return 'Produktivitas';
    if (name.includes('youtube') || name.includes('bstation') || name.includes('iqiyi') || name.includes('crunchyroll')) return 'Entertainment';
    return 'Streaming';
  },

  getLowestPrice(p) {
    if (p.prices && p.prices.length > 0) {
      const validPrices = p.prices.map(pr => pr.price).filter(val => typeof val === 'number' && val > 0);
      if (validPrices.length > 0) {
        return Math.min(...validPrices);
      }
    }
    return 0;
  },

  renderCompactProductCard(p) {
    const hasImg = p.image_url && p.image_url.trim() !== '';
    const iconHtml = hasImg
      ? `<div class="catalog-app-icon-wrap"><img src="${p.image_url}" alt="${p.name}"></div>`
      : `<div class="catalog-app-icon-wrap" style="background: ${p.color || '#7c3aed'};"><i class="fa-solid ${p.icon || 'fa-star'}" style="color: #ffffff; font-size: 1.3rem;"></i></div>`;

    const lowestPrice = this.getLowestPrice(p);
    const priceText = lowestPrice > 0 ? `Mulai Rp ${lowestPrice.toLocaleString('id-ID')}` : 'Lihat Paket';

    const stockStatusBadge = `<span class="catalog-stock-status"><i class="fa-solid fa-circle-check"></i> Ready Stock</span>`;

    return `
      <div class="storefront-compact-card">
        <div>
          <div class="catalog-card-header">
            ${iconHtml}
            <span class="storefront-compact-badge"><i class="fa-solid fa-clock" style="font-size: 0.65rem;"></i> ${p.duration || '1 Bulan'}</span>
          </div>

          <div class="catalog-card-info">
            <div class="catalog-card-title">${p.name}</div>
            <div class="catalog-card-garansi">
              <i class="fa-solid fa-shield-check" style="color: #10b981;"></i> ${p.garansi || 'Garansi Resmi 100%'}
            </div>
          </div>
        </div>

        <div>
          <div class="catalog-price-row" style="margin-bottom: 0.85rem;">
            <div>
              <div class="catalog-price-label">Harga Paket</div>
              <div class="storefront-compact-price">${priceText}</div>
            </div>
            <div>${stockStatusBadge}</div>
          </div>

          <button class="storefront-view-pkg-btn" onclick="App.openCatalogPackagesModal('${p.id}')">
            <i class="fa-solid fa-box-open"></i> Lihat Paket
          </button>
        </div>
      </div>
    `;
  },

  renderStorefrontBestsellers() {
    const container = document.getElementById('storefront-bestsellers-container');
    if (!container) return;

    let products = db.getProducts().filter(p => p.is_active_catalog !== false);
    // Take top 4 best sellers (Netflix, Canva, ChatGPT, Spotify, etc.)
    const bestsellers = products.slice(0, 4);

    const tagBadges = ['🔥 BEST SELLER', '⭐ POPULAR', '⚡ TRENDING', '🏆 TOP CHOICE'];

    let html = bestsellers.map((p, idx) => {
      const hasImg = p.image_url && p.image_url.trim() !== '';
      const iconHtml = hasImg
        ? `<div class="bestseller-app-icon"><img src="${p.image_url}" alt="${p.name}"></div>`
        : `<div class="bestseller-app-icon" style="background: ${p.color || '#7c3aed'};"><i class="fa-solid ${p.icon || 'fa-fire'}" style="color: #fff; font-size: 1.4rem;"></i></div>`;

      const lowestPrice = this.getLowestPrice(p);
      const priceText = lowestPrice > 0 ? `Mulai Rp ${lowestPrice.toLocaleString('id-ID')}` : 'Lihat Paket';
      const badgeText = tagBadges[idx % tagBadges.length];

      return `
        <div class="bestseller-card-featured" style="--brand-accent: ${p.color || '#7c3aed'};">
          <div>
            <div class="bestseller-card-top">
              ${iconHtml}
              <span class="bestseller-tag-badge">${badgeText}</span>
            </div>

            <div class="bestseller-card-body">
              <div class="bestseller-card-name">${p.name}</div>
              <div class="bestseller-benefit-line">
                <i class="fa-solid fa-bolt" style="color: #f59e0b; font-size: 0.7rem;"></i> Proses 1-5 Mnt &bull; ${p.garansi || 'Full Garansi'}
              </div>
            </div>
          </div>

          <div>
            <div class="bestseller-price-box" style="margin-bottom: 0.85rem;">
              <div>
                <div class="bestseller-price-sub">Harga Spesial</div>
                <div class="bestseller-price-val">${priceText}</div>
              </div>
              <span style="color: #10b981; font-weight: 700; font-size: 0.72rem; display: flex; align-items: center; gap: 0.25rem;">
                <i class="fa-solid fa-circle-check" style="font-size: 0.65rem;"></i> Ready
              </span>
            </div>

            <button class="bestseller-cta-btn" onclick="App.openCatalogPackagesModal('${p.id}')">
              <i class="fa-solid fa-box-open"></i> Lihat Paket
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  },

  renderStorefront() {
    const container = document.getElementById('storefront-grid-container');
    if (!container) return;

    // Update Nav Auth Button based on login session
    const navAuthBtn = document.getElementById('storefront-nav-auth-btn');
    const auth = db.getAuth();
    if (navAuthBtn) {
      if (auth) {
        navAuthBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Kembali ke Dashboard';
        navAuthBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      } else {
        navAuthBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Login Admin';
        navAuthBtn.style.background = 'linear-gradient(135deg, var(--brand-purple), var(--brand-pink))';
      }
    }

    const settings = db.getSettings();

    // Header dynamic settings
    const tickerEl = document.querySelector('.ticker-text');
    if (tickerEl && settings.ticker_text) {
      tickerEl.textContent = settings.ticker_text;
    }
    const titleEl = document.querySelector('.storefront-title');
    if (titleEl && settings.store_title) {
      titleEl.innerHTML = `${settings.store_title} <span>TANPA RIBET.</span>`;
    }

    // Render Bestsellers section
    this.renderStorefrontBestsellers();

    let products = db.getProducts();
    // Filter active catalog items only
    products = products.filter(p => p.is_active_catalog !== false);

    // Filter by category pill if not "Semua"
    if (this.currentStorefrontCategory && this.currentStorefrontCategory !== 'Semua') {
      products = products.filter(p => this.getProductCategory(p) === this.currentStorefrontCategory);
    }

    // Filter by storefront search query if typed
    const searchInput = document.getElementById('storefront-search-input');
    if (searchInput && searchInput.value.trim() !== '') {
      const q = searchInput.value.toLowerCase().trim();
      products = products.filter(p => p.name.toLowerCase().includes(q) || (p.note && p.note.toLowerCase().includes(q)));
    }

    if (!products || products.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: rgba(255,255,255,0.7); background: rgba(20,24,45,0.6); border-radius: var(--radius-lg); border: 1px dashed rgba(255,255,255,0.15);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🛒</div>
          <h3 style="color:#fff; font-size: 1.1rem; font-weight: 800;">Produk Tidak Ditemukan</h3>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Tidak ada produk yang cocok dengan kategori/pencarian Anda.</p>
        </div>
      `;
      return;
    }

    let html = products.map(p => this.renderCompactProductCard(p)).join('');
    container.innerHTML = html;
  },

  openCatalogPackagesModal(productId) {
    const prod = db.getProductById(productId);
    if (!prod) return;

    const modal = document.getElementById('modal-catalog-packages');
    const titleEl = document.getElementById('catalog-modal-title');
    const garansiEl = document.getElementById('catalog-modal-garansi');
    const listEl = document.getElementById('catalog-packages-list');

    const hasImg = prod.image_url && prod.image_url.trim() !== '';
    const iconHtml = hasImg
      ? `<div style="width: 44px; height: 44px; border-radius: 12px; background: #ffffff; display: flex; align-items: center; justify-content: center; padding: 4px; flex-shrink: 0; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.06);"><img src="${prod.image_url}" alt="${prod.name}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;"></div>`
      : `<div style="width: 44px; height: 44px; border-radius: 12px; background: ${prod.color || '#7c3aed'}; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.2rem; flex-shrink: 0;"><i class="fa-solid ${prod.icon || 'fa-box'}"></i></div>`;

    if (titleEl) {
      titleEl.innerHTML = `
        ${iconHtml}
        <div>
          <div style="font-size: 1.15rem; font-weight: 800; font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a;">${prod.name}</div>
          <div style="font-size: 0.78rem; color: #64748b; font-weight: 500; margin-top: 0.1rem;">Masa Aktif: ${prod.duration || '1 Bulan'}</div>
        </div>
      `;
    }

    if (garansiEl) {
      garansiEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${prod.garansi || 'Full Garansi Sesuai S&K'}`;
    }

    const prices = prod.prices || [];
    if (prices.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; color: #64748b; padding: 1.5rem 0; font-size: 0.88rem;">
          Hubungi admin via WhatsApp untuk info ketersediaan paket.
        </div>
      `;
      this.selectedPackageData = { prod, label: 'Standard', price: 0 };
    } else {
      this.selectedPackageData = { prod, label: prices[0].label, price: prices[0].price };

      let html = '';
      prices.forEach((pr, idx) => {
        const isSelected = idx === 0 ? 'selected' : '';
        html += `
          <div class="package-item-option ${isSelected}" data-idx="${idx}" onclick="App.selectCatalogPackage('${prod.id}', ${idx}, this)">
            <div>
              <div class="pkg-title">${pr.label}</div>
              <div class="pkg-category">Kategori: ${pr.category || 'Member'}</div>
            </div>
            <div class="pkg-price">
              Rp ${(pr.price || 0).toLocaleString('id-ID')}
              ${idx === 0 ? '<i class="fa-solid fa-circle-check" style="font-size: 1.05rem; color: #7c3aed; margin-left: 0.35rem;"></i>' : ''}
            </div>
          </div>
        `;
      });
      listEl.innerHTML = html;
    }

    this.renderCatalogOrderFooter();
    if (modal) modal.classList.add('active');
  },

  selectCatalogPackage(productId, idx, el) {
    const prod = db.getProductById(productId);
    if (!prod || !prod.prices || !prod.prices[idx]) return;

    document.querySelectorAll('.package-item-option').forEach(item => {
      item.classList.remove('selected');
      const checkIcon = item.querySelector('.fa-circle-check');
      if (checkIcon) checkIcon.remove();
    });

    if (el) {
      el.classList.add('selected');
      const priceEl = el.querySelector('.pkg-price');
      if (priceEl && !priceEl.querySelector('.fa-circle-check')) {
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-circle-check';
        icon.style.cssText = 'font-size: 1.05rem; color: #7c3aed; margin-left: 0.35rem;';
        priceEl.appendChild(icon);
      }
    }

    const pr = prod.prices[idx];
    this.selectedPackageData = { prod, label: pr.label, price: pr.price };
    this.renderCatalogOrderFooter();
  },

  renderCatalogOrderFooter() {
    const footerEl = document.getElementById('catalog-order-footer');
    if (!footerEl || !this.selectedPackageData) return;

    const { prod, label, price } = this.selectedPackageData;
    const settings = db.getSettings();
    const waNum = settings.support_phone ? settings.support_phone.replace(/\D/g, '') : '085775335453';
    const waBase = waNum.startsWith('0') ? '62' + waNum.slice(1) : (waNum.startsWith('62') ? waNum : '62' + waNum);

    const priceText = price > 0 ? ` — Rp ${price.toLocaleString('id-ID')}` : '';
    const msg = encodeURIComponent(`Halo Babyiel Store, saya mau pesan ${prod.name} paket ${label}${priceText}. Apakah ready stok? 🙏`);
    const waUrl = `https://wa.me/${waBase}?text=${msg}`;

    footerEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.6rem;">
        <button type="button" onclick="App.openCheckoutModal()" style="display: flex; align-items: center; justify-content: center; gap: 0.55rem; background: #7c3aed; color: #ffffff; font-size: 0.95rem; font-weight: 800; padding: 0.85rem 1.25rem; border-radius: 12px; border: none; box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3); cursor: pointer; transition: all 0.2s ease;">
          <i class="fa-solid fa-qrcode" style="font-size: 1.15rem;"></i> Bayar Otomatis QRIS${priceText}
        </button>
        <a href="${waUrl}" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 0.4rem; background: #f1f5f9; color: #16a34a; font-size: 0.82rem; font-weight: 700; padding: 0.55rem; border-radius: 10px; border: 1px solid #cbd5e1; text-decoration: none; transition: all 0.2s ease;">
          <i class="fa-brands fa-whatsapp"></i> Atau Pesan Manual via WhatsApp
        </a>
      </div>
    `;
  },

  // --- AUTOMATED CHECKOUT & QRIS ENGINE ---
  openCheckoutModal() {
    if (!this.selectedPackageData) return;

    this.closeCatalogPackagesModal();

    const { prod, label, price } = this.selectedPackageData;
    const modal = document.getElementById('modal-checkout-form');

    const summaryProd = document.getElementById('checkout-summary-prod');
    const summaryPkg = document.getElementById('checkout-summary-pkg');
    const summaryPrice = document.getElementById('checkout-summary-price');

    if (summaryProd) summaryProd.textContent = prod.name;
    if (summaryPkg) summaryPkg.textContent = `Paket ${label}`;
    if (summaryPrice) summaryPrice.textContent = `Rp ${price.toLocaleString('id-ID')}`;

    if (modal) modal.classList.add('active');
  },

  closeCheckoutModal() {
    const modal = document.getElementById('modal-checkout-form');
    if (modal) modal.classList.remove('active');
  },

  currentActiveOrder: null,
  qrisPollTimer: null,
  qrisCountdownTimer: null,

  async handleProcessCheckout(e) {
    if (e) e.preventDefault();

    const name = document.getElementById('checkout-cust-name').value.trim();
    const wa = document.getElementById('checkout-cust-wa').value.trim();
    const email = document.getElementById('checkout-cust-email') ? document.getElementById('checkout-cust-email').value.trim() : '';

    if (!name || !wa) {
      this.showToast('Input Kurang', 'Nama dan Nomor WhatsApp wajib diisi!', 'warning');
      return;
    }

    const { prod, label } = this.selectedPackageData;

    try {
      const btnSubmit = document.getElementById('btn-submit-checkout');
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses QRIS...';
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: prod.id,
          package_label: label,
          customer_name: name,
          customer_wa: wa,
          customer_email: email
        })
      });

      const res = await response.json();

      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Lanjutkan Pembayaran QRIS <i class="fa-solid fa-arrow-right"></i>';
      }

      if (!res.success) {
        this.showToast('Gagal Checkout', res.message || 'Terjadi kesalahan pada server.', 'error');
        return;
      }

      this.currentActiveOrder = res.order;
      this.closeCheckoutModal();
      this.openQRISModal(res.order);

    } catch (err) {
      console.error('Checkout API error:', err);
      this.showToast('Error Server', 'Gagal terhubung ke backend server.', 'error');
    }
  },

  openQRISModal(order) {
    const modal = document.getElementById('modal-checkout-qris');
    if (!modal || !order) return;

    document.getElementById('qris-order-id').textContent = `Order ID: ${order.id}`;
    document.getElementById('qris-total-amount').textContent = `Rp ${order.price.toLocaleString('id-ID')}`;

    const qrisImg = document.getElementById('qris-image-display');
    if (qrisImg) qrisImg.src = order.qris_url;

    // Start 15-minute countdown
    this.startQRISCountdown(15 * 60);

    // Start Auto Polling every 3 seconds
    this.startQRISPolling(order.id);

    modal.classList.add('active');
  },

  closeQRISModal() {
    const modal = document.getElementById('modal-checkout-qris');
    if (modal) modal.classList.remove('active');
    this.stopQRISPolling();
    this.stopQRISCountdown();
  },

  startQRISCountdown(durationSeconds) {
    this.stopQRISCountdown();
    let remaining = durationSeconds;
    const timerEl = document.getElementById('qris-countdown-timer');

    const updateDisplay = () => {
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      if (timerEl) {
        timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      if (remaining <= 0) {
        this.stopQRISCountdown();
        this.showToast('QRIS Kadaluarsa', 'Waktu pembayaran QRIS telah habis. Silakan buat pesanan baru.', 'warning');
        this.closeQRISModal();
      }
      remaining--;
    };

    updateDisplay();
    this.qrisCountdownTimer = setInterval(updateDisplay, 1000);
  },

  stopQRISCountdown() {
    if (this.qrisCountdownTimer) {
      clearInterval(this.qrisCountdownTimer);
      this.qrisCountdownTimer = null;
    }
  },

  startQRISPolling(orderId) {
    this.stopQRISPolling();

    this.qrisPollTimer = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`);
        const data = await res.json();

        if (data.success && data.payment_status === 'PAID') {
          this.stopQRISPolling();
          this.stopQRISCountdown();
          this.closeQRISModal();

          // Fetch full account credentials & show fulfillment modal
          this.fetchAndDisplayFulfillment(orderId);
        }
      } catch (err) {
        console.warn('Polling status error:', err);
      }
    }, 3000);
  },

  stopQRISPolling() {
    if (this.qrisPollTimer) {
      clearInterval(this.qrisPollTimer);
      this.qrisPollTimer = null;
    }
  },

  async simulateQRISPaymentSuccess() {
    if (!this.currentActiveOrder) return;

    try {
      const res = await fetch('/api/simulations/pay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: this.currentActiveOrder.id })
      });
      const data = await res.json();

      if (data.success) {
        this.showToast('Pembayaran Diterima', 'Simulasi bayar QRIS berhasil! Membuka data akun...', 'success');
        this.stopQRISPolling();
        this.stopQRISCountdown();
        this.closeQRISModal();
        this.fetchAndDisplayFulfillment(this.currentActiveOrder.id);
      } else {
        this.showToast('Gagal Simulasi', data.message || 'Error', 'error');
      }
    } catch (err) {
      console.error('Simulate payment error:', err);
    }
  },

  async fetchAndDisplayFulfillment(orderId) {
    try {
      const res = await fetch(`/api/orders/${orderId}/fulfillment`);
      const data = await res.json();

      if (!data.success || !data.account) {
        this.showToast('Menunggu Stok', 'Pembayaran berhasil! Stok sedang diproses oleh admin.', 'info');
        return;
      }

      const modal = document.getElementById('modal-order-fulfillment');
      document.getElementById('fulfillment-order-id').textContent = `Order ID: ${data.order_id}`;
      document.getElementById('fulfillment-cust-name').textContent = data.customer_name;
      document.getElementById('fulfillment-prod-title').textContent = `${data.product_name} — ${data.package_name}`;

      document.getElementById('fulfillment-email').textContent = data.account.email || '-';
      document.getElementById('fulfillment-password').textContent = data.account.password || '-';
      document.getElementById('fulfillment-loginby').textContent = data.account.login_by || 'OTP WhatsApp';
      document.getElementById('fulfillment-profile').textContent = data.account.profile || 'Profil 1';
      document.getElementById('fulfillment-pin').textContent = data.account.pin || '1234';

      if (modal) modal.classList.add('active');
      this.showToast('Pesanan Berhasil!', `Akun ${data.product_name} Anda telah siap!`, 'success');

    } catch (err) {
      console.error('Fetch fulfillment error:', err);
    }
  },

  closeFulfillmentModal() {
    const modal = document.getElementById('modal-order-fulfillment');
    if (modal) modal.classList.remove('active');
  },

  copyFulfillmentField(elementId, labelName) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const val = el.textContent.trim();
    if (!val || val === '-') {
      this.showToast('Gagal Salin', `Tidak ada data ${labelName} untuk disalin.`, 'warning');
      return;
    }

    navigator.clipboard.writeText(val).then(() => {
      this.showToast(`${labelName} Disalin!`, `${val} telah tersimpan di clipboard.`, 'success');
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = val;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.showToast(`${labelName} Disalin!`, `${val} telah tersimpan di clipboard.`, 'success');
    });
  },

  closeCatalogPackagesModal() {
    const modal = document.getElementById('modal-catalog-packages');
    if (modal) modal.classList.remove('active');
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

  handleLogin(e) {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    const userInput = document.getElementById('login-username');
    const passInput = document.getElementById('login-password');
    const user = (userInput && userInput.value.trim()) ? userInput.value.trim() : 'admin';
    const pass = (passInput && passInput.value.trim()) ? passInput.value.trim() : '123';

    const res = db.login(user, pass);
    if (res.success) {
      this.showToast('Login Berhasil', `Selamat datang kembali, ${res.session.name || user}!`, 'success');
      this.checkAuth();
    } else {
      this.showToast('Login Gagal', res.message, 'error');
    }
    return false;
  },

  quickLogin(username, password) {
    const userInput = document.getElementById('login-username');
    const passInput = document.getElementById('login-password');
    if (userInput) userInput.value = username;
    if (passInput) passInput.value = password;
    this.handleLogin();
  },

  bindEvents() {
    // Login Form Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
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

    // Mark Sold Form Submit (Modal)
    const markSoldForm = document.getElementById('mark-sold-form');
    if (markSoldForm) {
      markSoldForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleMarkSold();
      });
    }

    // Drag and Drop Zone for Excel
    const dropZone = document.getElementById('excel-drop-zone');
    if (dropZone) {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
        }, false);
      });
      dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
          const input = document.getElementById('excel-file-input');
          if (input) {
            input.files = files;
            this.handleExcelFileSelect({ target: { files: files } });
          }
        }
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

    // User Search Input (Realtime filtering in Settings)
    const userSearchInput = document.getElementById('user-search-input');
    if (userSearchInput) {
      userSearchInput.addEventListener('input', (e) => {
        this.renderUsersTable(e.target.value);
      });
    }

    // Storefront Settings Form Submit
    const storefrontForm = document.getElementById('storefront-settings-form');
    if (storefrontForm) {
      storefrontForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const store_title = document.getElementById('setting-store-title').value.trim();
        const store_subtitle = document.getElementById('setting-store-subtitle').value.trim();
        const ticker_text = document.getElementById('setting-ticker-text').value.trim();

        db.saveSettings({ store_title, store_subtitle, ticker_text });
        this.showToast('Katalog Disimpan', 'Pengaturan tampilan katalog publik berhasil disimpan.', 'success');
      });
    }

    // Catalog Settings Form Submit (Dedicated Kelola Katalog Tab)
    const catalogForm = document.getElementById('catalog-settings-form');
    if (catalogForm) {
      catalogForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const store_title = document.getElementById('catalog-store-title').value.trim();
        const support_phone = document.getElementById('catalog-support-phone').value.trim();
        const store_subtitle = document.getElementById('catalog-store-subtitle').value.trim();
        const ticker_text = document.getElementById('catalog-ticker-text').value.trim();

        db.saveSettings({ store_title, support_phone, store_subtitle, ticker_text });
        this.showToast('Katalog Disimpan', 'Pengaturan header, promo announcement, dan kontak support katalog berhasil disimpan.', 'success');
      });
    }

    // Catalog Search Input (Realtime filtering in Kelola Katalog page)
    const catalogSearchInput = document.getElementById('catalog-search-input');
    if (catalogSearchInput) {
      catalogSearchInput.addEventListener('input', () => {
        this.renderCatalogView();
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

    // Stock Filter Assignment Dropdown
    const filterAssignSelect = document.getElementById('filter-assignment-select');
    if (filterAssignSelect) {
      filterAssignSelect.addEventListener('change', (e) => {
        this.stockFilters.assignment = e.target.value;
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

        this.reportFilters.range = btn.getAttribute('data-range');
        this.reportFilters.page = 1;
        this.renderReportView();
      });
    });

    // Report Product Filter Select
    const reportProdSelect = document.getElementById('report-product-select');
    if (reportProdSelect) {
      reportProdSelect.addEventListener('change', (e) => {
        this.reportFilters.product_id = e.target.value;
        this.reportFilters.page = 1;
        this.renderReportView();
      });
    }

    // Report Search Input
    const reportSearchInput = document.getElementById('report-search-input');
    if (reportSearchInput) {
      reportSearchInput.addEventListener('input', (e) => {
        this.reportFilters.search = e.target.value;
        this.reportFilters.page = 1;
        this.renderReportView();
      });
    }

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
      stock: { title: 'Kelola Stok Akun', desc: 'Daftar stok akun ready, assigned, dan sedang berlangganan.' },
      products: { title: 'Master Produk & Template', desc: 'Manajemen daftar produk dan format template WA.' },
      catalog: { title: 'Kelola Katalog Publik (Admin Only)', desc: 'Pengaturan produk, harga paket, promo announcement, dan tampilan katalog pembeli.' },
      report: { title: 'Laporan Penjualan', desc: 'Analisis akun terjual berdasarkan periode dan produk.' },
      activity: { title: 'Activity Log', desc: 'Riwayat seluruh aktivitas sistem secara realtime.' },
      settings: { title: 'Pengaturan Sistem', desc: 'Kelola akun admin, kontak support, dan backup data.' }
    };

    if (titles[page]) {
      if (titleEl) titleEl.textContent = titles[page].title;
      if (descEl) descEl.textContent = titles[page].desc;
    }

    // Trigger page-specific renders
    try {
      if (page === 'dashboard') this.renderDashboardView();
      if (page === 'stock') this.renderStockView();
      if (page === 'products') this.renderProductsView();
      if (page === 'catalog') this.renderCatalogView();
      if (page === 'report') this.renderReportView();
      if (page === 'activity') this.renderActivityView();
      if (page === 'settings') this.renderSettingsView();
    } catch (err) {
      console.error(`Error rendering page ${page}:`, err);
    }
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
    const soldStocks = stocks.filter(s => (s.status === 'SEDANG BERLANGGANAN' || s.status === 'SOLD') && s.sold_at);

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

    // Chart 2: Top 5 Selling Products (Count > 0 Only)
    const products = db.getProducts();
    const totalSoldAll = soldStocks.length || 1;

    // Filter out 0 sales items and sort descending by sales count
    const activeProducts = products.map(p => {
      const count = soldStocks.filter(s => s.product_id === p.id).length;
      const pct = count > 0 ? Math.round((count / totalSoldAll) * 100) : 0;
      return { ...p, count, pct };
    }).filter(p => p.count > 0).sort((a, b) => b.count - a.count);

    // Take top 5 for the doughnut chart
    const top5Products = activeProducts.slice(0, 5);

    const productLabels = top5Products.map(p => p.name);
    const productCounts = top5Products.map(p => p.count);
    const productColors = top5Products.map(p => p.color || '#3b82f6');

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
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: '#1e293b', font: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' } }
            }
          }
        }
      });
    }

    // Render Top Products Summary Table (Excluding 0 Sales Items)
    const tableContainer = document.getElementById('top-products-table-container');
    if (tableContainer) {
      if (activeProducts.length === 0) {
        tableContainer.innerHTML = `
          <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
            Belum ada data produk yang terjual.
          </div>
        `;
      } else {
        let tableHtml = `
          <table class="top-products-table">
            <thead>
              <tr>
                <th>Nama Aplikasi / Produk</th>
                <th style="text-align: center;">Jumlah Terjual</th>
                <th style="text-align: right;">Persentase</th>
              </tr>
            </thead>
            <tbody>
        `;

        activeProducts.forEach(p => {
          tableHtml += `
            <tr>
              <td>
                <div class="tp-prod-pill">
                  <span class="tp-color-dot" style="background: ${p.color || '#3b82f6'};"></span>
                  <span>${p.name}</span>
                </div>
              </td>
              <td style="text-align: center;">
                <span style="font-weight: 800; color: #0f172a;">${p.count} akun</span>
              </td>
              <td style="text-align: right;">
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem;">
                  <div class="tp-progress-bg">
                    <div class="tp-progress-bar" style="width: ${p.pct}%; background: ${p.color || '#3b82f6'};"></div>
                  </div>
                  <span style="font-weight: 800; min-width: 32px; color: #334155;">${p.pct}%</span>
                </div>
              </td>
            </tr>
          `;
        });

        tableHtml += `</tbody></table>`;
        tableContainer.innerHTML = tableHtml;
      }
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

  switchStockTab(status) {
    this.stockFilters.status = status;
    this.stockFilters.page = 1;

    const tabBtns = document.querySelectorAll('.stock-tab-btn');
    tabBtns.forEach(btn => {
      if (btn.getAttribute('data-status') === status) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.renderStockTable();
  },

  updateStockTabCounts() {
    const allStocks = db.getStocks({ status: 'ALL' });
    const readyCount = allStocks.filter(s => s.status === 'READY').length;
    const assignedCount = allStocks.filter(s => s.status === 'ASSIGNED').length;
    const subbedCount = allStocks.filter(s => s.status === 'SEDANG BERLANGGANAN').length;

    const badgeReady = document.getElementById('badge-count-ready');
    const badgeAssigned = document.getElementById('badge-count-assigned');
    const badgeSubbed = document.getElementById('badge-count-subbed');

    if (badgeReady) badgeReady.textContent = readyCount;
    if (badgeAssigned) badgeAssigned.textContent = assignedCount;
    if (badgeSubbed) badgeSubbed.textContent = subbedCount;
  },

  renderStockTable() {
    this.updateStockTabCounts();

    const tableBody = document.getElementById('stock-table-body');
    const paginationContainer = document.getElementById('stock-pagination');
    if (!tableBody) return;

    const allFiltered = db.getStocks(this.stockFilters);
    const totalItems = allFiltered.length;
    const totalPages = Math.ceil(totalItems / this.stockFilters.limit) || 1;

    if (this.stockFilters.page > totalPages) this.stockFilters.page = totalPages;

    const startIndex = (this.stockFilters.page - 1) * this.stockFilters.limit;
    const paginatedItems = allFiltered.slice(startIndex, startIndex + this.stockFilters.limit);

    const currentAuth = db.getAuth();
    const isAdmin = currentAuth && currentAuth.role === 'Admin';
    const now = new Date();

    if (paginatedItems.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="3">
            <div class="empty-state">
              <i class="fa-solid fa-box-open empty-icon"></i>
              <h3>Stok Tidak Ditemukan</h3>
              <p>Tidak ada data stok berstatus "${this.stockFilters.status}" yang sesuai dengan kriteria filter.</p>
            </div>
          </td>
        </tr>
      `;
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    let html = '';
    paginatedItems.forEach(item => {
      const prod = db.getProductById(item.product_id);
      const iconClass = prod ? prod.icon : 'fa-box';
      const prodColor = prod ? prod.color : '#3b82f6';
      const hasImg = prod && prod.image_url && prod.image_url.trim() !== '';

      const appIconHtml = hasImg
        ? `<img src="${prod.image_url}" alt="${item.product_name}" style="width: 22px; height: 22px; border-radius: 5px; object-fit: contain; background: #ffffff; padding: 1px; vertical-align: middle;">`
        : `<i class="fa-solid ${iconClass}" style="color: ${prodColor};"></i>`;

      // Subscription Status Badge (for SEDANG BERLANGGANAN)
      let subStatusBadgeHtml = '';
      let daysRemainingHtml = '';
      let expDateFormatted = '';

      if (item.status === 'SEDANG BERLANGGANAN') {
        const expDate = item.expired_date ? new Date(item.expired_date) : null;
        if (expDate) {
          expDateFormatted = expDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
          const diffMs = expDate - now;
          const daysLeft = Math.ceil(diffMs / 86400000);

          if (daysLeft <= 0) {
            subStatusBadgeHtml = `<span class="badge badge-danger" style="font-size: 0.7rem; padding: 2px 6px;"><i class="fa-solid fa-triangle-exclamation"></i> EXPIRED</span>`;
            daysRemainingHtml = `<span style="color: #ef4444; font-weight: 700;">Expired (${expDateFormatted})</span>`;
          } else if (daysLeft <= 3) {
            subStatusBadgeHtml = `<span class="badge badge-warning" style="font-size: 0.7rem; padding: 2px 6px; background: rgba(245, 158, 11, 0.15); color: #d97706;"><i class="fa-solid fa-clock"></i> EXPIRING SOON</span>`;
            daysRemainingHtml = `<span style="color: #d97706; font-weight: 700;">Sisa ${daysLeft} Hari (s/d ${expDateFormatted})</span>`;
          } else {
            subStatusBadgeHtml = `<span class="badge badge-success" style="font-size: 0.7rem; padding: 2px 6px;"><i class="fa-solid fa-circle-check"></i> ACTIVE</span>`;
            daysRemainingHtml = `<span style="color: #10b981; font-weight: 700;">Sisa ${daysLeft} Hari (s/d ${expDateFormatted})</span>`;
          }
        } else {
          subStatusBadgeHtml = `<span class="badge badge-success" style="font-size: 0.7rem; padding: 2px 6px;"><i class="fa-solid fa-circle-check"></i> ACTIVE</span>`;
        }
      }

      const buyerInfoHtml = (item.buyer_wa || item.buyer_name) ? `
        <div class="buyer-data-tag">
          <i class="fa-brands fa-whatsapp"></i> WA: <b>${item.buyer_wa || item.nomor || '-'}</b> &bull; Pembeli: <b>${item.buyer_name || '-'}</b>
        </div>
      ` : '';

      const assignedDateFormatted = item.assigned_at ? new Date(item.assigned_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '';

      html += `
        <tr>
          <td>
            <div class="product-pill">
              ${appIconHtml}
              <span>${item.product_name}</span>
              ${subStatusBadgeHtml}
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

              ${buyerInfoHtml}

              ${item.status === 'ASSIGNED' ? `
                <span class="assigned-user-tag" style="background: rgba(124, 58, 237, 0.1); color: #7c3aed; border: 1px solid rgba(124, 58, 237, 0.2);">
                  <i class="fa-solid fa-user-check"></i> Assigned: <b>@${item.assigned_to}</b> ${assignedDateFormatted ? `(${assignedDateFormatted})` : ''}
                </span>
              ` : ''}

              ${item.status === 'SEDANG BERLANGGANAN' && daysRemainingHtml ? `
                <span class="sold-date-tag">
                  <i class="fa-solid fa-clock-rotate-left"></i> ${daysRemainingHtml} &bull; Seller: <b>@${item.sold_by || item.assigned_to || 'admin'}</b>
                </span>
              ` : ''}
            </div>
          </td>
          <td>
            <div class="action-btn-group" style="justify-content: flex-end; gap: 0.35rem;">
              <!-- ACTION PER STATUS -->
              ${item.status === 'READY' ? `
                ${isAdmin ? `
                  <button class="act-btn act-btn-sold" onclick="App.openMarkSoldModal('${item.id}')" title="Jual Langsung ke Customer">
                    <i class="fa-solid fa-cart-shopping"></i> Jual
                  </button>
                  <button class="act-btn act-btn-transfer" onclick="App.openAssignStockModal('${item.id}')" title="Assign ke Reseller" style="background: rgba(124, 58, 237, 0.1); color: #7c3aed; border-color: rgba(124, 58, 237, 0.3);">
                    <i class="fa-solid fa-user-plus"></i> Assign
                  </button>
                  <button class="act-btn act-btn-copy" onclick="App.copyTemplate('${item.id}')" title="Copy Template WA">
                    <i class="fa-solid fa-copy"></i>
                  </button>
                  <button class="act-btn act-btn-delete" onclick="App.deleteStock('${item.id}')" title="Hapus Stock">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                ` : ''}
              ` : ''}

              ${item.status === 'ASSIGNED' ? `
                ${isAdmin ? `
                  <button class="act-btn act-btn-take" onclick="App.takeBackStock('${item.id}')" title="Ambil Kembali Stock dari Reseller" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">
                    <i class="fa-solid fa-rotate-left"></i> Ambil Stock
                  </button>
                ` : `
                  <button class="act-btn act-btn-sold" onclick="App.openMarkSoldModal('${item.id}')" title="Jual Stock Ini">
                    <i class="fa-solid fa-cart-shopping"></i> Jual
                  </button>
                `}
                <button class="act-btn act-btn-copy" onclick="App.openStockDetailModal('${item.id}')" title="Detail & Histori Lifecycle">
                  <i class="fa-solid fa-circle-info"></i> Detail
                </button>
                <button class="act-btn act-btn-copy" onclick="App.copyTemplate('${item.id}')" title="Copy Template WA">
                  <i class="fa-solid fa-copy"></i> Copy
                </button>
              ` : ''}

              ${item.status === 'SEDANG BERLANGGANAN' ? `
                <button class="act-btn act-btn-renew" onclick="App.openRenewModal('${item.id}')" title="Perpanjang Subscription">
                  <i class="fa-solid fa-clock-rotate-left"></i> Perpanjang
                </button>
                <button class="act-btn act-btn-copy" onclick="App.openStockDetailModal('${item.id}')" title="Detail & Histori Lifecycle">
                  <i class="fa-solid fa-circle-info"></i> Detail
                </button>
                <button class="act-btn act-btn-copy" onclick="App.copyTemplate('${item.id}')" title="Copy Template WA">
                  <i class="fa-solid fa-copy"></i> Copy
                </button>
              ` : ''}
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
  },

  setPage(pageNum) {
    this.stockFilters.page = pageNum;
    this.renderStockTable();
  },

  // --- NOTIFICATION BADGE & MODAL ---
  updateNotificationBadge() {
    const auth = db.getAuth();
    if (!auth) return;
    const count = db.getUnreadNotificationCount(auth.username);
    const badge = document.getElementById('notif-badge-count');
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  },

  openNotificationsModal() {
    const auth = db.getAuth();
    if (!auth) return;
    const notifs = db.getNotifications(auth.username);
    const modal = document.getElementById('modal-notifications');
    const listContainer = document.getElementById('notif-modal-list');
    const countText = document.getElementById('notif-modal-count-text');

    if (countText) countText.textContent = `${notifs.length} Notifikasi (${db.getUnreadNotificationCount(auth.username)} belum dibaca)`;

    if (listContainer) {
      if (notifs.length === 0) {
        listContainer.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
            <i class="fa-solid fa-bell-slash" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
            Belum ada notifikasi untuk Anda.
          </div>
        `;
      } else {
        let html = '';
        notifs.forEach(n => {
          const dateStr = new Date(n.created_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          });
          const isUnread = !n.read;
          const bg = isUnread ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-card)';
          const border = isUnread ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--border-color)';

          html += `
            <div style="background: ${bg}; border: ${border}; border-radius: var(--radius-md); padding: 0.85rem 1rem; position: relative; cursor: pointer;" onclick="db.markNotifAsRead('${n.id}'); App.updateNotificationBadge(); App.openNotificationsModal();">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem;">
                <span style="font-weight: 800; font-size: 0.85rem; color: var(--text-main);">${n.title}</span>
                <span style="font-size: 0.725rem; color: var(--text-muted);">${dateStr}</span>
              </div>
              <div style="font-size: 0.825rem; color: var(--text-muted); line-height: 1.4;">${n.message}</div>
            </div>
          `;
        });
        listContainer.innerHTML = html;
      }
    }

    if (modal) modal.classList.add('active');
  },

  closeNotificationsModal() {
    const modal = document.getElementById('modal-notifications');
    if (modal) modal.classList.remove('active');
  },

  markAllNotifsRead() {
    const auth = db.getAuth();
    if (!auth) return;
    db.markAllNotifsAsRead(auth.username);
    this.updateNotificationBadge();
    this.openNotificationsModal();
    this.showToast('Notifikasi', 'Semua notifikasi ditandai telah dibaca.', 'success');
  },

  // --- ADD STOCK & TAB HANDLERS ---
  switchAddStockTab(tabName) {
    const singleTab = document.getElementById('add-stock-tab-single');
    const bulkTab = document.getElementById('add-stock-tab-bulk');
    const singleBtn = document.getElementById('add-stock-tab-single-btn');
    const bulkBtn = document.getElementById('add-stock-tab-bulk-btn');

    if (tabName === 'single') {
      if (singleTab) { singleTab.style.display = 'block'; singleTab.classList.add('active'); }
      if (bulkTab) { bulkTab.style.display = 'none'; bulkTab.classList.remove('active'); }
      if (singleBtn) singleBtn.classList.add('active');
      if (bulkBtn) bulkBtn.classList.remove('active');
    } else {
      if (singleTab) { singleTab.style.display = 'none'; singleTab.classList.remove('active'); }
      if (bulkTab) { bulkTab.style.display = 'block'; bulkTab.classList.add('active'); }
      if (singleBtn) singleBtn.classList.remove('active');
      if (bulkBtn) bulkBtn.classList.add('active');
    }
  },

  openAddStockModal(initialTab = 'single') {
    const modal = document.getElementById('modal-add-stock');
    if (!modal) return;

    // Populate product select dropdown
    const select = document.getElementById('stock-product-id');
    if (select) {
      const products = db.getProducts();
      let html = '<option value="">-- Pilih Produk --</option>';
      products.forEach(p => {
        html += `<option value="${p.id}">${p.name}</option>`;
      });
      select.innerHTML = html;
    }

    // Switch to target tab
    this.switchAddStockTab(initialTab);

    // Reset form
    const form = document.getElementById('add-stock-form');
    if (form) form.reset();

    modal.classList.add('active');
  },

  closeAddStockModal() {
    const modal = document.getElementById('modal-add-stock');
    if (modal) modal.classList.remove('active');
  },

  handleAddStock(e) {
    if (e) e.preventDefault();

    const productEl = document.getElementById('stock-product-id');
    const emailEl = document.getElementById('stock-email');
    const nomorEl = document.getElementById('stock-nomor');
    const loginEl = document.getElementById('stock-login-by');
    const profileEl = document.getElementById('stock-profile');
    const pinEl = document.getElementById('stock-pin');
    const noteEl = document.getElementById('stock-note');

    const product_id = productEl ? productEl.value : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const nomor = nomorEl ? nomorEl.value.trim() : '';
    const login_by = loginEl ? loginEl.value.trim() : '';
    const profile = profileEl ? profileEl.value.trim() : '';
    const pin = pinEl ? pinEl.value.trim() : '';
    const note = noteEl ? noteEl.value.trim() : '';

    if (!product_id || !email) {
      this.showToast('Input Kurang', 'Pilih Produk dan Email Akun Primary wajib diisi!', 'warning');
      return;
    }

    const newStock = db.addStock({
      product_id,
      email,
      nomor: nomor || '-',
      login_by: login_by || 'OTP WhatsApp',
      profile: profile || 'Profil 1',
      pin: pin || '1234',
      note: note || ''
    });

    this.closeAddStockModal();
    this.showToast('Stock Berhasil Ditambah', `Stok ${newStock.product_name} (${newStock.email}) berhasil disimpan sebagai READY.`, 'success');

    if (this.currentPage === 'stock') {
      this.renderStockTable();
    } else if (this.currentPage === 'dashboard') {
      this.renderDashboardView();
    }
  },

  // --- ASSIGN STOCK HANDLERS ---
  openAssignStockModal(stockId) {
    const stock = db.getStockById(stockId);
    if (!stock) return;

    const modal = document.getElementById('modal-assign-stock');
    document.getElementById('assign-stock-id').value = stock.id;
    document.getElementById('assign-stock-info').textContent = `${stock.product_name} (${stock.email})`;

    const select = document.getElementById('assign-reseller-select');
    if (select) {
      const users = db.getUsers().filter(u => u.role === 'Member');
      let html = '<option value="">-- Pilih Reseller --</option>';
      users.forEach(u => {
        html += `<option value="${u.username}" ${stock.assigned_to === u.username ? 'selected' : ''}>${u.name} (@${u.username})</option>`;
      });
      select.innerHTML = html;
    }

    if (modal) modal.classList.add('active');
  },

  closeAssignStockModal() {
    const modal = document.getElementById('modal-assign-stock');
    if (modal) modal.classList.remove('active');
  },

  handleAssignStock(e) {
    if (e) e.preventDefault();
    const stockId = document.getElementById('assign-stock-id').value;
    const targetReseller = document.getElementById('assign-reseller-select').value;

    if (!targetReseller) {
      this.showToast('Input Kurang', 'Silakan pilih reseller penerima stock!', 'warning');
      return;
    }

    const res = db.assignStock(stockId, targetReseller);
    if (res.success) {
      this.closeAssignStockModal();
      this.showToast('Stock Di-assign', `Stok ${res.stock.product_name} (${res.stock.email}) berhasil diassign ke reseller @${targetReseller}.`, 'success');
      this.renderStockTable();
      if (this.currentPage === 'dashboard') this.renderDashboardView();
    } else {
      this.showToast('Gagal Assign', res.message, 'error');
    }
  },

  takeBackStock(stockId) {
    const stock = db.getStockById(stockId);
    if (!stock) return;

    this.showConfirm(
      'Ambil Stock Kembali',
      `Ambil kembali stock ${stock.product_name} (${stock.email}) dari reseller @${stock.assigned_to}? Stock akan kembali menjadi READY di bawah kontrol Admin.`,
      () => {
        const res = db.takeBackStock(stockId);
        if (res.success) {
          this.showToast('Stock Diambil Kembali', `Stock ${stock.product_name} (${stock.email}) telah dikembalikan ke status READY. Notifikasi telah dikirim ke reseller @${stock.assigned_to}.`, 'success');
          this.renderStockTable();
          this.updateNotificationBadge();
          if (this.currentPage === 'dashboard') this.renderDashboardView();
        } else {
          this.showToast('Gagal', res.message, 'error');
        }
      },
      'warning'
    );
  },

  // --- RENEW SUBSCRIPTION HANDLERS ---
  openRenewModal(stockId) {
    const stock = db.getStockById(stockId);
    if (!stock) return;

    const modal = document.getElementById('modal-renew-stock');
    document.getElementById('renew-stock-id').value = stock.id;
    document.getElementById('renew-stock-info').textContent = `${stock.product_name} (${stock.email}) — Pembeli: ${stock.buyer_name || '-'}`;

    const expFormatted = stock.expired_date ? new Date(stock.expired_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
    document.getElementById('renew-current-exp').textContent = `Expired Saat Ini: ${expFormatted}`;

    if (modal) modal.classList.add('active');
  },

  closeRenewModal() {
    const modal = document.getElementById('modal-renew-stock');
    if (modal) modal.classList.remove('active');
  },

  handleRenewStock(e) {
    if (e) e.preventDefault();
    const stockId = document.getElementById('renew-stock-id').value;
    const daysToAdd = parseInt(document.getElementById('renew-days').value || 30, 10);

    const res = db.renewSubscription(stockId, daysToAdd);
    if (res.success) {
      this.closeRenewModal();
      this.showToast('Subscription Diperpanjang', `Masa aktif ${res.stock.product_name} (${res.stock.email}) berhasil diperpanjang +${daysToAdd} hari.`, 'success');
      this.renderStockTable();
      if (this.currentPage === 'dashboard') this.renderDashboardView();
    } else {
      this.showToast('Gagal Perpanjang', res.message, 'error');
    }
  },

  // --- STOCK DETAIL & TIMELINE MODAL ---
  openStockDetailModal(stockId) {
    const stock = db.getStockById(stockId);
    if (!stock) return;

    const modal = document.getElementById('modal-stock-detail');
    const container = document.getElementById('stock-detail-content');
    if (!container) return;

    const now = new Date();
    let subStatusBadge = '';
    let daysRemainingText = '-';

    if (stock.status === 'SEDANG BERLANGGANAN' && stock.expired_date) {
      const exp = new Date(stock.expired_date);
      const diffMs = exp - now;
      const daysLeft = Math.ceil(diffMs / 86400000);

      if (daysLeft <= 0) {
        subStatusBadge = `<span class="badge badge-danger"><i class="fa-solid fa-triangle-exclamation"></i> EXPIRED</span>`;
        daysRemainingText = `<span style="color: #ef4444; font-weight: 800;">Sudah Expired (${Math.abs(daysLeft)} hari lalu)</span>`;
      } else if (daysLeft <= 3) {
        subStatusBadge = `<span class="badge badge-warning" style="background: rgba(245, 158, 11, 0.15); color: #d97706;"><i class="fa-solid fa-clock"></i> EXPIRING SOON</span>`;
        daysRemainingText = `<span style="color: #d97706; font-weight: 800;">Sisa ${daysLeft} Hari (Segera Expired)</span>`;
      } else {
        subStatusBadge = `<span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> ACTIVE</span>`;
        daysRemainingText = `<span style="color: #10b981; font-weight: 800;">Sisa ${daysLeft} Hari</span>`;
      }
    }

    const startFormatted = stock.start_date ? new Date(stock.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
    const expFormatted = stock.expired_date ? new Date(stock.expired_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

    let historyTimelineHtml = '';
    const historyList = stock.history || [];
    if (historyList.length === 0) {
      historyTimelineHtml = `<div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 0.5rem;">Belum ada riwayat aktivitas.</div>`;
    } else {
      historyList.forEach(h => {
        const hDate = h.date ? new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
        let hBadgeColor = '#3b82f6';
        let hIcon = 'fa-circle-info';
        if (h.type === 'CREATED') { hBadgeColor = '#3b82f6'; hIcon = 'fa-plus-circle'; }
        if (h.type === 'ASSIGNED') { hBadgeColor = '#7c3aed'; hIcon = 'fa-share'; }
        if (h.type === 'TAKEN_BACK') { hBadgeColor = '#ef4444'; hIcon = 'fa-rotate-left'; }
        if (h.type === 'SOLD') { hBadgeColor = '#10b981'; hIcon = 'fa-cart-shopping'; }
        if (h.type === 'RENEWAL') { hBadgeColor = '#06b6d4'; hIcon = 'fa-rotate-right'; }
        if (h.type === 'EXPIRED') { hBadgeColor = '#f59e0b'; hIcon = 'fa-clock'; }

        historyTimelineHtml += `
          <div style="display: flex; gap: 0.75rem; align-items: flex-start; border-left: 2px solid ${hBadgeColor}; padding-left: 0.85rem; margin-bottom: 0.85rem;">
            <div>
              <div style="font-size: 0.825rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid ${hIcon}" style="color: ${hBadgeColor};"></i> ${h.type} &bull; <span style="font-weight: 600; color: var(--text-muted); font-size: 0.75rem;">by ${h.by || 'admin'}</span>
              </div>
              <div style="font-size: 0.775rem; color: var(--text-muted); margin-top: 0.15rem;">${h.details || '-'}</div>
              <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 0.1rem;">${hDate}</div>
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem;">
        <div>
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); letter-spacing: 0.5px;">Produk:</span>
          <h3 style="font-size: 1.1rem; color: var(--text-main); font-weight: 900; margin: 0;">${stock.product_name}</h3>
          <div style="font-size: 0.85rem; color: var(--primary); font-weight: 700; margin-top: 0.2rem;">${stock.email}</div>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Status Stock:</span>
          <span class="badge ${stock.status === 'READY' ? 'badge-primary' : (stock.status === 'ASSIGNED' ? 'badge-purple' : 'badge-success')}" style="${stock.status === 'ASSIGNED' ? 'background: rgba(124, 58, 237, 0.15); color: #7c3aed;' : ''}">
            ${stock.status}
          </span>
          ${subStatusBadge ? `<div style="margin-top: 0.35rem;">${subStatusBadge}</div>` : ''}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
        <div style="background: var(--bg-body); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.85rem;">
          <h4 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 800;">Informasi Akun</h4>
          <div style="font-size: 0.825rem; line-height: 1.6; color: var(--text-main);">
            <div><b>Login By:</b> ${stock.login_by || '-'}</div>
            <div><b>Profil:</b> ${stock.profile || '-'}</div>
            <div><b>PIN:</b> ${stock.pin || '-'}</div>
            <div><b>No HP:</b> ${stock.nomor || '-'}</div>
            <div><b>Note:</b> ${stock.note || '-'}</div>
          </div>
        </div>

        <div style="background: var(--bg-body); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.85rem;">
          <h4 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 800;">Assignment &amp; Penjualan</h4>
          <div style="font-size: 0.825rem; line-height: 1.6; color: var(--text-main);">
            <div><b>Assigned Reseller:</b> ${stock.assigned_to && stock.assigned_to !== 'admin' ? `<span style="color: #7c3aed; font-weight: 800;">@${stock.assigned_to}</span>` : 'Admin (Unassigned)'}</div>
            <div><b>Penjual / Seller:</b> ${stock.sold_by ? `@${stock.sold_by}` : '-'}</div>
            <div><b>Pembeli:</b> ${stock.buyer_name || '-'} (${stock.buyer_wa || '-'})</div>
            <div><b>Masa Berlangganan:</b> ${startFormatted} s/d ${expFormatted}</div>
            <div><b>Sisa Waktu:</b> ${daysRemainingText}</div>
          </div>
        </div>
      </div>

      <div style="background: var(--bg-body); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.85rem;">
        <h4 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.75rem; font-weight: 800;">Histori Assignment &amp; Lifecycle Stock</h4>
        ${historyTimelineHtml}
      </div>
    `;

    if (modal) modal.classList.add('active');
  },

  closeStockDetailModal() {
    const modal = document.getElementById('modal-stock-detail');
    if (modal) modal.classList.remove('active');
  },

  // --- MARK SOLD MODAL HANDLERS ---
  openMarkSoldModal(stockId) {
    const stock = db.getStockById(stockId);
    if (!stock) return;

    const modal = document.getElementById('modal-mark-sold');
    document.getElementById('sold-stock-id').value = stock.id;
    document.getElementById('sold-stock-info').textContent = `${stock.product_name} (${stock.email})`;
    document.getElementById('sold-buyer-wa').value = (stock.nomor && stock.nomor !== '-') ? stock.nomor : '';
    document.getElementById('sold-buyer-name').value = stock.buyer_name || '';

    if (modal) modal.classList.add('active');
  },

  closeMarkSoldModal() {
    const modal = document.getElementById('modal-mark-sold');
    if (modal) modal.classList.remove('active');
  },

  handleMarkSold(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('sold-stock-id').value;
    const buyer_wa = document.getElementById('sold-buyer-wa').value.trim();
    const buyer_name = document.getElementById('sold-buyer-name').value.trim();
    const duration_days = document.getElementById('sold-duration-days').value;

    if (!buyer_wa || !buyer_name) {
      this.showToast('Input Kurang', 'Nomor WA Pembeli dan Nama Pembeli wajib diisi!', 'warning');
      return;
    }

    const res = db.sellStock(id, { buyer_wa, buyer_name, duration_days });
    if (res && res.success) {
      this.closeMarkSoldModal();
      this.showToast('Penjualan Berhasil', `Akun ${res.stock.product_name} (${res.stock.email}) berhasil dijual ke ${buyer_name}! Status berubah menjadi SEDANG BERLANGGANAN.`, 'success');
      this.renderStockTable();
      if (this.currentPage === 'dashboard') this.renderDashboardView();
    } else {
      this.showToast('Gagal', res ? res.message : 'Terjadi kesalahan', 'error');
    }
  },

  // --- BULK UPLOAD EXCEL HANDLERS ---
  openBulkUploadModal() {
    this.openAddStockModal('bulk');
  },

  closeBulkUploadModal() {
    this.closeAddStockModal();
  },

  downloadExcelTemplate() {
    const sampleData = [
      {
        "Produk": "Netflix Premium",
        "Nomor HP / Order ID": "085775335453",
        "Email Akun": "netflix.bulk01@gmail.com",
        "Login By": "OTP WhatsApp",
        "Profil": "Profil 1 (User A)",
        "PIN": "1234",
        "Catatan": "Garansi 30 hari"
      },
      {
        "Produk": "Canva Pro",
        "Nomor HP / Order ID": "081234567890",
        "Email Akun": "canva.bulk02@yahoo.com",
        "Login By": "Magic Link",
        "Profil": "Admin Team",
        "PIN": "-",
        "Catatan": "Plan Designer 1 Tahun"
      },
      {
        "Produk": "Disney+ Hotstar",
        "Nomor HP / Order ID": "089988776655",
        "Email Akun": "disney.bulk03@babyiel.com",
        "Login By": "OTP Phone",
        "Profil": "Profil 2",
        "PIN": "9988",
        "Catatan": "Sharing 3 User"
      }
    ];

    if (window.XLSX) {
      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template Stok");
      XLSX.writeFile(workbook, "Template_Bulk_Upload_Stok_Babyiel.xlsx");
      this.showToast('Template Didownload', 'Template Excel (.xlsx) telah tersimpan di folder download Anda.', 'success');
    } else {
      let csvContent = "data:text/csv;charset=utf-8,Produk,Nomor HP / Order ID,Email Akun,Login By,Profil,PIN,Catatan\n";
      sampleData.forEach(r => {
        csvContent += `"${r.Produk}","${r["Nomor HP / Order ID"]}","${r["Email Akun"]}","${r["Login By"]}","${r.Profil}","${r.PIN}","${r.Catatan}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "Template_Bulk_Upload_Stok_Babyiel.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showToast('Template Didownload', 'Template CSV telah tersimpan.', 'success');
    }
  },

  parsedExcelRows: [],

  handleExcelFileSelect(event) {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        if (!window.XLSX) {
          this.showToast('Library Error', 'Library SheetJS belum siap, silakan coba lagi.', 'error');
          return;
        }
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!json || json.length === 0) {
          this.showToast('File Kosong', 'File Excel tidak berisi data stok yang valid.', 'warning');
          return;
        }

        this.parsedExcelRows = json.map(row => {
          return {
            product_name: row['Produk'] || row['product_name'] || row['Product'] || row['Nama Produk'] || '',
            nomor: row['Nomor HP / Order ID'] || row['Nomor HP'] || row['No HP'] || row['nomor'] || row['Order ID'] || '-',
            email: row['Email Akun'] || row['Email'] || row['email'] || row['Login'] || '-',
            login_by: row['Login By'] || row['login_by'] || 'OTP WhatsApp',
            profile: row['Profil'] || row['Profile'] || row['profile'] || '-',
            pin: row['PIN'] || row['pin'] || row['PIN Akun'] || '-',
            note: row['Catatan'] || row['Catatan Internal'] || row['note'] || ''
          };
        }).filter(r => r.email !== '-' || r.nomor !== '-');

        if (this.parsedExcelRows.length === 0) {
          this.showToast('Data Tidak Valid', 'Tidak ada data email atau nomor HP yang valid di file ini.', 'warning');
          return;
        }

        const previewContainer = document.getElementById('excel-preview-container');
        const countSpan = document.getElementById('excel-preview-count');
        const tbody = document.getElementById('excel-preview-tbody');
        const submitBtn = document.getElementById('btn-submit-bulk-excel');

        if (countSpan) countSpan.textContent = this.parsedExcelRows.length;
        if (tbody) {
          tbody.innerHTML = this.parsedExcelRows.map(r => `
            <tr>
              <td><b style="color: var(--primary);">${r.product_name || 'Autodetect'}</b></td>
              <td>${r.nomor}</td>
              <td style="font-weight: 600;">${r.email}</td>
              <td>${r.login_by}</td>
              <td>${r.profile}</td>
              <td>${r.pin}</td>
            </tr>
          `).join('');
        }

        if (previewContainer) previewContainer.style.display = 'block';
        if (submitBtn) submitBtn.disabled = false;
        this.showToast('File Berhasil Di-parse', `Ditemukan ${this.parsedExcelRows.length} baris data stok. Silakan cek preview & klik Import.`, 'success');

      } catch (err) {
        console.error('Excel parse error:', err);
        this.showToast('Gagal Membaca Excel', 'Format file Excel tidak dapat dibaca. Pastikan format file sesuai.', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  },

  resetExcelUpload() {
    this.parsedExcelRows = [];
    const input = document.getElementById('excel-file-input');
    const previewContainer = document.getElementById('excel-preview-container');
    const submitBtn = document.getElementById('btn-submit-bulk-excel');

    if (input) input.value = '';
    if (previewContainer) previewContainer.style.display = 'none';
    if (submitBtn) submitBtn.disabled = true;
  },

  handleBulkImport() {
    if (!this.parsedExcelRows || this.parsedExcelRows.length === 0) return;

    const count = db.bulkAddStocks(this.parsedExcelRows);
    this.showToast('Bulk Upload Berhasil', `${count} stok akun dari Excel berhasil ditambahkan ke database!`, 'success');
    this.closeBulkUploadModal();

    if (this.currentPage === 'stock') this.renderStockTable();
    if (this.currentPage === 'dashboard') this.renderDashboardView();
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
    const prodNameEl = document.getElementById('transfer-product-name');
    const emailInfoEl = document.getElementById('transfer-email-info');
    const profileInfoEl = document.getElementById('transfer-profile-info');
    const selectEl = document.getElementById('transfer-target-user');

    if (idInput) idInput.value = stock.id;
    if (prodNameEl) {
      const prod = db.getProductById(stock.product_id);
      const icon = prod ? prod.icon : 'fa-box';
      prodNameEl.innerHTML = `<i class="fa-solid ${icon}"></i> ${stock.product_name}`;
    }
    if (emailInfoEl) {
      emailInfoEl.innerHTML = `<b>Email:</b> ${stock.email} &bull; <b>Order ID/No:</b> ${stock.nomor || '-'}`;
    }
    if (profileInfoEl) {
      const profileText = stock.profile && stock.profile !== '-' ? stock.profile : 'No Profile';
      const assignedText = stock.assigned_to ? stock.assigned_to : 'Belum di-assign';
      profileInfoEl.innerHTML = `
        <span class="profile-pill-tag"><i class="fa-solid fa-user-tag"></i> Profil: ${profileText}</span>
        <span class="assigned-user-tag"><i class="fa-solid fa-user-circle"></i> Currently: ${assignedText}</span>
      `;
    }

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
  // =========================================================
  // MASTER PRODUK VIEW
  // =========================================================
  renderProductsView() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    const products = db.getProducts();
    const auth = db.getAuth();
    const isMember = auth && auth.role === 'Member';
    const userTemplates = isMember ? db.getUserTemplates(auth.username) : {};

    let html = '';

    products.forEach(p => {
      const displayTemplate = (isMember && userTemplates[p.id]) ? userTemplates[p.id] : p.template;
      const hasImg = p.image_url && p.image_url.trim() !== '';
      const prodIconHtml = hasImg
        ? `<img src="${p.image_url}" alt="${p.name}" style="width: 44px; height: 44px; border-radius: 10px; object-fit: contain; background: #fff; padding: 2px; border: 1px solid #e2e8f0; flex-shrink: 0;">`
        : `<div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: ${p.color}; flex-shrink: 0;">
             <i class="fa-solid ${p.icon}"></i>
           </div>`;

      const isCatalogActive = p.is_active_catalog !== false;
      const catalogBadgeHtml = isCatalogActive
        ? `<span class="badge badge-success" style="font-size: 0.68rem; padding: 2px 7px;"><i class="fa-solid fa-eye"></i> Tampil di Katalog</span>`
        : `<span class="badge badge-danger" style="font-size: 0.68rem; padding: 2px 7px;"><i class="fa-solid fa-eye-slash"></i> Sembunyi</span>`;

      // Build prices summary HTML for card
      let priceSummaryHtml = '';
      if (p.prices && p.prices.length > 0) {
        priceSummaryHtml = p.prices.map(pr => `
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.76rem; border-bottom: 1px dashed var(--border-subtle); padding: 0.15rem 0;">
            <span style="color: var(--text-muted);">&bull; ${pr.label}</span>
            <span style="font-weight: 800; color: var(--primary);">Rp ${(pr.price || 0).toLocaleString('id-ID')}</span>
          </div>
        `).join('');
      } else {
        priceSummaryHtml = `<div style="font-size: 0.75rem; color: var(--text-muted); text-align: center;">Belum ada opsi harga katalog</div>`;
      }

      html += `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                ${prodIconHtml}
                <div>
                  <h3 style="font-size: 1.05rem; color: var(--text-main); font-weight: 900; margin: 0;">${p.name}</h3>
                  <span style="font-size: 0.78rem; color: var(--primary); font-weight: 700;">Masa Aktif: ${p.duration}</span>
                </div>
              </div>
              <div>${catalogBadgeHtml}</div>
            </div>

            <!-- KATALOG PRICES & BENEFITS PREVIEW -->
            <div style="background: var(--bg-body); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.65rem 0.85rem; margin-bottom: 0.85rem;">
              <div style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.35rem; display: flex; align-items: center; justify-content: space-between;">
                <span><i class="fa-solid fa-tags"></i> Opsi Harga Katalog</span>
                <span style="color: #10b981; font-weight: 700;">${p.garansi || 'Garansi Resmi ✓'}</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.15rem; max-height: 90px; overflow-y: auto;">
                ${priceSummaryHtml}
              </div>
              ${p.note ? `<div style="margin-top: 0.4rem; font-size: 0.72rem; color: var(--brand-purple); font-weight: 700;">${p.note}</div>` : ''}
            </div>

            <div style="margin-bottom: 1rem;">
              <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.3rem;">
                ${isMember ? 'Template WA Khusus Saya:' : 'Preview Template WA:'}
              </span>
              <pre class="product-template-preview" style="background: var(--bg-body); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.65rem; font-family: monospace; font-size: 0.78rem; white-space: pre-wrap; word-break: break-word; color: var(--text-main); max-height: 110px; overflow-y: auto;">${displayTemplate}</pre>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; padding-top: 0.85rem; border-top: 1px solid var(--border-color); flex-wrap: wrap;">
            ${isMember ? `
              <button class="btn btn-secondary btn-sm btn-block" onclick="App.openEditProductModal('${p.id}')">
                <i class="fa-solid fa-pen-to-square"></i> Edit Template Saya
              </button>
            ` : `
              <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="App.openEditProductModal('${p.id}')" title="Edit Produk & Harga Katalog">
                <i class="fa-solid fa-pen-to-square"></i> Edit Produk &amp; Harga
              </button>
              <button class="btn btn-secondary btn-sm" onclick="App.duplicateProduct('${p.id}')" title="Duplikasi Produk">
                <i class="fa-solid fa-copy"></i>
              </button>
              <button class="btn btn-danger btn-sm" onclick="App.deleteProduct('${p.id}')" title="Hapus Produk Master">
                <i class="fa-solid fa-trash"></i>
              </button>
            `}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  // =========================================================
  // KELOLA KATALOG VIEW (ADMIN ONLY)
  // =========================================================
  renderCatalogView() {
    const auth = db.getAuth();
    if (auth && auth.role !== 'Admin') {
      this.showToast('Akses Dibatasi', 'Hanya Admin yang dapat mengelola Katalog Publik.', 'error');
      this.navigate('stock');
      return;
    }

    const settings = db.getSettings();
    const titleInput = document.getElementById('catalog-store-title');
    const phoneInput = document.getElementById('catalog-support-phone');
    const subtitleInput = document.getElementById('catalog-store-subtitle');
    const tickerInput = document.getElementById('catalog-ticker-text');

    if (titleInput) titleInput.value = settings.store_title || 'Babyiel Store';
    if (phoneInput) phoneInput.value = settings.support_phone || '085775335453';
    if (subtitleInput) subtitleInput.value = settings.store_subtitle || 'Akun Digital Premium • Terpercaya & Bergaransi 🛡️';
    if (tickerInput) tickerInput.value = settings.ticker_text || '⚡ PROMO SPESIAL HARI INI: PROSES CEPAT 1-5 MENIT &bull; FULL GARANSI RESMI &bull; READY AKUN PREMIUM POPULER ⚡ DISKON RESELLER UP TO 50% ⚡';

    const container = document.getElementById('catalog-products-grid');
    if (!container) return;

    let products = db.getProducts();
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput && searchInput.value.trim() !== '') {
      const q = searchInput.value.toLowerCase().trim();
      products = products.filter(p => p.name.toLowerCase().includes(q) || (p.note && p.note.toLowerCase().includes(q)));
    }

    if (products.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: var(--text-muted); background: var(--bg-body); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
          <i class="fa-solid fa-box-open" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
          Produk katalog tidak ditemukan. Klik <b>"Tambah Produk Katalog Baru"</b> di atas.
        </div>
      `;
      return;
    }

    let html = '';
    products.forEach(p => {
      const hasImg = p.image_url && p.image_url.trim() !== '';
      const prodIconHtml = hasImg
        ? `<img src="${p.image_url}" alt="${p.name}" style="width: 44px; height: 44px; border-radius: 10px; object-fit: contain; background: #fff; padding: 2px; border: 1px solid #e2e8f0; flex-shrink: 0;">`
        : `<div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.3); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: ${p.color || '#7c3aed'}; flex-shrink: 0;">
             <i class="fa-solid ${p.icon || 'fa-box'}"></i>
           </div>`;

      const isCatalogActive = p.is_active_catalog !== false;
      const catalogBadgeHtml = isCatalogActive
        ? `<span class="badge badge-success" style="font-size: 0.72rem; padding: 3px 8px;"><i class="fa-solid fa-eye"></i> Tampil di Katalog</span>`
        : `<span class="badge badge-danger" style="font-size: 0.72rem; padding: 3px 8px;"><i class="fa-solid fa-eye-slash"></i> Disembunyikan</span>`;

      let priceSummaryHtml = '';
      if (p.prices && p.prices.length > 0) {
        priceSummaryHtml = p.prices.map(pr => `
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; border-bottom: 1px dashed var(--border-subtle); padding: 0.2rem 0;">
            <span style="color: var(--text-main); font-weight: 600;">• ${pr.label} <small style="color:var(--text-muted);">(${pr.category || 'Member'})</small></span>
            <span style="font-weight: 800; color: var(--primary);">Rp ${(pr.price || 0).toLocaleString('id-ID')}</span>
          </div>
        `).join('');
      } else {
        priceSummaryHtml = `<div style="font-size: 0.78rem; color: var(--text-muted); text-align: center; padding: 0.3rem 0;">Belum ada opsi harga katalog</div>`;
      }

      html += `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%; border: 1.5px solid ${isCatalogActive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'};">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                ${prodIconHtml}
                <div>
                  <h3 style="font-size: 1.05rem; color: var(--text-main); font-weight: 900; margin: 0;">${p.name}</h3>
                  <span style="font-size: 0.78rem; color: var(--primary); font-weight: 700;">Durasi: ${p.duration || '1 Bulan'}</span>
                </div>
              </div>
              <div>${catalogBadgeHtml}</div>
            </div>

            <div style="background: var(--bg-body); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.75rem 0.85rem; margin-bottom: 0.85rem;">
              <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.4rem; display: flex; align-items: center; justify-content: space-between;">
                <span><i class="fa-solid fa-tags"></i> Opsi Paket &amp; Harga (Pembeli)</span>
                <span style="color: #10b981; font-weight: 700;">${p.garansi || 'Garansi Resmi ✓'}</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.2rem; max-height: 120px; overflow-y: auto;">
                ${priceSummaryHtml}
              </div>
              ${p.note ? `<div style="margin-top: 0.45rem; font-size: 0.75rem; color: var(--brand-purple); font-weight: 700; background: rgba(124,58,237,0.06); padding: 0.3rem 0.5rem; border-radius: 4px;">${p.note}</div>` : ''}
            </div>
          </div>

          <div style="display: flex; gap: 0.4rem; padding-top: 0.85rem; border-top: 1px solid var(--border-color); flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="App.openEditProductModal('${p.id}')" title="Edit Produk &amp; Harga Paket">
              <i class="fa-solid fa-pen-to-square"></i> Edit Produk &amp; Harga
            </button>
            <button class="btn ${isCatalogActive ? 'btn-warning' : 'btn-success'} btn-sm" onclick="App.toggleCatalogStatus('${p.id}')" title="Toggle Tampil/Sembunyi di Katalog">
              <i class="fa-solid ${isCatalogActive ? 'fa-eye-slash' : 'fa-eye'}"></i> ${isCatalogActive ? 'Sembunyikan' : 'Tampilkan'}
            </button>
            <button class="btn btn-danger btn-sm" onclick="App.deleteProduct('${p.id}')" title="Hapus Produk dari Katalog">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  toggleCatalogStatus(productId) {
    const prod = db.getProductById(productId);
    if (!prod) return;

    const newStatus = prod.is_active_catalog === false ? true : false;
    db.updateProduct(productId, { is_active_catalog: newStatus });
    this.showToast(
      newStatus ? 'Katalog Ditampilkan' : 'Katalog Disembunyikan',
      `Produk "${prod.name}" sekarang ${newStatus ? 'tampil' : 'disembunyikan dari'} Katalog Publik.`,
      newStatus ? 'success' : 'info'
    );

    if (this.currentPage === 'catalog') this.renderCatalogView();
    if (this.currentPage === 'products') this.renderProductsView();
  },

  updateProductImagePreview(url) {
    const previewImg = document.getElementById('prod-image-preview-img');
    const previewIcon = document.getElementById('prod-image-preview-icon');
    if (url && url.trim() !== '') {
      if (previewImg) { previewImg.src = url; previewImg.style.display = 'block'; }
      if (previewIcon) previewIcon.style.display = 'none';
    } else {
      if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }
      if (previewIcon) previewIcon.style.display = 'block';
    }
  },

  handleProductImageFile(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const urlInput = document.getElementById('prod-image-url');
        if (urlInput) urlInput.value = e.target.result;
        this.updateProductImagePreview(e.target.result);
      };
      reader.readAsDataURL(input.files[0]);
    }
  },

  // --- PRICE REPEATER FOR CATALOG ---
  renderPriceRows(prices = []) {
    const container = document.getElementById('price-rows-container');
    if (!container) return;

    if (!prices || prices.length === 0) {
      prices = [{ label: '1 Bulan', price: 35000, category: '💎 Member' }];
    }

    let html = '';
    prices.forEach((p, idx) => {
      html += `
        <div class="price-row-item" style="display: flex; gap: 0.5rem; align-items: center; background: var(--bg-card); padding: 0.4rem 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <input type="text" class="form-input price-label-input" placeholder="Nama Paket (contoh: 1 Bulan Sharing)" value="${p.label || ''}" style="flex: 2; padding: 0.35rem 0.6rem; font-size: 0.8rem;">
          <input type="number" class="form-input price-val-input" placeholder="Harga Rp" value="${p.price !== undefined ? p.price : ''}" style="flex: 1.5; padding: 0.35rem 0.6rem; font-size: 0.8rem;">
          <input type="text" class="form-input price-cat-input" placeholder="Kategori/Tag" value="${p.category || '💎 Member'}" style="flex: 1.5; padding: 0.35rem 0.6rem; font-size: 0.8rem;">
          <button type="button" class="btn btn-danger btn-xs" onclick="App.removePriceRow(this)" title="Hapus Paket Ini" style="padding: 0.35rem 0.65rem;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `;
    });
    container.innerHTML = html;
  },

  addPriceRow(label = '', price = '', category = '💎 Member') {
    const container = document.getElementById('price-rows-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'price-row-item';
    div.style.cssText = 'display: flex; gap: 0.5rem; align-items: center; background: var(--bg-card); padding: 0.4rem 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);';
    div.innerHTML = `
      <input type="text" class="form-input price-label-input" placeholder="Nama Paket (contoh: 1 Bulan Sharing)" value="${label}" style="flex: 2; padding: 0.35rem 0.6rem; font-size: 0.8rem;">
      <input type="number" class="form-input price-val-input" placeholder="Harga Rp" value="${price}" style="flex: 1.5; padding: 0.35rem 0.6rem; font-size: 0.8rem;">
      <input type="text" class="form-input price-cat-input" placeholder="Kategori/Tag" value="${category}" style="flex: 1.5; padding: 0.35rem 0.6rem; font-size: 0.8rem;">
      <button type="button" class="btn btn-danger btn-xs" onclick="App.removePriceRow(this)" title="Hapus Paket Ini" style="padding: 0.35rem 0.65rem;">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;
    container.appendChild(div);
  },

  removePriceRow(btn) {
    const row = btn.closest('.price-row-item');
    if (row) row.remove();
  },

  getPricesFromForm() {
    const container = document.getElementById('price-rows-container');
    if (!container) return [];

    const items = container.querySelectorAll('.price-row-item');
    const prices = [];
    items.forEach(row => {
      const labelInput = row.querySelector('.price-label-input');
      const valInput = row.querySelector('.price-val-input');
      const catInput = row.querySelector('.price-cat-input');

      const label = labelInput ? labelInput.value.trim() : '';
      const priceVal = valInput ? valInput.value : '';
      const category = catInput ? catInput.value.trim() || '💎 Member' : '💎 Member';

      if (label || priceVal) {
        prices.push({
          label: label || 'Paket',
          price: parseInt(priceVal || 0, 10),
          category: category
        });
      }
    });
    return prices;
  },

  openAddProductModal() {
    const auth = db.getAuth();
    if (auth && auth.role === 'Member') {
      this.showToast('Akses Dibatasi', 'Member hanya dapat mengedit template copy milik sendiri.', 'warning');
      return;
    }
    const modal = document.getElementById('modal-product');
    document.getElementById('product-form-title').textContent = 'Tambah Produk & Katalog Baru';
    document.getElementById('edit-product-id').value = '';
    document.getElementById('prod-name').value = '';
    document.getElementById('prod-name').disabled = false;
    document.getElementById('prod-catalog-status').value = 'true';
    document.getElementById('prod-catalog-status').disabled = false;
    document.getElementById('prod-icon').value = 'fa-box';
    document.getElementById('prod-icon').disabled = false;
    document.getElementById('prod-color').value = '#3b82f6';
    document.getElementById('prod-color').disabled = false;
    document.getElementById('prod-duration').value = '1 Bulan';
    document.getElementById('prod-duration').disabled = false;
    document.getElementById('prod-garansi').value = '✅ Full Garansi Sesuai S&K';
    document.getElementById('prod-garansi').disabled = false;
    document.getElementById('prod-note').value = '';
    document.getElementById('prod-note').disabled = false;
    document.getElementById('prod-image-url').value = '';
    document.getElementById('prod-image-file').value = '';
    this.updateProductImagePreview('');
    this.renderPriceRows([{ label: '1 Bulan', price: 35000, category: '💎 Member' }]);
    document.getElementById('prod-template').value = '';

    if (modal) modal.classList.add('active');
  },

  duplicateProduct(id) {
    const prod = db.getProductById(id);
    if (!prod) return;

    document.getElementById('product-form-title').textContent = `Duplikasi Produk: ${prod.name}`;
    document.getElementById('edit-product-id').value = '';
    document.getElementById('prod-name').value = `${prod.name} (Copy)`;
    document.getElementById('prod-name').disabled = false;
    document.getElementById('prod-catalog-status').value = prod.is_active_catalog !== false ? 'true' : 'false';
    document.getElementById('prod-catalog-status').disabled = false;
    document.getElementById('prod-icon').value = prod.icon || 'fa-box';
    document.getElementById('prod-icon').disabled = false;
    document.getElementById('prod-color').value = prod.color || '#3b82f6';
    document.getElementById('prod-color').disabled = false;
    document.getElementById('prod-duration').value = prod.duration || '1 Bulan';
    document.getElementById('prod-duration').disabled = false;
    document.getElementById('prod-garansi').value = prod.garansi || '✅ Full Garansi Sesuai S&K';
    document.getElementById('prod-garansi').disabled = false;
    document.getElementById('prod-note').value = prod.note || '';
    document.getElementById('prod-note').disabled = false;
    document.getElementById('prod-image-url').value = prod.image_url || '';
    document.getElementById('prod-image-file').value = '';
    this.updateProductImagePreview(prod.image_url || '');
    this.renderPriceRows(prod.prices || []);
    document.getElementById('prod-template').value = prod.template || '';

    const modal = document.getElementById('modal-product');
    if (modal) modal.classList.add('active');
  },

  openEditProductModal(id) {
    const prod = db.getProductById(id);
    if (!prod) return;

    const auth = db.getAuth();
    const isMember = auth && auth.role === 'Member';

    document.getElementById('prod-image-url').value = prod.image_url || '';
    document.getElementById('prod-image-file').value = '';
    this.updateProductImagePreview(prod.image_url || '');
    this.renderPriceRows(prod.prices || []);

    if (isMember) {
      const userTemplates = db.getUserTemplates(auth.username);
      document.getElementById('product-form-title').textContent = `Edit Template Saya: ${prod.name}`;
      document.getElementById('edit-product-id').value = prod.id;
      document.getElementById('prod-name').value = prod.name;
      document.getElementById('prod-name').disabled = true;
      document.getElementById('prod-catalog-status').value = prod.is_active_catalog !== false ? 'true' : 'false';
      document.getElementById('prod-catalog-status').disabled = true;
      document.getElementById('prod-icon').value = prod.icon;
      document.getElementById('prod-icon').disabled = true;
      document.getElementById('prod-color').value = prod.color;
      document.getElementById('prod-color').disabled = true;
      document.getElementById('prod-duration').value = prod.duration;
      document.getElementById('prod-duration').disabled = true;
      document.getElementById('prod-garansi').value = prod.garansi || '';
      document.getElementById('prod-garansi').disabled = true;
      document.getElementById('prod-note').value = prod.note || '';
      document.getElementById('prod-note').disabled = true;
      document.getElementById('prod-template').value = userTemplates[prod.id] || prod.template;
    } else {
      document.getElementById('product-form-title').textContent = `Edit Produk & Katalog: ${prod.name}`;
      document.getElementById('edit-product-id').value = prod.id;
      document.getElementById('prod-name').value = prod.name;
      document.getElementById('prod-name').disabled = false;
      document.getElementById('prod-catalog-status').value = prod.is_active_catalog !== false ? 'true' : 'false';
      document.getElementById('prod-catalog-status').disabled = false;
      document.getElementById('prod-icon').value = prod.icon;
      document.getElementById('prod-icon').disabled = false;
      document.getElementById('prod-color').value = prod.color;
      document.getElementById('prod-color').disabled = false;
      document.getElementById('prod-duration').value = prod.duration;
      document.getElementById('prod-duration').disabled = false;
      document.getElementById('prod-garansi').value = prod.garansi || '✅ Full Garansi Sesuai S&K';
      document.getElementById('prod-garansi').disabled = false;
      document.getElementById('prod-note').value = prod.note || '';
      document.getElementById('prod-note').disabled = false;
      document.getElementById('prod-template').value = prod.template;
    }

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
    const garansi = document.getElementById('prod-garansi').value.trim();
    const note = document.getElementById('prod-note').value.trim();
    const is_active_catalog = document.getElementById('prod-catalog-status').value === 'true';
    const prices = this.getPricesFromForm();
    const template = document.getElementById('prod-template').value;
    const image_url = document.getElementById('prod-image-url').value.trim();

    const auth = db.getAuth();
    if (auth && auth.role === 'Member') {
      if (!id) {
        this.showToast('Akses Dibatasi', 'Member hanya dapat mengedit template copy milik sendiri!', 'warning');
        return;
      }
      db.saveUserTemplate(auth.username, id, template);
      this.showToast('Template Tersimpan', 'Template WhatsApp khusus Anda berhasil disimpan!', 'success');
      this.closeProductModal();
      this.renderProductsView();
      return;
    }

    if (!name) {
      this.showToast('Input Kurang', 'Nama Produk wajib diisi!', 'warning');
      return;
    }

    const prodPayload = {
      name,
      icon,
      image_url,
      color,
      duration,
      garansi,
      note,
      is_active_catalog,
      prices,
      template
    };

    if (id) {
      db.updateProduct(id, prodPayload);
      this.showToast('Produk & Katalog Diperbarui', 'Data produk dan pengaturan katalog publik berhasil disimpan.', 'success');
    } else {
      db.addProduct(prodPayload);
      this.showToast('Produk & Katalog Ditambah', 'Produk baru berhasil ditambahkan ke database & katalog.', 'success');
    }

    this.closeProductModal();
    this.renderProductsView();
    if (this.currentPage === 'storefront') this.renderStorefront();
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
  // REPORT VIEW & CUSTOMER DATA COLLECTION
  // =========================================================
  setReportPage(p) {
    this.reportFilters.page = p;
    this.renderReportView();
  },

  renderReportView() {
    // Populate Product Filter Select dropdown if not populated
    const select = document.getElementById('report-product-select');
    if (select && select.children.length <= 1) {
      const products = db.getProducts();
      select.innerHTML = `<option value="ALL">Semua Aplikasi</option>` + 
        products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    const reportData = db.getReportData(this.reportFilters);

    // Update Summary Stats Cards
    const totalSoldEl = document.getElementById('report-stat-total-sold');
    const uniqueBuyersEl = document.getElementById('report-stat-unique-buyers');
    const topAppEl = document.getElementById('report-stat-top-app');

    if (totalSoldEl) totalSoldEl.textContent = `${reportData.total} akun`;
    if (uniqueBuyersEl) uniqueBuyersEl.textContent = `${reportData.uniqueBuyers} Pembeli`;
    if (topAppEl) topAppEl.textContent = reportData.topProduct;

    // Render Detailed Sales & Customer Table
    const tbody = document.getElementById('report-table-body');
    const paginationContainer = document.getElementById('report-pagination');
    if (!tbody) return;

    const allItems = reportData.soldItems;
    const totalItems = allItems.length;
    const limit = this.reportFilters.limit || 10;
    const totalPages = Math.ceil(totalItems / limit) || 1;

    if (this.reportFilters.page > totalPages) this.reportFilters.page = totalPages;

    const startIndex = (this.reportFilters.page - 1) * limit;
    const paginatedItems = allItems.slice(startIndex, startIndex + limit);

    if (paginatedItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-state" style="padding: 2.5rem 1rem;">
              <i class="fa-solid fa-folder-open empty-icon" style="font-size: 2.5rem;"></i>
              <h3>Tidak Ada Data Penjualan</h3>
              <p>Tidak ada transaksi terjual atau pembeli yang sesuai dengan kriteria filter.</p>
            </div>
          </td>
        </tr>
      `;
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    let html = '';
    paginatedItems.forEach(item => {
      const prod = db.getProductById(item.product_id);
      const iconClass = prod ? prod.icon : 'fa-box';
      const prodColor = prod ? prod.color : '#3b82f6';
      const hasImg = prod && prod.image_url && prod.image_url.trim() !== '';

      const appIconHtml = hasImg
        ? `<img src="${prod.image_url}" alt="${item.product_name}" style="width: 22px; height: 22px; border-radius: 5px; object-fit: contain; background: #ffffff; padding: 1px; vertical-align: middle;">`
        : `<i class="fa-solid ${iconClass}" style="color: ${prodColor};"></i>`;

      const soldDateFormatted = item.sold_at ? new Date(item.sold_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : '-';

      const waClean = (item.buyer_wa || item.nomor || '').replace(/[^0-9]/g, '');
      const waLink = waClean ? `https://wa.me/${waClean.startsWith('0') ? '62' + waClean.substring(1) : waClean}` : '#';

      html += `
        <tr>
          <td>
            <div style="font-weight: 700; color: #0f172a;">${soldDateFormatted}</div>
          </td>
          <td>
            <div class="product-pill">
              ${appIconHtml}
              <span>${item.product_name}</span>
            </div>
          </td>
          <td>
            <div class="email-display">
              <span class="email-text">${item.email}</span>
              ${item.profile && item.profile !== '-' ? `
                <span class="profile-pill-tag"><i class="fa-solid fa-user-tag"></i> ${item.profile}</span>
              ` : ''}
            </div>
          </td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 0.2rem;">
              <span style="font-weight: 800; color: #0f172a;"><i class="fa-solid fa-user" style="color: #64748b; font-size: 0.75rem;"></i> ${item.buyer_name || 'Tanpa Nama'}</span>
              <a href="${waLink}" target="_blank" rel="noopener" style="font-size: 0.78rem; font-weight: 700; color: #16a34a; text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem;">
                <i class="fa-brands fa-whatsapp"></i> ${item.buyer_wa || item.nomor || '-'}
              </a>
            </div>
          </td>
          <td style="text-align: right;">
            <span class="badge-sub-status ${item.sub_status === 'Sedang Berlangganan' ? 'subbing' : 'sold'}">
              <i class="fa-solid ${item.sub_status === 'Sedang Berlangganan' ? 'fa-clock' : 'fa-check'}"></i> ${item.sub_status || 'Terjual'}
            </span>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    // Render Pagination Controls
    if (paginationContainer) {
      let pagHtml = `
        <div>Menampilkan <b>${startIndex + 1}</b> - <b>${Math.min(startIndex + limit, totalItems)}</b> dari <b>${totalItems}</b> data penjualan</div>
        <div class="pagination-controls">
          <button class="page-btn" ${this.reportFilters.page === 1 ? 'disabled' : ''} onclick="App.setReportPage(${this.reportFilters.page - 1})">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
      `;

      for (let p = 1; p <= totalPages; p++) {
        pagHtml += `
          <button class="page-btn ${p === this.reportFilters.page ? 'active' : ''}" onclick="App.setReportPage(${p})">${p}</button>
        `;
      }

      pagHtml += `
          <button class="page-btn" ${this.reportFilters.page === totalPages ? 'disabled' : ''} onclick="App.setReportPage(${this.reportFilters.page + 1})">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      `;
      paginationContainer.innerHTML = pagHtml;
    }
  },

  exportReportCSV() {
    const reportData = db.getReportData(this.reportFilters);
    const items = reportData.soldItems;

    if (items.length === 0) {
      this.showToast('Export Gagal', 'Tidak ada data penjualan untuk di-export.', 'warning');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID Stock,Tanggal Terjual,Nama Aplikasi,Email Akun,Profil,Nama Pembeli,Nomor WA Pembeli,Status,Assigned To\n";

    items.forEach(item => {
      const soldDate = item.sold_at ? new Date(item.sold_at).toLocaleString('id-ID') : '-';
      const row = [
        `"${item.id}"`,
        `"${soldDate}"`,
        `"${item.product_name}"`,
        `"${item.email}"`,
        `"${item.profile || '-'}"`,
        `"${item.buyer_name || '-'}"`,
        `"${item.buyer_wa || item.nomor || '-'}"`,
        `"${item.sub_status || 'Terjual'}"`,
        `"${item.assigned_to || '-'}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Database_Pembeli_BabyielStore_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast('Export Berhasil', `File CSV berisi ${items.length} data pembeli telah didownload.`, 'success');
  },

  copyReportWAList() {
    const reportData = db.getReportData(this.reportFilters);
    const items = reportData.soldItems;

    const waMap = new Map();
    items.forEach(item => {
      const wa = item.buyer_wa || item.nomor;
      if (wa && wa !== '-') {
        waMap.set(wa, item.buyer_name || 'Customer');
      }
    });

    if (waMap.size === 0) {
      this.showToast('Copy Gagal', 'Tidak ada nomor WhatsApp pembeli yang ditemukan.', 'warning');
      return;
    }

    let text = `=== DATABASE KONTAK WA PEMBELI (${waMap.size} Customer) ===\n\n`;
    let count = 1;
    waMap.forEach((name, wa) => {
      text += `${count}. ${name} - ${wa}\n`;
      count++;
    });

    navigator.clipboard.writeText(text).then(() => {
      this.showToast('List Kontak WA Dicopy!', `${waMap.size} nomor kontak pembeli siap di-broadcast.`, 'success');
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.showToast('List Kontak WA Dicopy!', `${waMap.size} nomor kontak pembeli siap di-broadcast.`, 'success');
    });
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

  renderUsersTable(query = '') {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    let users = db.getUsers();
    const currentAuth = db.getAuth();
    const isAdmin = currentAuth && currentAuth.role === 'Admin';

    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      users = users.filter(u =>
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q))
      );
    }

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">User tidak ditemukan.</td></tr>`;
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

// Immediate initialization fallback
if (typeof App !== 'undefined' && App.init) {
  try { App.init(); } catch (e) { console.warn('App.init fallback executed:', e); }
}
