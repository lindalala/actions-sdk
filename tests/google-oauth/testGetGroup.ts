import assert from "node:assert";
import { runAction } from "../../src/app";

async function runTests() {
  const result = await runAction(
    "getGroup",
    "googleOauth",
    { authToken: "dummy-token" },
    { groupKey: "group@example.com" } // Replace with real groupKey
  );
  assert(result, "Should return a result");
  assert(result.success, "Should be successful");
  assert(result.group, "Should return group object");
  if (result.success) {
    const { id, email, name, description } = result.group;
    assert(typeof id === "string" && id.length > 0, "Group should have a valid id");
    assert(typeof email === "string" && email.length > 0, "Group should have a valid email");
    assert(typeof name === "string" && name.length > 0, "Group should have a valid name");
    if (description !== undefined) {
      assert(typeof description === "string", "Group description should be a string if present");
    }
  }
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
