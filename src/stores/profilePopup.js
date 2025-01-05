import { reactive } from 'vue';
import { authState } from '@/stores/auth.js'

export const profilePopupState = reactive({
  isProfilePopupVisible: false,

  togglePopup() {
    this.isProfilePopupVisible = !this.isProfilePopupVisible
    console.log(123)
  },

  closePopup() {
    this.isProfilePopupVisible = false
    console.log(1)
  },

  logout() {
    this.closePopup()
    authState.logout()
  },
});
