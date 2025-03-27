import {
  AuthParamsType,
  asanaCreateTaskFunction,
  asanaCreateTaskOutputType,
  asanaCreateTaskParamsType,
} from "../../autogen/types";
import { axiosClient } from "../../util/axiosClient";

const getWorkspaceIdFromProject = async (projectId: string, authToken: string): Promise<string | null> => {
  if (!projectId || !authToken) {
    console.error("Project ID and authToken are required");
    return null;
  }

  try {
    const response = await axiosClient.get(`https://app.asana.com/api/1.0/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    return response.data?.data?.workspace?.gid || null;
  } catch (error) {
    console.error("Error fetching workspace ID from project:", error);
    return null;
  }
};

const getTaskTemplates = async (authToken: string, projectId: string) => {
  const url = `https://app.asana.com/api/1.0/task_templates/?project=${projectId}`;
  try {
    const response = await axiosClient.get(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching Asana task templates:", error);
    return [];
  }
};

const getUserIdByEmail = async (authToken: string, workspaceId: string, email: string) => {
  const url = `https://app.asana.com/api/1.0/workspaces/${workspaceId}/users?email=${encodeURIComponent(email)}`;
  try {
    const response = await axiosClient.get(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data.data.length > 0 ? response.data.data[0].gid : null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
};

const createAsanaTask: asanaCreateTaskFunction = async ({
  params,
  authParams,
}: {
  params: asanaCreateTaskParamsType;
  authParams: AuthParamsType;
}): Promise<asanaCreateTaskOutputType> => {
  const { authToken } = authParams;
  const { name, projectId, description, customFields, taskTemplate, assignee, approvalStatus, dueAt } = params;

  if (!name || !authToken || !projectId) {
    return { success: false, error: "Task name, valid authToken, and workspaceId are required" };
  }

  const workspaceId = await getWorkspaceIdFromProject(projectId, authToken);
  if (!workspaceId) {
    return { success: false, error: "Project ID invalid" };
  }

  let assigneeId;
  if (assignee && assignee.includes("@")) {
    assigneeId = await getUserIdByEmail(authToken, workspaceId, assignee);
  } else {
    assigneeId = assignee;
  }

  let templateId: string | null = null;
  try {
    if (taskTemplate) {
      const templates = await getTaskTemplates(authToken, projectId);

      if (/^\d+$/.test(taskTemplate)) {
        // Numeric: try ID match
        if (templates.some((t: { gid: string }) => t.gid === taskTemplate)) {
          templateId = taskTemplate;
        }
      } else {
        // Try to find a template by name
        const taskTemplateStr = taskTemplate.trim().toLowerCase();
        const matchedTemplate = templates.find((t: { name: string }) => t.name.toLowerCase() === taskTemplateStr);
        if (matchedTemplate) {
          templateId = matchedTemplate.gid;
        }
      }

      if (!templateId) {
        return {
          success: false,
          error: `Task template '${taskTemplate}' not found. Available templates: ${templates.map((t: { name: string }) => t.name).join(", ")}`,
        };
      }
    }

    const response = await axiosClient.post(
      `https://app.asana.com/api/1.0/tasks`,
      {
        data: {
          name,
          projects: [projectId],
          ...(description && { notes: description }),
          ...(customFields && { custom_fields: customFields }),
          ...(templateId && { task_template: templateId }),
          ...(assigneeId && { assignee: assigneeId }),
          ...(approvalStatus && { approval_status: approvalStatus }),
          ...(dueAt && { due_at: dueAt }),
        },
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );

    return {
      success: true,
      taskUrl: `https://app.asana.com/0/${projectId}/${response.data.data.gid}`,
    };
  } catch (error) {
    console.error("Error creating Asana task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export default createAsanaTask;
