<template>
  <q-page padding>
    <!-- content -->
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserStore } from 'stores/user';
import { db } from 'boot/firebaseInit';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default defineComponent({
  data() {
    return {
      name: 'DashboardPage',
      userStore: useUserStore()
    };
  },
  async mounted() {
    // 0. Check to see if user belongs
    if (!this.userStore.user) {
      this.$router.push('/');
      console.log('No user');
    } else {
      // 1. Check to see if user has a document
      const docRef = doc(db, 'Users', this.userStore.user.uid);
      const docSnap = await getDoc(docRef);
      // 2. If not, create a document
      if(!docSnap.exists()) {
        await setDoc(doc(db, "Users", this.userStore.user.uid), {
          email: this.userStore.user.email,
          tier: "basic"
        });
      }
      // 3. Read the document
      // 4. Iterate through the document and create a list of all the projects
      // 5. If there are no projects, display a message
    }
  }
});
</script>
