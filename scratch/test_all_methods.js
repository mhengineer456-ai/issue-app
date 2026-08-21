const reqUrl = 'https://script.google.com/macros/s/AKfycbyFdp043WFv-UY8Xs5BcZy9EK86XFdfKyyJi2vNgfLJo62rCuXfEZeIDJUJDLJyHNVXfQ/exec';
const indexUrl = 'https://script.google.com/macros/s/AKfycbz9ofgmid-74YQ61oRUN6d4crBlF5FfG5qjeXDg2bUoLoZ7eBWkRVx58t4UzfNODuuzfA/exec';

async function testMethods() {
  console.log('--- Testing Requirements Web App GET ---');
  const getReq = `${reqUrl}?action=recordCompletedLot&lotNumber=61244&status=${encodeURIComponent('Approved / Completed')}&remarks=${encodeURIComponent('Approval Submitted via Pintu')}&supervisor=MONU&party=SS&brand=QC%20ON&fabric=MH%20FLEECE&garment=LOWER&style=NORMAL&pcs=528`;
  try {
    const res = await fetch(getReq);
    console.log('GET req status:', res.status);
    const json = await res.json();
    console.log('GET req result:', json);
  } catch (e) {
    console.error('GET req error:', e.message);
  }

  console.log('--- Testing Index Web App GET ---');
  const getIndex = `${indexUrl}?action=updatestatus&type=completed&lot=61244&status=${encodeURIComponent('Complete Lot')}&remarks=${encodeURIComponent('Approval Submitted via Pintu')}&supervisor=MONU`;
  try {
    const res = await fetch(getIndex);
    console.log('GET index status:', res.status);
    const json = await res.json();
    console.log('GET index result:', json);
  } catch (e) {
    console.error('GET index error:', e.message);
  }
}

testMethods();
