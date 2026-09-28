import { InventoryItem } from '../types/game';

export const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 'potion',
    name: '萬靈生命藥劑 (Potion)',
    description: '加爾迪亞煉金術研製的紅色藥劑，回復一名夥伴 70 點生命值。',
    type: 'consumable',
    quantity: 5,
    healHp: 70,
    effectDescription: '回復 70 HP',
  },
  {
    id: 'ether',
    name: '魔導乙太精華 (Ether)',
    description: '濃縮古代時空魔力的清澈液體，回復一名夥伴 35 點 MP。',
    type: 'consumable',
    quantity: 3,
    healMp: 35,
    effectDescription: '回復 35 MP',
  },
  {
    id: 'revive_feather',
    name: '時光鳳凰之羽 (Lapis)',
    description: '能逆轉因果回到受傷前的神話羽毛，令倒下的夥伴以 50% HP 復活。',
    type: 'consumable',
    quantity: 2,
    revive: true,
    effectDescription: '復活倒下隊友',
  },
  {
    id: 'time_pendant',
    name: '赤紅時空吊墜 (Chrono Pendant)',
    description: '千禧盛典上掉落的古老吊墜，刻有神秘徽印，能引發次元傳送門共振。',
    type: 'key_item',
    quantity: 1,
    effectDescription: '穿越時空之門的核心信物',
  },
  {
    id: 'world_tree_seed',
    name: '世界樹之種 (Seed of Life)',
    description: '蘊含浩瀚生機的原始金黃種子，若播種在靈氣充沛之地，將庇蔭千萬年後的世界。',
    type: 'key_item',
    quantity: 1,
    effectDescription: '在原始時代火山口播種可改寫未來',
  },
];
