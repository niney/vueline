<template>
    <div
        class="rounded-lg px-6 py-4 min-w-[150px]"
        :class="darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'"
    >
        <div class="text-[11px] text-gray-400 uppercase mb-1">{{ label }}</div>
        <div class="text-2xl font-semibold" :class="valueClass">
            {{ value }}
            <span v-if="percent !== undefined" class="text-sm font-normal">
                ({{ percent }}%)
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
    name: 'StatCard',
    props: {
        label: {
            type: String,
            required: true
        },
        value: {
            type: [Number, String],
            required: true
        },
        percent: {
            type: Number,
            default: undefined
        },
        variant: {
            type: String as () => 'default' | 'success' | 'error',
            default: 'default'
        },
        darkMode: {
            type: Boolean,
            default: true
        }
    },
    setup(props) {
        const valueClass = computed(() => {
            switch (props.variant) {
                case 'success': return 'text-green-500';
                case 'error': return 'text-red-500';
                default: return '';
            }
        });

        return { valueClass };
    }
});
</script>
