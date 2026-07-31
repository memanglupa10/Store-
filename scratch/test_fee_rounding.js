// Test fee rounding logic
function calculateQRISPrice(catalogPrice) {
  const rawPriceWithFee = catalogPrice * 1.05;
  return catalogPrice > 0 ? Math.ceil(rawPriceWithFee / 500) * 500 : 0;
}

const testCases = [7000, 10000, 12000, 15000, 20000, 25000, 30000, 35000, 50000];

console.log('--- QRIS 5% Surcharge & Rounding Up Test (to nearest Rp 500) ---');
testCases.forEach(catalogPrice => {
  const qrisPrice = calculateQRISPrice(catalogPrice);
  console.log(`Harga Katalog: Rp ${catalogPrice.toLocaleString('id-ID')} | +5% Raw: Rp ${(catalogPrice*1.05).toLocaleString('id-ID')} | Harga QRIS (Bulatan): Rp ${qrisPrice.toLocaleString('id-ID')}`);
});
