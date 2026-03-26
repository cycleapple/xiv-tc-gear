/** FFXIV game constants and TC translations */

// ─── Jobs ────────────────────────────────────────────────────────────────

export const ALL_COMBAT_JOBS = [
  'PLD', 'WAR', 'DRK', 'GNB',
  'WHM', 'SCH', 'AST', 'SGE',
  'MNK', 'DRG', 'NIN', 'SAM', 'RPR', 'VPR',
  'BRD', 'MCH', 'DNC',
  'BLM', 'SMN', 'RDM', 'PCT', 'BLU',
] as const;

export type JobName = typeof ALL_COMBAT_JOBS[number];

export const JOB_ROLES: Record<string, JobName[]> = {
  '坦克': ['PLD', 'WAR', 'DRK', 'GNB'],
  '治療': ['WHM', 'SCH', 'AST', 'SGE'],
  '近戰': ['MNK', 'DRG', 'NIN', 'SAM', 'RPR', 'VPR'],
  '遠程': ['BRD', 'MCH', 'DNC'],
  '法師': ['BLM', 'SMN', 'RDM', 'PCT', 'BLU'],
};

export const JOB_DISPLAY_NAMES: Record<JobName, string> = {
  PLD: '騎士', WAR: '戰士', DRK: '暗黑騎士', GNB: '絕槍戰士',
  WHM: '白魔導士', SCH: '學者', AST: '占星術士', SGE: '賢者',
  MNK: '武僧', DRG: '龍騎士', NIN: '忍者', SAM: '武士', RPR: '鐮刀師', VPR: '蝮蛇劍士',
  BRD: '吟遊詩人', MCH: '機工士', DNC: '舞者',
  BLM: '黑魔導士', SMN: '召喚師', RDM: '赤魔導士', PCT: '繪靈法師', BLU: '青魔導士',
};

export const JOB_ABBREVIATIONS_TC: Record<JobName, string> = {
  PLD: '騎', WAR: '戰', DRK: '暗', GNB: '槍',
  WHM: '白', SCH: '學', AST: '占', SGE: '賢',
  MNK: '僧', DRG: '龍', NIN: '忍', SAM: '侍', RPR: '鐮', VPR: '蝮',
  BRD: '詩', MCH: '機', DNC: '舞',
  BLM: '黑', SMN: '召', RDM: '赤', PCT: '繪', BLU: '青',
};

/** XIVAPI job icon URLs (062000 series) */
export const JOB_ICONS: Record<JobName, string> = {
  PLD: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062119_hr1.tex?format=png',
  WAR: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062121_hr1.tex?format=png',
  DRK: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062132_hr1.tex?format=png',
  GNB: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062137_hr1.tex?format=png',
  WHM: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062124_hr1.tex?format=png',
  SCH: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062128_hr1.tex?format=png',
  AST: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062133_hr1.tex?format=png',
  SGE: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062140_hr1.tex?format=png',
  MNK: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062120_hr1.tex?format=png',
  DRG: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062122_hr1.tex?format=png',
  NIN: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062130_hr1.tex?format=png',
  SAM: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062134_hr1.tex?format=png',
  RPR: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062139_hr1.tex?format=png',
  VPR: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062141_hr1.tex?format=png',
  BRD: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062123_hr1.tex?format=png',
  MCH: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062131_hr1.tex?format=png',
  DNC: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062138_hr1.tex?format=png',
  BLM: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062125_hr1.tex?format=png',
  SMN: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062127_hr1.tex?format=png',
  RDM: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062135_hr1.tex?format=png',
  PCT: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062142_hr1.tex?format=png',
  BLU: 'https://beta.xivapi.com/api/1/asset/ui/icon/062000/062136_hr1.tex?format=png',
};

// ─── Stats ───────────────────────────────────────────────────────────────

export type RawStatKey =
  | 'strength' | 'dexterity' | 'vitality' | 'intelligence' | 'mind'
  | 'crit' | 'dhit' | 'determination' | 'skillspeed' | 'spellspeed'
  | 'tenacity' | 'piety'
  | 'hp' | 'wdPhys' | 'wdMag' | 'defensePhys' | 'defenseMag'
  | 'weaponDelay' | 'gearHaste';

export const MAIN_STATS = ['strength', 'dexterity', 'intelligence', 'mind'] as const;
export const SUB_STATS = ['crit', 'dhit', 'determination', 'skillspeed', 'spellspeed', 'tenacity', 'piety'] as const;
export const MATERIA_STATS = ['crit', 'dhit', 'determination', 'skillspeed', 'spellspeed', 'tenacity', 'piety'] as const;

export const STAT_FULL_NAMES: Record<string, string> = {
  crit: '暴擊', defenseMag: '魔法防禦力', defensePhys: '物理防禦力',
  determination: '信念', dexterity: '靈巧', dhit: '直擊',
  hp: 'HP', intelligence: '智力', mind: '精神',
  piety: '信仰', skillspeed: '技能速度', spellspeed: '詠唱速度',
  strength: '力量', tenacity: '堅韌', vitality: '耐力',
  wdMag: '魔法基本性能', wdPhys: '物理基本性能', weaponDelay: '攻擊間隔',
  gearHaste: '加速',
};

export const STAT_ABBREVIATIONS: Record<string, string> = {
  crit: '暴擊', defenseMag: '魔防', defensePhys: '物防',
  determination: '信念', dexterity: '靈巧', dhit: '直擊',
  hp: 'HP', intelligence: '智力', mind: '精神',
  piety: '信仰', skillspeed: '技速', spellspeed: '詠速',
  strength: '力量', tenacity: '堅韌', vitality: '耐力',
  wdMag: '魔傷', wdPhys: '物傷', weaponDelay: '間隔',
  gearHaste: '加速',
};

/** Convert BaseParam ID to stat key */
export function statById(id: number): RawStatKey | undefined {
  switch (id) {
    case 1: return 'strength';
    case 2: return 'dexterity';
    case 3: return 'vitality';
    case 4: return 'intelligence';
    case 5: return 'mind';
    case 6: return 'piety';
    case 7: return 'hp';
    case 12: return 'wdPhys';
    case 13: return 'wdMag';
    case 19: return 'tenacity';
    case 21: return 'defensePhys';
    case 22: return 'dhit';
    case 24: return 'defenseMag';
    case 27: return 'crit';
    case 44: return 'determination';
    case 45: return 'skillspeed';
    case 46: return 'spellspeed';
    case 47: return 'gearHaste';
    default: return undefined;
  }
}

/** Convert stat key to BaseParam ID */
export function statToId(stat: RawStatKey): number | undefined {
  const map: Partial<Record<RawStatKey, number>> = {
    strength: 1, dexterity: 2, vitality: 3, intelligence: 4, mind: 5,
    piety: 6, hp: 7, wdPhys: 12, wdMag: 13, tenacity: 19,
    defensePhys: 21, dhit: 22, defenseMag: 24, crit: 27,
    determination: 44, skillspeed: 45, spellspeed: 46, gearHaste: 47,
  };
  return map[stat];
}

// ─── Equip Slots ─────────────────────────────────────────────────────────

export type EquipSlotKey =
  | 'Weapon' | 'OffHand' | 'Head' | 'Body' | 'Hand'
  | 'Legs' | 'Feet' | 'Ears' | 'Neck' | 'Wrist'
  | 'RingLeft' | 'RingRight';

export const EQUIP_SLOTS: EquipSlotKey[] = [
  'Weapon', 'OffHand', 'Head', 'Body', 'Hand',
  'Legs', 'Feet', 'Ears', 'Neck', 'Wrist',
  'RingLeft', 'RingRight',
];

export const SLOT_DISPLAY_NAMES: Record<EquipSlotKey, string> = {
  Weapon: '武器', OffHand: '副手', Head: '頭部', Body: '身體',
  Hand: '手部', Legs: '腿部', Feet: '腳部', Ears: '耳飾',
  Neck: '項鍊', Wrist: '手鐲', RingLeft: '戒指(左)', RingRight: '戒指(右)',
};

/** Map slot key to EquipSlotCategory field */
export function slotMatchesCategory(slot: EquipSlotKey, cat: Record<string, number>): boolean {
  switch (slot) {
    case 'Weapon': return (cat.mainHand ?? 0) > 0;
    case 'OffHand': return (cat.offHand ?? 0) > 0;
    case 'Head': return (cat.head ?? 0) > 0;
    case 'Body': return (cat.body ?? 0) > 0;
    case 'Hand': return (cat.gloves ?? 0) > 0;
    case 'Legs': return (cat.legs ?? 0) > 0;
    case 'Feet': return (cat.feet ?? 0) > 0;
    case 'Ears': return (cat.ears ?? 0) > 0;
    case 'Neck': return (cat.neck ?? 0) > 0;
    case 'Wrist': return (cat.wrists ?? 0) > 0;
    case 'RingLeft':
    case 'RingRight': return (cat.fingerL ?? 0) > 0 || (cat.fingerR ?? 0) > 0;
    default: return false;
  }
}

// ─── Materia ─────────────────────────────────────────────────────────────

export const MATERIA_SLOTS_MAX = 5;
export const MATERIA_LEVEL_MAX_NORMAL = 12;
export const MATERIA_LEVEL_MAX_OVERMELD = 11;

// ─── Item Level ──────────────────────────────────────────────────────────

export const MIN_ILVL_ITEMS = 290;
export const MIN_ILVL_FOOD = 430;
export const MAX_ILVL = 999;

// ─── Supported Levels ────────────────────────────────────────────────────

export const SUPPORTED_LEVELS = [70, 80, 90, 100] as const;
export type SupportedLevel = typeof SUPPORTED_LEVELS[number];
export const CURRENT_MAX_LEVEL = 100;

// ─── Acquisition Source TC Names ─────────────────────────────────────────

export const ACQUISITION_SOURCE_NAMES: Record<string, string> = {
  NormalRaid: '普通副本',
  SavageRaid: '零式副本',
  Tome: '神典石裝',
  AugTome: '強化神典石裝',
  Crafted: '製作裝',
  AugCrafted: '強化製作裝',
  Relic: '肝武',
  Dungeon: '迷宮',
  ExtremeTrial: '極蠻神',
  Ultimate: '絕本',
  Artifact: 'AF裝',
  AllianceRaid: '聯盟副本',
  Criterion: '異聞',
  DeepDungeon: '深層迷宮',
  FieldOperation: '攻城戰',
  Other: '其他',
  Custom: '自訂',
  Unknown: '不明',
};

// ─── Race ────────────────────────────────────────────────────────────────

export const RACE_DISPLAY_NAMES: Record<string, string> = {
  Midlander: '中原之民', Highlander: '高地之民',
  Wildwood: '森林之民', Duskwight: '黑影之民',
  Plainsfolk: '平原之民', Dunesfolk: '沙丘之民',
  'Seekers of the Sun': '逐日之民', 'Keepers of the Moon': '護月之民',
  'Sea Wolf': '北洋之民', Hellsguard: '紅焰之民',
  Raen: '晝之民', Xaela: '夜之民',
  Rava: '拉巴族', Veena: '維娜族',
  Helion: '日光之民', 'The Lost': '迷途之民',
};
