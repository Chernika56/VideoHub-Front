import { reactive } from 'vue'

export const authState = reactive({
    isAuthenticated: !!localStorage.getItem('auth'),
    login() {
        this.isAuthenticated = true;
        localStorage.setItem('auth', 'true');
    },
    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('auth');
    },
});
