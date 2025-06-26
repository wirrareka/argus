import * as XLSX from "exceljs";
import axios from "axios";
import {_GSPS2PDF} from "@/lib/worker-init.ts";

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiYXBwbGljYXRpb24iLCJjb21wYW55X2lkIjoiNWNhNTU4YWUtOTRhMy00Yzk1LWJkNzctNzMzOWIyMzY1MDI1IiwiY29tcGFueV9jb2RlIjoiYXJndXMiLCJpYXQiOjE3NTA3NzQzNzIsInN1YiI6IlN0aWNrZXJzIn0.nhpb4y_k81khngzIGI3MuBRhVDUtE9dzPf6fFv3wtEo';

export type Sticker = {
  code: string
  barcode: string
  prefix: string
}

export const getPDF = async (templateId: string, stickers: Sticker[]) => {
  const payload = {
    data: {
      stickers
    }
  };

  const url = `https://render.quanto.sk/api/renders/${templateId}.pdf?return_type=document&regenerate=true`;

  const response = await axios.post(url, payload, {
    responseType: 'blob',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  // Vytvor blob URL z response dát
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);

  // gs start
  const dataObject = {psDataURL: blobUrl, pages: stickers.length};
  const element = await _GSPS2PDF(dataObject) as string | URL;
  const {pdfURL, size} = await loadPDFData(element as string);
  return { pdfURL, size };
}

export const triggerDownload = (blobUrl: string, filename: string) => {
  // Vytvor dočasný link element pre download

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;

  // Pridaj do DOM, klikni a odstráň
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Vyčisti blob URL
  URL.revokeObjectURL(blobUrl);
};


export interface ParseResult {
  data: (string | number | null)[];
  error?: string;
}

export const parseExcelFirstColumn = async (files: FileList | null): Promise<ParseResult> => {
  try {
    // Skontroluj či sú súbory vybrané
    if (!files || files.length === 0) {
      return { data: [], error: 'Žiadny súbor nebol vybraný' };
    }

    const file = files[0];

    // Skontroluj typ súboru
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      return { data: [], error: 'Neplatný typ súboru. Podporované sú iba .xlsx a .xls súbory' };
    }

    // Vytvor workbook a načítaj súbor
    const workbook = new XLSX.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    // Získaj prvý worksheet
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      return { data: [], error: 'Excel súbor neobsahuje žiadne worksheety' };
    }

    const firstColumnData: (string | number | null)[] = [];

    // Iteruj cez riadky a získaj hodnoty z prvého stĺpca
    worksheet.eachRow((row) => {
      const cellValue = row.getCell(1).value;

      // Spracuj hodnotu bunky
      if (cellValue === null || cellValue === undefined) {
        firstColumnData.push(null);
      } else if (typeof cellValue === 'object' && 'richText' in cellValue) {
        // Pre rich text objekty - extrahuj text zo všetkých častí
        const richTextParts = cellValue.richText as Array<{ text: string }>;
        const combinedText = richTextParts.map(part => part.text).join('');
        firstColumnData.push(combinedText);
      } else if (typeof cellValue === 'object' && 'result' in cellValue) {
        // Pre formula objekty
        firstColumnData.push((cellValue as {result: string}).result);
      } else if (typeof cellValue === 'object' && 'hyperlink' in cellValue) {
        // Pre hyperlink objekty
        firstColumnData.push((cellValue as {text: string}).text || (cellValue as {hyperlink: string}).hyperlink);
      } else {
        firstColumnData.push(cellValue as string | number);
      }
    });

    return { data: firstColumnData };

  } catch (error) {
    console.error('Chyba pri parsovaní Excel súboru:', error);
    return {
      data: [],
      error: `Chyba pri parsovaní súboru: ${error instanceof Error ? error.message : 'Neznáma chyba'}`
    };
  }
};

export function loadPDFData(response: string): Promise<{pdfURL: string, size: number}> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", response);
    xhr.responseType = "arraybuffer";
    xhr.onload = function () {
      window.URL.revokeObjectURL(response);
      const blob = new Blob([xhr.response], {type: "application/pdf"});
      const pdfURL = window.URL.createObjectURL(blob);
      const size = xhr.response.byteLength;
      resolve({pdfURL, size});
    };
    xhr.send();
  });
}
