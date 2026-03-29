/** API response types matching data.xivgear.app */

export interface XivApiLangValueString {
  en: string;
  de: string;
  fr: string;
  ja: string;
  tc?: string;
}

export interface Icon {
  url: string;
}

export interface EquipSlotCategory {
  primaryKey: number;
  mainHand: number;
  offHand: number;
  head: number;
  body: number;
  gloves: number;
  legs: number;
  feet: number;
  ears: number;
  neck: number;
  wrists: number;
  fingerL: number;
  fingerR: number;
}

export enum GearAcquisitionSource {
  NormalRaid = 'NormalRaid',
  SavageRaid = 'SavageRaid',
  Tome = 'Tome',
  AugTome = 'AugTome',
  Crafted = 'Crafted',
  AugCrafted = 'AugCrafted',
  Relic = 'Relic',
  Dungeon = 'Dungeon',
  ExtremeTrial = 'ExtremeTrial',
  Ultimate = 'Ultimate',
  Artifact = 'Artifact',
  AllianceRaid = 'AllianceRaid',
  Criterion = 'Criterion',
  DeepDungeon = 'DeepDungeon',
  FieldOperation = 'FieldOperation',
  Other = 'Other',
  Custom = 'Custom',
  Unknown = 'Unknown',
}

export interface Item {
  primaryKey: number;
  rowId: number;
  ilvl: number;
  name: string;
  nameTranslations: XivApiLangValueString;
  icon: Icon;
  equipSlotCategory: EquipSlotCategory;
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
  acquisitionSource: GearAcquisitionSource;
  // TC name injected at runtime (may be CN fallback)
  tcName?: string;
  isCnFallback?: boolean;
}

export interface ItemsEndpointResponse {
  items: Item[];
}

export interface FoodStatBonus {
  percentage: number;
  max: number;
}

export interface Food {
  primaryKey: number;
  rowId: number;
  name: string;
  nameTranslations: XivApiLangValueString;
  icon: Icon;
  levelItem: number;
  bonuses: Record<string, FoodStatBonus>;
  bonusesHQ: Record<string, FoodStatBonus>;
  foodItemId: number;
  // TC name injected at runtime (may be CN fallback)
  tcName?: string;
  isCnFallback?: boolean;
}

export interface FoodEndpointResponse {
  items: Food[];
}

export interface MateriaItem {
  primaryKey: number;
  name: string;
  nameTranslations: XivApiLangValueString;
  icon: Icon;
  ilvl: number;
}

export interface Materia {
  primaryKey: number;
  rowId: number;
  item: MateriaItem[];
  value: number[];
  baseParam: number;
}

export interface MateriaEndpointResponse {
  items: Materia[];
}

export interface ClassJob {
  primaryKey: number;
  abbreviation: string;
  abbreviationTranslations: XivApiLangValueString;
  nameTranslations: XivApiLangValueString;
  modifierDexterity: number;
  modifierHitPoints: number;
  modifierIntelligence: number;
  modifierMind: number;
  modifierPiety: number;
  modifierStrength: number;
  modifierVitality: number;
}

export interface JobEndpointResponse {
  items: ClassJob[];
}

export interface BaseParam {
  primaryKey: number;
  name: string;
  twoHandWeaponPercent: number;
  oneHandWeaponPercent: number;
  offHandPercent: number;
  headPercent: number;
  chestPercent: number;
  handsPercent: number;
  legsPercent: number;
  feetPercent: number;
  earringPercent: number;
  necklacePercent: number;
  braceletPercent: number;
  ringPercent: number;
  meldParam: number[];
}

export interface BaseParamEndpointResponse {
  items: BaseParam[];
}

export interface ItemLevel {
  primaryKey: number;
  criticalHit: number;
  defense: number;
  determination: number;
  dexterity: number;
  directHitRate: number;
  HP: number;
  intelligence: number;
  magicDefense: number;
  magicalDamage: number;
  mind: number;
  physicalDamage: number;
  piety: number;
  skillSpeed: number;
  spellSpeed: number;
  strength: number;
  tenacity: number;
  vitality: number;
}

export interface ItemLevelEndpointResponse {
  items: ItemLevel[];
}
