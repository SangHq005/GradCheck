import { Student } from '../types';

export const parseCSV = (content: string, source: 'club' | 'school'): Student[] => {
  const lines = content.split(/\r\n|\n/).map(l => l.trim()).filter(l => l);
  if (lines.length === 0) return [];

  // Detect if the first line looks like a header or data
  // Heuristic: Check if first line contains common header keywords or looks like an ID
  const firstLine = lines[0].toLowerCase();
  const hasHeader = firstLine.includes('mssv') || firstLine.includes('id') || firstLine.includes('mã') || firstLine.includes('name') || firstLine.includes('tên');

  let startIndex = 0;
  let idIndex = 0;
  let nameIndex = 1;
  let majorIndex = 2;

  if (hasHeader) {
    startIndex = 1;
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    // Try to identify column indices dynamically
    const foundId = headers.findIndex(h => h.includes('mssv') || h.includes('id') || h.includes('mã'));
    const foundName = headers.findIndex(h => h.includes('tên') || h.includes('name') || h.includes('họ'));
    const foundMajor = headers.findIndex(h => h.includes('ngành') || h.includes('khoa') || h.includes('major'));

    if (foundId !== -1) idIndex = foundId;
    if (foundName !== -1) nameIndex = foundName;
    if (foundMajor !== -1) majorIndex = foundMajor;
  } else {
    // If no header, assume it's a raw list. 
    // If single column, it's ID. If multiple, Col 0 is ID.
    startIndex = 0;
    idIndex = 0;
  }

  const students: Student[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle simple list (no commas) or CSV
    let values: string[] = [];
    if (line.includes(',')) {
       values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
    } else {
       // Treat the whole line as the ID if no commas found
       values = [line];
    }

    // Must have at least an ID
    if (values.length <= idIndex) continue;

    const id = values[idIndex];
    // If name index exceeds bounds, use empty string or ID as placeholder
    const fullName = (values.length > nameIndex) ? values[nameIndex] : ''; 
    const major = (values.length > majorIndex) ? values[majorIndex] : undefined;
    
    if (id) {
      students.push({
        id: id.toString().trim(),
        fullName: fullName,
        major: major,
        source,
        raw: { originalLine: line }
      });
    }
  }

  return students;
};