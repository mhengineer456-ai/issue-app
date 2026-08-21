const { fetchCompletedLots } = require('../src/services/lotService');

async function testDirectFetch() {
  console.log('Testing direct Google Sheet fetch via fetchCompletedLots()...');
  try {
    const res = await fetchCompletedLots();
    console.log('Error status:', res.error);
    console.log('Lots count:', res.lots ? res.lots.length : 0);
    if (res.lots && res.lots.length > 0) {
      console.log('🎉 DIRECT GOOGLE SHEET FETCH SUCCESS!');
      console.log('Sample lot 1:', res.lots[0]);
      console.log('Sample lot 2:', res.lots[1]);
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testDirectFetch();
