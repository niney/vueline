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
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
    </svg>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'IconMoon',
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
