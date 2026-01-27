import { PcbItem } from "@/model/sp-smart-bom-params";

const STORAGE_KEY = 'spSmartBomV2_cache';

interface CacheData {
    fileName: string;
    contentHash: string;
    excelData: any;
    result: PcbItem[];
    timestamp: number;
}

/**
 * 파일 내용 해시 생성 (SHA-256)
 */
export const generateHash = async (data: ArrayBuffer): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * 캐시 저장
 */
export const saveToCache = (name: string, hash: string, excelData: any, result: PcbItem[]): void => {
    const cacheData: CacheData = {
        fileName: name,
        contentHash: hash,
        excelData,
        result,
        timestamp: Date.now()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
};

/**
 * 캐시 불러오기 (파일명 + 해시 일치 시)
 */
export const loadFromCache = (name: string, hash: string): PcbItem[] | null => {
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (!cached) return null;

    try {
        const data: CacheData = JSON.parse(cached);
        if (data.fileName === name && data.contentHash === hash) {
            return data.result;
        }
    } catch (e) {
        console.error('캐시 파싱 오류:', e);
    }
    return null;
};

/**
 * 캐시 삭제
 */
export const clearCache = (): void => {
    sessionStorage.removeItem(STORAGE_KEY);
};
