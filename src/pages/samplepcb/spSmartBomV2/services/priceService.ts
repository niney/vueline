import { PcbItem, Price } from "@/model/sp-smart-bom-params";

// 패키지 우선순위
const PKG_PRIORITY = ['Cut', 'Digi', 'Bulk', 'Tape'];

/**
 * 가격 포맷팅
 */
export const formatPrice = (price: number | null | undefined): string => {
    if (price == null) return '0';
    return price.toLocaleString();
};

/**
 * 패키지 옵션 목록 (Cut Tape 우선)
 */
export const getPriceOptions = (item: PcbItem): Price[] => {
    const prices = item.parts?.prices || [];
    return [...prices].sort((a, b) => {
        const aIsCT = a.pkg?.toLowerCase().includes('cut tape') || a.pkg?.toUpperCase() === 'CT';
        const bIsCT = b.pkg?.toLowerCase().includes('cut tape') || b.pkg?.toUpperCase() === 'CT';
        if (aIsCT && !bIsCT) return -1;
        if (!aIsCT && bIsCT) return 1;
        return 0;
    });
};

/**
 * 가격 단계의 최소 수량 반환
 */
export const getPriceSteps = (price: Price | { breakQuantity?: number }): number => {
    if ('priceSteps' in price && price.priceSteps?.length) {
        return price.priceSteps[0].breakQuantity;
    }
    return (price as { breakQuantity?: number }).breakQuantity || 1;
};

/**
 * 수량에 맞는 가격 단계 찾기
 */
export const findMatchingPriceStep = (item: PcbItem, qty: number) => {
    const prices = item.parts?.prices;
    if (!prices?.length) return null;

    for (const price of prices) {
        const steps = [...price.priceSteps].sort((a, b) => b.breakQuantity - a.breakQuantity);
        for (const step of steps) {
            if (qty >= step.breakQuantity) {
                return { price, step };
            }
        }
    }
    // 최소 단계 반환
    const firstPrice = prices[0];
    const minStep = firstPrice.priceSteps[0];
    return { price: firstPrice, step: minStep };
};

/**
 * 아이템 수량 업데이트 및 가격 계산
 */
export const updateItemQty = (item: PcbItem, qty: number): void => {
    const prices = item.parts?.prices;
    if (prices?.length) {
        const match = findMatchingPriceStep(item, qty);
        if (match) {
            item.selectedPrice = {
                pkg: match.price.pkg,
                breakQuantity: match.step.breakQuantity,
                unitPrice: match.step.unitPrice,
                qty,
                moq: match.price.moq,
                stock: match.price.stock
            };
        }
    } else if (item.parts?.price1) {
        item.selectedPrice = {
            pkg: item.parts.partsPackaging || 'Cut Tape (CT)',
            breakQuantity: 1,
            unitPrice: item.parts.price1,
            qty,
            moq: item.parts.moq || 1,
            stock: 0
        };
    }
};

/**
 * 초기 가격 설정 (패키지 우선순위 기반)
 */
export const updateSelectedPrice = (item: PcbItem): void => {
    if (!item.parts || (!item.parts.prices && !item.parts.price1)) {
        item.selectedPrice = undefined;
        return;
    }

    const qty = item.selectedPrice?.qty || item.qty || 1;

    // price1만 있는 경우
    if (!item.parts.prices) {
        item.selectedPrice = {
            pkg: 'Cut Tape (CT)',
            breakQuantity: 1,
            unitPrice: item.parts.price1 || 0,
            qty: qty,
            moq: 1,
            stock: 0
        };
        return;
    }

    // 패키지 우선순위로 정렬
    const sortedPrices = [...item.parts.prices].sort((a, b) => {
        const aIndex = PKG_PRIORITY.findIndex(pkg => a.pkg.includes(pkg));
        const bIndex = PKG_PRIORITY.findIndex(pkg => b.pkg.includes(pkg));
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    for (const price of sortedPrices) {
        if (!price.priceSteps?.length) continue;
        const sortedSteps = [...price.priceSteps].sort((a, b) => b.breakQuantity - a.breakQuantity);

        for (const step of sortedSteps) {
            if (qty >= step.breakQuantity) {
                item.selectedPrice = {
                    pkg: price.pkg,
                    breakQuantity: step.breakQuantity,
                    unitPrice: step.unitPrice,
                    qty: qty,
                    moq: price.moq,
                    stock: price.stock
                };
                return;
            }
        }
    }

    // 기본값
    item.selectedPrice = {
        pkg: '',
        breakQuantity: 0,
        unitPrice: 0,
        qty: qty,
        moq: 1,
        stock: 0
    };
};

/**
 * 활성 가격 범위 확인
 */
export const isActiveRange = (item: PcbItem, price: Price, step: { breakQuantity: number }): boolean => {
    return item.selectedPrice?.pkg === price.pkg &&
        item.selectedPrice?.breakQuantity === step.breakQuantity;
};

/**
 * 단일 가격 활성 확인
 */
export const isActiveSingleRange = (item: PcbItem): boolean => {
    return !!item.selectedPrice?.qty;
};

/**
 * MOQ 미달 확인
 */
export const isUnderMoq = (item: PcbItem): boolean => {
    if (!item.selectedPrice) return false;
    return item.selectedPrice.qty < item.selectedPrice.moq;
};

/**
 * MOQ 반환
 */
export const getMoq = (item: PcbItem): number => {
    return item.selectedPrice?.moq || 1;
};

/**
 * 계산된 총 가격
 */
export const getCalculatedPrice = (item: PcbItem): number => {
    if (!item.selectedPrice) return 0;
    return item.selectedPrice.unitPrice * item.selectedPrice.qty;
};
