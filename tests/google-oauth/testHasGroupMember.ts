import assert from "node:assert";
import { runAction } from "../../src/app";

async function runTests() {
  const result = await runAction(
    "hasGroupMember",
    "googleOauth",
    { authToken: "dummy-token" },
    { groupKey: "group@example.com", memberKey: "user@example.com" } // Replace with real keys
  );
  assert(result, "Should return a result");
  assert(result.success, "Should be sucessful");
  assert(typeof result.isMember === "boolean", "Should have isMember boolean");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
