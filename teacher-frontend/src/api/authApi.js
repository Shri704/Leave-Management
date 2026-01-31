import axios from "./axios";

export const login = (data) => axios.post("/auth/login", data);
export const signup = (data) => axios.post("/auth/signup", data);
