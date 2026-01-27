<template>
    <li
        class="px-2.5 py-2 rounded-md cursor-pointer flex items-center gap-2.5 text-sm mb-0.5 transition-colors"
        :class="active ? activeClass : inactiveClass"
    >
        <i :class="icon" class="w-[18px] text-center text-sm"></i>
        <span>{{ label }}</span>
    </li>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
    name: 'NavItem',
    props: {
        icon: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        active: {
            type: Boolean,
            default: false
        },
        darkMode: {
            type: Boolean,
            default: true
        }
    },
    setup(props) {
        const activeClass = computed(() =>
            props.darkMode
                ? 'bg-[rgba(30,58,95,0.5)] text-white'
                : 'bg-blue-100 text-blue-700'
        );

        const inactiveClass = computed(() =>
            props.darkMode
                ? 'text-white/70 hover:bg-gray-800 hover:text-white'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        );

        return { activeClass, inactiveClass };
    }
});
</script>
