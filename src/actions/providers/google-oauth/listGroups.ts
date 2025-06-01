import type {
  AuthParamsType,
  googleOauthListGroupsFunction,
  googleOauthListGroupsOutputType,
  googleOauthListGroupsParamsType,
} from "../../autogen/types";
import { axiosClient } from "../../util/axiosClient";
import { MISSING_AUTH_TOKEN } from "../../util/missingAuthConstants";

interface GoogleGroup {
  id: string;
  email: string;
  name: string;
  description?: string;
  [key: string]: unknown;
}

interface GoogleGroupsResponse {
  groups?: GoogleGroup[];
  [key: string]: unknown;
}

const listGroups: googleOauthListGroupsFunction = async ({
  authParams,
}: {
  params: googleOauthListGroupsParamsType;
  authParams: AuthParamsType;
}): Promise<googleOauthListGroupsOutputType> => {
  const { authToken } = authParams;
  if (!authToken) {
    return { success: false, groups: [], error: MISSING_AUTH_TOKEN };
  }
  try {
    const response = await axiosClient.get(
      "https://admin.googleapis.com/admin/directory/v1/groups?customer=my_customer",
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );

    const groups = ((response.data as GoogleGroupsResponse).groups || []).map(
      ({ id, email, name, description }: GoogleGroup) => ({
        id,
        email,
        name,
        description,
      }),
    );
    return { success: true, groups };
  } catch (error) {
    return {
      success: false,
      groups: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export default listGroups;
