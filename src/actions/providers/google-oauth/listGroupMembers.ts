import type {
  AuthParamsType,
  googleOauthListGroupMembersFunction,
  googleOauthListGroupMembersOutputType,
  googleOauthListGroupMembersParamsType,
} from "../../autogen/types";
import { axiosClient } from "../../util/axiosClient";
import { MISSING_AUTH_TOKEN } from "../../util/missingAuthConstants";

type Member = { id: string; email: string; role: string; type: string };

const listGroupMembers: googleOauthListGroupMembersFunction = async ({
  params,
  authParams,
}: {
  params: googleOauthListGroupMembersParamsType;
  authParams: AuthParamsType;
}): Promise<googleOauthListGroupMembersOutputType> => {
  const { authToken } = authParams;
  const { groupKey } = params;
  if (!authToken) {
    return { success: false, members: [], error: MISSING_AUTH_TOKEN };
  }
  try {
    const response = await axiosClient.get(
      `https://admin.googleapis.com/admin/directory/v1/groups/${encodeURIComponent(groupKey)}/members`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );

    const members = (response.data.members || []).map(({ id, email, role, type }: Member) => ({
      id,
      email,
      role,
      type,
    }));
    return { success: true, members };
  } catch (error) {
    return {
      success: false,
      members: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export default listGroupMembers;
