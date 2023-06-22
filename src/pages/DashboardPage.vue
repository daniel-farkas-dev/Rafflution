<template>
  <q-page padding>
    <template v-for="(project, index) in projects" :key="index">
      <q-card class="q-mb-md">
        <q-card-section>
          <q-item-label>{{ project.name }}</q-item-label>
          <q-item-label caption>{{ timeAgo(project.lastEdited) }}</q-item-label>
        </q-card-section>
      </q-card>
    </template>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserStore } from 'stores/user';
import { db } from 'boot/firebaseInit';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { projectDetails, timeAgo } from 'assets/utilities';

export default defineComponent({
  methods: { timeAgo },
  data() {
    return {
      name: 'DashboardPage',
      userStore: useUserStore(),
      projects: [] as projectDetails[]
    };
  },
  async mounted() {
    // 0. Check to see if user belongs
    if (!this.userStore.user) { //TODO: Wait for pinia to load
      this.$router.push('/');
    } else {
      // 1. Check to see if user has a document
      let docRef = doc(db, 'Users', this.userStore.user.uid);
      const docSnap = await getDoc(docRef);
      // 2. If not, create a document
      if (!docSnap.exists()) {
        await setDoc(doc(db, 'Users', this.userStore.user.uid), {
          email: this.userStore.user.email,
          tier: 'basic',
          projects: []
        });
      }
      // 3. Iterate through the document and create a list of all the projects
      else {
        if (Array.isArray(docSnap.data().projects && docSnap.data().projects.length)) {
          // Query the projects collection for each project
          for (let i = 0; i < docSnap.data().projects.length; i++) {
            let projectRef = doc(db, 'Projects', docSnap.data().projects[i]);
            const projectSnap = await getDoc(projectRef);
            let project: projectDetails = {
              name: projectSnap.data()?.info.name,
              lastEdited: new Date(projectSnap.data()?.info.lastEdited.toDate())
            };
            this.projects.push(project);
          }
        }
      }
    }
  }
});
</script>
