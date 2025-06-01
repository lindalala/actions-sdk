import assert from "node:assert";
import { runAction } from "../../src/app";

async function runTests() {
  const result = await runAction(
    "addGroupMember",
    "googleOauth",
    { authToken: "dummy-token" },
    { groupKey: "group@example.com", email: "user@example.com", role: "MEMBER" } // Replace with real values
  );
  assert(result, "Should return a result");
  assert(result.success, "Should have success boolean");
  assert(typeof result.memberID === "string" && result.memberID.length > 0, "Should have memberID string");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
