import { fetchCompletedLots } from '../src/services/lotService.js';

async function testFinalFetch() {
  console.log('Testing updated fetchCompletedLots()...');
  try {
    const res = await fetchCompletedLots();
    console.log('Result Error:', res.error);
    console.log('Total Lots fetched:', res.lots ? res.lots.length : 0);
    if (res.lots && res.lots.length > 0) {
      console.log('🎉🎉 SUCCESS!');
      console.log('Sample Lot:', res.lots[0]);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testFinalFetch();
