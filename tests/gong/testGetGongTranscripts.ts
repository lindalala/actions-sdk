import assert from "node:assert";
import { runAction } from "../../src/app";
import dotenv from "dotenv";

dotenv.config();

async function runTest() {
  const result = await runAction(
    "getGongTranscripts",
    "gong",
    {
      authToken: process.env.GONG_TOKEN!,
      username: process.env.GONG_USERNAME!,
    },
    {
      userRole: "Chief of Staff",
      trackers: ["Value Prop"],
      startDate: "2025-05-01T00:00:00Z",
      endDate: "2025-05-13T23:59:59Z"
    }
  );

  // Validate response
  assert(result, "Response should not be null");
  assert(result.success, "Response should indicate success");
  assert(Array.isArray(result.callTranscripts), "Response should contain callTranscripts array");
  
  if (result.callTranscripts.length > 0) {
    const firstTranscript = result.callTranscripts[0];
    assert(firstTranscript.callId, "Transcript should have a callId");
    assert(firstTranscript.callName, "Transcript should have a callName");
    assert(firstTranscript, "Transcript should have transcript data");
    assert(firstTranscript.transcript[0].speakerName, "Transcript should have speaker names");
    assert(Array.isArray(firstTranscript.transcript[0].sentences), "Transcript should have sentences array");
  }

  console.log("Test passed successfully!");
}

async function runTestInvalidUsername() {
  const result = await runAction(
    "getGongTranscripts",
    "gong",
    {
      authToken: process.env.GONG_TOKEN!,
      username: process.env.BAD_GONG_USERNAME!,
    },
    {
      userRole: "Chief of Staff",
      trackers: ["Value Prop"],
      startDate: "2025-05-01T00:00:00Z",
      endDate: "2025-05-08T23:59:59Z"
    }
  );

  // Validate response
  assert(result.error, "Response should indicate an error");
  assert(result.error === "User email not found in Gong users", "Error message should indicate user not found");

  console.log("Test passed successfully!");
}

runTest().catch((error) => {
  console.error("Test failed:", error);
  if (error.response) {
    console.error("API response:", error.response.data);
    console.error("Status code:", error.response.status);
  }
  process.exit(1);
}); 

runTestInvalidUsername().catch((error) => {
  console.error("Test failed:", error);
  if (error.response) {
    console.error("API response:", error.response.data);
    console.error("Status code:", error.response.status);
  }
  process.exit(1);
});
