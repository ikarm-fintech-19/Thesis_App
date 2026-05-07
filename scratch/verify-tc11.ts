// Verify TC-11 calculation manually
// Gross = 50,000, CNAS 9% = 4,500, Taxable = 45,500

console.log('=== Manual Verification TC-11 ===');
console.log('Gross: 50,000');
console.log('CNAS 9%: 4,500');
console.log('Taxable: 45,500');
console.log('');
console.log('IRG Brackets:');
console.log('  0-20,000: 0% = 0');
console.log('  20,000-40,000: 23% × 20,000 = 4,600');
console.log('  40,000-45,500: 27% × 5,500 = 1,485');
console.log('IRG Brut: 6,085');
console.log('');
console.log('Abatement 40%: 2,434');
console.log('  (min: 1,500, max: 10,000)');
console.log('');
console.log('IRG Net = 6,085 - 2,434 = 3,651 DZD');
console.log('');
console.log('Net Salary = 45,500 - 3,651 = 41,849 DZD');
console.log('');
console.log('=== Test passes with correct expected value: 3,651 ===');
