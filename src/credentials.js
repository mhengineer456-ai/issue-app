// ============================================================
// GOOGLE SHEETS & APPS SCRIPT API CREDENTIALS CONFIGURATION
// Loaded dynamically from .env (via process.env.EXPO_PUBLIC_*)
// ============================================================

/**
 * 1. GOOGLE API KEY (v4)
 * - Used for unauthenticated read operations across Google Sheets
 */
export const GOOGLE_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_API_KEY ||
  'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';

/**
 * 2. PRIMARY MASTER INDEX SPREADSHEET
 * - Spreadsheet Name: "INDEX / CUTTING MATRIX"
 * - Spreadsheet ID: 1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA
 * - Tab Names: "Index", "Sheet1"
 */
export const SPREADSHEET_ID =
  process.env.EXPO_PUBLIC_SPREADSHEET_ID ||
  '1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA';

/**
 * 3. SUPERVISORS MASTER SPREADSHEET
 * - Spreadsheet Name: "SUPERVISORS"
 * - Spreadsheet ID: 1iBDfsxA9XEC9nhQE-ALBYlyGRZWOaCYvWsnGfYYbr1I
 * - Tab Names: "Supervisors", "List"
 */
export const SUPERVISORS_SPREADSHEET_ID =
  process.env.EXPO_PUBLIC_SUPERVISORS_SPREADSHEET_ID ||
  '1iBDfsxA9XEC9nhQE-ALBYlyGRZWOaCYvWsnGfYYbr1I';

/**
 * 4. PACKING ISSUES SPREADSHEET
 * - Spreadsheet Name: "PACKING ISSUES"
 * - Spreadsheet ID: 1uo14nKO_yHu4AJ2rOgaJajuprcinj6xw1AUMFJ6_zYM
 * - Tab Names: "Issues", "Packing Issues"
 */
export const ISSUES_SPREADSHEET_ID =
  process.env.EXPO_PUBLIC_ISSUES_SPREADSHEET_ID ||
  '1uo14nKO_yHu4AJ2rOgaJajuprcinj6xw1AUMFJ6_zYM';

/**
 * 5. RAWPACK SPREADSHEET
 * - Spreadsheet Name: "RAWPACK"
 * - Spreadsheet ID: 1xD8Uy1lUgvNTQ2RGRBI4ZjOrozbinUPRq2_UfIplP98
 * - Tab Names: "Sheet1", "RAWPACK"
 */
export const RAWPACK_SPREADSHEET_ID =
  process.env.EXPO_PUBLIC_RAWPACK_SPREADSHEET_ID ||
  '1xD8Uy1lUgvNTQ2RGRBI4ZjOrozbinUPRq2_UfIplP98';

/**
 * 6. PACKING APPS SCRIPT WEB APP URL
 * - Purpose: Write operations for Packing Dept
 */
export const APPS_SCRIPT_URL =
  process.env.EXPO_PUBLIC_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbyFdp043WFv-UY8Xs5BcZy9EK86XFdfKyyJi2vNgfLJo62rCuXfEZeIDJUJDLJyHNVXfQ/exec';

/**
 * 7. STITCHING APPS SCRIPT WEB APP URL
 * - Purpose: Write & Read operations for Stitching Dept
 */
export const STITCHING_APPS_SCRIPT_URL =
  process.env.EXPO_PUBLIC_STITCHING_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbxg2O3h_pFaqfypG0dFCyNkCkD69IAG957VzS5Zc7bGyMQ022WfVVlglA0CtrgqZ0N8/exec';

/**
 * 8. STITCHING ISSUES SPREADSHEET
 * - Spreadsheet Name: "LOT ISSUED BY PINTU"
 * - Spreadsheet ID: 1oxWP8aWRih1e98SYOV1qu4XlpDIF2NZdtxisX01ZtuA
 * - Tab Names: "Stitching Issues", "Completed Lots", "PINUISSUEDLOT"
 */
export const STITCHING_SPREADSHEET_ID =
  process.env.EXPO_PUBLIC_STITCHING_SPREADSHEET_ID ||
  '1oxWP8aWRih1e98SYOV1qu4XlpDIF2NZdtxisX01ZtuA';

/**
 * 9. COMPLETED LOTS SPREADSHEET
 * - Spreadsheet Name: "REQUIREMENTS" (or "LOT ISSUED BY PINTU")
 * - Spreadsheet ID: 1Ydzo9F2FUsU-VTQdUfz12uQ-_l4E_B0fhp0w4H0DYA (REQUIREMENTS)
 * - Backup ID: 1oxWP8aWRih1e98SYOV1qu4XlpDIF2NZdtxisX01ZtuA (STITCHING)
 * - Tab Name Required: "Completed Lots"
 */
export const COMPLETED_LOTS_SPREADSHEET_ID =
  process.env.EXPO_PUBLIC_COMPLETED_LOTS_SPREADSHEET_ID ||
  '1Ydzo9F22FUsU-VTQdUfz12uQ-_l4E_B0fhp0w4H0DYA';

/**
 * 10. COMPLETED LOTS DEDICATED APPS SCRIPT WEB APP URL
 * - Dedicated Apps Script URL for REQUIREMENTS sheet Completed Lots
 */
export const COMPLETED_LOTS_APPS_SCRIPT_URL =
  process.env.EXPO_PUBLIC_COMPLETED_LOTS_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbz9ofgmid-74YQ61oRUN6d4crBlF5FfG5qjeXDg2bUoLoZ7eBWkRVx58t4UzfNODuuzfA/exec';

