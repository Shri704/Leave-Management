import axios from "./axios";

export const applyLeave = (data) => axios.post("/leaves", data);
export const getMyLeaves = () => axios.get("/leaves/my-leaves");
export const getLeaveStatistics = () => axios.get("/leaves/statistics");
