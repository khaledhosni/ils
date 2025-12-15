// src/api/endpoints.js

const BASE_URL = "https://api.example.com";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: BASE_URL + "/auth/login",
    REGISTER: BASE_URL + "/auth/register",
    PROFILE: BASE_URL + "/auth/profile",
  },

  USERS: {
    GET_ALL: BASE_URL + "/users",
    GET_BY_ID: (id) => BASE_URL + "/users/" + id,
    CREATE: BASE_URL + "/users",
    UPDATE: (id) => BASE_URL + "/users/" + id,
    DELETE: (id) => BASE_URL + "/users/" + id,
  },

  CUSTOMERS: {
    GET_ALL: BASE_URL + "/customers",
    GET_BY_ID: (id) => BASE_URL + "/customers/" + id,
  },
};
