<template>
    <div class="mx-auto py-4">
        <h1 class="text-2xl font-bold mb-4">Smart Aegis</h1>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import '@/tailwind.css';

export default defineComponent({
    name: 'SpSmartAegisApp',
    props: {
        params: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
        };
    },
    created() {
        console.log('SpSmartAegisApp created');
    },
    methods: {
    }
});
</script>

<style lang="scss">
</style>
