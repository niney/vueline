import * as XLSX from 'xlsx';
import { PcbItem } from "@/model/sp-smart-bom-params";
import { generateHash, loadFromCache, saveToCache } from "./cacheService";

export interface ExcelData {
    fileName: string;
    fileSize: number;
    sheets: SheetData[];
}

export interface SheetData {
    name: string;
    range: {
        startRow: number;
        endRow: number;
        startCol: number;
        endCol: number;
    };
    cells: CellData[];
}

export interface CellData {
    address: string;
    row: number;
    col: number;
    formatted: string;
    raw: any;
    type: string;
    format: string;
    formula: string;
    style: any;
}

export interface ProcessResult {
    result: PcbItem[];
    fromCache: boolean;
}

/**
 * 엑셀 파일 파싱
 */
export const parseExcelFile = (data: ArrayBuffer, file: File): ExcelData => {
    const workbook = XLSX.read(data, {
        type: 'array',
        cellStyles: true,
        cellFormula: true,
        cellDates: true,
        raw: false
    });

    const excelData: ExcelData = {
        fileName: file.name,
        fileSize: file.size,
        sheets: []
    };

    workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');

        const sheetData: SheetData = {
            name: sheetName,
            range: {
                startRow: range.s.r,
                endRow: range.e.r,
                startCol: range.s.c,
                endCol: range.e.c
            },
            cells: []
        };

        for (let row = range.s.r; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                const cell = worksheet[cellAddress];
                if (cell) {
                    sheetData.cells.push({
                        address: cellAddress,
                        row,
                        col,
                        formatted: cell.w || '',
                        raw: cell.v,
                        type: cell.t || 'z',
                        format: cell.z || '',
                        formula: cell.f || '',
                        style: cell.s || null
                    });
                }
            }
        }
        excelData.sheets.push(sheetData);
    });

    return excelData;
};

/**
 * BOM 분석 API 호출
 */
export const analyzeBom = async (file: File, excelData: ExcelData, apiUrl: string): Promise<PcbItem[]> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('excelData', JSON.stringify(excelData));

    const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('API 요청 실패');
    }

    return response.json();
};

/**
 * 파일 처리 (캐시 확인 → 파싱 → API 호출)
 */
export const processFile = async (file: File, apiUrl: string): Promise<ProcessResult> => {
    const data = await file.arrayBuffer();
    const contentHash = await generateHash(data);

    // 캐시 확인
    const cachedResult = loadFromCache(file.name, contentHash);
    if (cachedResult) {
        console.log('캐시에서 결과 로드:', file.name);
        return { result: cachedResult, fromCache: true };
    }

    // 엑셀 파싱
    const excelData = parseExcelFile(data, file);

    // API 호출
    const result = await analyzeBom(file, excelData, apiUrl);

    // 캐시 저장
    saveToCache(file.name, contentHash, excelData, result);
    console.log('캐시 저장 완료:', file.name);

    return { result, fromCache: false };
};
