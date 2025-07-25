import type { AxiosError } from "axios";
import axios from "axios";
import type {
  AuthParamsType,
  jiraAssignJiraTicketFunction,
  jiraAssignJiraTicketOutputType,
  jiraAssignJiraTicketParamsType,
} from "../../autogen/types.js";
import { getUserAccountIdFromEmail } from "./utils.js";

const assignJiraTicket: jiraAssignJiraTicketFunction = async ({
  params,
  authParams,
}: {
  params: jiraAssignJiraTicketParamsType;
  authParams: AuthParamsType;
}): Promise<jiraAssignJiraTicketOutputType> => {
  const { authToken, cloudId, baseUrl } = authParams;

  const apiUrl = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/`;

  if (!cloudId || !authToken) {
    throw new Error("Valid Cloud ID and auth token are required to assign Jira ticket");
  }

  try {
    let assigneeId: string | null = params.assignee;
    if (assigneeId && assigneeId.includes("@")) {
      assigneeId = await getUserAccountIdFromEmail(assigneeId, apiUrl, authToken);
    }

    if (!assigneeId) {
      throw new Error("Unable to get valid assignee account ID.");
    }

    await axios.put(
      `${apiUrl}issue/${params.issueId}/assignee`,
      { accountId: assigneeId },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    return {
      success: true,
      ticketUrl: `${baseUrl}/browse/${params.issueId}`,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Error assigning issue:", axiosError);
    return {
      success: false,
      error: axiosError.message,
    };
  }
};

export default assignJiraTicket;
