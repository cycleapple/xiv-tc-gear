/**
 * Generate local items JSON from ffxiv-datamining EN CSVs.
 * Replaces the broken data.xivgear.app API.
 *
 * Usage: tsx scripts/generate-items-data.mts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const dataminingEn = process.argv[2] || 'E:/FFXIV/XIVLauncher/ffxiv-datamining/csv/en';
const dataminingJa = 'E:/FFXIV/XIVLauncher/ffxiv-datamining/csv/ja';
const MIN_ILVL = 690;

// Combat jobs from constants.ts
const COMBAT_JOBS = [
  'PLD','WAR','DRK','GNB','WHM','SCH','AST','SGE',
  'MNK','DRG','NIN','SAM','RPR','VPR','BRD','MCH','DNC',
  'BLM','SMN','RDM','PCT','BLU',
];
// Base classes that map to jobs
const BASE_TO_JOB: Record<string, string> = {
  GLA: 'PLD', MRD: 'WAR', CNJ: 'WHM', THM: 'BLM',
  PGL: 'MNK', LNC: 'DRG', ARC: 'BRD', ROG: 'NIN', ACN: 'SMN',
};

/**
 * Parse CSV with 1 header row (EN datamining format).
 * Returns header + data rows.
 */
function parseCSV(filePath: string): { header: string[]; rows: string[][] } {
  const content = readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
  const allRows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < content.length && content[i + 1] === '"') {
          field += '"'; i++;
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
        row.push(field); field = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && i + 1 < content.length && content[i + 1] === '\n') i++;
        row.push(field); field = '';
        if (row.length > 1) allRows.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
  }
  if (row.length > 0 || field.length > 0) {
    row.push(field);
    if (row.length > 1) allRows.push(row);
  }

  return { header: allRows[0] || [], rows: allRows.slice(1) };
}

// Build column index map from header
function colMap(header: string[]): Record<string, number> {
  const m: Record<string, number> = {};
  header.forEach((h, i) => { m[h] = i; });
  return m;
}

// --- Parse EquipSlotCategory.csv ---
console.log('Parsing EquipSlotCategory.csv...');
const eqSlot = parseCSV(join(dataminingEn, 'EquipSlotCategory.csv'));
const eqSlotCol = colMap(eqSlot.header);
const equipSlotMap: Record<number, Record<string, number>> = {};
for (const row of eqSlot.rows) {
  const id = parseInt(row[eqSlotCol['#']]);
  if (isNaN(id)) continue;
  equipSlotMap[id] = {
    mainHand: parseInt(row[eqSlotCol['MainHand']]) || 0,
    offHand: parseInt(row[eqSlotCol['OffHand']]) || 0,
    head: parseInt(row[eqSlotCol['Head']]) || 0,
    body: parseInt(row[eqSlotCol['Body']]) || 0,
    gloves: parseInt(row[eqSlotCol['Gloves']]) || 0,
    legs: parseInt(row[eqSlotCol['Legs']]) || 0,
    feet: parseInt(row[eqSlotCol['Feet']]) || 0,
    ears: parseInt(row[eqSlotCol['Ears']]) || 0,
    neck: parseInt(row[eqSlotCol['Neck']]) || 0,
    wrists: parseInt(row[eqSlotCol['Wrists']]) || 0,
    fingerL: parseInt(row[eqSlotCol['FingerL']]) || 0,
    fingerR: parseInt(row[eqSlotCol['FingerR']]) || 0,
  };
}
console.log(`  ${Object.keys(equipSlotMap).length} slot categories`);

// --- Parse ClassJobCategory.csv ---
console.log('Parsing ClassJobCategory.csv...');
const cjc = parseCSV(join(dataminingEn, 'ClassJobCategory.csv'));
const cjcCol = colMap(cjc.header);
const classJobCatMap: Record<number, string[]> = {};
for (const row of cjc.rows) {
  const id = parseInt(row[cjcCol['#']]);
  if (isNaN(id)) continue;
  const jobs: string[] = [];
  for (const job of COMBAT_JOBS) {
    // Check job column directly
    if (cjcCol[job] !== undefined && row[cjcCol[job]] === 'True') {
      jobs.push(job);
      continue;
    }
    // Check base class columns
    for (const [base, mapped] of Object.entries(BASE_TO_JOB)) {
      if (mapped === job && cjcCol[base] !== undefined && row[cjcCol[base]] === 'True') {
        if (!jobs.includes(job)) jobs.push(job);
      }
    }
  }
  classJobCatMap[id] = jobs;
}
console.log(`  ${Object.keys(classJobCatMap).length} job categories`);

// --- Parse JA Item.csv for Japanese names ---
console.log('Parsing JA Item.csv for Japanese names...');
const jaItem = parseCSV(join(dataminingJa, 'Item.csv'));
const jaCol = colMap(jaItem.header);
const jaNames: Record<number, string> = {};
for (const row of jaItem.rows) {
  const id = parseInt(row[jaCol['#']]);
  const name = row[jaCol['Name'] ?? 4];
  if (!isNaN(id) && name) jaNames[id] = name;
}
console.log(`  ${Object.keys(jaNames).length} JA names`);

// --- Parse EN Item.csv ---
console.log('Parsing EN Item.csv...');
const enItem = parseCSV(join(dataminingEn, 'Item.csv'));
const c = colMap(enItem.header);

// Icon URL helper
function iconUrl(iconId: number): string {
  const padded = iconId.toString().padStart(6, '0');
  const dir = padded.slice(0, 3) + '000';
  return `https://beta.xivapi.com/api/1/asset/ui/icon/${dir}/${padded}_hr1.tex?format=png`;
}

interface OutputItem {
  primaryKey: number;
  rowId: number;
  ilvl: number;
  name: string;
  nameTranslations: { en: string; ja: string };
  icon: { url: string };
  equipSlotCategory: Record<string, number> & { primaryKey: number };
  damageMag: number;
  damagePhys: number;
  damageMagHQ: number;
  damagePhysHQ: number;
  delayMs: number;
  materiaSlotCount: number;
  advancedMeldingPermitted: boolean;
  canBeHq: boolean;
  unique: boolean;
  rarity: number;
  equipLevel: number;
  defensePhys: number;
  defenseMag: number;
  defensePhysHQ: number;
  defenseMagHQ: number;
  baseParamMap: Record<string, number>;
  baseParamMapHQ: Record<string, number>;
  baseParamMapSpecial: Record<string, number>;
  classJobs: string[];
  acquisitionSource: number;
}

const items: OutputItem[] = [];

for (const row of enItem.rows) {
  const id = parseInt(row[c['#']]);
  if (isNaN(id)) continue;

  const ilvl = parseInt(row[c['LevelItem']]) || 0;
  if (ilvl < MIN_ILVL) continue;

  const name = row[c['Name']] || '';
  if (!name) continue;

  const eqSlotCatId = parseInt(row[c['EquipSlotCategory']]) || 0;
  if (eqSlotCatId === 0) continue;

  const slotCat = equipSlotMap[eqSlotCatId];
  if (!slotCat) continue;

  // Must be equippable in a combat gear slot
  const isEquipSlot = slotCat.mainHand || slotCat.offHand || slotCat.head ||
    slotCat.body || slotCat.gloves || slotCat.legs || slotCat.feet ||
    slotCat.ears || slotCat.neck || slotCat.wrists || slotCat.fingerL || slotCat.fingerR;
  if (!isEquipSlot) continue;

  const classJobCatId = parseInt(row[c['ClassJobCategory']]) || 0;
  const classJobs = classJobCatMap[classJobCatId] || [];
  if (classJobs.length === 0) continue;

  const damagePhys = parseInt(row[c['DamagePhys']]) || 0;
  const damageMag = parseInt(row[c['DamageMag']]) || 0;
  const defensePhys = parseInt(row[c['DefensePhys']]) || 0;
  const defenseMag = parseInt(row[c['DefenseMag']]) || 0;
  const delayMs = parseInt(row[c['Delayms']]) || 0;
  const materiaSlotCount = parseInt(row[c['MateriaSlotCount']]) || 0;
  const advancedMelding = row[c['IsAdvancedMeldingPermitted']] === 'True';
  const canBeHq = row[c['CanBeHq']] === 'True';
  const unique = row[c['IsUnique']] === 'True';
  const rarity = parseInt(row[c['Rarity']]) || 0;
  const equipLevel = parseInt(row[c['LevelEquip']]) || 0;
  const iconId = parseInt(row[c['Icon']]) || 0;

  // Build base param map
  const baseParamMap: Record<string, number> = {};
  for (let i = 0; i < 6; i++) {
    const paramId = parseInt(row[c[`BaseParam[${i}]`]]) || 0;
    const paramVal = parseInt(row[c[`BaseParamValue[${i}]`]]) || 0;
    if (paramId > 0 && paramVal > 0) {
      baseParamMap[paramId.toString()] = paramVal;
    }
  }

  const baseParamMapSpecial: Record<string, number> = {};
  for (let i = 0; i < 6; i++) {
    const paramId = parseInt(row[c[`BaseParamSpecial[${i}]`]]) || 0;
    const paramVal = parseInt(row[c[`BaseParamValueSpecial[${i}]`]]) || 0;
    if (paramId > 0 && paramVal > 0) {
      baseParamMapSpecial[paramId.toString()] = paramVal;
    }
  }

  // Derive acquisition source heuristic
  let acquisitionSource = 15; // Unknown
  if (canBeHq && advancedMelding) acquisitionSource = 4; // Crafted
  else if (materiaSlotCount === 2 && !advancedMelding) {
    if (name.startsWith('Augmented')) acquisitionSource = 3; // AugTome
    else acquisitionSource = 1; // SavageRaid or Tome (2 = Tome)
  }
  else if (materiaSlotCount === 0 && !advancedMelding) acquisitionSource = 0; // NormalRaid

  items.push({
    primaryKey: id,
    rowId: id,
    ilvl,
    name,
    nameTranslations: { en: name, ja: jaNames[id] || '' },
    icon: { url: iconUrl(iconId) },
    equipSlotCategory: { primaryKey: eqSlotCatId, ...slotCat },
    damageMag,
    damagePhys,
    damageMagHQ: damageMag,
    damagePhysHQ: damagePhys,
    delayMs,
    materiaSlotCount,
    advancedMeldingPermitted: advancedMelding,
    canBeHq,
    unique,
    rarity,
    equipLevel,
    defensePhys,
    defenseMag,
    defensePhysHQ: defensePhys,
    defenseMagHQ: defenseMag,
    baseParamMap,
    baseParamMapHQ: baseParamMap,
    baseParamMapSpecial,
    classJobs,
    acquisitionSource,
  });
}

console.log(`  ${items.length} items with ilvl >= ${MIN_ILVL}`);

// --- Write output ---
const outputPath = resolve('src/lib/data/items-data.json');
writeFileSync(outputPath, JSON.stringify(items), 'utf-8');
const sizeMB = (Buffer.byteLength(JSON.stringify(items)) / 1024 / 1024).toFixed(2);
console.log(`Written items-data.json (${items.length} items, ${sizeMB} MB)`);
console.log('Done!');
