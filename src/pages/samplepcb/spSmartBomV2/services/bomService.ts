import * as XLSX from 'xlsx';
import { PcbItem, BomUploadFileInfo } from "@/model/sp-smart-bom-params";
import { generateHash, loadFromCache, saveToCache } from "./cacheService";
import { FILE_SERVER_URL } from "@/app-constants";

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
    fileInfo: BomUploadFileInfo | null;
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

        // 빈 행 제거: 데이터가 있는 마지막 행까지만 유지
        const nonEmptyRows = new Set<number>();
        sheetData.cells.forEach((cell) => {
            if (cell.formatted && cell.formatted.toString().trim() !== '') {
                nonEmptyRows.add(cell.row);
            }
        });

        if (nonEmptyRows.size > 0) {
            const maxNonEmptyRow = Math.max(...Array.from(nonEmptyRows));
            sheetData.cells = sheetData.cells.filter((cell) => cell.row <= maxNonEmptyRow);
            sheetData.range.endRow = maxNonEmptyRow;
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
        return { result: cachedResult.result, fromCache: true, fileInfo: cachedResult.fileInfo };
    }

    // 엑셀 파싱
    const excelData = parseExcelFile(data, file);

    // API 호출
    const result = await analyzeBom(file, excelData, apiUrl);

    // 파일 서버에 업로드
    let fileInfo: BomUploadFileInfo | null = null;
    try {
        const uploadResult = await uploadBomFile(file);
        console.log('[BOM 파일 업로드] 성공:', uploadResult);
        if (uploadResult?.result && uploadResult.data?.length > 0) {
            fileInfo = uploadResult.data[0];
        }
    } catch (err) {
        console.error('[BOM 파일 업로드] 실패:', err);
    }

    // 캐시 저장 (fileInfo 포함)
    saveToCache(file.name, contentHash, excelData, result, fileInfo);
    console.log('캐시 저장 완료:', file.name);

    return { result, fromCache: false, fileInfo };
};

/**
 * BOM 파일 업로드 (파일 서버에 저장)
 */
export interface BomUploadResponse {
    result: boolean;
    data: BomUploadFileInfo[];
}

export const uploadBomFile = async (file: File): Promise<BomUploadResponse> => {
    const form = new FormData();
    form.append('serviceType', 'bom');
    form.append('files', file, file.name);

    const response = await fetch(`${FILE_SERVER_URL}/api/uploadFileByAnonymous`, {
        method: 'POST',
        body: form
    });

    if (!response.ok) {
        throw new Error(`업로드 실패: ${response.statusText}`);
    }

    return response.json();
};
