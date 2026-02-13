<template>
    <div class="number-input-container" :class="{ 'is-dark': darkMode }">
        <button
            type="button"
            class="number-btn decrease"
            :disabled="isMinDisabled"
            @click="decrease"
        >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        </button>
        <input
            ref="inputRef"
            type="number"
            :value="modelValue"
            :placeholder="placeholder"
            :min="min"
            :max="max"
            :step="step"
            class="number-input"
            @input="onInput"
            @blur="onBlur"
        />
        <button
            type="button"
            class="number-btn increase"
            :disabled="isMaxDisabled"
            @click="increase"
        >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
    name: 'NumberInput',
    props: {
        modelValue: {
            type: [Number, String],
            default: ''
        },
        placeholder: {
            type: String,
            default: ''
        },
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: Infinity
        },
        step: {
            type: Number,
            default: 1
        },
        darkMode: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue', 'change'],
    setup(props, { emit }) {
        const inputRef = ref<HTMLInputElement | null>(null);

        const numericValue = computed(() => {
            const val = Number(props.modelValue);
            return isNaN(val) ? 0 : val;
        });

        const isMinDisabled = computed(() => numericValue.value <= props.min);
        const isMaxDisabled = computed(() => numericValue.value >= props.max);

        const emitValue = (value: number) => {
            const clampedValue = Math.max(props.min, Math.min(props.max, value));
            emit('update:modelValue', clampedValue);
            emit('change', clampedValue);
        };

        const onInput = (event: Event) => {
            const target = event.target as HTMLInputElement;
            const value = target.value === '' ? '' : Number(target.value);
            emit('update:modelValue', value);
        };

        const onBlur = () => {
            if (props.modelValue === '' || props.modelValue === null) return;
            const value = Number(props.modelValue);
            if (!isNaN(value)) {
                emitValue(value);
            }
        };

        const increase = () => {
            emitValue(numericValue.value + props.step);
        };

        const decrease = () => {
            emitValue(numericValue.value - props.step);
        };

        return {
            inputRef,
            isMinDisabled,
            isMaxDisabled,
            onInput,
            onBlur,
            increase,
            decrease
        };
    }
});
</script>

<style scoped lang="scss">
.number-input-container {
    display: inline-flex;
    align-items: center;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    overflow: hidden;
    background: white;

    &.is-dark {
        background: #1f1f1f;
        border-color: #4a4a4a;

        .number-input {
            color: #e5e7eb;
            background: transparent;

            &::placeholder {
                color: #6b7280;
            }
        }

        .number-btn {
            color: #9ca3af;
            border-color: #4a4a4a;

            &:hover:not(:disabled) {
                background: #2d2d2d;
                color: #e5e7eb;
            }

            &:disabled {
                color: #4b5563;
            }
        }
    }
}

.number-input {
    width: 60px;
    padding: 6px 8px;
    font-size: 14px;
    text-align: center;
    border: none;
    outline: none;
    background: transparent;
    color: #374151;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    &::placeholder {
        color: #9ca3af;
    }
}

.number-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s ease;

    &.decrease {
        border-right: 1px solid #d1d5db;
    }

    &.increase {
        border-left: 1px solid #d1d5db;
    }

    &:hover:not(:disabled) {
        background: #f3f4f6;
        color: #374151;
    }

    &:disabled {
        cursor: not-allowed;
        color: #d1d5db;
    }
}
</style>
