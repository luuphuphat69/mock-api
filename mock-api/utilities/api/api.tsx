import axios from "axios";

const api = axios.create({
  baseURL: "https://api.mockapi.io.vn/api",
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

export async function deleteProjectByID(id: string) {
  try {
    await api.delete(`/projects/${id}`);
  } catch (err) {
    throw err;
  }
}

export async function patchProject(id: string, payload: {}) {
  try {
    await api.patch(`$/project/${id}`, payload)
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

export async function addResource(projectId: string, payload: {}) {
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

export async function editResource(id: string, payload: {}) {
  try {
    const res = await api.patch(`/resources/${id}`, payload)
    return res;
  } catch (err) {
    throw err
  }
}

export async function deleteResource(id: string) {
  try {
    const res = await api.delete(`/resources/${id}`)
    return res;
  } catch (err) {
    throw err
  }
}