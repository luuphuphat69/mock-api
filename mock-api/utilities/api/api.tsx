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

export async function changePass(userid: string, currentPassword: string, newPassword: string) {
  try {
    const res = await api.post(`/change-password/${userid}`,
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

export async function getProjectByUserID(userId: string) {
  try {
    const res = await api.get(`/projects/user/${userId}`)
    return res.data;
  } catch (err: unknown) {
    throw err;
  }
}

export async function getProjectById(projectId: string){
    try {
    const res = await api.get(`/projects/${projectId}`)
    return res;
  } catch (err: unknown) {
    throw err;
  }
}

export async function getCollabProject(userid: string){
  try{
    const res = await api.get(`projects/collab/${userid}`);
    return res.data;
  }catch(err:unknown){
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

export async function deleteProjectByID(userid: string, id: string) {
  try {
    await api.delete(`/projects/${userid}/${id}`);
  } catch (err) {
    throw err;
  }
}

export async function patchProject(userid: string, id: string, payload: object) {
  try {
    await api.patch(`/projects/${userid}/${id}`, payload)
  } catch (err) {
    throw err
  }
}

export async function addResource(userid:string, projectId: string, payload: object) {
  try {
    const res = await api.post(`/resources/${userid}/${projectId}`, payload);
    return res;
  } catch (err) {
    throw err
  }
}

export async function getResourceByProjectId(userid: string, projectId: string) {
  try {
    const res = await api.get(`/resources/${userid}/${projectId}`)
    return res;
  } catch (err) {
    throw err
  }
}

export async function editResource(userid: string, projectId: string, id: string, payload: object) {
  try {
    const res = await api.patch(`/resources/${userid}/${projectId}/${id}`, payload)
    return res;
  } catch (err) {
    throw err
  }
}

export async function deleteResource(userid: string, projectId: string, id: string) {
  try {
    const res = await api.delete(`/resources/${userid}/${projectId}/${id}`)
    return res;
  } catch (err) {
    throw err
  }
}

export async function sendInvite(inviterId: string, projectId: string, payload: { users: object; project: IProject }) {
  try {
    const res = await api.post(`/members/send-invite/${inviterId}/${projectId}`, payload)
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getMembers(projectId: string){
  try{
    const res = await api.get(`/members/${projectId}`);
    return res;
  }catch(err){
    console.log(err);
    throw err;
  }
}

export async function removeMember(requesterid: string, userid: string, projectid: string){
  try{
    const res = await api.delete(`/members/${requesterid}/${userid}/${projectid}`);
    return res;
  }catch(err){
    console.log(err);
    throw err
  }
}

export async function updateMemberRole(requesterid: string, userid: string, projectid: string, role: string){
  try{
    const res = await api.patch(`/members/update-role/${requesterid}/${userid}/${projectid}`,
      {role: role.toLowerCase()}
    )
    return res;
  }catch(err){
    console.log(err);
    throw err
  }
}

export async function getLogs(projectId: string){
  try{
    const res = await api.get(`/logs/${projectId}`)
    return res;
  }catch(err){
    console.log(err);
    throw err;
  }
}

export async function clearLogs(requestid: string, projectId: string){
  try{
    const res = await api.delete(`/logs/${requestid}/${projectId}`)
    return res;
  }catch(err){
    console.log(err);
    throw err;
  }
}

export async function requestResetPassword(email: string){
  try{
    const res = await api.post(`/reset-password?email=${email}`)
    return res;
  }catch(err){
    console.log(err);
    throw err
  }
}

export async function getGeneralMetrics(projectId: string){
  try{
    const res = await api.get(`/metrics/general/${projectId}`)
    return res.data;
  }catch(err){
    console.log(err);
    throw err
  }
}

export async function getMethodMetrics(projectId: string, method: string){
  try{
    const res = await api.get(`/metrics/method/${projectId}?method=${method}`)
    return res.data;
  }catch(err){
    console.log(err);
    throw err
  }
}

export async function getMonthlyMetrics(projectId: string, month:number, year: number){
  try{
    const res = await api.get(`/metrics/monthly/${projectId}?month=${month}&year=${year}`)
    return res.data;
  }catch(err){
    console.log(err);
    throw err
  }
}

export async function getMockLogs (projectId: string, params?: string | MockLogsQueryParams){
  try{
    const res = typeof params === "string"
      ? await api.get(`/mock-logs/project/${projectId}?${params}`)
      : await api.get(`/mock-logs/project/${projectId}`, { params })
    return res.data;
  }catch(err){
    console.log(err);
    throw err
  }
}

export async function getMockLogsByMethod (projectId: string, params?: string | MockLogsQueryParams){
  try{
    const res = typeof params === "string"
      ? await api.get(`/mock-logs/method/${projectId}?${params}`)
      : await api.get(`/mock-logs/method/${projectId}`, { params })
    return res.data;
  }catch(err){
    console.log(err);
    throw err
  }
}

export async function renewKey(requestId: string, projectId: string){
    try{
    const res = await api.patch(`/projects/key/renew/${requestId}/${projectId}`)
    return res;
  }catch(err){
    console.log(err);
    throw err
  }
}
