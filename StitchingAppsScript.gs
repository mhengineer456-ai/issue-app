/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT - STITCHING LOT ISSUE DATA STORAGE
 * ==============================================================================
 * 
 * INSTRUCTIONS FOR DEPLOYMENT:
 * 1. Open Google Sheets (Spreadsheet ID: 1oxWP8aWRih1e98SYOV1qu4XlpDIF2NZdtxisX01ZtuA)
 * 2. Click Extensions > Apps Script in the Google Sheets menu.
 * 3. Paste this entire code into Code.gs (replacing any existing code).
 * 4. Click "Deploy" > "New deployment".
 * 5. Select type: "Web app".
 * 6. Set Description: "Stitching Lot Issue Storage Web App".
 * 7. Set Execute as: "Me" (your Google account).
 * 8. Set Who has access: "Anyone" (CRITICAL for mobile app requests).
 * 9. Click "Deploy", authorize permissions when prompted.
 * 10. Copy the Web App URL and paste it into `.env` as `EXPO_PUBLIC_STITCHING_APPS_SCRIPT_URL`.
 * ==============================================================================
 */

// Target Spreadsheet ID and Sheet / Tab Name for Stitching Issues
const SPREADSHEET_ID = '1oxWP8aWRih1e98SYOV1qu4XlpDIF2NZdtxisX01ZtuA';
const SHEET_NAME = 'Stitching Issues';

/**
 * Gets the target Spreadsheet by ID or Active Spreadsheet fallback
 */
function getTargetSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID !== 'YOUR_SPREADSHEET_ID') {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (e) {
      console.warn('Could not open spreadsheet by ID, falling back to active spreadsheet: ' + e.message);
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Handles HTTP POST Requests (JSON Payload)
 */
function doPost(e) {
  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    return processStitchingData(data);
  } catch (err) {
    return createJsonResponse({ ok: false, error: err.toString() });
  }
}

/**
 * Handles HTTP GET Requests (URL Query Parameter Fallback & Data Fetching)
 */
function doGet(e) {
  try {
    const data = (e && e.parameter) ? e.parameter : {};
    if (data.action === 'getCompletedLots' || data.action === 'readCompletedLots' || data.action === 'getCompleted') {
      return getCompletedLotsData(data);
    }
    return processStitchingData(data);
  } catch (err) {
    return createJsonResponse({ ok: false, error: err.toString() });
  }
}

/**
 * Returns Completed Lots rows from Google Sheet
 */
function getCompletedLotsData(data) {
  const targetId = data.spreadsheetId || '1Ydzo9F2FUsU_VTQdUfz12uQ_l4E_B0fhp0w4H0DYA';
  let ss;
  try {
    ss = SpreadsheetApp.openById(targetId);
  } catch(e) {
    ss = getTargetSpreadsheet();
  }
  const sheetName = data.sheetName || 'Completed Lots';
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return createJsonResponse({ ok: false, error: 'Sheet tab not found', values: [] });
  }
  const values = sheet.getDataRange().getValues();
  return createJsonResponse({ ok: true, values: values });
}

/**
 * Processes Stitching Data and Appends to Google Sheet
 */
function processStitchingData(data) {
  const ss = getTargetSpreadsheet();

  const targetSheetName = data.sheetName || SHEET_NAME;
  let sheet = ss.getSheetByName(targetSheetName);

  // If the sheet tab does not exist, create it and set up column headers
  if (!sheet) {
    sheet = ss.insertSheet(targetSheetName);
    const headers = [
      'Timestamp',
      'Lot Number',
      'Garment Type',
      'Fabric',
      'Style',
      'Brand',
      'Season',
      'Direct Stitching',
      'Stitching Supervisor',
      'Stitching Issue Date',
      'Total Pcs',
      'Party Name',
      'Special Remarks',
      'Authorized By'
    ];
    
    sheet.appendRow(headers);
    
    // Style header row (Dark Blue background, White bold text)
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#2563EB');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }

  // Extract fields from payload
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const lotNumber = data.lotNumber || data['Lot Number'] || '';
  const garmentType = data.garmentType || data['Garment Type'] || '';
  const fabric = data.fabric || data.Fabric || '';
  const style = data.style || data.Style || '';
  const brand = data.brand || data.Brand || '';
  const season = data.season || data.Season || '';
  const directStitching = data.directStitching || data['Direct Stitching'] || '';
  const stitchingSupervisor = data.stitchingSupervisor || data.supervisor || '';
  const stitchingIssueDate = data.stitchingIssueDate || new Date().toISOString().split('T')[0];
  const totalPcs = data.totalPcs || data['Total Pcs'] || 0;
  const partyName = data.partyName || data['Party Name'] || '';
  const specialRemarks = data.specialRemarks || data.priority || '';
  const authorizedBy = data.authorizedBy || '';

  // Append new Stitching Issue row
  const rowData = [
    timestamp,
    lotNumber,
    garmentType,
    fabric,
    style,
    brand,
    season,
    directStitching,
    stitchingSupervisor,
    stitchingIssueDate,
    totalPcs,
    partyName,
    specialRemarks,
    authorizedBy
  ];

  sheet.appendRow(rowData);

  return createJsonResponse({
    ok: true,
    message: 'Stitching lot data saved successfully!',
    sheetName: targetSheetName,
    lotNumber: lotNumber,
    timestamp: timestamp
  });
}

/**
 * Creates a CORS-compliant JSON response
 */
function createJsonResponse(responseObject) {
  return ContentService
    .createTextOutput(JSON.stringify(responseObject))
    .setMimeType(ContentService.MimeType.JSON);
}
