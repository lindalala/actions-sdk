import { WebClient } from "@slack/web-api";
import type {
  AuthParamsType,
  slackCreateChannelFunction,
  slackCreateChannelParamsType,
  slackCreateChannelOutputType,
} from "../../autogen/types";
import { MISSING_AUTH_TOKEN } from "../../util/missingAuthConstants";

const createChannel: slackCreateChannelFunction = async ({
  params,
  authParams,
}: {
  params: slackCreateChannelParamsType;
  authParams: AuthParamsType;
}): Promise<slackCreateChannelOutputType> => {
  if (!authParams.authToken) {
    throw new Error(MISSING_AUTH_TOKEN);
  }

  try {
    const client = new WebClient(authParams.authToken);
    const { channelName, isPrivate } = params;
    const result = await client.conversations.create({
      name: channelName,
      is_private: isPrivate ?? false,
    });

    if (!result.ok || !result.channel || !result.channel.id) {
      return {
        success: false,
        error: result.error || "Unknown error creating channel",
      };
    }

    const channelId = result.channel.id;
    const channelUrl = `https://slack.com/app_redirect?channel=${channelId}`;

    return {
      success: true,
      channelId,
      channelUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error creating channel",
    };
  }
};

export default createChannel;
