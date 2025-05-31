import assert from "node:assert";
import { runAction } from "../../src/app";

async function runTest() {
  const result = await runAction(
    "listCalendars",
    "googleOauth",
    { authToken: "auth-token-with-calendar-scope-here" },
    { maxResults: 1 },
  );

  assert(result, "Response should not be null");
  assert(result.success, "Success should be true");
  assert(Array.isArray(result.calendars), "Calendars should be an array");
  assert(result.calendars.length > 0, "Calendars array should not be empty");
  // Only check the first calendar for required fields
  const first = result.calendars[0];
  if (first) {
    assert(typeof first.id === "string" && first.id.length > 0, "Calendar should have an id");
    assert(typeof first.summary === "string" && first.summary.length > 0, "Calendar should have a summary/name");
  }

  console.log(`Successfully found ${result.calendars.length} calendars`);
  console.log("Response: ", result);
}

runTest().catch((error) => {
  console.error("Test failed:", error);
  if (error.response) {
    console.error("API response:", error.response.data);
    console.error("Status code:", error.response.status);
  }
  process.exit(1);
});
