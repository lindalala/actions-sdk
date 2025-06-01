import assert from "node:assert";
import { runAction } from "../../src/app";

async function runTests() {
  const result = await runAction(
    "deleteGroupMember",
    "googleOauth",
    { authToken: "dummy-token" },
    { groupKey: "group@example.com", memberKey: "user@example.com" } // Replace with real values
  );
  assert(result, "Should return a result");
  assert(result.success, "Should be successful");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
