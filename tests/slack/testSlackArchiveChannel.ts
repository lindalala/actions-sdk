import assert from "node:assert";
import { runAction } from "../../src/app";
import dotenv from "dotenv";

dotenv.config();

async function runTest() {
  const result = await runAction(
    "archiveChannel",
    "slack",
    { authToken: process.env.SLACK_BOT_TOKEN },
    { channelId: process.env.SLACK_CHANNEL_ID },
  );

  console.log(
    "Response: " + JSON.stringify(result, null, 2),
  );

  assert(result, "Response should not be null");
  assert(result.success, "Channel archiving should be successful");
}

runTest().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
