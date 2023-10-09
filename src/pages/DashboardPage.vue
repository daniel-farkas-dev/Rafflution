<template>
  <q-page padding>
    <q-card bordered class="q-mt-sm">
      <q-card-section class="row justify-between">
        <div class="text-h6 text-weight-bolder text-grey-8">Projects</div>
        <q-btn
          class="text-capitalize"
          color="indigo-7"
          label="Add Project"
          outline
          @click="projectForm = true"
        ></q-btn>
        <q-dialog v-model="projectForm">
          <q-card class="q-px-md" style="width: 300px">
            <q-card-section class="flex justify-between q-px-xs">
              <div class="text-h6">New Project</div>
              <q-btn
                flat
                round
                dense
                icon="close"
                class="q-ml-sm"
                @click="projectForm = false"
              />
            </q-card-section>
            <q-form @reset="onReset" @submit="createProject">
              <q-input
                v-model="newProject.info.name"
                label="Project Name"
                :rules="[
                  () =>
                    newProject.info.name !== '' || 'Project name is required',
                  () =>
                    newName() || 'You already have a project with this name',
                  () =>
                    newProject.info.name.length <= 20 ||
                    'Project name must be less than 20 characters',
                  () =>
                    allowedChars() ||
                    'You can only use letters, numbers, and \'-\'.',
                ]"
                outlined
              />
              <!-- Function instead of straight bool to suppress errors -->
              <q-select
                v-model="newProject.info.label"
                :options="options"
                label="Project Color"
                :rules="[
                  () =>
                    newProject.info.label !== '' || 'Project color is required',
                ]"
                map-options
                outlined
                emit-value
              />

              <div class="float-right q-py-md">
                <q-btn color="negative" label="Reset" outline type="reset" />
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
      </q-card-section>
      <q-separator></q-separator>
      <q-list>
        <ProjectRow
          v-for="(project, index) in projects"
          :key="index"
          :project="project"
        />

        <q-separator inset="item" />
      </q-list>
    </q-card>
    <template v-if="projects.length === 0">
      <q-card class="q-mb-md">
        <q-card-section>
          <q-item-label>No projects found</q-item-label>
        </q-card-section>
      </q-card>
    </template>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserStore } from 'stores/user';
import { db } from 'boot/firebaseInit';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  arrayUnion,
  DocumentReference,
  updateDoc,
} from 'firebase/firestore';
import {
  Color,
  projectDetails,
  projectDocument,
  Tier,
  timeAgo,
  userDocument,
} from 'assets/utilities';
import ProjectRow from 'components/ProjectRow.vue';

export default defineComponent({
  components: { ProjectRow },
  data() {
    return {
      name: 'DashboardPage',
      userStore: useUserStore(),
      projects: [] as projectDetails[],
      projectForm: false,
      newProject: {
        info: {
          name: '',
          label: '' as Color,
        },
        users: {
          owner: '',
        },
      } as projectDocument,
      options: [
        {
          label: '🔴 Red',
          value: 'red',
        },
        {
          label: '🟠 Orange',
          value: 'orange',
        },
        {
          label: '🟡 Yellow',
          value: 'yellow',
        },
        {
          label: '🟢 Green',
          value: 'green',
        },
        {
          label: '🔵 Blue',
          value: 'blue',
        },
        {
          label: '⚫ Black',
          value: 'black',
        },
        {
          label: '⚪ White',
          value: 'white',
        },
      ],
      nameError: 'Project name is required',
      userDocRef: null as DocumentReference<userDocument> | null,
    };
  },
  methods: {
    timeAgo,
    onReset() {
      this.newProject = {
        info: {
          name: '',
          label: '' as Color,
        },
        users: {
          owner: '',
        },
      } as projectDocument;
    },
    async createProject() {
      if (
        this.newProject.info.name != '' &&
        this.newName() &&
        this.newProject.info.name.length <= 20 &&
        this.allowedChars() &&
        this.newProject.info.label != ('' as Color)
      ) {
        this.projectForm = false;
        const docRef = await addDoc(collection(db, 'Projects'), {
          info: {
            name: this.newProject.info.name,
            label: this.newProject.info.label,
            lastEdited: serverTimestamp(),
            created: serverTimestamp(),
            term: 1,
          },
          participants: [],
          users: {
            owner: this.userStore.user?.uid,
            editors: [],
            viewers: [],
          },
        });
        await updateDoc(this.userDocRef as DocumentReference<userDocument>, {
          projects: arrayUnion(docRef.id),
        });
        this.$router.push('/edit/' + docRef.id);
        this.$q.notify({
          message: 'Project created successfully',
          color: 'positive',
          icon: 'check',
          position: 'top',
          timeout: 5000,
        });
      }
    },
    newName() {
      for (let project of this.projects) {
        if (
          project.name.toUpperCase() === this.newProject.info.name.toUpperCase()
        ) {
          return false;
        }
      }
      return true;
    },
    allowedChars() {
      let regex = /^[a-zA-Z0-9-]*$/;
      return regex.test(this.newProject.info.name);
    },
  },
  async mounted() {
    // 0. Check to see if user belongs
    if (!this.userStore.user) {
      //TODO: Wait for pinia to load
      this.$router.push('/');
    } else {
      // 1. Check to see if user has a document
      this.userDocRef = doc(
        db,
        'Users',
        this.userStore.user.uid
      ) as DocumentReference<userDocument>;
      const docSnap = await getDoc(this.userDocRef);
      // 2. If not, create a document
      if (!docSnap.exists()) {
        await setDoc(this.userDocRef, {
          email: this.userStore.user.email as string,
          tier: Tier.basic,
          projects: [],
        } as userDocument);
      }
      // 3. Iterate through the document and create a list of all the projects
      else {
        if (
          Array.isArray(docSnap.data().projects) &&
          docSnap.data().projects.length
        ) {
          // Query the projects collection for each project
          for (let i = 0; i < docSnap.data().projects.length; i++) {
            let projectRef = doc(db, 'Projects', docSnap.data().projects[i]);
            const projectSnap = await getDoc(projectRef);
            let project: projectDetails = {
              id: projectSnap.id,
              name: projectSnap.data()?.info.name,
              lastEdited: new Date(
                projectSnap.data()?.info.lastEdited.toDate()
              ),
              label: projectSnap.data()?.info.label,
            };
            this.projects.push(project);
          }
        }
      }
    }
  },
});
</script>

<style lang="scss" scoped>
.q-list .q-separator:last-of-type {
  display: none;
}
</style>
