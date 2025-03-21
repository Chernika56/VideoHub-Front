import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    authenticated: false,
  }),
  actions: {
    async authenticateUser(login, password) {
      try {
        const {data} = await useFetch("/api/auth", {
          method: "POST",
          body: { login: login, password: password},
        });

        if (data.value.session) {
          const token = useCookie("token", { sameSite: "lax" });
          token.value = data.session; 
          this.authenticated = true;
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    },

    logUserOut() {
      const token = useCookie("token", { sameSite: "lax" });
      this.authenticated = false;
      token.value = null;
    },
  },
});
