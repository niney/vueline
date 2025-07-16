import { ref, PropType, watch } from 'vue';
import { PcbItem, Price } from '@/model/sp-smart-bom-params';

export const useAnalysisTableComposable = {
    props: {
        pcbItems: {
            type: Array as PropType<(PcbItem & { selected?: boolean, selectedPkg?: string })[]>,
            required: true
        },
        selectAll: {
            type: Boolean,
            required: true
        },
        isEditMode: {
            type: Boolean,
            default: false
        }
    },
    setup(props: any, emit: any) {
        const selectAllValue = ref(props.selectAll);

        watch(() => props.selectAll, (newVal) => {
            selectAllValue.value = newVal;
        });

        const toggleAll = () => {
            props.pcbItems.forEach((item: PcbItem & { selected?: boolean }) => {
                item.selected = selectAllValue.value;
            });
            emit('update:selectAll', selectAllValue.value);
        };

        const updateSelectAll = () => {
            const allSelected = props.pcbItems.every((item: PcbItem & { selected?: boolean }) => item.selected);
            selectAllValue.value = allSelected;
            emit('update:selectAll', allSelected);
        };

        const isActiveRange = (product: PcbItem, price: Price, step: any): boolean => {
            if (!product.selectedPrice) return false;

            // 선택된 가격 정보와 현재 가격 정보가 같은지 확인
            if (product.selectedPrice.pkg !== price.pkg) return false;

            // 현재 수량이 이 가격 범위에 해당하는지 확인
            const qty = product.selectedPrice.qty;

            // 가격 단계를 수량 기준으로 오름차순 정렬
            const sortedSteps = [...price.priceSteps].sort((a, b) => a.breakQuantity - b.breakQuantity);

            // 현재 단계의 인덱스 찾기
            const currentIndex = sortedSteps.findIndex(s => s.breakQuantity === step.breakQuantity);
            const nextStep = sortedSteps[currentIndex + 1]; // 다음 단계

            // 현재 단계의 최소 수량보다 크거나 같고, 다음 단계의 최소 수량보다 작은 경우
            if (nextStep) {
                return qty >= step.breakQuantity && qty < nextStep.breakQuantity;
            } else {
                // 마지막 단계인 경우
                return qty >= step.breakQuantity;
            }
        };

        const isActiveSingleRange = (product: PcbItem): boolean => {
            return !!product.selectedPrice && product.selectedPrice.qty > 0;
        };

        const updatePriceStep = (product: PcbItem, price: Price, step: any) => {
            // 현재 선택된 가격 정보가 있고, 같은 패키지이고, 같은 가격 단계인 경우 업데이트
            if (product.selectedPrice &&
                product.selectedPrice.pkg === price.pkg &&
                product.selectedPrice.breakQuantity === step.breakQuantity) {
                product.selectedPrice.unitPrice = step.unitPrice;
                // 수량이 이미 설정되어 있으면 가격 재계산
                if (product.selectedPrice.qty > 0) {
                    updateProductPrice(product, product.selectedPrice.qty);
                }
            }
            emit('update:pcbItems', props.pcbItems);
        };

        const updateSinglePrice = (product: PcbItem) => {
            if (product.selectedPrice && product.parts?.price1) {
                product.selectedPrice.unitPrice = product.parts.price1;
                // 수량이 이미 설정되어 있으면 가격 재계산
                if (product.selectedPrice.qty > 0) {
                    updateProductPrice(product, product.selectedPrice.qty);
                }
            }
            emit('update:pcbItems', props.pcbItems);
        };

        const updateQtyFromSelect = (product: PcbItem, price: Price | null, event: Event) => {
            if (!price && event.target && product.parts?.prices) {
                const target = event.target as HTMLSelectElement;
                const selectedOption = target.options[target.selectedIndex];
                const pIndex = parseInt(selectedOption.getAttribute('data-index') || '0');
                if (!isNaN(pIndex) && pIndex >= 0 && pIndex < product.parts.prices.length) {
                    price = product.parts.prices[pIndex];
                } else {
                    return; // 유효하지 않은 인덱스인 경우 함수 종료
                }
            }

            if (!price) return; // price가 여전히 null이면 함수 종료

            const target = event.target as HTMLSelectElement;
            const qty = parseInt(target.value);
            if (!isNaN(qty)) {
                product.selectedPrice = {
                    pkg: price.pkg,
                    breakQuantity: qty,
                    unitPrice: price.priceSteps.find(step => step.breakQuantity === qty)?.unitPrice || 0,
                    qty: qty,
                    moq: price.moq,
                    stock: price.stock
                };
            } else {
                product.selectedPrice = undefined;
            }
            emit('update:pcbItems', props.pcbItems);
        };

        const updateQty = (product: PcbItem, event: Event) => {
            const value = (event.target as HTMLInputElement).value;
            const qty = parseInt(value) || 0;
            updateProductPrice(product, qty);
            emit('update:pcbItems', props.pcbItems);
        };

        const updateProductPrice = (product: PcbItem, qty: number) => {
            if (!product.selectedPrice) {
                product.selectedPrice = {
                    pkg: '',
                    breakQuantity: 0,
                    unitPrice: 0,
                    qty,
                    moq: 1,
                    stock: 0
                };
                return;
            }

            // 기존 pkg 유지
            const currentPkg = product.selectedPrice.pkg;
            product.selectedPrice.qty = qty;

            // 가격 업데이트
            if (product.parts?.prices) {
                const priceInfo = product.parts.prices.find(p => p.pkg === currentPkg);
                if (priceInfo?.priceSteps) {
                    // 수량에 맞는 가격 구간 찾기
                    const sortedSteps = [...priceInfo.priceSteps].sort((a, b) => b.breakQuantity - a.breakQuantity);
                    for (const step of sortedSteps) {
                        if (qty >= step.breakQuantity) {
                            product.selectedPrice.breakQuantity = step.breakQuantity;
                            product.selectedPrice.unitPrice = step.unitPrice;
                            product.selectedPrice.moq = priceInfo.moq;
                            product.selectedPrice.stock = priceInfo.stock;
                            return;
                        }
                    }
                }
            } else if (product.parts?.price1) {
                // price1만 있는 경우
                product.selectedPrice.breakQuantity = 1;
                product.selectedPrice.unitPrice = product.parts.price1;
                product.selectedPrice.moq = product.parts.moq || 1;
                product.selectedPrice.stock = 0;
            }
        };

        const isUnderMoq = (product: PcbItem): boolean => {
            const { selectedPrice, parts } = product;
            if (!selectedPrice || !parts?.prices) return false;

            const priceInfo = parts.prices.find(p => p.pkg === selectedPrice.pkg);
            return priceInfo ? selectedPrice.qty < priceInfo.moq : false;
        };

        const getMoq = (product: PcbItem): number => {
            if (!product.parts?.prices || !product.selectedPrice) return 0;
            const selectedPrice = product.parts.prices.find(p => p.pkg === product.selectedPrice?.pkg);
            return selectedPrice?.moq || 0;
        };

        const getCalculatedPrice = (product: PcbItem): number | null => {
            if (!product.selectedPrice) return null;
            return product.selectedPrice.qty * product.selectedPrice.unitPrice;
        };

        const formatPrice = (price: number | null): string => {
            if (price === null) return '-';
            return new Intl.NumberFormat('ko-KR').format(price);
        };

        return {
            selectAllValue,
            toggleAll,
            updateSelectAll,
            isActiveRange,
            isActiveSingleRange,
            updatePriceStep,
            updateSinglePrice,
            updateQtyFromSelect,
            updateQty,
            isUnderMoq,
            getMoq,
            getCalculatedPrice,
            formatPrice,
            // handlePkgChange
        };
    }
}; 