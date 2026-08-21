/**
 * Dedicated Google Apps Script for Requirements, Hold Lots, Expected Dates, Tasks, Kaaj Button & Completed Lots Management
 * Dedicated Spreadsheet ID: 1Ydzo9F2FUsU-VTQdUfz12uQ-_l4E_B0fhp0w4H0DYA
 */

const REQUIREMENTS_SPREADSHEET_ID = "1Ydzo9F2FUsU-VTQdUfz12uQ-_l4E_B0fhp0w4H0DYA";
const SHEET_NAME = "Requirements";
const HOLD_SHEET_NAME = "Hold Lots";
const EXPECTED_DATES_SHEET_NAME = "Expected Dates";
const TASKS_SHEET_NAME = "Tasks";
const KAJBUTTON_SHEET_NAME = "Kaaj Button Issuance";
const COMPLETED_SHEET_NAME = "Completed Lots";

/**
 * Extracts parameters safely from GET query strings or POST JSON bodies
 */
function getParams(e) {
  var params = {};
  if (e && e.parameter) {
    for (var key in e.parameter) {
      params[key] = e.parameter[key];
    }
  }
  if (e && e.postData && e.postData.contents) {
    try {
      var bodyObj = JSON.parse(e.postData.contents);
      for (var bKey in bodyObj) {
        params[bKey] = bodyObj[bKey];
      }
    } catch (err) {
      // ignore non-json body
    }
  }
  return params;
}

function doGet(e) {
  const params = getParams(e);
  const action = params.action || "";
  
  if (action === "getRequirements") {
    return handleGetRequirements(params.supervisor);
  } else if (action === "reportIssue" || action === "addRequirement") {
    return handleReportIssue(params);
  } else if (action === "updateRequirementStatus") {
    return handleUpdateRequirementStatus(params);
  } else if (action === "recordHoldLot" || action === "addHoldLot") {
    return handleRecordHoldLot(params);
  } else if (action === "getHoldLots") {
    return handleGetHoldLots(params.supervisor);
  } else if (action === "releaseHoldLot" || action === "unholdLot") {
    return handleReleaseHoldLot(params);
  } else if (action === "recordExpectedDate" || action === "updateExpectedDate") {
    return handleRecordExpectedDate(params);
  } else if (action === "getExpectedDates") {
    return handleGetExpectedDates(params.supervisor);
  } else if (action === "getTasks") {
    return handleGetTasks(params.supervisor);
  } else if (action === "addTask" || action === "createTask") {
    return handleAddTask(params);
  } else if (action === "updateTaskStatus") {
    return handleUpdateTaskStatus(params);
  } else if (action === "recordKaajButtonIssuance" || action === "addKaajButton") {
    return handleRecordKaajButtonIssuance(params);
  } else if (action === "getKaajButtonIssuance") {
    return handleGetKaajButtonIssuance(params.supervisor);
  } else if (action === "recordCompletedLot" || action === "addCompletedLot") {
    return handleRecordCompletedLot(params);
  } else if (action === "getCompletedLots") {
    return handleGetCompletedLots(params.supervisor);
  } else if (action === "submitLotApproval" || action === "approveCompletedLot") {
    return handleSubmitLotApproval(params);
  } else if (action === "ping" || action === "test") {
    return respondJSON({
      status: "success",
      message: "Dedicated Google Apps Script WebApp is LIVE and operational!",
      spreadsheetId: REQUIREMENTS_SPREADSHEET_ID
    });
  }
  
  return respondJSON({
    status: "error",
    message: "Invalid action: '" + action + "'. Valid actions: getRequirements, reportIssue, recordHoldLot, getHoldLots, releaseHoldLot, recordExpectedDate, getExpectedDates, getTasks, addTask, updateTaskStatus, recordKaajButtonIssuance, getKaajButtonIssuance, recordCompletedLot, getCompletedLots, ping."
  });
}

function doPost(e) {
  return doGet(e);
}

/* ==================== REQUIREMENTS MANAGEMENT ==================== */

function handleGetRequirements(supervisorName) {
  try {
    const sheet = getOrCreateRequirementsSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return respondJSON({ status: "success", requirements: [] });
    }
    
    const rows = data.slice(1);
    const requirements = [];
    const isAdmin = supervisorName && supervisorName.toLowerCase().includes("admin");
    
    rows.forEach(row => {
      if (!row[0]) return;
      
      const req = {
        id: row[0].toString(),
        submittedAt: row[1] ? row[1].toString() : new Date().toISOString(),
        supervisor: row[2] ? row[2].toString() : "",
        lotNumber: row[3] ? row[3].toString() : "General",
        priority: row[4] ? row[4].toString() : "Urgent",
        description: row[5] ? row[5].toString() : "",
        status: row[6] ? row[6].toString() : "Reported to HOD",
        isFulfilled: (row[6] && (row[6].toString().toLowerCase().includes("fulfilled") || row[6].toString().toLowerCase().includes("resolved"))),
        fulfilledAt: row[7] ? row[7].toString() : null,
        resolutionRemarks: row[8] ? row[8].toString() : ""
      };
      
      if (isAdmin || !supervisorName || !req.supervisor || req.supervisor.toLowerCase().trim() === supervisorName.toLowerCase().trim()) {
        requirements.push(req);
      }
    });
    
    requirements.reverse();
    return respondJSON({ status: "success", requirements: requirements });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

function handleReportIssue(params) {
  try {
    const sheet = getOrCreateRequirementsSheet();
    const lotNumber = params.lotNumber || "General";
    const priority = params.priority || "Urgent";
    const description = params.description || "";
    const supervisor = params.supervisor || "Supervisor";
    
    const reqId = "req-" + Date.now();
    const timestamp = new Date().toISOString();
    const status = "Reported to HOD";
    
    sheet.appendRow([
      reqId,
      timestamp,
      supervisor,
      lotNumber,
      priority,
      description,
      status,
      "",
      ""
    ]);
    
    return respondJSON({
      status: "success",
      message: "Requirement reported successfully in dedicated sheet",
      reqId: reqId,
      timestamp: timestamp
    });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

function handleUpdateRequirementStatus(params) {
  try {
    const sheet = getOrCreateRequirementsSheet();
    const reqId = params.reqId;
    const lotNumber = params.lotNumber;
    const status = params.status || "Fulfilled";
    const remarks = params.remarks || "";
    const fulfilledAt = new Date().toISOString();
    
    const data = sheet.getDataRange().getValues();
    let updated = false;
    
    for (let i = 1; i < data.length; i++) {
      if ((reqId && data[i][0].toString() === reqId.toString()) || (lotNumber && data[i][3] && data[i][3].toString() === lotNumber.toString())) {
        sheet.getRange(i + 1, 7).setValue(status);
        sheet.getRange(i + 1, 8).setValue(fulfilledAt);
        sheet.getRange(i + 1, 9).setValue(remarks);
        updated = true;
        break;
      }
    }
    
    return respondJSON({
      status: updated ? "success" : "not_found",
      message: updated ? "Requirement updated successfully in dedicated sheet" : "Requirement ID not found"
    });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

/* ==================== HOLD LOTS SEPARATE SHEET MANAGEMENT ==================== */

function handleRecordHoldLot(params) {
  try {
    const sheet = getOrCreateHoldLotsSheet();
    const lotNumber = params.lotNumber || "N/A";
    const supervisor = params.supervisor || "Supervisor";
    const holdStatus = params.holdStatus || params.status || "On Hold";
    const remarks = params.remarks || "";
    
    // Deduplication check: prevent adding duplicate entry within 30 seconds
    const data = sheet.getDataRange().getValues();
    const now = new Date().getTime();
    for (let i = Math.max(1, data.length - 10); i < data.length; i++) {
      const rowLot = data[i][3] ? data[i][3].toString().trim() : "";
      const rowStatus = data[i][4] ? data[i][4].toString().trim() : "";
      const rowTime = data[i][1] ? new Date(data[i][1]).getTime() : 0;
      if (rowLot === lotNumber.toString().trim() && rowStatus === holdStatus.toString().trim() && (now - rowTime) < 30000) {
        return respondJSON({ status: "ignored", message: "Duplicate hold entry skipped within 30 seconds" });
      }
    }

    const holdId = "hold-" + Date.now();
    const timestamp = new Date().toISOString();
    const holdState = "ACTIVE_HOLD";
    
    sheet.appendRow([
      holdId,
      timestamp,
      supervisor,
      lotNumber,
      holdStatus,
      remarks,
      holdState,
      "",
      ""
    ]);
    
    return respondJSON({
      status: "success",
      message: "Hold lot recorded in dedicated 'Hold Lots' sheet tab",
      holdId: holdId,
      timestamp: timestamp
    });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

function handleGetHoldLots(supervisorName) {
  try {
    const sheet = getOrCreateHoldLotsSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return respondJSON({ status: "success", holdLots: [] });
    }
    
    const rows = data.slice(1);
    const holdLots = [];
    const isAdmin = supervisorName && supervisorName.toLowerCase().includes("admin");
    
    rows.forEach(row => {
      if (!row[0]) return;
      
      const item = {
        id: row[0].toString(),
        timestamp: row[1] ? row[1].toString() : new Date().toISOString(),
        supervisor: row[2] ? row[2].toString() : "",
        lotNumber: row[3] ? row[3].toString() : "",
        holdStatus: row[4] ? row[4].toString() : "On Hold",
        remarks: row[5] ? row[5].toString() : "",
        holdState: row[6] ? row[6].toString() : "ACTIVE_HOLD",
        releasedAt: row[7] ? row[7].toString() : null,
        releaseRemarks: row[8] ? row[8].toString() : ""
      };
      
      if (isAdmin || !supervisorName || !item.supervisor || item.supervisor.toLowerCase().trim() === supervisorName.toLowerCase().trim()) {
        holdLots.push(item);
      }
    });
    
    holdLots.reverse();
    return respondJSON({ status: "success", holdLots: holdLots });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

function handleReleaseHoldLot(params) {
  try {
    const sheet = getOrCreateHoldLotsSheet();
    const lotNumber = params.lotNumber;
    const holdId = params.holdId;
    const remarks = params.remarks || "Released / Unheld from portal";
    const releasedAt = new Date().toISOString();
    
    const data = sheet.getDataRange().getValues();
    let updated = false;
    
    for (let i = 1; i < data.length; i++) {
      if ((holdId && data[i][0].toString() === holdId.toString()) || (lotNumber && data[i][3].toString() === lotNumber.toString())) {
        sheet.getRange(i + 1, 7).setValue("RELEASED");
        sheet.getRange(i + 1, 8).setValue(releasedAt);
        sheet.getRange(i + 1, 9).setValue(remarks);
        updated = true;
        break;
      }
    }
    
    return respondJSON({
      status: updated ? "success" : "not_found",
      message: updated ? "Hold lot released in dedicated sheet" : "Hold record not found"
    });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

/* ==================== EXPECTED DATES SEPARATE SHEET MANAGEMENT ==================== */

function handleRecordExpectedDate(params) {
  try {
    const sheet = getOrCreateExpectedDatesSheet();
    const lotNumber = params.lotNumber || "N/A";
    const expectedDate = params.expectedDate || params.date || "";
    const supervisor = params.supervisor || "Supervisor";
    const remarks = params.remarks || "";
    
    // Deduplication check: prevent adding duplicate entry within 30 seconds
    const data = sheet.getDataRange().getValues();
    const now = new Date().getTime();
    for (let i = Math.max(1, data.length - 10); i < data.length; i++) {
      const rowLot = data[i][3] ? data[i][3].toString().trim() : "";
      const rowExpDate = data[i][4] ? data[i][4].toString().trim() : "";
      const rowTime = data[i][1] ? new Date(data[i][1]).getTime() : 0;
      if (rowLot === lotNumber.toString().trim() && rowExpDate === expectedDate.toString().trim() && (now - rowTime) < 30000) {
        return respondJSON({ status: "ignored", message: "Duplicate expected date entry skipped within 30 seconds" });
      }
    }

    const recordId = "exp-" + Date.now();
    const timestamp = new Date().toISOString();
    
    sheet.appendRow([
      recordId,
      timestamp,
      supervisor,
      lotNumber,
      expectedDate,
      remarks
    ]);
    
    return respondJSON({
      status: "success",
      message: "Expected completion date recorded in dedicated 'Expected Dates' sheet tab",
      recordId: recordId,
      timestamp: timestamp
    });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

function handleGetExpectedDates(supervisorName) {
  try {
    const sheet = getOrCreateExpectedDatesSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return respondJSON({ status: "success", expectedDates: [] });
    }
    
    const rows = data.slice(1);
    const expectedDates = [];
    const isAdmin = supervisorName && supervisorName.toLowerCase().includes("admin");
    
    rows.forEach(row => {
      if (!row[0]) return;
      
      const item = {
        id: row[0].toString(),
        timestamp: row[1] ? row[1].toString() : new Date().toISOString(),
        supervisor: row[2] ? row[2].toString() : "",
        lotNumber: row[3] ? row[3].toString() : "",
        expectedDate: row[4] ? row[4].toString() : "",
        remarks: row[5] ? row[5].toString() : ""
      };
      
      if (isAdmin || !supervisorName || !item.supervisor || item.supervisor.toLowerCase().trim() === supervisorName.toLowerCase().trim()) {
        expectedDates.push(item);
      }
    });
    
    expectedDates.reverse();
    return respondJSON({ status: "success", expectedDates: expectedDates });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

/* ==================== TASKS SEPARATE SHEET MANAGEMENT ==================== */

function handleAddTask(params) {
  try {
    const sheet = getOrCreateTasksSheet();
    const title = params.title || "Task Item";
    const category = params.category || "Production";
    const priority = params.priority || "NORMAL";
    const dueDate = params.dueDate || "";
    const description = params.description || "";
    const supervisor = params.supervisor || "Supervisor";
    
    const taskId = "task-" + Date.now();
    const timestamp = new Date().toISOString();
    const status = "PENDING";
    
    sheet.appendRow([
      taskId,
      timestamp,
      supervisor,
      title,
      category,
      priority,
      status,
      dueDate,
      description
    ]);
    
    return respondJSON({
      status: "success",
      message: "Task created successfully in dedicated 'Tasks' sheet tab",
      taskId: taskId,
      timestamp: timestamp
    });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

function handleGetTasks(supervisorName) {
  try {
    const sheet = getOrCreateTasksSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return respondJSON({ status: "success", tasks: [] });
    }
    
    const rows = data.slice(1);
    const tasksList = [];
    const isAdmin = supervisorName && supervisorName.toLowerCase().includes("admin");
    
    rows.forEach(row => {
      if (!row[0]) return;
      
      const item = {
        id: row[0].toString(),
        createdAt: row[1] ? row[1].toString() : new Date().toISOString(),
        assignedTo: row[2] ? row[2].toString() : "",
        title: row[3] ? row[3].toString() : "Task",
        category: row[4] ? row[4].toString() : "General",
        priority: row[5] ? row[5].toString() : "NORMAL",
        status: row[6] ? row[6].toString() : "PENDING",
        dueDate: row[7] ? row[7].toString() : "",
        description: row[8] ? row[8].toString() : ""
      };
      
      if (isAdmin || !supervisorName || !item.assignedTo || item.assignedTo.toLowerCase().trim() === supervisorName.toLowerCase().trim()) {
        tasksList.push(item);
      }
    });
    
    tasksList.reverse();
    return respondJSON({ status: "success", tasks: tasksList });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

function handleUpdateTaskStatus(params) {
  try {
    const sheet = getOrCreateTasksSheet();
    const taskId = params.taskId;
    const status = params.status || "COMPLETED";
    
    const data = sheet.getDataRange().getValues();
    let updated = false;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === taskId.toString()) {
        sheet.getRange(i + 1, 7).setValue(status);
        updated = true;
        break;
      }
    }
    
    return respondJSON({
      status: updated ? "success" : "not_found",
      message: updated ? "Task status updated successfully in dedicated sheet" : "Task ID not found"
    });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

/* ==================== KAAJ BUTTON SEPARATE SHEET MANAGEMENT ==================== */

function handleRecordKaajButtonIssuance(params) {
  try {
    const sheet = getOrCreateKaajButtonSheet();
    const lotNumber = params.lotNumber || "N/A";
    const statusVal = params.status || params.operation || "Kaaj Working";
    const pcs = params.pcs || "0";
    const supervisor = params.supervisor || "Supervisor";
    const remarks = params.remarks || "";
    
    // Deduplication check: prevent adding duplicate entry within 30 seconds
    const data = sheet.getDataRange().getValues();
    const now = new Date().getTime();
    for (let i = Math.max(1, data.length - 10); i < data.length; i++) {
      const rowLot = data[i][3] ? data[i][3].toString().trim() : "";
      const rowStatus = data[i][4] ? data[i][4].toString().trim() : "";
      const rowTime = data[i][1] ? new Date(data[i][1]).getTime() : 0;
      if (rowLot === lotNumber.toString().trim() && rowStatus === statusVal.toString().trim() && (now - rowTime) < 30000) {
        return respondJSON({ status: "ignored", message: "Duplicate kaaj button entry skipped within 30 seconds" });
      }
    }

    const recordId = "kaj-" + Date.now();
    const timestamp = new Date().toISOString();
    
    sheet.appendRow([
      recordId,
      timestamp,
      supervisor,
      lotNumber,
      statusVal,
      pcs,
      remarks
    ]);
    
    return respondJSON({
      status: "success",
      message: "Kaaj button issuance recorded in dedicated 'Kaaj Button Issuance' sheet tab",
      recordId: recordId,
      timestamp: timestamp
    });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

function handleGetKaajButtonIssuance(supervisorName) {
  try {
    const sheet = getOrCreateKaajButtonSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return respondJSON({ status: "success", kaajRecords: [] });
    }
    
    const rows = data.slice(1);
    const kaajRecords = [];
    const isAdmin = supervisorName && supervisorName.toLowerCase().includes("admin");
    
    rows.forEach(row => {
      if (!row[0]) return;
      
      const item = {
        id: row[0].toString(),
        timestamp: row[1] ? row[1].toString() : new Date().toISOString(),
        supervisor: row[2] ? row[2].toString() : "",
        lotNumber: row[3] ? row[3].toString() : "",
        status: row[4] ? row[4].toString() : "Kaaj Working",
        pcs: row[5] ? row[5].toString() : "0",
        remarks: row[6] ? row[6].toString() : ""
      };
      
      if (isAdmin || !supervisorName || !item.supervisor || item.supervisor.toLowerCase().trim() === supervisorName.toLowerCase().trim()) {
        kaajRecords.push(item);
      }
    });
    
    kaajRecords.reverse();
    return respondJSON({ status: "success", kaajRecords: kaajRecords });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

/* ==================== COMPLETED LOTS SEPARATE SHEET MANAGEMENT ==================== */

function handleRecordCompletedLot(params) {
  try {
    const sheet = getOrCreateCompletedLotsSheet();
    const lotNumber = params.lotNumber || params.lot || "N/A";
    const supervisor = params.supervisor || "Supervisor";
    const party = params.party || params.partyName || "";
    const brand = params.brand || "";
    const fabric = params.fabric || params.material || "";
    const garment = params.garment || params.garmentType || "";
    const style = params.style || "";
    const pcs = params.pcs || "0";
    const imageUrl = params.imageUrl || params.image || "";
    const statusVal = params.status || params.operation || "Approved / Completed";
    const remarks = params.remarks || "";
    
    const data = sheet.getDataRange().getValues();
    let rowFound = -1;
    
    for (let i = 1; i < data.length; i++) {
      const rowLot = data[i][3] ? data[i][3].toString().trim() : "";
      if (rowLot === lotNumber.toString().trim()) {
        rowFound = i + 1;
        break;
      }
    }

    const timestamp = new Date().toISOString();

    if (rowFound > 0) {
      // Update existing row
      sheet.getRange(rowFound, 2).setValue(timestamp);
      if (supervisor) sheet.getRange(rowFound, 3).setValue(supervisor);
      if (party) sheet.getRange(rowFound, 5).setValue(party);
      if (brand) sheet.getRange(rowFound, 6).setValue(brand);
      if (fabric) sheet.getRange(rowFound, 7).setValue(fabric);
      if (garment) sheet.getRange(rowFound, 8).setValue(garment);
      if (style) sheet.getRange(rowFound, 9).setValue(style);
      if (pcs && pcs !== "0") sheet.getRange(rowFound, 10).setValue(pcs);
      if (imageUrl) sheet.getRange(rowFound, 11).setValue(imageUrl);
      sheet.getRange(rowFound, 12).setValue(statusVal);
      if (remarks) sheet.getRange(rowFound, 13).setValue(remarks);

      return respondJSON({
        status: "success",
        message: "Completed lot updated in 'Completed Lots' sheet tab",
        lotNumber: lotNumber
      });
    } else {
      // Append new row
      const recordId = "comp-" + Date.now();
      sheet.appendRow([
        recordId,
        timestamp,
        supervisor,
        lotNumber,
        party,
        brand,
        fabric,
        garment,
        style,
        pcs,
        imageUrl,
        statusVal,
        remarks
      ]);

      return respondJSON({
        status: "success",
        message: "Completed lot recorded in 'Completed Lots' sheet tab",
        recordId: recordId,
        timestamp: timestamp
      });
    }
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

function handleGetCompletedLots(supervisorName) {
  try {
    const sheet = getOrCreateCompletedLotsSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return respondJSON({ status: "success", completedRecords: [], values: data });
    }
    
    const rows = data.slice(1);
    const completedRecords = [];
    const isAdmin = supervisorName && supervisorName.toLowerCase().includes("admin");
    
    rows.forEach(row => {
      if (!row[0]) return;
      
      const item = {
        id: row[0].toString(),
        timestamp: row[1] ? row[1].toString() : new Date().toISOString(),
        supervisor: row[2] ? row[2].toString() : "",
        lotNumber: row[3] ? row[3].toString() : "",
        party: row[4] ? row[4].toString() : "",
        brand: row[5] ? row[5].toString() : "",
        fabric: row[6] ? row[6].toString() : "",
        garment: row[7] ? row[7].toString() : "",
        style: row[8] ? row[8].toString() : "",
        pcs: row[9] ? row[9].toString() : "0",
        imageUrl: row[10] ? row[10].toString() : "",
        status: row[11] ? row[11].toString() : "Completed",
        remarks: row[12] ? row[12].toString() : ""
      };
      
      if (isAdmin || !supervisorName || !item.supervisor || item.supervisor.toLowerCase().trim() === supervisorName.toLowerCase().trim()) {
        completedRecords.push(item);
      }
    });
    
    completedRecords.reverse();
    return respondJSON({ status: "success", completedRecords: completedRecords, values: data });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

function handleSubmitLotApproval(params) {
  try {
    const sheet = getOrCreateCompletedLotsSheet();
    const lotNumber = params.lotNumber;
    const approvalType = params.approvalType || "Final Approval";
    const approvedBy = params.approvedBy || "Admin";
    const remarks = params.remarks || "";
    
    const data = sheet.getDataRange().getValues();
    let updated = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][3] && data[i][3].toString().trim() === lotNumber.toString().trim()) {
        sheet.getRange(i + 1, 12).setValue(approvalType + " (" + approvedBy + ")");
        if (remarks) {
          sheet.getRange(i + 1, 13).setValue(remarks);
        }
        updated = true;
        break;
      }
    }
    return respondJSON({
      status: updated ? "success" : "recorded",
      message: updated ? "Lot approval recorded in Completed Lots sheet" : "Approval logged successfully"
    });
  } catch (err) {
    return respondJSON({ status: "error", message: err.toString() });
  }
}

/* ==================== HELPER SHEET INITIALIZERS ==================== */

function getOrCreateRequirementsSheet() {
  const ss = SpreadsheetApp.openById(REQUIREMENTS_SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Requirement ID",
      "Timestamp",
      "Supervisor",
      "Lot Number",
      "Priority",
      "Description",
      "Status",
      "Fulfilled At",
      "Resolution Remarks"
    ]);
    sheet.getRange("1:1").setFontWeight("bold").setBackground("#0066cc").setFontColor("#ffffff");
  }
  return sheet;
}

function getOrCreateHoldLotsSheet() {
  const ss = SpreadsheetApp.openById(REQUIREMENTS_SPREADSHEET_ID);
  let sheet = ss.getSheetByName(HOLD_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(HOLD_SHEET_NAME);
    sheet.appendRow([
      "Hold ID",
      "Timestamp",
      "Supervisor",
      "Lot Number",
      "Hold Authority / Status",
      "Hold Reason / Remarks",
      "Hold State (ACTIVE / RELEASED)",
      "Released At",
      "Release Remarks"
    ]);
    sheet.getRange("1:1").setFontWeight("bold").setBackground("#dc2626").setFontColor("#ffffff");
  }
  return sheet;
}

function getOrCreateExpectedDatesSheet() {
  const ss = SpreadsheetApp.openById(REQUIREMENTS_SPREADSHEET_ID);
  let sheet = ss.getSheetByName(EXPECTED_DATES_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(EXPECTED_DATES_SHEET_NAME);
    sheet.appendRow([
      "Record ID",
      "Timestamp",
      "Supervisor",
      "Lot Number",
      "Expected Completion Date",
      "Remarks / Delay Reason"
    ]);
    sheet.getRange("1:1").setFontWeight("bold").setBackground("#ea580c").setFontColor("#ffffff");
  }
  return sheet;
}

function getOrCreateTasksSheet() {
  const ss = SpreadsheetApp.openById(REQUIREMENTS_SPREADSHEET_ID);
  let sheet = ss.getSheetByName(TASKS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(TASKS_SHEET_NAME);
    sheet.appendRow([
      "Task ID",
      "Timestamp",
      "Supervisor",
      "Task Title",
      "Category",
      "Priority",
      "Status",
      "Due Date",
      "Description"
    ]);
    sheet.getRange("1:1").setFontWeight("bold").setBackground("#0066cc").setFontColor("#ffffff");
  }
  return sheet;
}

function getOrCreateKaajButtonSheet() {
  const ss = SpreadsheetApp.openById(REQUIREMENTS_SPREADSHEET_ID);
  let sheet = ss.getSheetByName(KAJBUTTON_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(KAJBUTTON_SHEET_NAME);
    sheet.appendRow([
      "Record ID",
      "Timestamp",
      "Supervisor",
      "Lot Number",
      "Status / Operation",
      "Pcs",
      "Remarks"
    ]);
    sheet.getRange("1:1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
  }
  return sheet;
}

function getOrCreateCompletedLotsSheet() {
  const ss = SpreadsheetApp.openById(REQUIREMENTS_SPREADSHEET_ID);
  let sheet = ss.getSheetByName(COMPLETED_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(COMPLETED_SHEET_NAME);
    sheet.appendRow([
      "Record ID",
      "Timestamp",
      "Supervisor",
      "Lot Number",
      "Party Name",
      "Brand",
      "Fabric / Material",
      "Garment Type",
      "Style",
      "Pcs / Qty",
      "Image URL",
      "Status / Operation",
      "Remarks"
    ]);
    sheet.getRange("1:1").setFontWeight("bold").setBackground("#16a34a").setFontColor("#ffffff");
  }
  return sheet;
}

/**
 * Direct Test Function for Google Apps Script Editor
 * Select 'testScript' in the top dropdown and click 'Run'!
 */
function testScript() {
  Logger.log("=========================================");
  Logger.log("Testing Spreadsheet Connection: " + REQUIREMENTS_SPREADSHEET_ID);
  const ss = SpreadsheetApp.openById(REQUIREMENTS_SPREADSHEET_ID);
  Logger.log("Spreadsheet Title: " + ss.getName());
  
  const reqSheet = getOrCreateRequirementsSheet();
  Logger.log("✅ Tab 'Requirements' ready (Rows: " + reqSheet.getLastRow() + ")");
  
  const holdSheet = getOrCreateHoldLotsSheet();
  Logger.log("✅ Tab 'Hold Lots' ready (Rows: " + holdSheet.getLastRow() + ")");
  
  const expSheet = getOrCreateExpectedDatesSheet();
  Logger.log("✅ Tab 'Expected Dates' ready (Rows: " + expSheet.getLastRow() + ")");
  
  const taskSheet = getOrCreateTasksSheet();
  Logger.log("✅ Tab 'Tasks' ready (Rows: " + taskSheet.getLastRow() + ")");
  
  const kajSheet = getOrCreateKaajButtonSheet();
  Logger.log("✅ Tab 'Kaaj Button Issuance' ready (Rows: " + kajSheet.getLastRow() + ")");

  const compSheet = getOrCreateCompletedLotsSheet();
  Logger.log("✅ Tab 'Completed Lots' ready (Rows: " + compSheet.getLastRow() + ")");
  
  Logger.log("=========================================");
  Logger.log("SUCCESS! All 6 dedicated tabs exist and are ready for WebApp calls.");
}

function respondJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
