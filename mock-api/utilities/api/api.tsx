import axios from "axios";
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

function getErrorDetail(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data || error.message;
  }

  return error;
}

export interface MockLogsQueryParams {
  _page?: number | string;
  _limit?: number | string;
  _from?: string;
  _to?: string;
  method?: string;
  success?: boolean | string;
  succes?: boolean | string;
  _order?: "asc" | "desc";
  order?: "asc" | "desc";
  sort?: "asc" | "desc";
  _sort?: "asc" | "desc";
}

export type ClearMockLogsPeriod = 7 | 30 | 90 | "all";

export async function register(registerPayload: IRegisterPayload) {
  try {
    const res = await api.post("/register", registerPayload);
    return res.data;
  } catch (error: unknown) {
    console.error("Register error:", getErrorDetail(error));
    throw error;
  }
}

export async function login(loginPayload: ILoginPayload) {
  try {
    const res = await api.post('/login', loginPayload, {
      withCredentials: true
    });
    return res;
  } catch (error: unknown) {
    throw error;
  }
}

export async function logout() {
  try {
    await api.post('/logout');
  } catch (error: unknown) {
    console.error("Logout error:", getErrorDetail(error));
    throw error;
  }
}

export async function changePass(currentPassword: string, newPassword: string) {
  try {
    const res = await api.post(`/change-password`,
      {
        currentPassword: currentPassword,
        newPassword: newPassword
      });
    return res;
  } catch (err) {
    console.log(err);
    throw err
  }
}

export async function me() {
  try {
    const res = await api.get('/me')
    return res
  } catch (err: unknown) {
    throw err
  }
}

export async function searchUser(query: string) {
  try {
    const res = await api.get('/user/search', { params: { user: query } });
    return res.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function updateUser(payload: object) {
  try {
    const res = await api.patch(`/user/update`, payload);
    return res.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function getProjectByUserID() {
  try {
    const res = await api.get(`/projects/user`)
    return res.data;
  } catch (err: unknown) {
    throw err;
  }
}

export async function getProjectById(projectId: string) {
  try {
    const res = await api.get(`/projects/${projectId}`)
    return res;
  } catch (err: unknown) {
    throw err;
  }
}

export async function getCollabProject() {
  try {
    const res = await api.get(`projects/collab`);
    return res.data;
  } catch (err: unknown) {
    console.log(err);
    throw err;
  }
}

export async function addNewProject(payload: object) {
  try {
    const res = await api.post('/projects', payload)
    return res;
  } catch (err) {
    throw err
  }
}

export async function deleteProjectByID(id: string) {
  try {
    await api.delete(`/projects/${id}`);
  } catch (err) {
    throw err;
  }
}

export async function patchProject(id: string, payload: object) {
  try {
    await api.patch(`/projects/${id}`, payload)
  } catch (err) {
    throw err
  }
}

export async function updateProjectVisibility(projectId: string, payload: object) {
  try {
    await api.patch(`/projects/set-visibility/${projectId}`, payload)
  } catch (err) {
    throw err
  }
}

export async function searchProject(query: string) {
  try {
    const res = await api.get(`/projects/search?project=${query}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function addResource(projectId: string, payload: object) {
  try {
    const res = await api.post(`/resources/${projectId}`, payload);
    return res;
  } catch (err) {
    throw err
  }
}

export async function getResourceByProjectId(projectId: string) {
  try {
    const res = await api.get(`/resources/${projectId}`)
    return res;
  } catch (err) {
    throw err
  }
}

export async function editResource(projectId: string, id: string, payload: object) {
  try {
    const res = await api.patch(`/resources/${projectId}/${id}`, payload)
    return res;
  } catch (err) {
    throw err
  }
}

export async function deleteResource(projectId: string, id: string) {
  try {
    const res = await api.delete(`/resources/${projectId}/${id}`)
    return res;
  } catch (err) {
    throw err
  }
}

export async function sendInvite(projectId: string, payload: { users: object; project: IProject }) {
  try {
    const res = await api.post(`/members/send-invite/${projectId}`, payload)
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function joinProject(projectId: string, payload: {accessKey: string}){
  try{
    const res = await api.post(`members/join-in/${projectId}`, payload)
    return res.data;
  }catch(err){
    console.error(err);
    throw err;
  }
}

export async function getMembers(projectId: string) {
  try {
    const res = await api.get(`/members/${projectId}`);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function leaveProject(projectId: string) {
  try {
    const res = await api.delete(`/members/leave/${projectId}`);
    return res;
  } catch (err) {
    console.log(err);
    throw err
  }
}

export async function removeMember(userid: string, projectid: string) {
  try {
    const res = await api.delete(`/members/${userid}/${projectid}`);
    return res;
  } catch (err) {
    console.log(err);
    throw err
  }
}

export async function updateMemberRole(userid: string, projectid: string, role: string) {
  try {
    const res = await api.patch(`/members/update-role/${userid}/${projectid}`,
      { role: role.toLowerCase() }
    )
    return res;
  } catch (err) {
    console.log(err);
    throw err
  }
}

export async function getLogs(projectId: string) {
  try {
    const res = await api.get(`/logs/${projectId}`)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function clearLogs(projectId: string) {
  try {
    const res = await api.delete(`/logs/${projectId}`)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function requestResetPassword(email: string) {
  try {
    const res = await api.post(`/reset-password?email=${email}`)
    return res;
  } catch (err) {
    console.log(err);
    throw err
  }
}

export async function getGeneralMetrics(projectId: string) {
  try {
    const res = await api.get(`/metrics/general/${projectId}`)
    return res.data;
  } catch (err) {
    console.log(err);
    throw err
  }
}

export async function getMethodMetrics(projectId: string, method: string) {
  try {
    const res = await api.get(`/metrics/method/${projectId}?method=${method}`)
    return res.data;
  } catch (err) {
    console.log(err);
    throw err
  }
}

export async function getMonthlyMetrics(projectId: string, month: number, year: number) {
  try {
    const res = await api.get(`/metrics/monthly/${projectId}?month=${month}&year=${year}`)
    return res.data;
  } catch (err) {
    console.log(err);
    throw err
  }
}

export async function getMockLogs(projectId: string, params?: string | MockLogsQueryParams) {
  try {
    const res = typeof params === "string"
      ? await api.get(`/mock-logs/project/${projectId}?${params}`)
      : await api.get(`/mock-logs/project/${projectId}`, { params })
    return res.data;
  } catch (err) {
    console.log(err);
    throw err
  }
}

export async function getMockLogsByMethod(projectId: string, params?: string | MockLogsQueryParams) {
  try {
    const res = typeof params === "string"
      ? await api.get(`/mock-logs/method/${projectId}?${params}`)
      : await api.get(`/mock-logs/method/${projectId}`, { params })
    return res.data;
  } catch (err) {
    console.log(err);
    throw err
  }
}

export async function clearMockLogs(projectId: string, period: ClearMockLogsPeriod) {
  try {
    const res = await api.delete(`/mock-logs/clear/${projectId}/${period}`)
    return res.data;
  } catch (err) {
    console.log(err);
    throw err
  }
}

export async function renewKey(projectId: string, type: string) {
  try {
    const res = await api.patch(`/projects/renew-keys/${projectId}?type=${type}`)
    return res.data;
  } catch (err) {
    console.log(err);
    throw err
  }
}

export async function getProjectNotify(projectId: string) {
  try {
    const res = await api.get(`/project-notify/${projectId}`)
    return res.data;
  } catch (err) {
    console.log(err);
    throw err
  }
}

export async function clearProjectNotify(
  projectId: string,
  params?: {
    code?: string;
    type?: string;
    notifyId?: string;
    id?: string;
  }
) {
  try {
    const res = await api.delete(`/project-notify/${projectId}`, { params })
    return res.data;
  } catch (err) {
    console.log(err);
    throw err
  }
}
