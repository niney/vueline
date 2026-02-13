<template>
    <div
        class="stat-card relative overflow-hidden rounded-lg px-4 py-3"
        :class="[
            darkMode ? 'bg-white/[0.04]' : 'bg-white shadow-sm',
            variantBorderClass
        ]"
    >
        <div class="flex items-center justify-between gap-2">
            <div class="flex-1 min-w-0">
                <div
                    class="text-[10px] font-semibold tracking-[0.1em] uppercase mb-1"
                    :class="darkMode ? 'text-gray-500' : 'text-gray-400'"
                >{{ label }}</div>
                <div class="flex items-baseline gap-1.5">
                    <span class="text-xl font-bold tabular-nums" :class="valueClass">{{ value }}</span>
                    <span
                        v-if="percent !== undefined"
                        class="text-xs font-medium tabular-nums"
                        :class="percentClass"
                    >{{ percent }}%</span>
                </div>
            </div>
            <div
                class="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                :class="iconBgClass"
            >
                <i class="text-xs" :class="iconClass"></i>
            </div>
        </div>
        <!-- 하단 액센트 바 -->
        <div class="absolute bottom-0 left-0 right-0 h-[2px]" :class="accentBarClass"></div>
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
            if (props.darkMode) {
                switch (props.variant) {
                    case 'success': return 'text-emerald-400';
                    case 'error': return 'text-rose-400';
                    default: return 'text-gray-100';
                }
            } else {
                switch (props.variant) {
                    case 'success': return 'text-emerald-600';
                    case 'error': return 'text-rose-600';
                    default: return 'text-gray-800';
                }
            }
        });

        const percentClass = computed(() => {
            if (props.darkMode) {
                return props.variant === 'success' ? 'text-emerald-400/70' : 'text-gray-500';
            }
            return props.variant === 'success' ? 'text-emerald-500' : 'text-gray-400';
        });

        const iconClass = computed(() => {
            switch (props.variant) {
                case 'success': return 'fas fa-check text-emerald-400';
                case 'error': return 'fas fa-times text-rose-400';
                default: return 'fas fa-layer-group text-blue-400';
            }
        });

        const iconBgClass = computed(() => {
            if (props.darkMode) {
                switch (props.variant) {
                    case 'success': return 'bg-emerald-500/10';
                    case 'error': return 'bg-rose-500/10';
                    default: return 'bg-blue-500/10';
                }
            } else {
                switch (props.variant) {
                    case 'success': return 'bg-emerald-50';
                    case 'error': return 'bg-rose-50';
                    default: return 'bg-blue-50';
                }
            }
        });

        const accentBarClass = computed(() => {
            switch (props.variant) {
                case 'success': return 'bg-gradient-to-r from-emerald-500/80 to-emerald-500/0';
                case 'error': return 'bg-gradient-to-r from-rose-500/80 to-rose-500/0';
                default: return 'bg-gradient-to-r from-blue-500/80 to-blue-500/0';
            }
        });

        const variantBorderClass = computed(() => {
            if (props.darkMode) {
                switch (props.variant) {
                    case 'success': return 'border border-emerald-500/10';
                    case 'error': return 'border border-rose-500/10';
                    default: return 'border border-white/[0.06]';
                }
            }
            return 'border border-gray-100';
        });

        return { valueClass, percentClass, iconClass, iconBgClass, accentBarClass, variantBorderClass };
    }
});
</script>
