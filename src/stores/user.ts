import { defineStore } from 'pinia';
import type { User } from 'firebase/auth'

export const useUserStore = defineStore('user', {
  state: () => ({ user: null as User | null }),
  getters: {
    isUserSignedIn: (state) => state.user !== null
  },
})
