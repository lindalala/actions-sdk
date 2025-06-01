import assert from "node:assert";
import { runAction } from "../../src/app";

async function runTests() {
  const result = await runAction(
    "listGroupMembers",
    "googleOauth",
    { authToken: "dummy-token" },
    { groupKey: "group@example.com" } // Replace with real groupKey
  );
  assert(result, "Should return a result");
  assert(result.success, "Should be successful");
  assert(Array.isArray(result.members), "Should return members array");
  if (result.members.length > 0) {
    const { id, email, role, type } = result.members[0];
    assert(typeof id === "string" && id.length > 0, "Member should have a valid id");
    assert(typeof email === "string" && email.length > 0, "Member should have a valid email");
    assert(typeof role === "string" && role.length > 0, "Member should have a valid role");
    assert(typeof type === "string" && type.length > 0, "Member should have a valid type");
  }
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
