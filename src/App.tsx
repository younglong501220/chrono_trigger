/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { EraId, Character, Enemy, InventoryItem, CausalityEvent, GameEnding, StoryChoice } from './types/game';
import { INITIAL_CHARACTERS } from './data/characters';
import { INITIAL_ITEMS } from './data/items';
import { ALL_ENEMIES } from './data/enemies';
import { ERAS_DATA } from './data/eras';
import { INITIAL_CAUSALITY_EVENTS, GAME_ENDINGS } from './data/butterflyMatrix';
import { STORY_SCENARIOS } from './data/storyScenarios';
import { soundManager } from './audio/soundManager';

import { TopNav, ActiveTab } from './components/TopNav';
import { EraMapScreen } from './components/EraMapScreen';
import { BattleScreen } from './components/BattleScreen';
import { CausalityMatrixScreen } from './components/CausalityMatrixScreen';
import { PartyScreen } from './components/PartyScreen';
import { StoryDialogModal } from './components/StoryDialogModal';

import { Sparkles, Compass, Swords, ShieldCheck, Heart, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Game Core States
  const [currentEra, setCurrentEra] = useState<EraId>('AD_1000');
  const [activeTab, setActiveTab] = useState<ActiveTab>('story'); // Start on story/prologue to match user prompt!
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [activePartyIds, setActivePartyIds] = useState<string[]>(['cross', 'lucca', 'marle']);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [causalityEvents, setCausalityEvents] = useState<CausalityEvent[]>(INITIAL_CAUSALITY_EVENTS);
  const [endings, setEndings] = useState<GameEnding[]>(GAME_ENDINGS);

  // Combat States
  const [isBattleActive, setIsBattleActive] = useState<boolean>(false);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);

  // Story / Narrative States
  const [currentStoryStepId, setCurrentStoryStepId] = useState<string>('prologue');
  const [storyNotification, setStoryNotification] = useState<string | null>(null);

  // Audio & Display
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(false);

  // Causality Flags
  const causalityFlags: Record<string, boolean> = causalityEvents.reduce((acc, evt) => {
    acc[evt.id] = evt.isCompleted;
    return acc;
  }, {} as Record<string, boolean>);

  // Compute Butterfly Active Perks
  const butterflyPerks = {
    comboDamageBoost: !!causalityFlags['dryad_rescue'],
    autoMpRegen: !!causalityFlags['repair_generator'],
    critRateBoost: !!causalityFlags['tame_tyrano'],
    damageReduction: !!causalityFlags['royal_treasury_seal'],
  };

  // Sync background music on tab or era change
  useEffect(() => {
    if (isBattleActive) {
      soundManager.playEraBgm('battle');
    } else {
      const eraTheme = ERAS_DATA[currentEra].themeMusicType;
      soundManager.playEraBgm(eraTheme);
    }
  }, [currentEra, isBattleActive, activeTab]);

  // Complete a causality butterfly event
  const triggerCausalityEvent = (eventId: string) => {
    setCausalityEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId && !e.isCompleted) {
          // Perk reward logic
          if (eventId === 'seed_planted') {
            // Boost all character max HPs
            setCharacters((cPrev) =>
              cPrev.map((c) => ({
                ...c,
                maxHp: c.maxHp + 40,
                hp: c.hp + 40,
              }))
            );
          }
          return { ...e, isCompleted: true };
        }
        return e;
      })
    );
  };

  // Start Battle helper
  const startBattleWith = (enemyId: string) => {
    const enemyTemplate = ALL_ENEMIES[enemyId] || ALL_ENEMIES['rift_beast'];
    setCurrentEnemy({ ...enemyTemplate });
    setIsBattleActive(true);
    setActiveTab('battle');
  };

  // Handle Victory
  const handleVictory = (expYield: number, goldYield: number, enemyId: string) => {
    setIsBattleActive(false);
    setCurrentEnemy(null);

    // Give EXP & potential level up
    setCharacters((prev) =>
      prev.map((c) => {
        if (activePartyIds.includes(c.id)) {
          const nextLevel = c.level + 1;
          return {
            ...c,
            level: nextLevel,
            maxHp: c.maxHp + 25,
            hp: c.maxHp + 25,
            maxMp: c.maxMp + 10,
            mp: c.maxMp + 10,
            atk: c.atk + 4,
            def: c.def + 3,
            magic: c.magic + 4,
            spd: c.spd + 1,
            atb: 50,
          };
        }
        return c;
      })
    );

    // If beat specific bosses, trigger causality or ending
    if (enemyId === 'tyrano_boss') {
      triggerCausalityEvent('tame_tyrano');
      setStoryNotification('🏆 擊敗原始古代霸王暴龍！中世紀因此誕生龍騎士衛隊，全體暴擊率 +15%！');
    } else if (enemyId === 'yakra_boss') {
      triggerCausalityEvent('dryad_rescue');
      setStoryNotification('🏆 擊破偽裝主教雅庫拉！解救森林精靈，千禧年獲得太陽之石，合體技威力 +30%！');
    } else if (enemyId === 'guardian_core_boss') {
      triggerCausalityEvent('repair_generator');
      setStoryNotification('🏆 奪回工廠主機，重啟超導反應爐！時之夾縫能量充盈，每回合自動回復 MP！');
    } else if (enemyId === 'omega_core') {
      // Unlock Ending
      setEndings((ePrev) =>
        ePrev.map((e) => {
          if (causalityFlags['seed_planted'] && causalityFlags['repair_generator']) {
            if (e.id === 'ending_paradise') return { ...e, unlocked: true };
          } else {
            if (e.id === 'ending_guardian') return { ...e, unlocked: true };
          }
          return e;
        })
      );
      setStoryNotification('🌟 【歷史救贖】終焉奧米加核心消散！拯救全宇宙的時間線，達成歷史終局！');
      setCurrentStoryStepId('omega_victory');
      setActiveTab('story');
      return;
    }

    setActiveTab('era_map');
  };

  // Handle Defeat
  const handleDefeat = () => {
    setIsBattleActive(false);
    setCurrentEnemy(null);
    // Revive party with 50% HP
    setCharacters((prev) =>
      prev.map((c) => ({
        ...c,
        status: 'alive',
        hp: Math.round(c.maxHp * 0.5),
        atb: 20,
      }))
    );
    setStoryNotification('💀 隊伍在時間震盪中甦醒，生命值已在時空餘波中微弱復原。');
    setActiveTab('era_map');
  };

  // Handle Use Item
  const handleUseItem = (itemId: string) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item))
    );
  };

  // Toggle active party (up to 3 characters)
  const handleToggleParty = (charId: string) => {
    if (activePartyIds.includes(charId)) {
      if (activePartyIds.length <= 1) return; // Must have at least 1 hero
      setActivePartyIds((prev) => prev.filter((id) => id !== charId));
    } else {
      if (activePartyIds.length >= 3) {
        // Replace last one
        setActivePartyIds((prev) => [...prev.slice(0, 2), charId]);
      } else {
        setActivePartyIds((prev) => [...prev, charId]);
      }
    }
  };

  // Story choice selected
  const handleStoryChoice = (choice: StoryChoice) => {
    if (choice.butterflyKey) {
      triggerCausalityEvent(choice.butterflyKey);
    }
    if (choice.rewardItem) {
      setInventory((prev) =>
        prev.map((it) => (it.id === choice.rewardItem ? { ...it, quantity: it.quantity + 2 } : it))
      );
    }
    if (choice.teleportEra) {
      soundManager.playTimeGateWarp();
      setCurrentEra(choice.teleportEra);
    }
    if (choice.startBattleEnemyId) {
      startBattleWith(choice.startBattleEnemyId);
      return;
    }
    if (choice.nextStepId && STORY_SCENARIOS[choice.nextStepId]) {
      setCurrentStoryStepId(choice.nextStepId);
    }
  };

  // Custom action handler (Option 4: 自訂行動)
  const handleCustomAction = (actionText: string) => {
    const lower = actionText.toLowerCase();

    if (
      lower.includes('砍') ||
      lower.includes('戰') ||
      lower.includes('劍') ||
      lower.includes('殺') ||
      lower.includes('打') ||
      lower.includes('魔物')
    ) {
      setStoryNotification(`⚔️ 【自訂行動反饋】你果斷展開作戰行動：「${actionText}」！迎擊異次元強敵！`);
      startBattleWith('rift_beast');
    } else if (
      lower.includes('傳送') ||
      lower.includes('調') ||
      lower.includes('露卡') ||
      lower.includes('機器') ||
      lower.includes('頻率') ||
      lower.includes('準備')
    ) {
      setStoryNotification(`🔧 【自訂行動反饋】你與露卡緊密配合調整次元頻率：「${actionText}」！獲得額外魔導乙太！`);
      setInventory((prev) =>
        prev.map((it) => (it.id === 'ether' ? { ...it, quantity: it.quantity + 2 } : it))
      );
      setCurrentEra('AD_600');
      setCurrentStoryStepId('arrive_ad_600_calibrated');
    } else if (
      lower.includes('跳') ||
      lower.includes('吊墜') ||
      lower.includes('項鍊') ||
      lower.includes('衝') ||
      lower.includes('追')
    ) {
      soundManager.playTimeGateWarp();
      setStoryNotification(`🌀 【自訂行動反饋】你抓準時機：「${actionText}」，毅然踏入時空門！`);
      setCurrentEra('AD_600');
      setCurrentStoryStepId('arrive_ad_600_direct');
    } else {
      // General creative action
      setStoryNotification(
        `✨ 【自訂行動反饋】你執行了：「${actionText}」！在時空吊墜的光芒激盪下，歷史產生了奇妙的因果漣漪！`
      );
      // If in prologue, advance to calibrated
      if (currentStoryStepId === 'prologue') {
        setCurrentEra('AD_600');
        setCurrentStoryStepId('arrive_ad_600_calibrated');
      }
    }
  };

  // Landmark Click from Era Map
  const handleSelectLandmark = (landmarkId: string, actionType: string) => {
    if (landmarkId === 'sacred_crater') {
      triggerCausalityEvent('seed_planted');
      setStoryNotification(
        '🌱 【因果改寫成功】在 6500 萬年前火山播下世界樹之種！西元 2300 年廢土已化為艾登綠洲！全體 HP 上限 +40！'
      );
      setActiveTab('causality');
    } else if (landmarkId === 'tyrano_lair') {
      startBattleWith('tyrano_boss');
    } else if (landmarkId === 'guardia_castle_past') {
      triggerCausalityEvent('royal_treasury_seal');
      setStoryNotification(
        '🏰 【因果改寫成功】加強王城寶庫封印而不私自開啟！四百年後千禧寶庫將凝聚出【虹色鎧甲】(傷害減免 25%)！'
      );
      setActiveTab('causality');
    } else if (landmarkId === 'cathedral_shadows') {
      startBattleWith('yakra_boss');
    } else if (landmarkId === 'mystic_forest') {
      triggerCausalityEvent('dryad_rescue');
      setStoryNotification(
        '🌲 【因果改寫成功】解救迷霧修道院森林妖精！千禧年獲得太陽之石護身符，全體合體技威力 +30%！'
      );
      setActiveTab('causality');
    } else if (landmarkId === 'eden_oasis') {
      if (causalityFlags['seed_planted']) {
        setStoryNotification(
          '🌟 【命運神兵】你在世界樹核心拔出傳說聖劍【因果折光】！克羅斯攻擊力大幅飆升！'
        );
        setCharacters((prev) =>
          prev.map((c) => (c.id === 'cross' ? { ...c, atk: c.atk + 20, maxHp: c.maxHp + 30 } : c))
        );
      } else {
        setStoryNotification('💨 這裡是一片酸雨肆虐的荒原。提示：先返回原始時代火山口種下世界樹種子！');
      }
    } else if (landmarkId === 'derelict_factory') {
      startBattleWith('guardian_core_boss');
    } else if (landmarkId === 'thermal_power_station') {
      triggerCausalityEvent('repair_generator');
      setStoryNotification(
        '⚡ 【因果改寫成功】修復超導地熱反應堆！能量逆流至時之夾縫，戰鬥中每回合自動回復 6 MP！'
      );
      setActiveTab('causality');
    } else if (landmarkId === 'omega_abyss') {
      startBattleWith('omega_core');
    } else if (landmarkId === 'eternal_streetlamp') {
      // Heal party
      setCharacters((prev) =>
        prev.map((c) => ({
          ...c,
          status: 'alive',
          hp: c.maxHp,
          mp: c.maxMp,
          atb: 100,
        }))
      );
      soundManager.playHeal();
      setStoryNotification('🏮 永恆街燈的慈祥光芒完全回復了全體隊員的 HP 與 MP！');
    } else {
      // General explore / talk
      setCurrentStoryStepId(
        currentEra === 'AD_1000'
          ? 'prologue'
          : currentEra === 'AD_600'
          ? 'arrive_ad_600_direct'
          : currentEra === 'BC_65M'
          ? 'arrive_bc_65m'
          : currentEra === 'AD_2300'
          ? 'arrive_ad_2300'
          : 'arrive_end_of_time'
      );
      setActiveTab('story');
    }
  };

  const activePartyMembers = characters.filter((c) => activePartyIds.includes(c.id));
  const currentStory = STORY_SCENARIOS[currentStoryStepId] || STORY_SCENARIOS['prologue'];

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col relative ${scanlinesEnabled ? 'scanlines-overlay' : ''}`}>
      {/* Top Bar Header */}
      <TopNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'battle' && !isBattleActive) {
            // Start a quick combat encounter if not in combat
            const enemyPool =
              currentEra === 'BC_65M'
                ? 'primal_dino'
                : currentEra === 'AD_600'
                ? 'shadow_gargoyle'
                : currentEra === 'AD_2300'
                ? 'mutant_spider'
                : 'rift_beast';
            startBattleWith(enemyPool);
          } else {
            setActiveTab(tab);
          }
        }}
        isBattleActive={isBattleActive}
        isMuted={isMuted}
        onToggleMute={() => {
          const nextMute = !isMuted;
          setIsMuted(nextMute);
          soundManager.setMuted(nextMute);
        }}
        scanlinesEnabled={scanlinesEnabled}
        onToggleScanlines={() => setScanlinesEnabled(!scanlinesEnabled)}
      />

      {/* Story / Causal Notification Banner */}
      {storyNotification && (
        <div className="w-full max-w-5xl mx-auto px-4 pt-3">
          <div className="p-3 bg-amber-950/80 border border-amber-500/70 rounded-lg text-xs sm:text-sm font-mono text-amber-200 flex items-center justify-between shadow-lg animate-pulse">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{storyNotification}</span>
            </div>
            <button
              onClick={() => setStoryNotification(null)}
              className="text-xs text-amber-400 hover:text-white px-2 py-0.5 rounded border border-amber-600 font-bold ml-2 shrink-0"
            >
              確定
            </button>
          </div>
        </div>
      )}

      {/* Main Game Surface */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* VIEW 1: Story Dialogue & Narrative Matrix (Matches user's prompt!) */}
        {activeTab === 'story' && (
          <div className="flex flex-col gap-6">
            <StoryDialogModal
              step={currentStory}
              onSelectChoice={handleStoryChoice}
              onCustomAction={handleCustomAction}
            />

            {/* Quick Era Map & Action Shortcuts */}
            <div className="snes-window p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>
                  當前歷史節點：【{ERAS_DATA[currentEra].name} ‧ {ERAS_DATA[currentEra].timePeriod}】
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundManager.playCursor();
                    setActiveTab('era_map');
                  }}
                  className="px-3 py-1.5 bg-blue-900/80 hover:bg-blue-800 text-white rounded border border-blue-700"
                >
                  探索當前時代地圖 →
                </button>
                <button
                  onClick={() => {
                    soundManager.playCursor();
                    setActiveTab('causality');
                  }}
                  className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 rounded border border-amber-600"
                >
                  查看蝴蝶因果矩陣 →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: 5 Eras Map & Timeline Traveling */}
        {activeTab === 'era_map' && (
          <EraMapScreen
            currentEra={currentEra}
            onSelectEra={(eraId) => {
              setCurrentEra(eraId);
              // Set appropriate story step
              if (eraId === 'BC_65M') setCurrentStoryStepId('arrive_bc_65m');
              else if (eraId === 'AD_600') setCurrentStoryStepId('arrive_ad_600_direct');
              else if (eraId === 'AD_1000') setCurrentStoryStepId('prologue');
              else if (eraId === 'AD_2300') setCurrentStoryStepId('arrive_ad_2300');
              else setCurrentStoryStepId('arrive_end_of_time');
            }}
            onSelectLandmark={handleSelectLandmark}
            causalityFlags={causalityFlags}
          />
        )}

        {/* VIEW 3: Active Time Battle (ATB) Combat Screen */}
        {activeTab === 'battle' && (
          <div>
            {currentEnemy ? (
              <BattleScreen
                party={activePartyMembers}
                enemy={currentEnemy}
                inventory={inventory}
                butterflyPerks={butterflyPerks}
                onVictory={handleVictory}
                onDefeat={handleDefeat}
                onFlee={() => {
                  setIsBattleActive(false);
                  setCurrentEnemy(null);
                  setActiveTab('era_map');
                }}
                onUseItem={handleUseItem}
              />
            ) : (
              <div className="snes-window p-8 text-center flex flex-col items-center justify-center gap-3">
                <Swords className="w-12 h-12 text-amber-400 animate-bounce" />
                <h3 className="text-xl font-bold text-white">目前無遭遇戰鬥</h3>
                <p className="text-xs text-slate-300 max-w-md">
                  可前往【五大時代地圖】挑戰時代首領，或在下方點擊進行一場遭遇戰！
                </p>
                <button
                  onClick={() => startBattleWith('rift_beast')}
                  className="mt-2 px-5 py-2.5 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 font-mono text-sm"
                >
                  <Swords className="w-4 h-4" /> 觸發次元遭遇戰 (ATB 戰鬥)
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: Causality Matrix & Butterfly Effect Tracker */}
        {activeTab === 'causality' && (
          <CausalityMatrixScreen
            events={causalityEvents}
            endings={endings}
            onNavigateEra={(eraId) => {
              setCurrentEra(eraId);
              setActiveTab('era_map');
            }}
          />
        )}

        {/* VIEW 5: Party Roster & Tech Compendium */}
        {activeTab === 'party' && (
          <PartyScreen
            allCharacters={characters}
            activePartyIds={activePartyIds}
            onToggleActiveParty={handleToggleParty}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="w-full border-t border-blue-950/80 bg-slate-950 px-6 py-4 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 font-mono">
          <div className="flex items-center gap-2">
            <span>致敬 1995 坂口博信 ‧ 堀井雄二 ‧ 鳥山明 ‧ 光田康典</span>
            <span>·</span>
            <span>Chrono Trigger Homage</span>
          </div>
          <div>時空之輪：因果迴廊 ‧ Web Audio 16-bit Synthesizer & ATB Engine</div>
        </div>
      </footer>
    </div>
  );
}
