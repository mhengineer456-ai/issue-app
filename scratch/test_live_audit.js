const API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const ISSUES_ID = '1uo14nKO_yHu4AJ2rOgaJajuprcinj6xw1AUMFJ6_zYM';

async function testLiveCompletionAudit() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${ISSUES_ID}/values/CompletionAudit!A:M?key=${API_KEY}`;
  console.log('Fetching CompletionAudit tab:', url);
  try {
    const res = await fetch(url);
    console.log('HTTP Status Code:', res.status);
    const data = await res.json();
    if (res.ok) {
      console.log('🎉🎉🎉 LIVE COMPLETION AUDIT FETCH SUCCESS!');
      console.log('Total Rows:', data.values?.length);
      console.log('Headers:', data.values[0]);
      console.log('Row 1:', data.values[1]);
      console.log('Row 2:', data.values[2]);
      console.log('Row 3:', data.values[3]);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testLiveCompletionAudit();
