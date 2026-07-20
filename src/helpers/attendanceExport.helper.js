const {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  WidthType,
  BorderStyle,
} = require('docx');

const CELL_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
};

const formatTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const headerCell = (text) =>
  new TableCell({
    borders: CELL_BORDER,
    shading: { fill: '0F0F10' },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 18 })] })],
  });

const bodyCell = (text) =>
  new TableCell({
    borders: CELL_BORDER,
    children: [new Paragraph({ children: [new TextRun({ text: String(text ?? '—'), size: 18 })] })],
  });

/**
 * Build a .docx buffer for an attendance report.
 * @param {{ title: string, subtitle: string, records: any[], showEmployeeColumn?: boolean }} opts
 */
const buildAttendanceDocx = async ({ title, subtitle, records, showEmployeeColumn = true }) => {
  const columns = [
    ...(showEmployeeColumn ? ['Employee', 'Department'] : []),
    'Date',
    'Check-In',
    'Check-Out',
    'Worked Hrs',
    'Status',
    'Approval',
  ];

  const headerRow = new TableRow({ children: columns.map(headerCell) });

  const rows = records.map((r) => {
    const employee = r.employeeId?.name || r.employeeId?.email || '—';
    const department = r.employeeId?.department || '—';
    const cells = [
      ...(showEmployeeColumn ? [bodyCell(employee), bodyCell(department)] : []),
      bodyCell(r.date),
      bodyCell(formatTime(r.checkInTime)),
      bodyCell(formatTime(r.checkOutTime)),
      bodyCell(r.totalWorkedHours != null ? r.totalWorkedHours : '—'),
      bodyCell(r.attendanceStatus),
      bodyCell(r.approvalStatus),
    ];
    return new TableRow({ children: cells });
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
          new Paragraph({
            children: [new TextRun({ text: subtitle, italics: true, color: '555555' })],
            spacing: { after: 240 },
          }),
          records.length === 0
            ? new Paragraph({ text: 'No attendance records found for the selected filters.' })
            : new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [headerRow, ...rows],
              }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
};

module.exports = { buildAttendanceDocx };
