import axios from "axios";
const api = axios.create({
  baseURL: "https://api.mockapi.io.vn/api",
  //baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

export async function register(registerPayload: IRegisterPayload) {
  try {
    const res = await api.post("/register", registerPayload);
    return res.data;
  } catch (error: any) {
    console.error("Register error:", error.response?.data || error.message);
    throw error;
  }
}

export async function login(loginPayload: ILoginPayload) {
  try {
    const res = await api.post('/login', loginPayload);
    return res.data;
  } catch (error: any) {
    throw error;
  }
}

export async function logout() {
  try {
    await api.post('/logout');
  } catch (error: any) {
    console.error("Logout error:", error.response?.data || error.message);
    throw error;
  }
}

export async function me() {
  try {
    const res = await api.get('/me')
    return res
  } catch (err: any) {
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

export async function addNewProject(payload: {}) {
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

export async function patchProject(userid: string, id: string, payload: {}) {
  try {
    await api.patch(`/projects/${userid}/${id}`, payload)
  } catch (err) {
    throw err
  }
}

export async function getKey(id: string) {
  try {
    const res = await api.get(`/project/key/${id}`)
    return res.data;
  } catch (err) {
    throw err
  }
}

export async function addResource(userid:string, projectId: string, payload: {}) {
  try {
    const res = await api.post(`/resources/${userid}/${projectId}`, payload);
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

export async function editResource(userid: string, projectId: string, id: string, payload: {}) {
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

export async function sendInvite(payload: { users: {}; project: IProject }) {
  try {
    const res = await axios.post(
      "https://6q3ponujge.execute-api.us-east-1.amazonaws.com/default/send-invite",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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

export async function removeMember(userid: string, projectid: string){
  try{
    const res = await api.delete(`/members/${userid}/${projectid}`);
    return res;
  }catch(err){
    console.log(err);
    throw err
  }
}