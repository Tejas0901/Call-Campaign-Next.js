#!/usr/bin/env node

/\*\*

- Token Debug Checklist
- Run this checklist to verify the Hyrex token is flowing correctly through the app
  \*/

const checks = [
{
step: 1,
description: "Login stored token",
check: "Open DevTools → Application → Local Storage → Look for 'hyrex-auth-token'",
expected: "Should see a JWT token (eyJ... pattern)",
logs: ["[Login Response]", "[Token Verification]"],
},
{
step: 2,
description: "Modal receives token",
check: "Click 'Create Campaign' after login → Open console",
expected:
"Should see [CreateCampaignModal] log with authToken and first 20 chars",
logs: ["[CreateCampaignModal] Received authToken:"],
},
{
step: 3,
description: "Hook initializes with token",
check: "Look at console output after step 2",
expected: "Should see [useJobCodes] log showing token is present",
logs: ["[useJobCodes] Initialized with authToken:"],
},
{
step: 4,
description: "Job fetch initiated with token",
check: "Click on Job Code dropdown field",
expected:
"Should see [fetchJobCodes] log confirming fetch starts with token, then [fetchJobsFromHyrex] logs",
logs: [
"[fetchJobCodes] Starting fetch",
"[fetchJobsFromHyrex] Calling:",
"[fetchJobsFromHyrex] Headers has Authorization:",
],
},
{
step: 5,
description: "API response",
check: "Check console after dropdown is clicked",
expected:
"Should see [fetchJobsFromHyrex] Response status with 200 code (not 401)",
logs: ["[fetchJobsFromHyrex] Response status:"],
},
{
step: 6,
description: "Jobs loaded",
check: "Verify dropdown populates with job list",
expected:
"Should see [fetchJobsFromHyrex] Success log with count of results",
logs: ["[fetchJobsFromHyrex] Success"],
},
];

console.log("\n========================================");
console.log(" HYREX TOKEN FLOW DEBUG CHECKLIST");
console.log("========================================\n");

checks.forEach((check) => {
console.log(`\nSTEP ${check.step}: ${check.description}`);
console.log("─".repeat(50));
console.log(`ACTION: ${check.check}`);
console.log(`EXPECTED: ${check.expected}`);
console.log(`CONSOLE LOGS TO LOOK FOR:`);
check.logs.forEach((log) => {
console.log(`  • ${log}`);
});
});

console.log("\n========================================");
console.log(" COMMON ISSUES & FIXES");
console.log("========================================\n");

console.log("❌ 401 UNAUTHORIZED ERROR:");
console.log(" → Token stored but not being sent to API");
console.log(" → Fix: Check [fetchJobsFromHyrex] Headers has Authorization log");
console.log(" → Should show: true\n");

console.log("❌ TOKEN NOT IN LOCALSTORAGE:");
console.log(" → Login might have failed");
console.log(" → Fix: Check [Token Verification] log");
console.log(" → Verify Hyrex login credentials are correct\n");

console.log("❌ MODAL OPENS BUT NO TOKEN:");
console.log(" → authToken prop not being passed");
console.log(" → Fix: Check [CreateCampaignModal] log");
console.log(" → Should show authToken as true\n");

console.log("❌ DROPDOWN DOESN'T LOAD JOBS:");
console.log(" → Check [fetchJobCodes] and [fetchJobsFromHyrex] logs");
console.log(" → Look for error message after 'Error:'\n");

console.log("========================================\n");
