/**
 * Generate Traditional Chinese and Simplified Chinese name mappings
 * from ffxiv-datamining-tc and ffxiv-datamining-cn CSV files.
 * Outputs JSON files for use by the Next.js app.
 *
 * Usage: tsx scripts/generate-tc-data.mts [path-to-datamining-tc] [path-to-datamining-cn]
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import * as OpenCC from 'opencc-js';

const dataminingPath = process.argv[2] || 'E:/FFXIV/XIVLauncher/ffxiv-datamining-tc';
const dataminingCnPath = process.argv[3] || 'E:/FFXIV/XIVLauncher/ffxiv-datamining-cn';

/**
 * Parse a CSV file, handling quoted fields with commas and newlines inside.
 * Skips the first 3 header rows (datamining format).
 */
function parseCSV(filePath: string): string[][] {
  const content = readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let headerRowsSkipped = 0;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < content.length && content[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field);
        field = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && i + 1 < content.length && content[i + 1] === '\n') {
          i++;
        }
        row.push(field);
        field = '';
        if (headerRowsSkipped < 3) {
          headerRowsSkipped++;
        } else if (row.length > 1) {
          rows.push(row);
        }
        row = [];
      } else {
        field += ch;
      }
    }
  }
  if (row.length > 0 || field.length > 0) {
    row.push(field);
    if (headerRowsSkipped >= 3 && row.length > 1) {
      rows.push(row);
    }
  }
  return rows;
}

// --- Item names ---
console.log('Processing Item.csv...');
const itemRows = parseCSV(join(dataminingPath, 'Item.csv'));
const itemNames: Record<number, string> = {};
let itemCount = 0;
for (const row of itemRows) {
  const id = parseInt(row[0]);
  const name = row[10];
  if (isNaN(id) || !name || name === '') continue;
  itemNames[id] = name;
  itemCount++;
}
console.log(`  Found ${itemCount} items with names`);

// --- ClassJob names ---
console.log('Processing ClassJob.csv...');
const jobRows = parseCSV(join(dataminingPath, 'ClassJob.csv'));
const jobNames: Record<string, string> = {};
const jobAbbreviations: Record<string, string> = {};
for (const row of jobRows) {
  const id = parseInt(row[0]);
  const name = row[1];
  const abbr = row[2];
  if (isNaN(id) || !name || !abbr) continue;
  jobNames[abbr] = name;
  jobAbbreviations[id.toString()] = abbr;
}
console.log(`  Found ${Object.keys(jobNames).length} jobs`);

// --- CN Item names (Simplified Chinese → Traditional Chinese conversion) ---
console.log('Processing CN Item.csv...');
const s2t = OpenCC.Converter({ from: 'cn', to: 'tw' });
const cnItemRows = parseCSV(join(dataminingCnPath, 'Item.csv'));
const cnItemNames: Record<number, string> = {};
let cnItemCount = 0;
for (const row of cnItemRows) {
  const id = parseInt(row[0]);
  const name = row[10];
  if (isNaN(id) || !name || name === '') continue;
  cnItemNames[id] = s2t(name);
  cnItemCount++;
}
console.log(`  Found ${cnItemCount} CN items with names (converted to Traditional)`);

// --- Write output ---
const outputDir = resolve('src/lib/data');
mkdirSync(outputDir, { recursive: true });

writeFileSync(
  join(outputDir, 'tc-items.json'),
  JSON.stringify(itemNames),
  'utf-8'
);
console.log(`Written tc-items.json (${itemCount} items)`);

writeFileSync(
  join(outputDir, 'cn-items.json'),
  JSON.stringify(cnItemNames),
  'utf-8'
);
console.log(`Written cn-items.json (${cnItemCount} items)`);

writeFileSync(
  join(outputDir, 'tc-jobs.json'),
  JSON.stringify(jobNames, null, 2),
  'utf-8'
);
console.log(`Written tc-jobs.json (${Object.keys(jobNames).length} jobs)`);

console.log('\nDone!');
