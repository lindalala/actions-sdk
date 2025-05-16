import assert from "node:assert";
import { runAction } from "../../src/app";

async function runTest() {
  const result = await runAction(
    "searchTasks", 
    "asana",
    //{ authToken: "replace-me-with-auth-token" }, 
    {authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDc1NTc4NjgsInNjb3BlIjoiZGVmYXVsdCBpZGVudGl0eSIsInN1YiI6MTIwOTgwNTcyMzk5MjA3OCwicmVmcmVzaF90b2tlbiI6MTIxMDI4MzE4MDI3ODEwOSwidmVyc2lvbiI6MiwiYXBwIjoxMjA5ODA3Njg4MDk4MDI5LCJleHAiOjE3NDc1NjE0Njh9.Jn-_bvdAchGt6LZ97YZT-OHBDSqgiaANBc4Ks_Ab1p8"},
    {
      query: "searchQuery", 
    },
  );
  assert(result, "Response should not be null");
  assert(result.success, "Success should be true");
  assert(Array.isArray(result.results), "Matches should be an array");

  console.log(`Found ${result.results.length} matching tasks:`);
  for (const match of result.results) {
    console.log(`- ${match.name} (ID: ${match.id}) in Workspace ${match.workspaceId}`);
  }
}

runTest().catch((error) => {
  console.error("Test failed:", error);
  if (error.response) {
    console.error("API response:", error.response.data);
    console.error("Status code:", error.response.status);
  }
  process.exit(1);
});