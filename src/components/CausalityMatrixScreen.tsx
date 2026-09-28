import React from 'react';
import { CausalityEvent, GameEnding, EraId } from '../types/game';
import { ERAS_DATA } from '../data/eras';
import { soundManager } from '../audio/soundManager';
import { GitBranch, Sparkles, CheckCircle2, Circle, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';

interface CausalityMatrixScreenProps {
  events: CausalityEvent[];
  endings: GameEnding[];
  onTriggerEvent?: (eventId: string) => void;
  onNavigateEra: (eraId: EraId) => void;
}

export const CausalityMatrixScreen: React.FC<CausalityMatrixScreenProps> = ({
  events,
  endings,
  onNavigateEra,
}) => {
  const completedCount = events.filter((e) => e.isCompleted).length;
  const progressPercent = Math.round((completedCount / events.length) * 100);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header Metric / Overview */}
      <div className="snes-window p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-900/60 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-300 font-bold mb-1">
              <GitBranch className="w-4 h-4 text-amber-400" />
              <span>時空因果矩陣 ‧ 蝴蝶效應監控儀 (Butterfly Causality Nexus)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif-cinzel">
              歷史分歧與跨時代漣漪網路
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              你在過去時代的微小抉擇（救下一顆種子、封印一件寶物），都將直接顛覆數百年乃至千萬年後的世界格局。
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-lg flex items-center gap-4 min-w-[200px]">
            <div>
              <div className="text-[10px] text-slate-400 font-mono">因果收束完成度</div>
              <div className="text-2xl font-bold text-amber-300 font-pixel tabular-nums">
                {progressPercent}%
              </div>
            </div>
            <div className="text-right text-xs font-mono text-slate-300">
              <div>
                已改寫: <span className="text-emerald-400 font-bold">{completedCount}</span> / {events.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">多重歷史分支</div>
            </div>
          </div>
        </div>

        {/* Five Eras Flow Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-2">
          {(['BC_65M', 'AD_600', 'AD_1000', 'AD_2300', 'END_OF_TIME'] as EraId[]).map((eraId, idx) => {
            const era = ERAS_DATA[eraId];
            return (
              <div
                key={eraId}
                onClick={() => {
                  soundManager.playSelect();
                  onNavigateEra(eraId);
                }}
                className="p-2.5 bg-slate-900/80 hover:bg-slate-850 rounded border border-slate-700/80 cursor-pointer transition-all hover:border-amber-400 group"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>階段 0{idx + 1}</span>
                  <span className="text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    前往 →
                  </span>
                </div>
                <div className="font-bold text-xs text-white mt-1 group-hover:text-amber-300">
                  {era.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{era.timePeriod}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Causality Events List */}
      <div className="snes-window p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 border-b border-blue-900/60 pb-2">
          <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>核心因果鏈節點 (Active Butterfly Links)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">跨時代連鎖影響</span>
        </div>

        <div className="flex flex-col gap-4">
          {events.map((event) => {
            const sourceEra = ERAS_DATA[event.sourceEra];
            const targetEra = ERAS_DATA[event.targetEra];

            return (
              <div
                key={event.id}
                className={`p-4 rounded-xl border transition-all ${
                  event.isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    {event.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 shrink-0" />
                    )}
                    <h4 className="font-bold text-sm sm:text-base text-white">{event.title}</h4>
                  </div>

                  {/* Era Leap Pill */}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-amber-300 font-bold">{sourceEra.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-emerald-400 font-bold">{targetEra.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                  <div className="p-3 bg-slate-950/60 rounded border border-slate-800/80">
                    <div className="text-[11px] font-mono text-amber-300/80 font-bold mb-1">
                      ◀ 過去的抉擇行動 ({sourceEra.timePeriod}):
                    </div>
                    <p className="text-slate-300">{event.pastAction}</p>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded border border-slate-800/80">
                    <div className="text-[11px] font-mono text-emerald-300/80 font-bold mb-1">
                      ▶ 未來的因果改寫 ({targetEra.timePeriod}):
                    </div>
                    <p className="text-slate-300">{event.futureConsequence}</p>
                  </div>
                </div>

                {/* Perk & Reward tag */}
                {event.unlockedItemOrPerk && (
                  <div
                    className={`mt-3 p-2 rounded text-xs font-mono flex items-center justify-between ${
                      event.isCompleted
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/40'
                        : 'bg-slate-950/50 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>解鎖永續特權: {event.unlockedItemOrPerk}</span>
                    </div>
                    <span className="font-bold">
                      {event.isCompleted ? '✨ 已啟動生效' : '🔒 待歷史干涉'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Endings Compendium Gallery */}
      <div className="snes-window p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 border-b border-blue-900/60 pb-2">
          <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>多重歷史結局畫卷 (Chronicle of Endings)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">4 大分支終局</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {endings.map((ending) => (
            <div
              key={ending.id}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                ending.unlocked
                  ? 'snes-window-gold border-amber-400'
                  : 'bg-slate-900/70 border-slate-800 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-300">{ending.tag}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      ending.unlocked
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {ending.unlocked ? '🏆 已達成' : '🔒 未解鎖'}
                  </span>
                </div>
                <h4 className="font-bold text-sm sm:text-base text-white">{ending.title}</h4>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  解鎖條件: {ending.condition}
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{ending.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
