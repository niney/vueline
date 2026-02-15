import { VueCommonParams } from "./vue-common-params";

interface PriceStep {
    breakQuantity: number;
    unitPrice: number;
}

export interface Price {
    distributor: string | null;
    moq: number;
    pkg: string;
    priceSteps: PriceStep[];
    sku: string;
    stock: number;
    updatedDate: string | null;
}

export interface Part {
    condenser: {
        field1: string | null;
        field2: string | null;
        field3: string | null;
        field4: string | null;
        field5: string | null;
        field6: string | null;
        field7: string | null;
        field8: string | null;
    } | null;
    contents: string | null;
    current: {
        field1: string | null;
        field2: string | null;
        field3: string | null;
        field4: string | null;
        field5: string | null;
        field6: string | null;
        field7: string | null;
        field8: string | null;
    } | null;
    dateCode: string | null;
    description: string | null;
    highlight?: {
        "condenser.field2.keyword"?: string[];
        "voltage.field1.keyword"?: string[];
        "condenser.field3.keyword"?: string[];  // Add this line
        "condenser.field4.keyword"?: string[];
        "condenser.field1.keyword"?: string[];
        "voltage.field3.keyword"?: string[];
        "voltage.field2.keyword"?: string[];
        "current.field1.keyword"?: string[];
        "inductor.field6.keyword"?: string[];
        "ohm.field4.keyword"?: string[];
    };
    id: string;
    images: string | null;
    inductor: {
        field1: string | null;
        field2: string | null;
        field3: string | null;
        field4: string | null;
        field5: string | null;
        field6: string | null;
        field7: string | null;
        field8: string | null;
    } | null;
    inventoryLevel: number | null;
    largeCategory: string;
    lastModifiedDate: string | number;
    managerEmail: string | null;
    managerName: string | null;
    managerPhoneNumber: string | null;
    manufacturerName: string;
    mediumCategory: string;
    memberId: string | null;
    memo: string | null;
    moq: number | null;
    new: boolean;
    offerName: string | null;
    ohm: {
        field1: string | null;
        field2: string | null;
        field3: string | null;
        field4: string | null;
        field5: string | null;
        field6: string | null;
        field7: string | null;
        field8: string | null;
    } | null;
    packaging: {
        field1: string | null;
        field2: string | null;
        field3: string | null;
        field4: string | null;
        field5: string | null;
        field6: string | null;
        field7: string | null;
        field8: string | null;
    } | null;
    partName: string;
    partsPackaging: string | null;
    photoUrl?: string | null;
    price: number | null;
    price1: number | null;
    price2: number | null;
    price3: number | null;
    price4: number | null;
    price5: number | null;
    prices: Price[] | null;
    productName: string | null;
    serviceType: string | null;
    size: string | null;
    smallCategory: string | null;
    specs: string | null;
    status: number | null;
    subServiceType: string | null;
    temperature: string | null;
    tolerance: {
        field1: string | null;
        field2: string | null;
        field3: string | null;
        field4: string | null;
        field5: string | null;
        field6: string | null;
        field7: string | null;
        field8: string | null;
    } | null;
    voltage: {
        field1: string | null;
        field2: string | null;
        field3: string | null;
        field4: string | null;
        field5: string | null;
        field6: string | null;
        field7: string | null;
        field8: string | null;
    } | null;
    watt: {
        field1: string | null;
        field2: string | null;
        field3: string | null;
        field4: string | null;
        field5: string | null;
        field6: string | null;
        field7: string | null;
        field8: string | null;
    } | null;
    writeDate: string | number;
    _id?: string;
    _index?: string;
    _score?: number;
}

interface Value {
    normalized_value: number | number[];
    unit: string | null;
    value: string;
}

export interface PriceInfo {
    pkg: string;
    breakQuantity: number;
    unitPrice: number;
}

export interface PcbItem {
    increment_number: string[];
    number: string[];
    package: string[];
    part_number?: string[];
    part_number_candidate: string[];
    reference_value?: string;
    parts?: Part;
    reference_prefix: string | null;
    row_idx: number;
    is_pcb?: boolean;
    search_value?: {
        capacitance?: string;
        resistance?: string;
    };
    value: string[];
    values: {
        capacitance?: Value;
        current?: Value;
        error_range?: Value;
        frequency?: Value;
        resistance?: Value;
        voltage?: Value;
        size?: Value;
        power?: Value;
    };
    qty?: number | null;
    selectedPrice?: {
        pkg: string;
        breakQuantity: number;
        unitPrice: number;
        qty: number;
        moq: number;
        stock: number;
    };
    priceOverride?: {
        unitPrice: number;
        appliedAt: string;
    };
}

export interface OrderSummary {
    fileName: string;
    quantity: number;
    expectedDelivery: string;
    totalAmount: number;
    shippingFee: number;
    managementFee: number;
    finalAmount: number;
}

export interface BomUploadFileInfo {
    uploadFileName: string;
    originFileName: string;
    pathToken: string;
    size: number;
}

export interface OrderSummaryV2 {
    fileInfo: BomUploadFileInfo | null;
    quantity: number;
    expectedDelivery: string;
    totalAmount: number;
    shippingFee: number;
    managementFee: number;
    finalAmount: number;
    discount?: number;
    memo?: string;
}

export interface MarginSummary {
    totalCost: number;
    totalMargin: number;
    marginPercent: number;
}

interface CartItem {
    ct_id: string;
    it_id: string;
    it_name: string;
    it_basic: string;  // JSON string
    ct_price: string;
    ct_point: string;
    ct_qty: string;
    ct_status: string;
    ct_send_cost: string;
    it_sc_type: string;
    ca_id: string;
    ca_id2: string;
    ca_id3: string;
    qty: string;
    file: string;
    menu: string;
    it_23: string;
    it_24: string;
    it_file1: string;
    it_explan: string;
    it_file1_exist: boolean;
}

interface CartBasicInfo {
    originPrice: number;
    marginPercent: string;
    marginPrice: number;
    transferCost: number;
}

interface CartApiResponse {
    result: boolean;
    data: CartItem[];
}

export interface SpSmartBomParams extends VueCommonParams {
    onRequestQuote?: (selectedItems: PcbItem[], orderSummary: OrderSummary) => void;
    onAddToCart?: (selectedItems: PcbItem[], orderSummary: OrderSummary, cartData: CartItem) => void;
    onSave?: (selectedItems: PcbItem[], orderSummary: OrderSummary, cartData: CartItem) => void;
    searchServerUrl?: string;
    mlServerUrl?: string;
    cartApiUrl?: string;
}

export interface SpSmartBomDetailParams extends VueCommonParams {
    searchServerUrl?: string;
    mlServerUrl?: string;
    partId: string;
}

export interface SpSmartBomV2Params extends VueCommonParams {
    searchServerUrl?: string;
    mlServerUrl?: string;
    cartApiUrl?: string;
    onRequestQuote?: (selectedItems: PcbItem[], orderSummary: OrderSummaryV2) => void;
    onAddToCart?: (selectedItems: PcbItem[], orderSummary: OrderSummaryV2, cartData: CartItem) => void;
    onSave?: (selectedItems: PcbItem[], orderSummary: OrderSummaryV2, cartData: CartItem) => void;
}

// 모든 인터페이스 export
export type { CartItem, CartBasicInfo, CartApiResponse };
