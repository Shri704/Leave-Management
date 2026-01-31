import axios from "./axios";

export const getHolidays = () => axios.get("/holidays");
