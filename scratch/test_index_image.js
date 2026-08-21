const SPREADSHEET_ID = '1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA';
const GOOGLE_API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';

function getDirectImageUrl(url) {
  if (!url) return '';
  const trimmed = url.toString().trim();
  if (!trimmed) return '';
  if (!trimmed.includes('drive.google.com')) return trimmed;
  let fileId = '';
  const dMatch = trimmed.match(/id=([^&]+)/);
  if (dMatch && dMatch[1]) fileId = dMatch[1];
  else {
    const fMatch = trimmed.match(/\/d\/([^/]+)/);
    if (fMatch && fMatch[1]) fileId = fMatch[1];
  }
  return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : trimmed;
}

async function testIndexImageLookup() {
  console.log('Testing Index Image Lookup from SPREADSHEET_ID:', SPREADSHEET_ID);
  const range = 'Index!A:M';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?key=${GOOGLE_API_KEY}`;
  
  try {
    const res = await fetch(url);
    console.log('HTTP Status:', res.status);
    const data = await res.json();
    const rows = data.values || [];
    console.log('Total Index Rows:', rows.length);
    if (rows.length <= 1) return;

    const headers = rows[0].map((h) => (h || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    console.log('Index Headers:', rows[0]);
    const lotIdx = headers.findIndex((h) => h.includes('lotnumber') || h.includes('lotno') || h.includes('lot'));
    const imgIdx = headers.findIndex((h) => h.includes('image') || h.includes('img') || h.includes('url') || h.includes('photo'));
    console.log(`lotIdx: ${lotIdx}, imgIdx: ${imgIdx}`);

    const imageMap = {};
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const lotNo = row[lotIdx] ? row[lotIdx].toString().trim() : '';
      const rawImg = row[imgIdx] ? row[imgIdx].toString().trim() : '';
      if (lotNo && rawImg) {
        imageMap[lotNo] = getDirectImageUrl(rawImg);
      }
    }

    console.log('Sample Index Image Map entries count:', Object.keys(imageMap).length);
    console.log('Checking Lots 61244, 11871, 11866:');
    console.log('61244 Image:', imageMap['61244'] || 'Not found in Index sheet');
    console.log('11871 Image:', imageMap['11871'] || 'Not found in Index sheet');
    console.log('11866 Image:', imageMap['11866'] || 'Not found in Index sheet');

    // Print first 5 items in imageMap
    const entries = Object.entries(imageMap).slice(0, 5);
    console.log('First 5 image map entries:', entries);

  } catch (e) {
    console.error('Error:', e.message);
  }
}

testIndexImageLookup();
