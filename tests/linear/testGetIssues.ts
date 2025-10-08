import assert from "node:assert";
import dotenv from "dotenv";
import { runAction } from "../../src/app.js";

dotenv.config();

async function runTest() {
  const result = await runAction(
    "getIssues",
    "linear",
    { authToken: process.env.LINEAR_AUTH_TOKEN! },
    { query: "500", maxResults: 25 }
  );

  assert(result.success, result.error || "getIssues did not succeed");
  assert(Array.isArray(result.results), "Issues should be an array");
  assert(result.results.length > 0, "Should return at least one issue");

  const firstIssue = result.results[0];
  assert(firstIssue.contents.id, "Issue should have an id");
  assert(firstIssue.name, "Issue should have a title");
  assert(
    Array.isArray(firstIssue.contents.labels),
    "Issue should have labels array"
  );
  assert(
    typeof firstIssue.contents.state === "string",
    "Issue should have a state"
  );
  assert(typeof firstIssue.url === "string", "Issue should have a url");
  assert(
    Array.isArray(firstIssue.contents.comments),
    "Issue should have comments array"
  );

  console.log("Response: ", JSON.stringify(result, null, 2));
}

runTest().catch((error) => {
  console.error("Test failed:", error);
  if (error.response) {
    console.error("API response:", error.response.data);
    console.error("Status code:", error.response.status);
  }
  process.exit(1);
});
