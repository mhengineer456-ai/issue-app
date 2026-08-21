const GOOGLE_API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const SPREADSHEET_ID = '1oxWP8aWRih1e98SYOV1qu4XlpDIF2NZdtxisX01ZtuA';

async function testWithKey() {
  const urlWithKey = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Completed%20Lots!A:M?key=${GOOGLE_API_KEY}`;
  const urlWithoutKey = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Completed%20Lots!A:M`;

  console.log('1. Testing WITHOUT key in URL:', urlWithoutKey);
  const resNoKey = await fetch(urlWithoutKey);
  console.log('Status WITHOUT key:', resNoKey.status);
  const bodyNoKey = await resNoKey.json();
  console.log('Response WITHOUT key:', bodyNoKey.error?.message);

  console.log('\n2. Testing WITH key in URL:', urlWithKey);
  const resKey = await fetch(urlWithKey);
  console.log('Status WITH key:', resKey.status);
  const bodyKey = await resKey.json();
  if (resKey.ok) {
    console.log('🎉🎉🎉 SUCCESS WITH KEY! Total Rows:', bodyKey.values?.length);
    console.log('Row 0 (Headers):', bodyKey.values?.[0]);
  } else {
    console.log('Error WITH key:', bodyKey.error?.message);
  }
}

testWithKey();
