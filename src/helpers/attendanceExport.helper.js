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
  const d = new Date(date);
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const m = String(minutes).padStart(2, '0');
  return `${h}:${m} ${ampm}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${String(d.getUTCDate()).padStart(2, '0')} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
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
      bodyCell(formatDate(r.date)),
      bodyCell(formatTime(r.checkInTime)),
      bodyCell(formatTime(r.checkOutTime)),
      bodyCell(r.totalWorkedHours != null ? `${Math.floor(r.totalWorkedHours)}h ${Math.round((r.totalWorkedHours % 1) * 60)}m` : '—'),
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
