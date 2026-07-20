import ExcelJS from 'exceljs';

export interface SuratRowExport {
  nomorSurat?: string | null;
  pengirim?: string | null;
  tanggalSurat?: string | null;
  tanggalPengajuan?: string | null;
  bidang?: string | null;
  perihal?: string | null;
  klasifikasi?: string | null;
  kodeKlasifikasi?: string | null;
  status?: string | null;
}

export async function exportSuratToExcel(data: SuratRowExport[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Rekap Surat');

  // Header
  sheet.mergeCells('A1:F1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'REKAPITULASI NOMOR SURAT DISKOMINFO';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFDC2626' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.mergeCells('A2:F2');
  const dateCell = sheet.getCell('A2');
  dateCell.value = `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })}`;
  dateCell.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.addRow([]); // empty row 3

  // Columns definition (without headers so exceljs doesn't overwrite row 1)
  sheet.columns = [
    { key: 'nomorSurat', width: 35 },
    { key: 'tanggalSurat', width: 18 },
    { key: 'perihal', width: 45 },
    { key: 'pemohon', width: 25 },
    { key: 'bidang', width: 25 },
    { key: 'tanggalPengajuan', width: 18 },
  ];

  // Manually add Header row at Row 4
  const headerRow = sheet.getRow(4);
  headerRow.values = [
    'Nomor surat',
    'Tanggal surat',
    'Perihal',
    'Pemohon',
    'Bidang',
    'Tanggal pengajuan'
  ];
  headerRow.height = 25;
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  
  // Style Header Cells
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDC2626' }, // Red-600
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF991B1B' } },
      left: { style: 'thin', color: { argb: 'FF991B1B' } },
      bottom: { style: 'medium', color: { argb: 'FF991B1B' } },
      right: { style: 'thin', color: { argb: 'FF991B1B' } },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Add data rows
  data.forEach((row) => {
    let formattedTglPengajuan = '-';
    if (row.tanggalPengajuan) {
      try {
        formattedTglPengajuan = new Date(row.tanggalPengajuan).toLocaleDateString('id-ID', {
          day: '2-digit', month: '2-digit', year: 'numeric'
        });
      } catch {
        formattedTglPengajuan = row.tanggalPengajuan;
      }
    }

    let formattedTglSurat = '-';
    if (row.tanggalSurat) {
      try {
        formattedTglSurat = new Date(row.tanggalSurat).toLocaleDateString('id-ID', {
          day: '2-digit', month: '2-digit', year: 'numeric'
        });
      } catch {
        formattedTglSurat = row.tanggalSurat;
      }
    }

    sheet.addRow({
      nomorSurat: row.nomorSurat || '-',
      tanggalSurat: formattedTglSurat,
      perihal: row.perihal || '-',
      pemohon: row.pengirim || '-',
      bidang: row.bidang || '-',
      tanggalPengajuan: formattedTglPengajuan,
    });
  });

  // Style data rows (Row 5+)
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 4) {
      row.height = 20;
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
          left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
          bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
          right: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        };
        // Alternating row colors
        if (rowNumber % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' }, // Gray-50
          };
        }
        // Center align Nomor, Tanggal Surat, Bidang, Tanggal Pengajuan
        if (colNumber === 1 || colNumber === 2 || colNumber === 5 || colNumber === 6) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
      });
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rekap_Surat_Diskominfo_${Date.now()}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
