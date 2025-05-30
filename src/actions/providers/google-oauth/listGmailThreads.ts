import { axiosClient } from "../../util/axiosClient";
import type {
  AuthParamsType,
  googleOauthListGmailThreadsFunction,
  googleOauthListGmailThreadsOutputType,
  googleOauthListGmailThreadsParamsType,
} from "../../autogen/types";
import { MISSING_AUTH_TOKEN } from "../../util/missingAuthConstants";

const listGmailThreads: googleOauthListGmailThreadsFunction = async ({
  params,
  authParams,
}: {
  params: googleOauthListGmailThreadsParamsType;
  authParams: AuthParamsType;
}): Promise<googleOauthListGmailThreadsOutputType> => {
  if (!authParams.authToken) {
    return { success: false, error: MISSING_AUTH_TOKEN, threads: [] };
  }

  const { query, pageToken, maxResults } = params;

  const url =
    `https://gmail.googleapis.com/gmail/v1/users/me/threads?q=${encodeURIComponent(query)}` +
    (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "") +
    (maxResults ? `&maxResults=${maxResults}` : "");

  try {
    const listRes = await axiosClient.get(url, {
      headers: {
        Authorization: `Bearer ${authParams.authToken}`,
      },
    });

    const { threads: threadList = [], nextPageToken = "", resultSizeEstimate = 0 } = listRes.data;

    const threads = !Array.isArray(threadList)
      ? []
      : await Promise.all(
          threadList.map(async thread => {
            try {
              const threadRes = await axiosClient.get(
                `https://gmail.googleapis.com/gmail/v1/users/me/threads/${thread.id}?format=full`,
                {
                  headers: {
                    Authorization: `Bearer ${authParams.authToken}`,
                  },
                },
              );
              const { id, historyId, messages } = threadRes.data;
              return {
                id,
                historyId,
                messages: Array.isArray(messages)
                  ? messages.map(msg => {
                      const { id, threadId, snippet, labelIds, internalDate, payload } = msg;
                      return {
                        id,
                        threadId,
                        snippet,
                        labelIds,
                        internalDate,
                        payload,
                      };
                    })
                  : [],
              };
            } catch (err) {
              return {
                id: thread.id,
                snippet: "",
                historyId: "",
                messages: [],
                error: err instanceof Error ? err.message : "Failed to fetch thread details",
              };
            }
          }),
        );

    // Collect any per-thread errors
    const threadErrors = threads
      .filter(t => "error" in t && typeof t.error === "string")
      .map(t => t.error)
      .join("; ");

    return {
      success: threadErrors.length === 0,
      threads,
      nextPageToken,
      resultSizeEstimate,
      error: threadErrors,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unknown error listing Gmail threads",
      threads: [],
    };
  }
};

export default listGmailThreads;
