const indexScriptUrl = 'https://script.google.com/macros/s/AKfycbz9ofgmid-74YQ61oRUN6d4crBlF5FfG5qjeXDg2bUoLoZ7eBWkRVx58t4UzfNODuuzfA/exec';
const reqScriptUrl = 'https://script.google.com/macros/s/AKfycbwSSO_E4yCfc-_HPDcUOgiZfU1CzIqHLDHMl2R79DTVBDMe-bnJB0H7mygohuM2E62EFw/exec';

async function testDualSubmission() {
  console.log('Testing Dual URL Submission...');
  
  // URL 1: Index Sheet
  const indexPayload = {
    action: 'completed',
    type: 'completed',
    lotNumber: '61244',
    status: 'Complete Lot',
    remarks: 'Approval Submitted via Pintu',
    supervisor: 'MONU',
  };

  // URL 2: Requirements Sheet (handleRecordCompletedLot)
  const reqPayload = {
    action: 'recordCompletedLot',
    lotNumber: '61244',
    supervisor: 'MONU',
    party: 'SS',
    brand: 'QC ON',
    fabric: 'MH FLEECE',
    garment: 'LOWER',
    style: 'NORMAL',
    pcs: '528',
    status: 'Approved / Completed',
    remarks: 'Approval Submitted via Pintu',
  };

  try {
    const res1 = await fetch(indexScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(indexPayload),
    });
    console.log('Index Script HTTP Status:', res1.status);

    const res2 = await fetch(reqScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqPayload),
    });
    console.log('Requirements Script HTTP Status:', res2.status);
    const text2 = await res2.text();
    console.log('Requirements Script Response:', text2);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testDualSubmission();
