import axios from "./axios";

export const getPendingLeaves = () => axios.get("/leaves/pending");
export const getProcessedLeaves = () => axios.get("/leaves/processed");
export const getTeacherStatistics = () => axios.get("/leaves/teacher-statistics");
export const approveLeave = (id) => axios.put(`/leaves/approve/${id}`);
export const rejectLeave = (id) => axios.put(`/leaves/reject/${id}`);
