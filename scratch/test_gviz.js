const REAL_SPREADSHEET_ID = '1Ydzo9F2FUsU-VTQdUfz12uQ-_l4E_B0fhp0w4H0DYA';

async function testGvizJson() {
  const sheetName = 'Completed Lots';
  const url = `https://docs.google.com/spreadsheets/d/${REAL_SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  console.log('Testing GVIZ URL:', url);
  try {
    const res = await fetch(url);
    console.log('HTTP Status:', res.status);
    const text = await res.text();
    console.log('Raw response (first 400 chars):\n', text.slice(0, 400));
    
    // GVIZ returns `/*O_o*/\ngoog.visualization.Query.setResponse({...});`
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/);
    if (jsonMatch && jsonMatch[1]) {
      const parsed = JSON.parse(jsonMatch[1]);
      console.log('🎉 GVIZ SUCCESS!');
      console.log('Table cols:', parsed.table?.cols?.map(c => c.label));
      console.log('Table rows count:', parsed.table?.rows?.length);
      console.log('Sample row 1:', parsed.table?.rows?.[0]?.c?.map(cell => cell?.v));
    }
  } catch (err) {
    console.error('GVIZ Error:', err.message);
  }
}

testGvizJson();
