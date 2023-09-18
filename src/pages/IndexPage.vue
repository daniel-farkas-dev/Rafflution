<template>
  <q-page padding>
    <section v-if="!userStore.isUserSignedIn">
      <q-btn @click="signIn"> Sign in with Google </q-btn>
    </section>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { auth } from 'boot/firebaseInit';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useUserStore } from 'stores/user';
export default defineComponent({
  data() {
    return {
      name: 'IndexPage',
      userStore: useUserStore(),
    };
  },
  methods: {
    signIn() {
      signInWithPopup(auth, new GoogleAuthProvider()).catch((err) => {
        console.error(err);
      });
    },
    signOut() {
      auth.signOut().catch((err) => {
        console.error(err);
      });
    },
  },
});
</script>
