import assert from "node:assert";
import { runAction } from "../../src/app.js";
import dotenv from "dotenv";

dotenv.config();

async function runTest() {
  const authToken = process.env.GITHUB_ACCESS_TOKEN;

  const result = await runAction(
    "searchRepository",
    "github",
    {
      authToken,
    },
    {
      organization: "Credal-ai",
      repository: "app",
      query: "test",
    }
  );

  console.log("Result:", JSON.stringify(result, null, 2));

  // Validate response structure
  assert(result, "Response should not be null");
  assert.strictEqual(result.success, true, "Success should be true");
  assert(Array.isArray(result.results), "Results should be an array");

  // Validate first result structure if results exist
  if (result.results.length > 0) {
    const firstResult = result.results[0];
    assert(firstResult.name && typeof firstResult.name === "string", "First result should have a name (string)");
    assert(firstResult.url && typeof firstResult.url === "string", "First result should have a url (string)");
    assert(firstResult.contents && typeof firstResult.contents === "object", "First result should have contents (object)");

    // Validate contents has reasonable fields
    const contents = firstResult.contents;
    assert(
      contents.path || contents.repository || contents.sha,
      "Contents should have at least one reasonable field (path, repository, or sha)"
    );
  }

  console.log("All tests passed!");
}

runTest().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
