import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    authenticated: false,
    accessLevel: null,
    id: null,
    login: null,

  }),
  //https://localhost:7277
  actions: {
    async authenticateUser(login, password) {
      try {
        const apiUrl = useRuntimeConfig().public.API_BASE_URL
        const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/auth/login`, {
          method: "POST",
          body: { login: login, password: password },
          credentials: "include",
        });

        if (status.value === "success") {
          this.authenticated = true;
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    },

    async whoami() {
      try {
        const apiUrl = useRuntimeConfig().public.API_BASE_URL
        const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/auth/whoami`, {
          method: "GET",
          credentials: "include",
        });

        if (status.value === "success" && data.value) {
          this.accessLevel = data.value.accessLevel;
          this.id = data.value.id;
          this.login = data.value.login;
          this.authenticated = true;
        } else {
          this.authenticated = false;
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    },

    async logUserOut() {
      const apiUrl = useRuntimeConfig().public.API_BASE_URL
      const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      this.authenticated = false;
    },
  },
});