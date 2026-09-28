export type EraId = 'BC_65M' | 'AD_600' | 'AD_1000' | 'AD_2300' | 'END_OF_TIME';

export type ElementType = 'physical' | 'lightning' | 'fire' | 'water' | 'shadow';

export interface TechSkill {
  id: string;
  name: string;
  jpName?: string;
  description: string;
  mpCost: number;
  damageMultiplier: number;
  element: ElementType;
  target: 'single' | 'all' | 'ally_single' | 'ally_all';
  healAmount?: number;
  requiredLevel: number;
}

export interface ComboTech {
  id: string;
  name: string;
  type: 'dual' | 'triple';
  requiredCharacterIds: string[];
  requiredSkillIds: string[];
  mpCosts: Record<string, number>; // characterId -> mpCost
  damageMultiplier: number;
  element: ElementType;
  target: 'single' | 'all';
  healAmount?: number;
  description: string;
  visualEffect: 'fire_vortex' | 'aurora_slash' | 'ice_blade' | 'antipode_blast' | 'delta_storm' | 'rocket_rush' | 'chrono_supernova';
}

export interface Character {
  id: string;
  name: string;
  title: string;
  weapon: string;
  element: ElementType;
  color: string;
  avatarBg: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  spd: number;
  magic: number;
  atb: number; // 0 to 100
  skills: TechSkill[];
  status: 'alive' | 'ko';
}

export interface EnemyAction {
  name: string;
  type: 'attack' | 'tech' | 'charge';
  damage: number;
  element?: ElementType;
  dialogue?: string;
}

export interface Enemy {
  id: string;
  name: string;
  title: string;
  era: EraId;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  atb: number;
  expYield: number;
  goldYield: number;
  elementalWeakness?: ElementType;
  elementalResistance?: ElementType;
  actions: EnemyAction[];
  spriteIcon: string;
  isBoss?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'consumable' | 'key_item' | 'equipment';
  quantity: number;
  healHp?: number;
  healMp?: number;
  revive?: boolean;
  effectDescription?: string;
}

export interface CausalityEvent {
  id: string;
  sourceEra: EraId;
  targetEra: EraId;
  title: string;
  pastAction: string;
  futureConsequence: string;
  isCompleted: boolean;
  unlockedItemOrPerk?: string;
}

export interface EraInfo {
  id: EraId;
  name: string;
  timePeriod: string;
  subtitle: string;
  description: string;
  image: string;
  bgGradient: string;
  themeMusicType: 'prehistoric' | 'medieval' | 'present' | 'future' | 'end_of_time';
  landmarks: {
    id: string;
    name: string;
    description: string;
    icon: string;
    actionType: 'explore' | 'talk' | 'boss' | 'butterfly';
    completed?: boolean;
  }[];
}

export interface StoryChoice {
  text: string;
  consequenceText: string;
  nextStepId?: string;
  butterflyKey?: string;
  rewardItem?: string;
  startBattleEnemyId?: string;
  teleportEra?: EraId;
}

export interface StoryStep {
  id: string;
  era: EraId;
  speaker: string;
  title: string;
  dialogue: string;
  characterVisual?: string;
  choices: StoryChoice[];
  isCustomActionAllowed?: boolean;
}

export interface BattleLogEntry {
  id: string;
  text: string;
  type: 'action' | 'damage' | 'heal' | 'combo' | 'system' | 'critical';
  timestamp: number;
}

export interface GameEnding {
  id: string;
  title: string;
  condition: string;
  description: string;
  unlocked: boolean;
  tag: string;
}
