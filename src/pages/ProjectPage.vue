<template>
  <q-page padding>
    <template v-if="missing">
      <div class="text-center text-h6">
        The file you asked for does not exist.
      </div>
      <div class="text-center text-subtitle1">
        It may have been deleted or you may have typed the URL incorrectly.
      </div>
    </template>
    <template v-if="denied">
      <div class="text-center text-h6">
        You do not have permission to view this file.
      </div>
      <div class="text-center text-subtitle1">
        If you believe this is an error, please contact the owner of this file.
      </div>
    </template>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { db } from 'boot/firebaseInit';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { projectDocument } from 'assets/utilities';
import { FirebaseError } from 'firebase/app';

export default defineComponent({
  name: 'ProjectPage',
  data() {
    return {
      id: this.$route.params.id as string,
      docRef: doc(db, 'Projects', this.$route.params.id as string),
      docData: {} as projectDocument,
      missing: false,
      denied: false,
      remotelyChanged: false,
    };
  },
  async mounted() {
    try {
      const docSnap = await getDoc(this.docRef);
      if (docSnap.exists()) {
        this.docData = docSnap.data() as projectDocument;
        onSnapshot(this.docRef, (doc) => {
          this.docData = doc.data() as projectDocument;
          if (!doc.metadata.hasPendingWrites && this.remotelyChanged) {
            this.$q.notify({
              message: 'This project has been updated by another user.',
              color: 'warning',
              icon: 'warning',
              position: 'top',
              timeout: 5000,
            });
            this.remotelyChanged = true;
          }
        });
      } else {
        this.missing = true;
      }
    } catch (e) {
      if (e instanceof FirebaseError && e.code === 'permission-denied') {
        this.denied = true;
        console.log(e, e.code, e.message);
      } else if (e instanceof FirebaseError && e.code === 'not-found') {
        this.missing = true;
      } else {
        console.log(e);
      }
    }
  },
});
</script>
