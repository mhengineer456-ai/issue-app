const https = require('https');

const API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const SUPERVISOR_SHEET_ID = '1iBDfsxA9XEC9nhQE-ALBYlyGRZWOaCYvWsnGfYYbr1I';
const SHEET_NAME = 'StitchingSupervisors';

const url = `https://sheets.googleapis.com/v4/spreadsheets/${SUPERVISOR_SHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}!A:G?key=${API_KEY}`;

https.get(url, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      if (json.values && json.values.length > 0) {
        console.log('--- HEADERS ---');
        console.log(json.values[0]);
        console.log(`\n--- ALL ROWS (${json.values.length - 1} total) ---`);
        for (let i = 1; i < json.values.length; i++) {
          console.log(json.values[i]);
        }
      } else {
        console.log('Response:', json);
      }
    } catch (e) {
      console.error(e);
    }
  });
}).on('error', (e) => console.error(e));
