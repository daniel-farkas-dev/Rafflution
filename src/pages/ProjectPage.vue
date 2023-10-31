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
    <template v-else-if="denied">
      <div class="text-center text-h6">
        You do not have permission to view this file.
      </div>
      <div class="text-center text-subtitle1">
        If you believe this is an error, please contact the owner of this file.
      </div>
    </template>
    <template v-else>
      <q-layout view="hHh lpR fFf">
        <q-header elevated>
          <q-toolbar>
            <q-toolbar-title>
              <q-btn
                :color="projectStore.project?.info?.label"
                rounded
                unelevated
                :ripple="false"
                >{{ projectStore.project?.info?.name }}
              </q-btn>
            </q-toolbar-title>
            <q-btn
              class="text-capitalize"
              color="secondary"
              label="Add Participant"
              @click="addParticipantDialog = true"
            ></q-btn>
            <q-dialog v-model="addParticipantDialog">
              <q-card class="q-px-md" style="width: 300px">
                <q-card-section class="flex justify-between q-px-xs">
                  <div class="text-h6">New Participant</div>
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    class="q-ml-sm"
                    @click="addParticipantDialog = false"
                  />
                </q-card-section>
                <q-form
                  @submit="
                    projectStore.addParticipant(newParticipant);
                    addParticipantDialog = false;
                  "
                >
                  <q-input
                    v-model="newParticipant.name"
                    label="Participant's Name*"
                    aria-required="true"
                    :rules="[
                      () =>
                        newParticipant.name !== '' ||
                        'Participant name is required',
                      () =>
                        projectStore.isNewName(newParticipant.name) ||
                        'You already have a participant with this name',
                      () =>
                        projectStore.isAllowedName(newParticipant.name) ||
                        'You can only use letters, numbers, and \'-\'.',
                    ]"
                    outlined
                  />
                  <q-input
                    type="number"
                    v-model="newParticipant.age"
                    label="Participant's Age"
                    :rules="[
                      () =>
                        projectStore.isAgeReal(newParticipant.age) ||
                        'Participant age must be a real age',
                    ]"
                    aria-required="false"
                    outlined
                  />
                  <div class="float-right q-py-md">
                    <q-btn
                      class="q-ml-md"
                      color="primary"
                      label="Submit"
                      type="submit"
                    />
                  </div>
                </q-form>
              </q-card>
            </q-dialog>
            <q-btn-toggle
              v-model="viewType"
              toggle-color="secondary"
              rounded
              color="grey-8"
              :readonly="locked"
              :options="[
                { label: 'Card', value: View.card },
                { label: 'Table', value: View.table },
              ]"
            />
            <q-input v-model="searchTerm" standout dense bg-color="secondary" />
            <q-btn @click="searchTerm = ''" label="Reset" color="warning" />
            <q-select
              v-model="filter"
              :options="Object.values(Filter)"
              filled
              label="Filter"
              bg-color="secondary"
              label-color="black"
              dense
            />
            <q-space />
            <q-avatar
              v-if="userStore.isUserSignedIn"
              @click="this.$router.push('/dash/')"
            >
              <img
                :src="userStore.user?.photoURL"
                onerror="this.onerror=null; this.src='profile.jpg';"
                alt="Profile Picture"
              />
              <q-tooltip>
                {{ userStore.user?.email }}
              </q-tooltip>
            </q-avatar>
          </q-toolbar>
        </q-header>
        <q-page-container>
          <template v-if="viewType == View.card">
            <div class="q-pa-md row items-start q-gutter-md">
              <ParticipantCard
                v-for="(participant, index) in projectStore.project
                  ?.participants"
                class="ParticipantCard"
                :key="index"
                :participantId="index as number"
                :searchTerm="searchTerm"
                :filterType="filter as Filter"
                @click="this.projectStore.togglePresence(index as number)"
              ></ParticipantCard>
            </div>
          </template>
          <template v-else></template>
        </q-page-container>
      </q-layout>
    </template>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { db } from 'boot/firebaseInit';
import { doc, DocumentReference, getDoc, onSnapshot } from 'firebase/firestore';
import { Filter, participant, projectDocument, View } from 'assets/utilities';
import { FirebaseError } from 'firebase/app';
import ParticipantCard from 'components/ParticipantCard.vue';
import { useProjectStore } from 'stores/project';
import { useUserStore } from 'stores/user';

export default defineComponent({
  setup() {
    const projectStore = useProjectStore();
    const userStore = useUserStore();
    return { projectStore, userStore };
  },
  name: 'ProjectPage',
  components: { ParticipantCard },
  data() {
    return {
      id: this.$route.params.id as string,
      docRef: doc(
        db,
        'Projects',
        this.$route.params.id as string
      ) as DocumentReference<projectDocument>,
      missing: false,
      denied: false,
      remotelyChanged: false,
      viewType: View.card,
      locked: false,
      addParticipantDialog: false,
      newParticipant: {
        name: '',
        timesCame: [],
        timesWon: [],
        age: undefined,
      } as participant,
      searchTerm: '',
      filter: Filter.all,
    };
  },
  computed: {
    Filter() {
      return Filter;
    },
    View() {
      return View;
    },
  },
  methods: {
    edit(index: number) {
      console.log(index);
    },
  },
  async mounted() {
    try {
      const docSnap = await getDoc(this.docRef);
      if (docSnap.exists()) {
        this.projectStore.setProject(
          docSnap.data() as projectDocument,
          this.docRef
        );
        onSnapshot(this.docRef, (doc) => {
          this.projectStore.setProject(
            doc.data() as projectDocument,
            this.docRef
          );
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
        console.error(e, e.code, e.message);
      } else if (e instanceof FirebaseError && e.code === 'not-found') {
        this.missing = true;
      } else {
        console.error(e);
      }
    }
  },
  unmounted() {
    this.projectStore.deleteProject();
  },
});
</script>
<style>
.q-select {
  width: 150px;
}
</style>
