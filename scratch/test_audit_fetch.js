const { fetchCompletedLots } = require('../src/services/lotService');

async function testAuditFetch() {
  console.log('Testing live fetchCompletedLots() with API Key...');
  try {
    const res = await fetchCompletedLots();
    console.log('Error status:', res.error);
    console.log('Lots count:', res.lots ? res.lots.length : 0);
    if (res.lots && res.lots.length > 0) {
      console.log('🎉🎉🎉 LIVE FETCH SUCCESSFUL!');
      console.log('Sample Lot 1:', res.lots[0]);
      console.log('Sample Lot 2:', res.lots[1]);
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testAuditFetch();
