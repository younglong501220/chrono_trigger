import React from 'react';
import { EraId } from '../types/game';
import { ERAS_DATA } from '../data/eras';
import { soundManager } from '../audio/soundManager';
import { Compass, Sparkles, Swords, MessageSquare, Clock, ShieldAlert } from 'lucide-react';

interface EraMapScreenProps {
  currentEra: EraId;
  onSelectEra: (eraId: EraId) => void;
  onSelectLandmark: (landmarkId: string, actionType: string) => void;
  causalityFlags: Record<string, boolean>;
}

export const EraMapScreen: React.FC<EraMapScreenProps> = ({
  currentEra,
  onSelectEra,
  onSelectLandmark,
  causalityFlags,
}) => {
  const currentEraData = ERAS_DATA[currentEra];
  const eraKeys: EraId[] = ['BC_65M', 'AD_600', 'AD_1000', 'AD_2300', 'END_OF_TIME'];

  const handleEraClick = (eraId: EraId) => {
    if (eraId === currentEra) return;
    soundManager.playTimeGateWarp();
    onSelectEra(eraId);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Era Navigation Timeline Selector */}
      <div className="snes-window p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3 border-b border-blue-900/60 pb-2">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>時空指針 ‧ 次元坐標跳躍 (Epoch Dimensional Key)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">5 大時代無縫穿梭</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {eraKeys.map((eraId) => {
            const era = ERAS_DATA[eraId];
            const isActive = eraId === currentEra;

            return (
              <button
                key={eraId}
                onClick={() => handleEraClick(eraId)}
                className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[78px] ${
                  isActive
                    ? 'snes-window-gold border-amber-400 scale-102 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-700/80 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-[10px] font-mono text-amber-300/80">{era.timePeriod}</div>
                  <div className="font-bold text-xs sm:text-sm text-white mt-0.5 line-clamp-1">
                    {era.name}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-700/40 text-[10px] font-mono">
                  {isActive ? (
                    <span className="text-amber-300 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      當前時代
                    </span>
                  ) : (
                    <span className="text-slate-400 hover:text-white flex items-center gap-1">
                      🌀 跳躍穿越
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Era Visual Feature & Lore Showcase */}
      <div className="snes-window overflow-hidden relative">
        <div className="relative h-60 sm:h-72 w-full overflow-hidden">
          <img
            src={currentEraData.image}
            alt={currentEraData.name}
            className="w-full h-full object-cover brightness-85 transform transition-transform duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Floating Era Title overlay */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentEraData.timePeriod}</span>
              <span className="text-slate-400">·</span>
              <span>{currentEraData.subtitle}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif-cinzel">
              {currentEraData.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {currentEraData.description}
            </p>
          </div>
        </div>

        {/* Dynamic Causality Alert Banner for this Era */}
        {currentEra === 'AD_2300' && (
          <div
            className={`p-3 border-t text-xs font-mono flex items-center justify-between ${
              causalityFlags['seed_planted']
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-red-950/60 border-red-800/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>
                {causalityFlags['seed_planted']
                  ? '【因果改寫生效】6500 萬年前埋下的種子已化為艾登綠洲！獲得神聖聖劍與倖存者崇敬！'
                  : '【時間線現狀】荒無人煙的酸雨廢土。提示：前往 B.C. 6500萬年火山口播下種子可改寫未來！'}
              </span>
            </div>
          </div>
        )}

        {currentEra === 'AD_1000' && causalityFlags['royal_treasury_seal'] && (
          <div className="p-3 bg-amber-950/60 border-t border-amber-600/40 text-xs font-mono text-amber-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>【因果改寫生效】中世紀四百年的封印醞釀，千禧寶庫中已凝結出【虹色神聖護甲】！</span>
          </div>
        )}
      </div>

      {/* Era Landmarks & Exploration Points */}
      <div className="snes-window p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 border-b border-blue-900/60 pb-2">
          <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
            <span className="text-amber-400">❖</span>
            <span>時代地標與歷史干涉節點 (Historical Landmarks)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">點擊即可探索或迎戰</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentEraData.landmarks.map((landmark) => {
            const isSpecial = landmark.actionType === 'butterfly';
            const isBoss = landmark.actionType === 'boss';

            return (
              <div
                key={landmark.id}
                className={`p-4 rounded-lg border transition-all flex flex-col justify-between ${
                  isSpecial
                    ? 'bg-amber-950/30 border-amber-600/60 hover:border-amber-400'
                    : isBoss
                    ? 'bg-red-950/30 border-red-700/60 hover:border-red-400'
                    : 'bg-slate-900/80 border-slate-700 hover:border-blue-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{landmark.icon}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        isSpecial
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : isBoss
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {isSpecial ? '🦋 蝴蝶節點' : isBoss ? '⚔️ 時代強敵' : '💬 探索交涉'}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm sm:text-base text-white">{landmark.name}</h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {landmark.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/50">
                  <button
                    onClick={() => {
                      soundManager.playSelect();
                      onSelectLandmark(landmark.id, landmark.actionType);
                    }}
                    className={`w-full py-2 px-3 rounded text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
                      isBoss
                        ? 'bg-red-700 hover:bg-red-600 text-white'
                        : isSpecial
                        ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                        : 'bg-blue-700 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {isBoss ? (
                      <>
                        <Swords className="w-3.5 h-3.5" /> 拔劍決鬥 (進入 ATB 戰鬥)
                      </>
                    ) : isSpecial ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> 干涉因果事件
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3.5 h-3.5" /> 調查與交涉
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
