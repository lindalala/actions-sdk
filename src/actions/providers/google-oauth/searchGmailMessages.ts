import { axiosClient } from "../../util/axiosClient";
import type {
  AuthParamsType,
  googleOauthSearchGmailMessagesFunction,
  googleOauthSearchGmailMessagesOutputType,
  googleOauthSearchGmailMessagesParamsType,
} from "../../autogen/types";
import { MISSING_AUTH_TOKEN } from "../../util/missingAuthConstants";

const searchGmailMessages: googleOauthSearchGmailMessagesFunction = async ({
  params,
  authParams,
}: {
  params: googleOauthSearchGmailMessagesParamsType;
  authParams: AuthParamsType;
}): Promise<googleOauthSearchGmailMessagesOutputType> => {
  if (!authParams.authToken) {
    return { success: false, error: MISSING_AUTH_TOKEN, messages: [] };
  }

  const { query, pageToken, maxResults } = params;

  const url =
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}` +
    (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "") +
    (maxResults ? `&maxResults=${maxResults}` : "");

  try {
    const listRes = await axiosClient.get(url, {
      headers: {
        Authorization: `Bearer ${authParams.authToken}`,
      },
    });

    const { messages: messageList = [], nextPageToken = "", resultSizeEstimate = 0 } = listRes.data;

    const messages = !Array.isArray(messageList)
      ? []
      : await Promise.all(
          messageList.map(async msg => {
            try {
              const msgRes = await axiosClient.get(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
                {
                  headers: {
                    Authorization: `Bearer ${authParams.authToken}`,
                  },
                },
              );
              const { id, threadId, snippet, labelIds, internalDate, payload } = msgRes.data;
              return {
                id,
                threadId,
                snippet,
                labelIds,
                internalDate,
                payload,
              };
            } catch (err) {
              // Return a minimal error object when something goes wrong fetching message details
              return {
                id: msg.id,
                threadId: "",
                snippet: "",
                labelIds: [],
                internalDate: "",
                payload: {},
                error: err instanceof Error ? err.message : "Failed to fetch message details",
              };
            }
          }),
        );

    // Collect any per-message errors
    const messageErrors = messages
      .filter(m => "error" in m && typeof m.error === "string")
      .map(m => (m as { error: string }).error)
      .join("; ");

    return {
      success: messageErrors.length === 0,
      messages,
      nextPageToken,
      resultSizeEstimate,
      error: messageErrors,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error searching Gmail",
      messages: [],
    };
  }
};

export default searchGmailMessages;
