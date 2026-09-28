import React, { useState, useEffect, useRef } from 'react';
import { Character, Enemy, ComboTech, TechSkill, InventoryItem, BattleLogEntry } from '../types/game';
import { COMBO_TECHS } from '../data/techCombos';
import { soundManager } from '../audio/soundManager';
import { Sword, Flame, Shield, Sparkles, Wand2, Heart, Award, ArrowLeft } from 'lucide-react';

interface BattleScreenProps {
  party: Character[];
  enemy: Enemy;
  inventory: InventoryItem[];
  butterflyPerks: {
    comboDamageBoost: boolean;
    autoMpRegen: boolean;
    critRateBoost: boolean;
    damageReduction: boolean;
  };
  onVictory: (exp: number, gold: number, enemyId: string) => void;
  onDefeat: () => void;
  onFlee: () => void;
  onUseItem: (itemId: string, targetCharId: string) => void;
}

interface FloatingText {
  id: string;
  text: string;
  type: 'damage' | 'heal' | 'critical' | 'tech';
  target: 'enemy' | string; // 'enemy' or charId
  x: number;
  y: number;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  party: initialParty,
  enemy: initialEnemy,
  inventory,
  butterflyPerks,
  onVictory,
  onDefeat,
  onFlee,
  onUseItem,
}) => {
  const [party, setParty] = useState<Character[]>(() =>
    initialParty.map((c) => ({ ...c, atb: Math.min(100, c.atb) }))
  );
  const [enemy, setEnemy] = useState<Enemy>({ ...initialEnemy });
  const [battleLogs, setBattleLogs] = useState<BattleLogEntry[]>([
    {
      id: 'init_1',
      text: `⚠️ 遭遇強敵！【${initialEnemy.title} ‧ ${initialEnemy.name}】出現了！`,
      type: 'action',
      timestamp: Date.now(),
    },
    {
      id: 'init_2',
      text: `⚔️ 即時 ATB 戰鬥啟動！連攜合體技隨時待命！`,
      type: 'system',
      timestamp: Date.now() + 1,
    },
  ]);
  const [activeCharIndex, setActiveCharIndex] = useState<number | null>(null);
  const [actionMenu, setActionMenu] = useState<'main' | 'tech' | 'combo' | 'item'>('main');
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [activeAnimEffect, setActiveAnimEffect] = useState<string | null>(null);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);
  const [isBattleEnded, setIsBattleEnded] = useState<boolean>(false);
  const battleLoopRef = useRef<number | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Play battle music on start
  useEffect(() => {
    soundManager.playEraBgm('battle');
    return () => {
      if (battleLoopRef.current) cancelAnimationFrame(battleLoopRef.current);
    };
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [battleLogs]);

  const addLog = (text: string, type: BattleLogEntry['type']) => {
    setBattleLogs((prev) => [
      ...prev.slice(-30),
      { id: Math.random().toString(36).substring(2, 9), text, type, timestamp: Date.now() },
    ]);
  };

  const spawnFloating = (text: string, type: FloatingText['type'], target: 'enemy' | string) => {
    const newFloat: FloatingText = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      type,
      target,
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 30,
    };
    setFloatingTexts((prev) => [...prev, newFloat]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((f) => f.id !== newFloat.id));
    }, 1200);
  };

  const triggerScreenShake = () => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 450);
  };

  // Main ATB Engine loop
  useEffect(() => {
    if (isBattleEnded) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Update Party ATB
      setParty((prevParty) => {
        let soundPlayed = false;
        const updated = prevParty.map((char) => {
          if (char.status === 'ko') return { ...char, atb: 0 };
          if (char.atb >= 100) return char;

          const fillRate = (char.spd * 4.5);
          const nextAtb = Math.min(100, char.atb + fillRate * dt);
          if (nextAtb >= 100 && char.atb < 100 && !soundPlayed) {
            soundManager.playAtbReady();
            soundPlayed = true;
          }
          return { ...char, atb: nextAtb };
        });
        return updated;
      });

      // Update Enemy ATB & AI attack
      setEnemy((prevEnemy) => {
        if (prevEnemy.hp <= 0) return prevEnemy;
        if (prevEnemy.atb < 100) {
          const nextAtb = Math.min(100, prevEnemy.atb + prevEnemy.spd * 3.8 * dt);
          return { ...prevEnemy, atb: nextAtb };
        } else {
          // Enemy acts!
          executeEnemyTurn();
          return { ...prevEnemy, atb: 0 };
        }
      });

      battleLoopRef.current = requestAnimationFrame(loop);
    };

    battleLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (battleLoopRef.current) cancelAnimationFrame(battleLoopRef.current);
    };
  }, [isBattleEnded, party, enemy]);

  // Set active ready character if none selected
  useEffect(() => {
    if (activeCharIndex === null) {
      const readyIdx = party.findIndex((c) => c.status === 'alive' && c.atb >= 100);
      if (readyIdx !== -1) {
        setActiveCharIndex(readyIdx);
        setActionMenu('main');
      }
    } else {
      const currentChar = party[activeCharIndex];
      if (!currentChar || currentChar.status === 'ko' || currentChar.atb < 100) {
        const nextReady = party.findIndex((c) => c.status === 'alive' && c.atb >= 100);
        setActiveCharIndex(nextReady !== -1 ? nextReady : null);
        setActionMenu('main');
      }
    }
  }, [party, activeCharIndex]);

  // Check victory / defeat conditions
  useEffect(() => {
    if (enemy.hp <= 0 && !isBattleEnded) {
      setIsBattleEnded(true);
      soundManager.playVictoryFanfare();
      addLog(`🏆 終極勝利！擊潰了【${enemy.name}】！獲得 ${enemy.expYield} 經驗值與 ${enemy.goldYield} 金幣！`, 'critical');
      setTimeout(() => {
        onVictory(enemy.expYield, enemy.goldYield, enemy.id);
      }, 2500);
    }

    const aliveAllies = party.filter((c) => c.status === 'alive');
    if (aliveAllies.length === 0 && !isBattleEnded) {
      setIsBattleEnded(true);
      addLog(`💀 全隊陣亡……時空指針陷入了死寂。`, 'damage');
      setTimeout(() => {
        onDefeat();
      }, 2500);
    }
  }, [enemy.hp, party, isBattleEnded]);

  // Enemy Action Execution
  const executeEnemyTurn = () => {
    const aliveAllies = party.filter((c) => c.status === 'alive');
    if (aliveAllies.length === 0 || enemy.hp <= 0) return;

    // Pick random action
    const action = enemy.actions[Math.floor(Math.random() * enemy.actions.length)];
    // Pick random target
    const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];

    let damage = Math.round(action.damage * (0.85 + Math.random() * 0.3) - target.def * 0.5);
    if (butterflyPerks.damageReduction) {
      damage = Math.round(damage * 0.75); // Rainbow Mail perk
    }
    damage = Math.max(10, damage);

    if (action.dialogue) {
      addLog(`💬 ${enemy.name}: ${action.dialogue}`, 'action');
    }

    triggerScreenShake();
    soundManager.playSlash();
    spawnFloating(`-${damage}`, 'damage', target.id);
    addLog(`💥 ${enemy.name} 使出【${action.name}】，重創 ${target.name} 造成 ${damage} 點傷害！`, 'damage');

    setParty((prev) =>
      prev.map((c) => {
        if (c.id !== target.id) return c;
        const newHp = Math.max(0, c.hp - damage);
        return {
          ...c,
          hp: newHp,
          status: newHp === 0 ? 'ko' : 'alive',
          atb: newHp === 0 ? 0 : c.atb,
        };
      })
    );
  };

  // Player Standard Attack
  const handleAttack = () => {
    if (activeCharIndex === null) return;
    const actor = party[activeCharIndex];
    if (!actor || actor.atb < 100) return;

    soundManager.playSlash();
    const isCrit = Math.random() < (butterflyPerks.critRateBoost ? 0.35 : 0.15);
    let damage = Math.round((actor.atk * 1.6 - enemy.def * 0.4) * (0.9 + Math.random() * 0.2));
    if (isCrit) damage = Math.round(damage * 1.7);
    damage = Math.max(15, damage);

    setActiveAnimEffect('slash');
    setTimeout(() => setActiveAnimEffect(null), 350);

    spawnFloating(isCrit ? `CRIT! ${damage}` : `${damage}`, isCrit ? 'critical' : 'damage', 'enemy');
    addLog(
      `🗡️ ${actor.name} 迅捷拔刀揮砍，${isCrit ? '【致命一擊！】' : ''}對 ${enemy.name} 造成 ${damage} 點傷害！`,
      isCrit ? 'critical' : 'action'
    );

    // Apply damage to enemy
    setEnemy((prev) => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));

    // Reset actor ATB & auto MP regen if unlocked
    setParty((prev) =>
      prev.map((c, idx) => {
        if (idx !== activeCharIndex) return c;
        const mpBonus = butterflyPerks.autoMpRegen ? 6 : 0;
        return { ...c, atb: 0, mp: Math.min(c.maxMp, c.mp + mpBonus) };
      })
    );

    setActionMenu('main');
    setActiveCharIndex(null);
  };

  // Player Single Tech Skill
  const handleSingleTech = (skill: TechSkill) => {
    if (activeCharIndex === null) return;
    const actor = party[activeCharIndex];
    if (!actor || actor.mp < skill.mpCost || actor.atb < 100) return;

    // Deduct MP & reset ATB
    setParty((prev) =>
      prev.map((c, idx) => (idx === activeCharIndex ? { ...c, mp: c.mp - skill.mpCost, atb: 0 } : c))
    );

    if (skill.healAmount && skill.healAmount > 0) {
      soundManager.playHeal();
      setActiveAnimEffect('heal');
      setTimeout(() => setActiveAnimEffect(null), 500);

      // Heal target
      if (skill.target === 'ally_all') {
        setParty((prev) =>
          prev.map((c) => {
            if (c.status === 'ko') return c;
            const newHp = Math.min(c.maxHp, c.hp + (skill.healAmount || 0));
            spawnFloating(`+${skill.healAmount}`, 'heal', c.id);
            return { ...c, hp: newHp };
          })
        );
        addLog(`✨ ${actor.name} 詠唱【${skill.name}】，全體隊員沐浴在聖光中回復生命！`, 'heal');
      } else {
        // Ally single: lowest HP
        const aliveAllies = party.filter((c) => c.status === 'alive');
        aliveAllies.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
        const target = aliveAllies[0] || actor;
        setParty((prev) =>
          prev.map((c) => {
            if (c.id !== target.id) return c;
            const newHp = Math.min(c.maxHp, c.hp + (skill.healAmount || 0));
            spawnFloating(`+${skill.healAmount}`, 'heal', c.id);
            return { ...c, hp: newHp };
          })
        );
        addLog(`✨ ${actor.name} 對 ${target.name} 施展【${skill.name}】，回復 ${skill.healAmount} 點生命！`, 'heal');
      }
    } else {
      // Offensive tech
      if (skill.element === 'fire') soundManager.playFire();
      else if (skill.element === 'lightning') soundManager.playLightning();
      else soundManager.playSlash();

      setActiveAnimEffect(skill.element);
      setTimeout(() => setActiveAnimEffect(null), 500);
      triggerScreenShake();

      let dmg = Math.round((actor.magic * 1.5 + actor.atk * 0.8) * skill.damageMultiplier);
      if (enemy.elementalWeakness === skill.element) {
        dmg = Math.round(dmg * 1.5);
        addLog(`⚡ 屬性弱點暴擊！火花迸發！`, 'critical');
      }
      dmg = Math.max(25, dmg);

      spawnFloating(`${dmg}`, 'damage', 'enemy');
      addLog(`🔥 ${actor.name} 發動特技【${skill.name}】，狂轟 ${enemy.name} 造成 ${dmg} 點傷害！`, 'action');
      setEnemy((prev) => ({ ...prev, hp: Math.max(0, prev.hp - dmg) }));
    }

    setActionMenu('main');
    setActiveCharIndex(null);
  };

  // Player Dual / Triple Combo Tech
  const handleComboTech = (combo: ComboTech) => {
    // Check all required chars are alive, ready, and have MP
    const requiredChars = party.filter((c) => combo.requiredCharacterIds.includes(c.id));
    if (requiredChars.length !== combo.requiredCharacterIds.length) return;

    for (const c of requiredChars) {
      if (c.status !== 'alive' || c.atb < 95) return;
      const cost = combo.mpCosts[c.id] || 0;
      if (c.mp < cost) return;
    }

    // Deduct MP & reset ATB for ALL participating characters
    setParty((prev) =>
      prev.map((c) => {
        if (combo.requiredCharacterIds.includes(c.id)) {
          const cost = combo.mpCosts[c.id] || 0;
          return { ...c, mp: c.mp - cost, atb: 0 };
        }
        return c;
      })
    );

    // Audio & Visual sequence
    soundManager.playLightning();
    soundManager.playFire();
    triggerScreenShake();
    setActiveAnimEffect('combo');
    setTimeout(() => setActiveAnimEffect(null), 900);

    // Calculate massive combo damage
    const totalPower = requiredChars.reduce((sum, c) => sum + c.magic * 1.3 + c.atk, 0);
    let comboDmg = Math.round(totalPower * combo.damageMultiplier);
    if (butterflyPerks.comboDamageBoost) {
      comboDmg = Math.round(comboDmg * 1.3); // Sun Stone perk
    }

    spawnFloating(`💥 COMBO ${comboDmg}!`, 'critical', 'enemy');
    addLog(
      `⚡✨ 【${combo.type === 'triple' ? '三人終極奧義' : '二人連攜合體技'}：${combo.name}】！`,
      'combo'
    );
    addLog(`> ${combo.description}`, 'combo');
    addLog(`> 爆發出撕裂維度的耀目光芒，對 ${enemy.name} 造成 ${comboDmg} 點毀滅性傷害！`, 'critical');

    setEnemy((prev) => ({ ...prev, hp: Math.max(0, prev.hp - comboDmg) }));
    setActionMenu('main');
    setActiveCharIndex(null);
  };

  // Defend action
  const handleDefend = () => {
    if (activeCharIndex === null) return;
    const actor = party[activeCharIndex];
    if (!actor) return;

    soundManager.playSelect();
    addLog(`🛡️ ${actor.name} 擺出嚴密防禦姿態，降低下一次受到的傷害！`, 'action');
    setParty((prev) =>
      prev.map((c, idx) => (idx === activeCharIndex ? { ...c, atb: 35, def: c.def + 8 } : c))
    );
    setActionMenu('main');
    setActiveCharIndex(null);
  };

  // Item usage in battle
  const handleItemUse = (item: InventoryItem) => {
    if (item.quantity <= 0) return;
    soundManager.playHeal();

    if (item.revive) {
      // Find first dead character
      const deadChar = party.find((c) => c.status === 'ko');
      if (deadChar) {
        setParty((prev) =>
          prev.map((c) =>
            c.id === deadChar.id
              ? { ...c, status: 'alive', hp: Math.round(c.maxHp * 0.5), atb: 30 }
              : c
          )
        );
        spawnFloating(`REVIVED!`, 'heal', deadChar.id);
        addLog(`🪶 使用【${item.name}】，${deadChar.name} 逆轉因果重返戰場！`, 'heal');
      } else {
        addLog(`沒有處於倒下狀態的隊友！`, 'system');
        return;
      }
    } else if (item.healHp) {
      // Heal active actor or lowest HP
      const target = party.find((c) => c.status === 'alive') || party[0];
      setParty((prev) =>
        prev.map((c) =>
          c.id === target.id
            ? { ...c, hp: Math.min(c.maxHp, c.hp + (item.healHp || 0)) }
            : c
        )
      );
      spawnFloating(`+${item.healHp}`, 'heal', target.id);
      addLog(`🧪 使用【${item.name}】，${target.name} 回復了 ${item.healHp} HP！`, 'heal');
    } else if (item.healMp) {
      const target = party.find((c) => c.status === 'alive') || party[0];
      setParty((prev) =>
        prev.map((c) =>
          c.id === target.id
            ? { ...c, mp: Math.min(c.maxMp, c.mp + (item.healMp || 0)) }
            : c
        )
      );
      spawnFloating(`+${item.healMp} MP`, 'heal', target.id);
      addLog(`🧪 使用【${item.name}】，${target.name} 回復了 ${item.healMp} MP！`, 'heal');
    }

    if (activeCharIndex !== null) {
      setParty((prev) =>
        prev.map((c, idx) => (idx === activeCharIndex ? { ...c, atb: 0 } : c))
      );
    }
    onUseItem(item.id, party[activeCharIndex || 0]?.id || '');
    setActionMenu('main');
    setActiveCharIndex(null);
  };

  // Find available combos for current party state
  const availableCombos = COMBO_TECHS.filter((combo) => {
    const requiredChars = party.filter((c) => combo.requiredCharacterIds.includes(c.id));
    if (requiredChars.length !== combo.requiredCharacterIds.length) return false;
    return requiredChars.every((c) => {
      const cost = combo.mpCosts[c.id] || 0;
      return c.status === 'alive' && c.atb >= 95 && c.mp >= cost;
    });
  });

  const activeChar = activeCharIndex !== null ? party[activeCharIndex] : null;

  return (
    <div
      className={`relative w-full max-w-5xl mx-auto flex flex-col gap-4 p-4 rounded-xl select-none transition-transform duration-75 ${
        isScreenShaking ? 'translate-x-1 -translate-y-1' : ''
      }`}
    >
      {/* Top Banner / Enemy Field */}
      <div className="relative w-full min-h-[260px] snes-window p-6 flex flex-col justify-between overflow-hidden">
        {/* Visual Animation Overlays */}
        {activeAnimEffect && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
            {activeAnimEffect === 'slash' && (
              <div className="w-80 h-1 bg-white shadow-[0_0_20px_#fff] rotate-45 transform scale-150 animate-ping" />
            )}
            {activeAnimEffect === 'fire' && (
              <div className="w-48 h-48 rounded-full bg-orange-500/80 blur-xl animate-pulse" />
            )}
            {activeAnimEffect === 'lightning' && (
              <div className="absolute inset-0 bg-blue-300/40 animate-pulse" />
            )}
            {activeAnimEffect === 'combo' && (
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/40 via-yellow-400/40 to-blue-600/40 animate-pulse backdrop-blur-xs" />
            )}
            {activeAnimEffect === 'heal' && (
              <div className="w-64 h-64 rounded-full bg-emerald-400/30 blur-2xl animate-ping" />
            )}
          </div>
        )}

        {/* Floating Numbers */}
        {floatingTexts.map((f) => (
          <div
            key={f.id}
            style={{
              left: f.target === 'enemy' ? `calc(50% + ${f.x}px)` : `calc(20% + ${f.x}px)`,
              top: f.target === 'enemy' ? `calc(35% + ${f.y}px)` : `calc(75% + ${f.y}px)`,
            }}
            className={`absolute z-40 font-pixel text-xl font-black pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-bounce ${
              f.type === 'damage'
                ? 'text-red-400'
                : f.type === 'critical'
                ? 'text-amber-300 text-2xl scale-125'
                : 'text-emerald-300'
            }`}
          >
            {f.text}
          </div>
        ))}

        {/* Enemy Display Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-3">
            <span className="text-4xl filter drop-shadow-md">{enemy.spriteIcon}</span>
            <div>
              <div className="text-xs text-amber-300 font-serif-cinzel font-semibold tracking-wider">
                {enemy.title}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                {enemy.name}
                {enemy.isBoss && (
                  <span className="text-xs px-2 py-0.5 bg-red-950 border border-red-500 text-red-300 rounded font-normal">
                    BOSS
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Enemy HP and ATB Bar */}
          <div className="w-full sm:w-72 bg-slate-900/80 p-3 rounded border border-slate-700">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">敵方體力 (HP)</span>
              <span className="text-red-400 font-bold tabular-nums">
                {enemy.hp} / {enemy.maxHp}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-red-600 to-rose-400 h-full transition-all duration-300"
                style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }}
              />
            </div>

            {/* Enemy ATB Bar */}
            <div className="flex justify-between text-[11px] font-mono mt-2 mb-0.5">
              <span className="text-slate-400">行動蓄力 (ATB)</span>
              <span className="text-yellow-400 tabular-nums">{Math.floor(enemy.atb)}%</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-yellow-400 h-full transition-all duration-100"
                style={{ width: `${enemy.atb}%` }}
              />
            </div>
          </div>
        </div>

        {/* Central Arena Visual representation */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="relative group p-6 rounded-2xl bg-gradient-to-b from-white/5 to-white/0 border border-white/10 flex flex-col items-center">
            <div className="text-6xl sm:text-7xl filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transition-transform duration-200 group-hover:scale-105">
              {enemy.spriteIcon}
            </div>
            {enemy.elementalWeakness && (
              <div className="mt-2 text-xs text-amber-200/90 font-mono">
                弱點屬性: <span className="uppercase text-amber-400 font-bold">{enemy.elementalWeakness}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick status bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/60 pt-2 z-10">
          <div>
            戰鬥音樂: <span className="text-amber-300 font-mono">16-bit Yasunori Mitsuda Homage</span>
          </div>
          {butterflyPerks.comboDamageBoost && (
            <div className="text-amber-300 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> 太陽之石共鳴中 (+30% 合體技威力)
            </div>
          )}
        </div>
      </div>

      {/* Middle Party Status Row (Classic SNES Bottom / Party Gauges) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {party.map((char, idx) => {
          const isReady = char.status === 'alive' && char.atb >= 100;
          const isSelected = activeCharIndex === idx;

          return (
            <div
              key={char.id}
              onClick={() => {
                if (char.status === 'alive' && char.atb >= 100) {
                  soundManager.playCursor();
                  setActiveCharIndex(idx);
                  setActionMenu('main');
                }
              }}
              className={`p-3.5 rounded-lg border-2 transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'snes-window-gold border-amber-400 scale-[1.02] shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : isReady
                  ? 'snes-window border-blue-400 hover:border-amber-300'
                  : 'bg-slate-900/90 border-slate-800 opacity-80'
              }`}
            >
              {isReady && (
                <div className="absolute top-1 right-2 text-[10px] font-pixel text-amber-300 animate-pulse">
                  READY
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs text-slate-400 font-mono">{char.title}</div>
                  <div className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                    {isSelected && <span className="text-amber-400 text-sm">▶</span>}
                    {char.name}
                  </div>
                </div>
                <div
                  className={`text-xs px-2 py-0.5 rounded font-mono ${
                    char.status === 'ko'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-slate-800 text-emerald-400'
                  }`}
                >
                  Lv.{char.level}
                </div>
              </div>

              {/* HP Bar */}
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-300">HP</span>
                  <span
                    className={`font-bold tabular-nums ${
                      char.hp <= char.maxHp * 0.25 ? 'text-red-400 animate-pulse' : 'text-slate-100'
                    }`}
                  >
                    {char.hp} / {char.maxHp}
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${Math.max(0, (char.hp / char.maxHp) * 100)}%` }}
                  />
                </div>

                {/* MP Bar */}
                <div className="flex justify-between pt-1">
                  <span className="text-slate-300">MP</span>
                  <span className="text-sky-300 font-bold tabular-nums">
                    {char.mp} / {char.maxMp}
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-400 h-full transition-all duration-300"
                    style={{ width: `${Math.max(0, (char.mp / char.maxMp) * 100)}%` }}
                  />
                </div>

                {/* ATB Gauge */}
                <div className="flex justify-between pt-1 text-[11px]">
                  <span className="text-amber-300/80">ATB</span>
                  <span className="text-amber-300 font-bold tabular-nums">{Math.floor(char.atb)}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className={`h-full transition-all duration-100 ${
                      char.atb >= 100
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-200 animate-pulse'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-400'
                    }`}
                    style={{ width: `${char.atb}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Command Box & Battle Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Commands Panel */}
        <div className="lg:col-span-6 snes-window p-4 flex flex-col justify-between min-h-[220px]">
          <div className="border-b border-blue-900/80 pb-2 mb-3 flex items-center justify-between">
            <div className="text-xs font-mono text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sword className="w-3.5 h-3.5" />
              {activeChar ? `行動指令 ‧ ${activeChar.name}` : '等待行動時機 (ATB 蓄力中...)'}
            </div>
            {actionMenu !== 'main' && (
              <button
                onClick={() => {
                  soundManager.playCursor();
                  setActionMenu('main');
                }}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-mono px-2 py-0.5 bg-blue-950/80 rounded border border-blue-800"
              >
                <ArrowLeft className="w-3 h-3" /> 返回
              </button>
            )}
          </div>

          {/* Submenu Views */}
          {activeChar ? (
            <div className="flex-1 flex flex-col justify-center">
              {actionMenu === 'main' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={handleAttack}
                    className="p-3 bg-blue-950/80 hover:bg-blue-850 hover:border-amber-400 border border-blue-700/80 rounded-lg text-left text-sm font-bold text-white transition-all flex items-center gap-2"
                  >
                    <Sword className="w-4 h-4 text-amber-300" />
                    <span>🗡️ 普通斬擊</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playSelect();
                      setActionMenu('tech');
                    }}
                    className="p-3 bg-blue-950/80 hover:bg-blue-850 hover:border-amber-400 border border-blue-700/80 rounded-lg text-left text-sm font-bold text-white transition-all flex items-center gap-2"
                  >
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>🔥 個人特技</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playSelect();
                      setActionMenu('combo');
                    }}
                    className="p-3 bg-blue-950/80 hover:bg-blue-850 hover:border-amber-400 border border-blue-700/80 rounded-lg text-left text-sm font-bold text-amber-200 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>⚡ 連攜合體技</span>
                    </div>
                    {availableCombos.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded font-black">
                        {availableCombos.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playSelect();
                      setActionMenu('item');
                    }}
                    className="p-3 bg-blue-950/80 hover:bg-blue-850 hover:border-amber-400 border border-blue-700/80 rounded-lg text-left text-sm font-bold text-white transition-all flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>🧪 道具背包</span>
                  </button>

                  <button
                    onClick={handleDefend}
                    className="p-2 bg-slate-900/60 hover:bg-slate-800 border border-slate-700 rounded-lg text-left text-xs font-semibold text-slate-300 transition-all flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-blue-300" />
                    <span>🛡️ 全神防禦</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playSelect();
                      onFlee();
                    }}
                    className="p-2 bg-slate-900/60 hover:bg-slate-800 border border-slate-700 rounded-lg text-left text-xs font-semibold text-slate-400 transition-all"
                  >
                    🏃 戰略撤退
                  </button>
                </div>
              )}

              {/* Single Tech Submenu */}
              {actionMenu === 'tech' && (
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {activeChar.skills.map((skill) => {
                    const canAfford = activeChar.mp >= skill.mpCost;
                    return (
                      <button
                        key={skill.id}
                        disabled={!canAfford}
                        onClick={() => handleSingleTech(skill)}
                        className={`p-2.5 rounded border text-left transition-all flex items-center justify-between ${
                          canAfford
                            ? 'bg-blue-950 hover:bg-blue-900 border-blue-700 text-white'
                            : 'bg-slate-950/80 border-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                            <span>{skill.name}</span>
                            <span className="text-[10px] text-amber-300 uppercase font-mono">
                              [{skill.element}]
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{skill.description}</div>
                        </div>
                        <div className="text-xs font-mono font-bold text-sky-300 whitespace-nowrap pl-2">
                          {skill.mpCost} MP
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Combo Tech Submenu */}
              {actionMenu === 'combo' && (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {COMBO_TECHS.map((combo) => {
                    const isAvailable = availableCombos.some((c) => c.id === combo.id);
                    return (
                      <button
                        key={combo.id}
                        disabled={!isAvailable}
                        onClick={() => handleComboTech(combo)}
                        className={`p-2.5 rounded border text-left transition-all flex items-center justify-between ${
                          isAvailable
                            ? 'bg-amber-950/60 hover:bg-amber-900/80 border-amber-500 text-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                            : 'bg-slate-950/80 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-amber-300">
                            <span>{combo.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 rounded border border-amber-500/30 uppercase">
                              {combo.type === 'triple' ? '三人奧義' : '二人合體'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                            {combo.description}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            需要角色: {combo.requiredCharacterIds.join(' + ')} (需全員滿 ATB 蓄力)
                          </div>
                        </div>
                        <div className="text-right whitespace-nowrap pl-2">
                          <span
                            className={`text-xs font-mono font-bold ${
                              isAvailable ? 'text-emerald-400' : 'text-slate-500'
                            }`}
                          >
                            {isAvailable ? '✨ 可發動' : '未就緒'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Item Submenu */}
              {actionMenu === 'item' && (
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {inventory
                    .filter((item) => item.type === 'consumable')
                    .map((item) => (
                      <button
                        key={item.id}
                        disabled={item.quantity <= 0}
                        onClick={() => handleItemUse(item)}
                        className={`p-2.5 rounded border text-left transition-all flex items-center justify-between ${
                          item.quantity > 0
                            ? 'bg-blue-950 hover:bg-blue-900 border-blue-700 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs sm:text-sm">{item.name}</div>
                          <div className="text-[11px] text-slate-400">{item.description}</div>
                        </div>
                        <div className="text-xs font-mono font-bold text-amber-300 whitespace-nowrap pl-2">
                          x{item.quantity}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-slate-400">
              <div className="text-3xl mb-2 animate-bounce">⏳</div>
              <div className="text-sm font-semibold text-slate-200">即時戰鬥中 (Active Time Battle)</div>
              <div className="text-xs text-slate-400 mt-1 max-w-xs">
                角色將根據敏捷度自動蓄滿 ATB 條，蓄滿後立即切換為行動指令。
              </div>
            </div>
          )}
        </div>

        {/* Battle Log Box */}
        <div className="lg:col-span-6 snes-window p-4 flex flex-col justify-between min-h-[220px]">
          <div className="text-xs font-mono text-slate-300 border-b border-blue-900/80 pb-2 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-cyan-400" /> 戰況即時紀要 (Combat Chronicle)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">CHRONO-ATB</span>
          </div>

          <div
            ref={logContainerRef}
            className="flex-1 overflow-y-auto space-y-1.5 text-xs font-mono p-2 bg-slate-950/70 rounded border border-slate-900 max-h-44"
          >
            {battleLogs.map((log) => (
              <div
                key={log.id}
                className={`leading-relaxed ${
                  log.type === 'combo'
                    ? 'text-yellow-300 font-bold bg-amber-950/30 p-1 rounded'
                    : log.type === 'critical'
                    ? 'text-amber-400 font-bold'
                    : log.type === 'damage'
                    ? 'text-rose-300'
                    : log.type === 'heal'
                    ? 'text-emerald-300'
                    : log.type === 'system'
                    ? 'text-cyan-300'
                    : 'text-slate-300'
                }`}
              >
                {log.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
