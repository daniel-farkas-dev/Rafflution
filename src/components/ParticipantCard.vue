<template>
  <q-btn
    v-show="isWanted"
    padding="sm"
    id="card"
    :class="
      this.participant?.timesCame.includes(
        this.projectStore.project?.info?.term as number
      )
        ? 'bg-green-4'
        : 'bg-red-4'
    "
  >
    <span class="row inline no-wrap justify-between items-baseline full-width">
      <span id="name" class="text-h6">
        {{ participant.name + (participant?.age ? ', ' : '') }}
        <span class="text-subtitle2"> {{ participant.age }}</span>
      </span>
      <span id="sub" class="">
        {{ projectStore.isEligible(participant) }} ~
        {{ participant.timesCame.length }}
      </span>
    </span>
    <q-menu
      context-menu
      fit
      anchor="bottom middle"
      self="top middle"
      v-model="menu"
    >
      <q-card class="q-px-md q-pb-xl" style="width: 300px">
        <q-card-section class="flex justify-between q-px-xs">
          <div class="text-h6">Edit Participant</div>
        </q-card-section>
        <q-form
          @submit="
            projectStore.editParticipant(participantId, newParticipant);
            menu = false;
          "
        >
          <q-input
            v-model="newParticipant.name"
            label="Participant's Name*"
            aria-required="true"
            :rules="[
              () =>
                newParticipant.name !== '' || 'Participant name is required',
              () =>
                projectStore.isNewName(
                  newParticipant.name,
                  participant?.name
                ) || 'You already have a participant with this name',
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
          <span class="float-right"
            ><q-btn
              class="q-ml-md"
              color="negative"
              label="Remove"
              @click="
                projectStore.deleteParticipant(participantId);
                menu = false;
              " /><q-btn
              class="q-ml-md float-right"
              color="primary"
              label="Submit"
              type="submit"
          /></span>
        </q-form>
      </q-card>
    </q-menu>
  </q-btn>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useProjectStore } from 'stores/project';
import { Filter, participant } from 'assets/utilities';

export default defineComponent({
  setup() {
    const projectStore = useProjectStore();
    return { projectStore };
  },
  props: {
    participantId: {
      type: Number,
      required: true,
    },
    searchTerm: {
      type: String,
      required: true,
    },
    filterType: {
      type: String as PropType<Filter>,
    },
  },
  data() {
    return {
      newParticipant: {
        name: '',
        timesCame: [],
        timesWon: [],
        age: undefined,
      } as participant,
      menu: false,
    };
  },
  computed: {
    participant() {
      return this.projectStore.project?.participants[this.participantId];
    },
    isWanted() {
      if (this.participant?.timesWon == undefined) {
        console.error('participant?.timesWon is undefined');
        return true;
      }
      switch (this.filterType) {
        case Filter.all:
          break;
        case Filter.present:
          if (
            this.participant?.timesCame.includes(
              this.projectStore.project?.info?.term as number
            )
          ) {
            break;
          } else {
            return false;
          }
        case Filter.absent:
          if (
            !this.participant?.timesCame.includes(
              this.projectStore.project?.info?.term as number
            )
          ) {
            break;
          } else {
            return false;
          }
        case Filter.won:
          if (!this.projectStore.isEligible(this.participant)) {
            break;
          } else {
            return false;
          }
        case Filter.eligible:
          if (this.projectStore.isEligible(this.participant)) {
            break;
          } else {
            return false;
          }
        default:
          return true;
      }
      if (this.searchTerm == '') {
        return true;
      }
      return (
        this.searchTerm != '' &&
        this.participant?.name
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      );
    },
  },
  mounted() {
    this.newParticipant = this.participant as participant;
  },
});
</script>
<style>
#card {
  width: 300px;
}

#name {
  text-overflow: ellipsis;
}
</style>
