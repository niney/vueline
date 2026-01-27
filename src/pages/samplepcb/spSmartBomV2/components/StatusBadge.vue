<template>
    <span
        class="inline-block px-2.5 py-1 rounded-xl text-xs font-medium"
        :class="variantClass"
    >
        {{ label }}
    </span>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
    name: 'StatusBadge',
    props: {
        label: {
            type: String,
            required: true
        },
        variant: {
            type: String as () => 'success' | 'error' | 'warning' | 'info',
            default: 'info'
        }
    },
    setup(props) {
        const variantClass = computed(() => {
            switch (props.variant) {
                case 'success': return 'bg-green-500/20 text-green-500';
                case 'error': return 'bg-red-500/20 text-red-500';
                case 'warning': return 'bg-yellow-500/20 text-yellow-500';
                case 'info': return 'bg-blue-500/20 text-blue-500';
                default: return 'bg-gray-500/20 text-gray-500';
            }
        });

        return { variantClass };
    }
});
</script>
