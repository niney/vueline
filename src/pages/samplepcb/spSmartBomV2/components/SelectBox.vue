<template>
    <div
        ref="containerRef"
        class="select-box-container"
        :class="{ 'is-open': isOpen }"
    >
        <!-- Hidden Sizer (가장 긴 옵션 기준 너비 결정) -->
        <div class="select-sizer" aria-hidden="true">
            <span v-if="showEmptyOption" class="sizer-item">{{ emptyOptionLabel }}</span>
            <span v-for="option in options" :key="'sizer-' + option.value" class="sizer-item">{{ option.label }}</span>
        </div>

        <!-- Trigger Button -->
        <button
            type="button"
            class="select-trigger"
            :class="[
                triggerClasses,
                { 'is-open': isOpen, 'has-value': hasValue, 'is-disabled': disabled }
            ]"
            :disabled="disabled"
            @click="toggleDropdown"
        >
            <span class="select-value">{{ displayLabel }}</span>
            <svg
                class="select-arrow"
                :class="{ 'rotate-180': isOpen }"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
            >
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>

        <!-- Dropdown -->
        <div
            v-if="isOpen"
            ref="dropdownRef"
            class="select-dropdown"
            :class="dropdownClasses"
            :style="dropdownStyle"
        >
            <!-- Empty Option -->
            <div
                v-if="showEmptyOption"
                class="select-option"
                :class="{ 'is-selected': modelValue === '' }"
                @click="selectEmptyOption"
            >
                <span class="option-label empty-option-label">{{ emptyOptionLabel }}</span>
                <div class="option-actions">
                    <svg v-if="modelValue === ''" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="#2A9ED2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>

            <!-- Options -->
            <template v-if="options.length > 0">
                <div
                    v-for="option in options"
                    :key="option.value"
                    class="select-option"
                    :class="{
                        'is-selected': option.value === modelValue,
                        'is-disabled': option.disabled,
                        'has-delete': showDeleteButton
                    }"
                    :data-value="option.value"
                    @click="selectOption(option)"
                >
                    <span class="option-label">{{ option.label }}</span>
                    <div class="option-actions">
                        <svg v-if="option.value === modelValue" width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="#2A9ED2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <button
                            v-if="showDeleteButton"
                            type="button"
                            class="delete-button"
                            @click.stop="onDeleteClick(option)"
                            @mousedown.stop
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </template>

            <!-- Empty State -->
            <div v-else class="select-option is-disabled">
                <span class="option-label">{{ emptyMessage }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, nextTick, PropType } from 'vue';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
    data?: any;
}

export default defineComponent({
    name: 'SelectBox',
    props: {
        options: {
            type: Array as PropType<SelectOption[]>,
            default: () => []
        },
        modelValue: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: '선택'
        },
        showDeleteButton: {
            type: Boolean,
            default: false
        },
        emptyMessage: {
            type: String,
            default: '옵션 없음'
        },
        disabled: {
            type: Boolean,
            default: false
        },
        dropdownWidth: {
            type: String,
            default: ''
        },
        showEmptyOption: {
            type: Boolean,
            default: false
        },
        emptyOptionLabel: {
            type: String,
            default: '선택 안함'
        },
        darkMode: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue', 'delete'],
    setup(props, { emit }) {
        const containerRef = ref<HTMLElement | null>(null);
        const dropdownRef = ref<HTMLElement | null>(null);
        const isOpen = ref(false);

        const hasValue = computed(() => {
            return props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined;
        });

        const displayLabel = computed(() => {
            const selectedOption = props.options.find(opt => opt.value === props.modelValue);
            return selectedOption?.label || props.placeholder;
        });

        const triggerClasses = computed(() => {
            return props.darkMode
                ? 'bg-[#2d2d2d] text-gray-300 border border-[#4a4a4a]'
                : 'bg-gray-100 text-gray-700 border border-gray-300';
        });

        const dropdownClasses = computed(() => {
            return props.darkMode
                ? 'dropdown-dark'
                : 'dropdown-light';
        });

        const dropdownStyle = computed(() => {
            const style: Record<string, string> = {};
            if (props.dropdownWidth) {
                style.width = props.dropdownWidth;
                style.right = 'auto';
            }
            return style;
        });

        const toggleDropdown = () => {
            if (props.disabled) return;
            const wasOpen = isOpen.value;
            isOpen.value = !isOpen.value;

            if (!wasOpen) {
                nextTick(() => scrollToSelectedOption());
            }
        };

        const scrollToSelectedOption = () => {
            if (!props.modelValue || !dropdownRef.value) return;

            const selectedOption = dropdownRef.value.querySelector(`[data-value="${props.modelValue}"]`) as HTMLElement;
            if (selectedOption) {
                const dropdownHeight = dropdownRef.value.clientHeight;
                const optionTop = selectedOption.offsetTop;
                const optionHeight = selectedOption.clientHeight;
                dropdownRef.value.scrollTop = optionTop - (dropdownHeight / 2) + (optionHeight / 2);
            }
        };

        const selectOption = (option: SelectOption) => {
            if (option.disabled) return;
            emit('update:modelValue', option.value);
            isOpen.value = false;
        };

        const selectEmptyOption = () => {
            emit('update:modelValue', '');
            isOpen.value = false;
        };

        const onDeleteClick = (option: SelectOption) => {
            emit('delete', option);
        };

        const onDocumentClick = (event: MouseEvent) => {
            if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
                isOpen.value = false;
            }
        };

        onMounted(() => {
            document.addEventListener('click', onDocumentClick);
        });

        onUnmounted(() => {
            document.removeEventListener('click', onDocumentClick);
        });

        return {
            containerRef,
            dropdownRef,
            isOpen,
            hasValue,
            displayLabel,
            triggerClasses,
            dropdownClasses,
            dropdownStyle,
            toggleDropdown,
            selectOption,
            selectEmptyOption,
            onDeleteClick
        };
    }
});
</script>

<style scoped lang="scss">
.select-box-container {
    position: relative;
    display: inline-block;
    text-align: left;
}

.select-sizer {
    display: flex;
    flex-direction: column;
    visibility: hidden;
    height: 0;
    overflow: hidden;
    padding: 0 40px 0 12px; // trigger padding + arrow space

    .sizer-item {
        font-size: 14px;
        white-space: nowrap;
    }
}

.select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 12px;
    font-size: 14px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    width: 100%;

    &.is-open {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }

    &.is-disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &:focus {
        outline: none;
    }
}

.select-value {
    white-space: nowrap;
}

.select-arrow {
    flex-shrink: 0;
    transition: transform 0.2s ease;
    color: currentColor;
    opacity: 0.6;

    &.rotate-180 {
        transform: rotate(180deg);
    }
}

.select-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    border: 1px solid;
    border-top: none;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 50;
    max-height: 200px;
    overflow-y: auto;

    &.dropdown-dark {
        background: #2d2d2d;
        border-color: #4a4a4a;
    }

    &.dropdown-light {
        background: white;
        border-color: #d1d5db;
    }
}

.select-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    cursor: pointer;
    border-radius: 6px;
    margin: 2px 4px;
    transition: background-color 0.15s ease;

    .dropdown-dark & {
        &:hover:not(.is-disabled) {
            background-color: #1f1f1f;
        }

        &:active:not(.is-disabled) {
            background-color: #171717;
        }

        &.is-selected {
            background-color: transparent;

            &:hover {
                background-color: #1f1f1f;
            }
        }
    }

    .dropdown-light & {
        &:hover:not(.is-disabled) {
            background-color: #f3f4f6;
        }

        &:active:not(.is-disabled) {
            background-color: #e5e7eb;
        }

        &.is-selected {
            background-color: transparent;

            &:hover {
                background-color: #f3f4f6;
            }
        }
    }

    &.is-disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    &.has-delete {
        padding-right: 4px;
    }
}

.option-label {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    white-space: nowrap;

    .dropdown-dark & {
        color: #d1d5db;
    }

    .dropdown-light & {
        color: #515A65;
    }

    &.empty-option-label {
        color: #9CA3AF;
    }
}

.option-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.delete-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: none;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    opacity: 0;
    color: #9CA3AF;

    .select-option:hover & {
        opacity: 1;
    }

    &:hover {
        background-color: #FEE2E2;
        color: #EF4444;
    }
}
</style>
