/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT - DEDICATED COMPLETED LOTS DATA SERVICE
 * ==============================================================================
 * 
 * INSTRUCTIONS FOR DEPLOYMENT:
 * 1. Open your "REQUIREMENTS" Google Sheet (Spreadsheet ID: 1Ydzo9F2FUsU-VTQdUfz12uQ-_l4E_B0fhp0w4H0DYA)
 * 2. Click Extensions > Apps Script in the Google Sheets menu.
 * 3. Paste this entire code into Code.gs (replacing any existing code).
 * 4. Click "Deploy" > "New deployment".
 * 5. Select type: "Web app".
 * 6. Set Description: "Completed Lots Dedicated Web App".
 * 7. Set Execute as: "Me" (your Google account).
 * 8. Set Who has access: "Anyone" (CRITICAL for mobile app & browser requests).
 * 9. Click "Deploy", authorize permissions when prompted.
 * 10. Copy the Web App URL and paste it into `.env` as `EXPO_PUBLIC_COMPLETED_LOTS_APPS_SCRIPT_URL`.
 * ==============================================================================
 */

// Target Spreadsheet ID and Sheet Tab Name for Completed Lots
const COMPLETED_LOTS_SPREADSHEET_ID = '1Ydzo9F2FUsU-VTQdUfz12uQ-_l4E_B0fhp0w4H0DYA';
const COMPLETED_LOTS_SHEET_NAME = 'Completed Lots';

/**
 * Gets the target Spreadsheet by ID or Active Spreadsheet fallback
 */
function getTargetSpreadsheet() {
  if (COMPLETED_LOTS_SPREADSHEET_ID && COMPLETED_LOTS_SPREADSHEET_ID !== 'YOUR_SPREADSHEET_ID') {
    try {
      return SpreadsheetApp.openById(COMPLETED_LOTS_SPREADSHEET_ID);
    } catch (e) {
      console.warn('Could not open spreadsheet by ID, falling back to active spreadsheet: ' + e.message);
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Handles HTTP GET Requests (Fetches all Completed Lots rows as JSON)
 */
function doGet(e) {
  try {
    const ss = getTargetSpreadsheet();
    let sheet = ss.getSheetByName(COMPLETED_LOTS_SHEET_NAME);

    // If "Completed Lots" tab does not exist, create it with standard headers
    if (!sheet) {
      sheet = ss.insertSheet(COMPLETED_LOTS_SHEET_NAME);
      const defaultHeaders = [
        'Record ID',
        'Timestamp',
        'Supervisor',
        'Lot Number',
        'Party Name',
        'Brand',
        'Fabric / Material',
        'Garment Type',
        'Style',
        'Pcs / Qty',
        'Image URL',
        'Status / Operation',
        'Remarks'
      ];
      sheet.appendRow(defaultHeaders);
      
      const headerRange = sheet.getRange(1, 1, 1, defaultHeaders.length);
      headerRange.setBackground('#1E40AF');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const values = sheet.getDataRange().getValues();

    return createJsonResponse({
      ok: true,
      spreadsheetId: ss.getId(),
      sheetName: COMPLETED_LOTS_SHEET_NAME,
      totalRows: values.length,
      values: values
    });
  } catch (err) {
    return createJsonResponse({ ok: false, error: err.toString(), values: [] });
  }
}

/**
 * Handles HTTP POST Requests (Appends new Completed Lot row)
 */
function doPost(e) {
  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    const ss = getTargetSpreadsheet();
    let sheet = ss.getSheetByName(COMPLETED_LOTS_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(COMPLETED_LOTS_SHEET_NAME);
    }

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const recordId = data.recordId || data['Record ID'] || ('comp-' + Date.now());
    const supervisor = data.supervisor || data.Supervisor || 'N/A';
    const lotNumber = data.lotNumber || data['Lot Number'] || '';
    const partyName = data.partyName || data['Party Name'] || 'N/A';
    const brand = data.brand || data.Brand || 'N/A';
    const fabric = data.fabric || data['Fabric / Material'] || data.Fabric || 'N/A';
    const garmentType = data.garmentType || data['Garment Type'] || 'N/A';
    const style = data.style || data.Style || 'N/A';
    const pcsQty = data.pcsQty || data['Pcs / Qty'] || data.totalPcs || 0;
    const imageUrl = data.imageUrl || data['Image URL'] || data.image || '';
    const status = data.status || data['Status / Operation'] || 'Complete Lot';
    const remarks = data.remarks || data.Remarks || '';

    const rowData = [
      recordId,
      timestamp,
      supervisor,
      lotNumber,
      partyName,
      brand,
      fabric,
      garmentType,
      style,
      pcsQty,
      imageUrl,
      status,
      remarks
    ];

    sheet.appendRow(rowData);

    return createJsonResponse({
      ok: true,
      message: 'Completed lot record saved successfully!',
      recordId: recordId,
      lotNumber: lotNumber,
      timestamp: timestamp
    });
  } catch (err) {
    return createJsonResponse({ ok: false, error: err.toString() });
  }
}

/**
 * Creates a CORS-compliant JSON response
 */
function createJsonResponse(responseObject) {
  return ContentService
    .createTextOutput(JSON.stringify(responseObject))
    .setMimeType(ContentService.MimeType.JSON);
}
