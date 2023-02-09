import axios from "axios";

const URL = process.env.REACT_APP_BACKEND_V1 || "http://localhost:3000/api/v1";

//global axois configurations
const Axios = axios.create();

Axios.defaults.baseURL = URL;
Axios.defaults.headers.common["Content-Type"] = "application/json";
// Axios.defaults.headers.common.Authorization = `Bearer ${process.env.REACT_APP_ACCESS_TOKEN}`;
// Axios.defaults.headers.common["X-APP-KEY"] = `${process.env.REACT_APP_APP_KEY}`;

Axios.interceptors.response.use(
    (response) => response,
    (error) =>
        Promise.reject(
            (error.response && error.response) ||
                "Something went wrong with API"
        )
);

export default Axios;
