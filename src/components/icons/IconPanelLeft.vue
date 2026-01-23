<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <rect width="18" height="18" x="3" y="3" rx="2"></rect>
        <path d="M9 3v18"></path>
    </svg>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'IconPanelLeft',
    props: {
        size: {
            type: [Number, String],
            default: 24
        },
        strokeWidth: {
            type: [Number, String],
            default: 2
        }
    }
});
</script>
