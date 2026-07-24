const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'database.json');

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
    template: `✨ NETFLIX PREMIUM 4K UHD SHARING ✨\n\n📞 Nomor : {{nomor}}\n📩 Email : {{email}}\nLogin By : {{login}}\n👤 Profil : {{profile}}\n🔐 PIN : {{pin}}\n\n━━━━━━━━━━━━━━\n💎 DETAIL AKUN\n✔️ Sharing (1 Bulan Premium 4K UHD)\n✔️ Private Profil & PIN kustom\n✔️ Bebas streaming 4K Ultra HD\n\n━━━━━━━━━━━━━━\n📌 GARANSI\n🛡️ Garansi full 30 hari anti-hold / logout\n🛡️ Wajib simpan bukti pembelian\n\n━━━━━━━━━━━━━━\n📞 Support:\n© Babyiel Store ({{support_phone}})`
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
    template: `✨ CANVA PRO DESIGNER TEAM ✨\n\n📞 Nomor : {{nomor}}\n📩 Email : {{email}}\nLogin By : {{login}}\n👤 Profil : {{profile}}\n🔐 PIN : {{pin}}\n\n━━━━━━━━━━━━━━\n📞 Support:\n© Babyiel Store ({{support_phone}})`
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
      { label: '1 Bulan', price: 35000, category: '💎 Sharing' }
    ],
    template: `✨ CHATGPT PLUS GPT-4o ✨\n\n📞 Nomor : {{nomor}}\n📩 Email : {{email}}\nLogin By : {{login}}\n👤 Profil : {{profile}}\n🔐 PIN : {{pin}}\n\n━━━━━━━━━━━━━━\n📞 Support:\n© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-getcontact',
    name: 'Getcontact Premium',
    icon: 'fa-address-book',
    image_url: 'assets/icons/getcontact.svg',
    color: '#3b82f6',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 15000, category: '💎 Standard' }
    ],
    template: `✨ GETCONTACT PREMIUM ✨\n\n📞 Nomor : {{nomor}}\n📩 Email : {{email}}\nLogin By : {{login}}\n\n━━━━━━━━━━━━━━\n📞 Support:\n© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-disney',
    name: 'Disney+ Hotstar',
    icon: 'fa-tv',
    image_url: 'assets/icons/disney.svg',
    color: '#8b5cf6',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: 'Sharing 6 User', price: 30000, category: '1 Bulan' },
      { label: 'Sharing 3 User', price: 55000, category: '1 Bulan' },
      { label: 'Private', price: 150000, category: '1 Bulan' }
    ],
    template: `✨ DISNEY+ HOTSTAR PREMIUM SHARING ✨\n\n📞 Nomor : {{nomor}}\n📩 Email : {{email}}\nLogin By : {{login}}\n👤 Profil : {{profile}}\n🔐 PIN : {{pin}}\n\n━━━━━━━━━━━━━━\n📞 Support:\n© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-youtube',
    name: 'YouTube Premium',
    icon: 'fa-play',
    image_url: 'assets/icons/youtube.svg',
    color: '#ef4444',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    note: '✨ Account Store +Rp2.000',
    prices: [
      { label: '1 Bulan', price: 7000, category: '💎 Member' },
      { label: '2 Bulan', price: 12000, category: '💎 Member' },
      { label: '3 Bulan', price: 18000, category: '💎 Member' },
      { label: '4 Bulan', price: 25000, category: '💎 Member' }
    ],
    template: `✨ YOUTUBE PREMIUM NO ADS ✨\n\n📞 Nomor : {{nomor}}\n📩 Email : {{email}}\nLogin By : {{login}}\n\n━━━━━━━━━━━━━━\n📞 Support:\n© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-alightmotion',
    name: 'Alight Motion Premium',
    icon: 'fa-video',
    image_url: 'assets/icons/alightmotion.svg',
    color: '#10b981',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 12000, category: '💎 Standard' }
    ],
    template: `✨ ALIGHT MOTION PREMIUM ✨\n\n📞 Nomor : {{nomor}}\n📩 Email : {{email}}\nLogin By : {{login}}\n\n━━━━━━━━━━━━━━\n📞 Support:\n© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-vidio',
    name: 'Vidio Platinum',
    icon: 'fa-film',
    image_url: 'assets/icons/vidio.svg',
    color: '#f59e0b',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Bulan', price: 25000, category: '💎 Platinum Premier' }
    ],
    template: `✨ VIDIO PLATINUM PREMIER ✨\n\n📞 Nomor : {{nomor}}\n📩 Email : {{email}}\nLogin By : {{login}}\n👤 Profil : {{profile}}\n🔐 PIN : {{pin}}\n\n━━━━━━━━━━━━━━\n📞 Support:\n© Babyiel Store ({{support_phone}})`
  },
  {
    id: 'prod-wetv',
    name: 'WeTV Premium',
    icon: 'fa-play-circle',
    image_url: 'assets/icons/wetv.svg',
    color: '#ec4899',
    duration: '1 Bulan',
    garansi: '✅ Full Garansi Sesuai S&K',
    prices: [
      { label: '1 Hari', price: 3000, category: '💎 VIP Sharing' },
      { label: '3 Hari', price: 6000, category: '💎 VIP Sharing' },
      { label: '7 Hari', price: 12000, category: '💎 VIP Sharing' },
      { label: '1 Bulan', price: 22000, category: '💎 VIP Sharing' }
    ],
    template: `✨ WETV VIP SHARING ✨\n\n📞 Nomor : {{nomor}}\n📩 Email : {{email}}\nLogin By : {{login}}\n\n━━━━━━━━━━━━━━\n📞 Support:\n© Babyiel Store ({{support_phone}})`
  }
];

const CLEAN_USERS = [
  { id: 'usr-admin-1', username: 'admin', password: '123', name: 'Super Admin Babyiel', role: 'Admin', created_at: new Date().toISOString() },
  { id: 'usr-admin-2', username: 'admin2', password: '123', name: 'Admin Operasional', role: 'Admin', created_at: new Date().toISOString() },
  { id: 'usr-m1', username: 'member1', password: '123', name: 'Reseller Budi', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m2', username: 'member2', password: '123', name: 'Reseller Siti', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m3', username: 'member3', password: '123', name: 'Reseller Dewi', role: 'Member', created_at: new Date().toISOString() },
  { id: 'usr-m4', username: 'member4', password: '123', name: 'Reseller Ahmad', role: 'Member', created_at: new Date().toISOString() }
];

function generateCleanStocks() {
  const products = [
    { id: 'prod-netflix', name: 'Netflix Premium' },
    { id: 'prod-canva', name: 'Canva Pro' },
    { id: 'prod-chatgpt', name: 'ChatGPT Plus' },
    { id: 'prod-getcontact', name: 'Getcontact Premium' },
    { id: 'prod-disney', name: 'Disney+ Hotstar' },
    { id: 'prod-youtube', name: 'YouTube Premium' },
    { id: 'prod-alightmotion', name: 'Alight Motion Premium' },
    { id: 'prod-vidio', name: 'Vidio Platinum' },
    { id: 'prod-wetv', name: 'WeTV Premium' }
  ];

  const stocks = [];
  const now = new Date();

  // 1. 100 STOCKS READY (STK-1001 to STK-1100)
  for (let i = 1; i <= 100; i++) {
    const id = `STK-${1000 + i}`;
    const p = products[(i - 1) % products.length];
    const numPadded = String(i).padStart(3, '0');
    stocks.push({
      id: id,
      product_id: p.id,
      product_name: p.name,
      nomor: `0857753${numPadded}53`,
      email: `${p.id.replace('prod-', '')}.ready${numPadded}@babyiel.com`,
      password: `pass${100000 + i}`,
      login_by: i % 2 === 0 ? 'Email & Password' : 'OTP WhatsApp',
      profile: `Profil ${(i % 4) + 1}`,
      pin: `${1000 + (i % 9000)}`,
      note: 'Garansi Resmi Full 100%',
      assigned_to: 'admin',
      status: 'READY',
      created_at: new Date(now - 86400000 * (i % 10)).toISOString(),
      updated_at: new Date(now - 86400000 * (i % 10)).toISOString()
    });
  }

  // 2. 10 STOCKS ASSIGNED (STK-1101 to STK-1110)
  const members = ['member1', 'member2', 'member3', 'member4'];
  for (let i = 1; i <= 10; i++) {
    const id = `STK-${1100 + i}`;
    const p = products[(i - 1) % products.length];
    const numPadded = String(i).padStart(2, '0');
    const member = members[(i - 1) % members.length];
    stocks.push({
      id: id,
      product_id: p.id,
      product_name: p.name,
      nomor: `081234567${numPadded}`,
      email: `${p.id.replace('prod-', '')}.assign${numPadded}@babyiel.com`,
      password: `passassign${numPadded}`,
      login_by: 'Email & Password',
      profile: `Profil ${(i % 4) + 1}`,
      pin: `${2000 + i}`,
      note: `Assigned to ${member}`,
      assigned_to: member,
      assigned_at: new Date(now - 86400000 * 2).toISOString(),
      assigned_by: 'admin',
      status: 'ASSIGNED',
      created_at: new Date(now - 86400000 * 3).toISOString(),
      updated_at: new Date(now - 86400000 * 2).toISOString()
    });
  }

  // 3. 10 STOCKS SEDANG BERLANGGANAN (STK-1111 to STK-1120)
  const buyers = [
    { name: 'Budi Santoso', wa: '081299887766' },
    { name: 'Siti Aminah', wa: '085711223344' },
    { name: 'Dewi Lestari', wa: '081277889900' },
    { name: 'Ahmad Fauzi', wa: '085799001122' },
    { name: 'Eko Prasetyo', wa: '081311223344' },
    { name: 'Maya Putri', wa: '085600112233' },
    { name: 'Rizky Pratama', wa: '087799887766' },
    { name: 'Hendra Wijaya', wa: '081298765432' },
    { name: 'Dian Sastro', wa: '089911223344' },
    { name: 'Fajar Ramadhan', wa: '081299881122' }
  ];

  for (let i = 1; i <= 10; i++) {
    const id = `STK-${1110 + i}`;
    const p = products[(i - 1) % products.length];
    const buyer = buyers[i - 1];
    const member = members[(i - 1) % members.length];
    const numPadded = String(i).padStart(2, '0');
    stocks.push({
      id: id,
      product_id: p.id,
      product_name: p.name,
      nomor: buyer.wa,
      email: `${p.id.replace('prod-', '')}.sub${numPadded}@babyiel.com`,
      password: `passsub${numPadded}`,
      login_by: 'Email & Password',
      profile: `Profil ${(i % 4) + 1}`,
      pin: `${3000 + i}`,
      note: 'Garansi Reseller 30 Hari',
      assigned_to: member,
      sold_by: member,
      status: 'SEDANG BERLANGGANAN',
      buyer_name: buyer.name,
      buyer_wa: buyer.wa,
      customer_name: buyer.name,
      customer_wa: buyer.wa,
      start_date: new Date(now - 86400000 * 5).toISOString(),
      purchased_at: new Date(now - 86400000 * 5).toISOString(),
      activated_at: new Date(now - 86400000 * 5).toISOString(),
      expired_date: new Date(now.getTime() + 86400000 * 25).toISOString(),
      expires_at: new Date(now.getTime() + 86400000 * 25).toISOString(),
      created_at: new Date(now - 86400000 * 10).toISOString(),
      updated_at: new Date(now - 86400000 * 5).toISOString(),
      sold_at: new Date(now - 86400000 * 5).toISOString()
    });
  }

  return stocks;
}

const dbData = {
  products: DEFAULT_PRODUCTS,
  users: CLEAN_USERS,
  stocks: generateCleanStocks(),
  orders: [],
  notifications: [],
  logs: [],
  webhook_logs: [],
  settings: {
    store_title: 'Babyiel Store',
    support_phone: '085775335453',
    qris_merchant_name: 'BABYIEL STORE OFFICIAL',
    qris_merchant_id: 'ID1029384756'
  }
};

fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
console.log('Database cleansed successfully!');
console.log('Users count:', CLEAN_USERS.length);
console.log('Total stocks:', dbData.stocks.length);
console.log('READY stocks:', dbData.stocks.filter(s => s.status === 'READY').length);
console.log('ASSIGNED stocks:', dbData.stocks.filter(s => s.status === 'ASSIGNED').length);
console.log('SEDANG BERLANGGANAN stocks:', dbData.stocks.filter(s => s.status === 'SEDANG BERLANGGANAN').length);
