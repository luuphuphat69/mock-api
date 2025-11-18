import axios from "axios";
axios.defaults.withCredentials = true;

//const localURL = "http://localhost:8000/api";
const localURL = "https://mock-api-server-sy5n.onrender.com/api"
export async function register(registerPayload: IRegisterPayload) {
  try {
    const res = await axios.post(`${localURL}/register`, registerPayload);
    return res.data;
  } catch (error: any) {
    console.error("Register error:", error.response?.data || error.message);
    throw error;
  }
}

export async function login(loginPayload: ILoginPayload) {
  try {
    const res = await axios.post(`${localURL}/login`, loginPayload);
    return res.data;
  } catch (error: any) {
    throw error;
  }
}

export async function logout() {
  try {
    await axios.post(`${localURL}/logout`);
  } catch (error: any) {
    console.error("Logout error:", error.response?.data || error.message);
    throw error;
  }
}

export async function me() {
  try {
    const res = await axios.get(`${localURL}/me`)
    return res
  } catch (err: unknown) {
    throw err
  }
}

export async function getProjectByUserID(userId: string) {
  try {
    const res = await axios.get(`${localURL}/projects/${userId}`)
    return res.data;
  } catch (err: unknown) {
    throw err;
  }
}

export async function addNewProject(payload: {}) {
  try {
    const res = await axios.post(`${localURL}/projects`, payload)
    return res;
  } catch (err) {
    throw err
  }
}

export async function deleteProjectByID(id: string) {
  try {
    await axios.delete(`${localURL}/projects/${id}`);
  } catch (err) {
    throw err;
  }
}

export async function patchProject(id: string, payload: {}) {
  try {
    await axios.patch(`${localURL}/project/${id}`, payload)
  } catch (err) {
    throw err
  }
}

export async function getKey(id: string) {
  try {
    const res = await axios.get(`${localURL}/project/key/${id}`)
    return res.data;
  } catch (err) {
    throw err
  }
}

export async function addResource(projectId: string, payload: {}) {
  try {
    const res = await axios.post(`${localURL}/resources/${projectId}`, payload);
    return res;
  } catch (err) {
    throw err
  }
}

export async function getResourceByProjectId(projectId: string) {
  try {
    const res = await axios.get(`${localURL}/resources/${projectId}`)
    return res;
  } catch (err) {
    throw err
  }
}

export async function editResource(id: string, payload: {}) {
  try {
    const res = await axios.patch(`${localURL}/resources/${id}`, payload)
    return res;
  } catch (err) {
    throw err
  }
}

export async function deleteResource(id: string) {
  try {
    const res = await axios.delete(`${localURL}/resources/${id}`)
    return res;
  } catch (err) {
    throw err
  }
}