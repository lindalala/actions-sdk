import assert from "node:assert";
import { runAction } from "../../src/app";

async function runTests() {
  const result = await runAction(
    "listGroups",
    "googleOauth",
    { authToken: "dummy-token" }, // Replace with valid token for real test
    {}
  );

  assert(result, "Should return a result");
  assert(result.success, "Should have success boolean");
  assert(Array.isArray(result.groups), "Should return groups array");
  if (result.groups.length > 0) {
    const { id, email, name, description } = result.groups[0];
    assert(typeof id === "string" && id.length > 0, "Group should have a valid id");
    assert(typeof email === "string" && email.length > 0, "Group should have a valid email");
    assert(typeof name === "string" && name.length > 0, "Group should have a valid name");
    if (description !== undefined) {
      assert(typeof description === "string", "Group description should be a string if present");
    }
  }
  console.log(result);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
