<template>
  <q-layout view="hHh lpr fFr">

    <q-header class="bg-primary text-white" elevated>
      <q-toolbar>
        <q-toolbar-title @click="this.$router.push('/')">
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          Rafflation
        </q-toolbar-title>
        <q-avatar v-if="userStore.isUserSignedIn" @click="this.$router.push('/dash/')">
          <img :src="userStore.user.photoURL" onerror="this.onerror=null; this.src='profile.jpg';"/>
          <q-tooltip>
            {{ userStore.user.email }}
          </q-tooltip>
        </q-avatar>
        <q-btn dense flat icon="menu" round @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="rightDrawerOpen" bordered show-if-above side="right" behavior="desktop">
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import { useUserStore } from 'stores/user';
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      rightDrawerOpen: false,
      userStore: useUserStore()
    };
  },
  methods: {
    toggleRightDrawer() {
      this.rightDrawerOpen = !this.rightDrawerOpen;
    }
  }
});
</script>
