<template>
  <q-item v-ripple clickable @click="select">
    <q-item-section avatar>
      <q-avatar :color="project.label" size="sm" />
    </q-item-section>

    <q-item-section>
      <q-item-label lines="1">{{ project.name }}</q-item-label>
    </q-item-section>

    <q-item-section side>
      Last edited
      {{ timeAgo(project.lastEdited) }}
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { timeAgo } from 'assets/utilities';
import type { projectDetails } from 'assets/utilities';
export default defineComponent({
  name: 'ProjectRow',
  methods: {
    timeAgo,
    select() {
      this.$router.push('/edit/' + this.project.id);
    },
  },
  props: {
    project: {
      type: Object as PropType<projectDetails>,
      required: true,
    },
  },
});
</script>
