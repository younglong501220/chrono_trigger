import React, { useState } from 'react';
import { Character } from '../types/game';
import { COMBO_TECHS } from '../data/techCombos';
import { soundManager } from '../audio/soundManager';
import { Users, Sparkles, Sword, Shield, Zap, Flame, Award, Check } from 'lucide-react';

interface PartyScreenProps {
  allCharacters: Character[];
  activePartyIds: string[];
  onToggleActiveParty: (charId: string) => void;
}

export const PartyScreen: React.FC<PartyScreenProps> = ({
  allCharacters,
  activePartyIds,
  onToggleActiveParty,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(activePartyIds[0] || 'cross');

  const selectedChar = allCharacters.find((c) => c.id === selectedCharId) || allCharacters[0];

  // Find all combos involving the selected character
  const relatedCombos = COMBO_TECHS.filter((c) => c.requiredCharacterIds.includes(selectedChar.id));

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Active Battle Party Bar */}
      <div className="snes-window p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-blue-900/60 pb-3 mb-4">
          <div>
            <div className="text-xs font-mono text-amber-300 font-bold flex items-center gap-1.5 mb-0.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>時空冒險小隊陣容 (Active Battle Roster)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-serif-cinzel">
              出戰隊員配置 (最多選擇 3 名英雄參戰)
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-300 bg-slate-900 px-3 py-1.5 rounded border border-slate-700">
            出戰中: <span className="text-amber-400 font-bold">{activePartyIds.length}</span> / 3 名
          </div>
        </div>

        {/* Character Card Carousel / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {allCharacters.map((char) => {
            const isActive = activePartyIds.includes(char.id);
            const isInspecting = selectedCharId === char.id;

            return (
              <div
                key={char.id}
                onClick={() => {
                  soundManager.playCursor();
                  setSelectedCharId(char.id);
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between min-h-[130px] relative ${
                  isInspecting
                    ? 'snes-window-gold border-amber-400 scale-102'
                    : isActive
                    ? 'bg-blue-950/80 border-blue-600'
                    : 'bg-slate-900/70 border-slate-800 opacity-70 hover:opacity-100'
                }`}
              >
                {isActive && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-emerald-500 text-slate-950 text-[9px] font-black rounded">
                    出戰中
                  </span>
                )}

                <div>
                  <div className="text-[10px] text-amber-300/80 font-mono line-clamp-1">{char.title}</div>
                  <div className="font-bold text-xs sm:text-sm text-white mt-0.5">{char.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">Lv.{char.level}</div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-700/50 flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-300">
                    <span>HP</span>
                    <span className="font-bold">{char.hp}/{char.maxHp}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundManager.playSelect();
                      onToggleActiveParty(char.id);
                    }}
                    className={`mt-1 py-1 px-1.5 rounded text-[10px] font-bold font-mono transition-all flex items-center justify-center gap-1 ${
                      isActive
                        ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isActive ? '離隊待命' : '加入先鋒'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Character Deep Profile & Techs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Attributes and Gear */}
        <div className="lg:col-span-5 snes-window p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-3 mb-4">
              <div>
                <span className="text-xs text-amber-300 font-mono">{selectedChar.title}</span>
                <h3 className="text-xl font-bold text-white">{selectedChar.name}</h3>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="px-2 py-0.5 bg-blue-900/80 border border-blue-700 text-blue-200 rounded uppercase">
                  {selectedChar.element} 屬性
                </span>
              </div>
            </div>

            {/* Stat meters */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-2 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Sword className="w-3.5 h-3.5 text-amber-400" /> 配備兵裝:
                </span>
                <span className="text-white font-bold">{selectedChar.weapon}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">物理攻擊:</span>
                  <span className="text-amber-300 font-bold">{selectedChar.atk}</span>
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">物理防禦:</span>
                  <span className="text-blue-300 font-bold">{selectedChar.def}</span>
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">行動速度:</span>
                  <span className="text-emerald-300 font-bold">{selectedChar.spd}</span>
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">魔導力量:</span>
                  <span className="text-purple-300 font-bold">{selectedChar.magic}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 leading-relaxed font-sans-tc">
            💡 戰術小提示：將克羅斯、露卡與瑪爾同時配置進隊伍，在戰鬥中雙方蓄滿 ATB 即可直接啟動經典的
            【火焰旋風輪】、【極光十字斬】與【冰炎雙重爆】！
          </div>
        </div>

        {/* Right: Techs & Combinations Showcase */}
        <div className="lg:col-span-7 snes-window p-4 sm:p-6 flex flex-col gap-4">
          <div className="border-b border-blue-900/60 pb-2">
            <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>特技清單 (Individual Skills)</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {selectedChar.skills.map((skill) => (
              <div
                key={skill.id}
                className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                    <span>{skill.name}</span>
                    <span className="text-sky-300 font-mono">{skill.mpCost} MP</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{skill.description}</p>
                </div>
                <div className="mt-2 text-[10px] font-mono text-amber-300 uppercase">
                  倍率: x{skill.damageMultiplier} ‧ 目標: {skill.target}
                </div>
              </div>
            ))}
          </div>

          <div className="border-b border-blue-900/60 pb-2 mt-2">
            <h4 className="font-bold text-sm sm:text-base text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>可參與的連攜合體技 (Dual & Triple Techs)</span>
            </h4>
          </div>

          <div className="space-y-2">
            {relatedCombos.map((combo) => (
              <div
                key={combo.id}
                className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg flex flex-col justify-between text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-amber-200 flex items-center gap-2">
                    <span>{combo.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">
                      {combo.type === 'triple' ? '三人終極奧義' : '二人連攜技'}
                    </span>
                  </div>
                  <span className="font-mono text-amber-400 font-bold">
                    倍率 x{combo.damageMultiplier}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] mt-1">{combo.description}</p>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  參戰成員: {combo.requiredCharacterIds.join(' + ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
