<template>
  <q-card
    id="card"
    :class="
      this.participant?.timesCame.includes(
        this.projectStore.project?.info?.term
      )
        ? 'bg-green-4'
        : 'bg-red-4'
    "
  >
    <q-card-section
      class="row inline no-wrap justify-between items-baseline full-width"
    >
      <div id="name" class="text-h6">
        {{ participant.name + (participant?.age ? ', ' : '') }}
        <span class="text-subtitle2">{{ participant.age }}</span>
      </div>
      <div id="sub" class="">
        {{ participant.timesCame.length }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useProjectStore } from 'stores/project';
import { mapStores } from 'pinia';
export default defineComponent({
  props: {
    participantId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    ...mapStores(useProjectStore),
    participant() {
      return this.projectStore.project?.participants[this.participantId];
    },
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
