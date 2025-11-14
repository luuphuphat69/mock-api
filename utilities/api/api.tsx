import axios from "axios";
axios.defaults.withCredentials = true;

const localURL = "http://localhost:8000/api";

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
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
}

export async function logout() {
  try {
    await axios.post(`${localURL}/logout`, {});
  } catch (error: any) {
    console.error("Logout error:", error.response?.data || error.message);
    throw error;
  }
}