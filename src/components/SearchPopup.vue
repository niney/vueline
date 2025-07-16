<template>
    <div v-if="isOpen" class="search-popup-overlay">
        <div class="search-popup">
            <div class="search-popup-header">
                <h3>제품 검색</h3>
                <button class="close-btn" @click="close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="search-popup-content">
                <div class="search-input-container">
                    <input
                        type="text"
                        v-model="searchQuery"
                        placeholder="전자부품 번호(P/N)로 검색하세요!"
                        @keyup.enter="search"
                        class="search-input"
                        ref="searchInput"
                    >
                    <button class="search-btn" @click="search">검색</button>
                </div>
                
                <div v-if="isSearching" class="loading-container">
                    <div class="spinner"></div>
                    <p>검색 중...</p>
                </div>
                
                <div v-else-if="searchResults.length > 0" class="search-results">
                    <SearchResultsTable 
                        :pcbItems="searchResults"
                        :showCartButton="false"
                        :showSelectButton="true"
                        @addToCart="selectItem"
                        @selectItem="selectItem"
                    />
                </div>
                
                <div v-else-if="searchPerformed" class="no-results">
                    <p>검색 결과가 없습니다.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick, watch } from 'vue';
import { PcbItem, Part } from '@/model/sp-smart-bom-params';
import SearchResultsTable from '@/components/SearchResultsTable.vue';
import { SAMPLEPCB_URL } from '@/app-constants';

export default defineComponent({
    name: 'SearchPopup',
    components: {
        SearchResultsTable
    },
    props: {
        isOpen: {
            type: Boolean,
            required: true
        },
        currentItem: {
            type: Object as () => PcbItem,
            default: null
        },
        itemIndex: {
            type: Number,
            default: -1
        },
        searchServerUrl: {
            type: String,
            required: true
        }
    },
    emits: ['close', 'select-item'],
    setup(props, { emit }) {
        const searchQuery = ref('');
        const searchResults = ref<PcbItem[]>([]);
        const isSearching = ref(false);
        const searchPerformed = ref(false);
        const searchInput = ref<HTMLInputElement | null>(null);
        
        watch(() => props.isOpen, (isOpen) => {
            if (isOpen) {
                // 팝업이 열리면 입력 필드에 포커스
                nextTick(() => {
                    if (searchInput.value) {
                        searchInput.value.focus();
                    }
                    
                    // 현재 아이템의 부품번호가 있으면 자동으로 설정
                    if (props.currentItem?.part_number?.[0]) {
                        searchQuery.value = props.currentItem.part_number[0];
                    }
                });
            } else {
                // 팝업이 닫히면 검색 초기화
                searchQuery.value = '';
                searchResults.value = [];
                searchPerformed.value = false;
            }
        });
        
        const search = () => {
            if (!searchQuery.value.trim()) {
                alert('검색어를 입력해주세요.');
                return;
            }
            
            isSearching.value = true;
            searchResults.value = [];
            
            $.ajax({
                url: props.searchServerUrl,
                type: 'GET',
                data: {
                    q: searchQuery.value,
                    qf: 'parsing'
                },
                success: (response) => {
                    if (response.result && response.data) {
                        searchResults.value = response.data.map((item: Part) => ({
                            increment_number: [''],
                            number: [''],
                            package: [''],
                            part_number: [item.partName],
                            part_number_candidate: [item.partName],
                            reference_value: props.currentItem?.reference_value || '',
                            row_idx: props.currentItem?.row_idx || 0,
                            value: [''],
                            values: props.currentItem?.values || {},
                            parts: item,
                            selectedPrice: {
                                qty: 1,
                                pkg: 'Cut Tape (CT)',
                                breakQuantity: 1,
                                unitPrice: item.price1 || 0,
                                moq: item.moq || 1,
                                stock: 0
                            }
                        }));
                    }
                    isSearching.value = false;
                    searchPerformed.value = true;
                },
                error: (error) => {
                    console.error('검색 오류:', error);
                    isSearching.value = false;
                    searchPerformed.value = true;
                }
            });
        };
        
        const close = () => {
            emit('close');
        };
        
        const selectItem = (item: PcbItem) => {
            emit('select-item', item, props.itemIndex);
            close();
        };
        
        return {
            searchQuery,
            searchResults,
            isSearching,
            searchPerformed,
            searchInput,
            search,
            close,
            selectItem
        };
    }
});
</script>

<style lang="scss" scoped>
.search-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.search-popup {
    width: 90%;
    max-width: 1200px;
    height: 90vh;
    background-color: white;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.search-popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #e8e8e8;
    
    h3 {
        margin: 0;
        font-size: 18px;
        font-weight: bold;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #999;
        
        &:hover {
            color: #333;
        }
    }
}

.search-popup-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
}

.search-input-container {
    display: flex;
    margin-bottom: 24px;
    
    .search-input {
        flex: 1;
        padding: 10px 16px;
        border: 1px solid #d9d9d9;
        border-radius: 4px 0 0 4px;
        font-size: 16px;
        
        &:focus {
            outline: none;
            border-color: #40a9ff;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
    }
    
    .search-btn {
        padding: 10px 20px;
        background-color: #1890ff;
        color: white;
        border: none;
        border-radius: 0 4px 4px 0;
        cursor: pointer;
        font-size: 16px;
        
        &:hover {
            background-color: #40a9ff;
        }
    }
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 50px 0;
    
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-left-color: #1890ff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
    }
    
    p {
        color: #666;
        font-size: 16px;
    }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.no-results {
    text-align: center;
    padding: 50px 0;
    color: #666;
    font-size: 16px;
}

.search-results {
    margin-top: 16px;
}
</style> 