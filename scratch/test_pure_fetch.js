const GOOGLE_API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const STITCHING_ID = '1oxWP8aWRih1e98SYOV1qu4XlpDIF2NZdtxisX01ZtuA';

async function testLiveFetch() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${STITCHING_ID}/values/Completed%20Lots!A:M?key=${GOOGLE_API_KEY}`;
  console.log('Fetching live from STITCHING spreadsheet:', url);
  try {
    const res = await fetch(url);
    console.log('HTTP Status Code:', res.status);
    const data = await res.json();
    if (res.ok) {
      console.log('🎉🎉🎉 LIVE FETCH SUCCESS!');
      console.log('Total Rows:', data.values?.length);
      console.log('Headers:', data.values[0]);
      console.log('Row 1:', data.values[1]);
      console.log('Row 2:', data.values[2]);
    } else {
      console.log('Error:', data);
    }
  } catch (err) {
    console.error('Fetch Error:', err.message);
  }
}

testLiveFetch();
