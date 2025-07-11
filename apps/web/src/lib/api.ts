import ky, { type KyInstance } from "ky";

// TODO: eventually need to introduce an API gateway to hit both the Node + Go servers
const API_BASE_URL = "http://localhost:8080/api"; // 8080 = go server

// TODO: generate this from the OpenAPI spec
class ApiClient {
  kyInstance: KyInstance;

  constructor() {
    this.kyInstance = ky.create({
      prefixUrl: API_BASE_URL,
      credentials: "include", // Always include cookies
      retry: {
        limit: 0,
      },
      hooks: {
        afterResponse: [
          (_request, _options, response) => {
            if (response.status === 401) {
              // TODO: redirect to `/login`
              // eslint-disable-next-line no-console -- debugging
              console.log("401");
            }
          },
        ],
      },
      // headers: {
      //   "Content-Type": "application/json",
      // },
    });
  }
}

export const apiClient = new ApiClient();
