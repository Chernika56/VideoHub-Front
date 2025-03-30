<script setup>
import { useAsyncData } from '#app';

definePageMeta({
    title: 'Авторизация',
    layout: 'auth',
})

const authStore = useAuthStore();

onMounted(async () => {
  await authStore.whoami();
  console.log("whoami выполнен");
});

if (authStore.authenticated) {
    navigateTo('/')
}

const isLogin = ref(true);
const login = ref('');
const password = ref('');
const confirmPassword = ref('');
const router = useRouter();

const forgotPassword = () => {
    // забыли пароль
};

const handleSubmit = async () => {
    try {
        await authStore.authenticateUser(login.value, password.value)

        if (authStore.authenticated) {
            navigateTo('/')
        } else {
            alert('Ошибка входа: Проверьте логин и пароль.');
        }

    } catch (error) {
        alert('Ошибка входа.');
    }
};
</script>

<template>
    <div class="root">
        <form @submit.prevent="handleSubmit" class="form">
            <h2>Вход</h2>
            <div class="formField">
                <span for="login">Логин</span>
                <input id="login" v-model="login" required />
            </div>
            <div class="formField">
                <span for="password">Пароль</span>
                <input id="password" type="password" v-model="password" required />
            </div>
            <div class="formField submitButton">
                <button class="buttonSubmit" type="submit">Войти</button>
            </div>
            <!-- <div class="footer">
                <button @click="forgotPassword" class="link">
                    Забыли пароль
                </button>
            </div> -->
        </form>
    </div>
</template>

<style scoped>
.root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding-top: 50px;
    background-color: var(--backgroundColorMain, #f3f5f7);
    flex: 1;
    width: 100%;
}

h2 {
    font-family: "Roboto", sans-serif;
    font-size: 20px;
    line-height: 1.4;
    font-weight: 400;
    position: relative;
    color: #252525;
    background-color: #f3f5f7;
    display: flex;
    height: 100%;
    width: 100%;
}

.form {
    max-width: 440px;
    margin: 0 auto;
    flex-grow: 1;
    /* Это заставит форму занимать доступное пространство */
    display: flex;
    flex-direction: column;
    width: 100%;
}

.formField {
    margin-bottom: 10px;
    position: relative;
    padding: 1px;
    width: 100%;
}

.submitButton {
    margin-top: 35px;
}

span {
    color: var(--textContentColorLight, #adafb2);
    position: relative;
    font-weight: 400;
    pointer-events: none;
    font-size: 12px;
}

input {
    position: relative;
    display: flex;
    align-items: center;
    border: 1px solid rgba(0, 0, 0, 0.12);
    box-sizing: border-box;
    background: #fff;
    color: #343940;
    height: 36px;
    transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    padding: 8px 10px;
    flex: 1 1 auto;
    outline: none;
    border: none;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
}

.buttonSubmit {
    color: var(--textAccentColor, #fff);
    background-color: var(--accentColorMain, #2469f2);
    width: 100%;
    padding: 11px 25px;
    font-size: 13px;
    line-height: 16px;
    border-radius: 61px;
    box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.2), 0 3px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 9px 0 rgba(0, 0, 0, 0.12);
    border: none;
    text-transform: uppercase;
    text-align: center;
    font-weight: 500;
    outline: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-family: inherit;
    text-decoration: none;
    position: relative;
    white-space: nowrap;
    transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
}

.link {
    padding: 6px 12px;
    margin-left: auto;
    display: inline-block;

    color: var(--textAccentColor, #fff);
    background-color: var(--accentColorMain, #2469f2);
    font-size: 13px;
    line-height: 16px;
    border-radius: 61px;
    box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.2), 0 3px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 9px 0 rgba(0, 0, 0, 0.12);
    border: none;
    text-align: center;
    font-weight: 500;
    outline: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-family: inherit;
    text-decoration: none;
    position: relative;
    white-space: nowrap;
    transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
}

button:hover,
button:active,
button:focus {
    color: var(--textAccentColor, #fff);
    background-color: var(--accentColorDark, #1047b5);
}

button:active {
    box-shadow: 0 3px 5px -2px rgba(0, 0, 0, 0.2), 0 6px 9px 2px rgba(0, 0, 0, 0.14), 0 2px 11px 4px rgba(0, 0, 0, 0.12);
}

.footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
