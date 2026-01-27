<template>
    <button
        class="bg-transparent border-none cursor-pointer p-1 rounded flex items-center justify-center transition-colors"
        :class="darkMode
            ? 'text-white/70 hover:bg-gray-800 hover:text-white'
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'"
        @click="$emit('click', $event)"
    >
        <slot></slot>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'IconButton',
    props: {
        darkMode: {
            type: Boolean,
            default: true
        }
    },
    emits: ['click']
});
</script>
