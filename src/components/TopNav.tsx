import React from 'react';
import { Volume2, VolumeX, Monitor, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

export type ActiveTab = 'era_map' | 'battle' | 'causality' | 'party' | 'story';

interface TopNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isBattleActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  scanlinesEnabled: boolean;
  onToggleScanlines: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  isBattleActive,
  isMuted,
  onToggleMute,
  scanlinesEnabled,
  onToggleScanlines,
}) => {
  const handleNav = (tab: ActiveTab) => {
    soundManager.playCursor();
    onTabChange(tab);
  };

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-blue-900/60 bg-slate-950/95 sticky top-0 z-50 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark in display face */}
      <button
        onClick={() => handleNav('era_map')}
        className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-amber-300 transition-colors font-serif-cinzel flex items-center gap-2"
      >
        <span className="text-amber-400 font-pixel text-xs">CHRONO</span>
        <span>時空之輪：因果迴廊</span>
      </button>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-5 text-xs sm:text-sm font-medium text-slate-400">
        <button
          onClick={() => handleNav('era_map')}
          className={`transition-colors hover:text-slate-100 whitespace-nowrap ${
            activeTab === 'era_map' ? 'text-amber-300 font-bold border-b-2 border-amber-400 pb-0.5' : ''
          }`}
        >
          五大時代地圖
        </button>

        <button
          onClick={() => handleNav('battle')}
          className={`transition-colors hover:text-slate-100 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'battle' ? 'text-amber-300 font-bold border-b-2 border-amber-400 pb-0.5' : ''
          }`}
        >
          <span>ATB 即時戰鬥</span>
          {isBattleActive && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
          )}
        </button>

        <button
          onClick={() => handleNav('causality')}
          className={`transition-colors hover:text-slate-100 whitespace-nowrap ${
            activeTab === 'causality' ? 'text-amber-300 font-bold border-b-2 border-amber-400 pb-0.5' : ''
          }`}
        >
          因果蝴蝶矩陣
        </button>

        <button
          onClick={() => handleNav('party')}
          className={`transition-colors hover:text-slate-100 whitespace-nowrap ${
            activeTab === 'party' ? 'text-amber-300 font-bold border-b-2 border-amber-400 pb-0.5' : ''
          }`}
        >
          隊伍與合體技
        </button>

        <button
          onClick={() => handleNav('story')}
          className={`transition-colors hover:text-slate-100 whitespace-nowrap ${
            activeTab === 'story' ? 'text-amber-300 font-bold border-b-2 border-amber-400 pb-0.5' : ''
          }`}
        >
          序章文字因果
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleScanlines}
          title={scanlinesEnabled ? '關閉 CRT 復古掃描線' : '開啟 CRT 復古掃描線'}
          className={`p-2 rounded border text-xs transition-all flex items-center gap-1 ${
            scanlinesEnabled
              ? 'bg-amber-950/80 border-amber-500 text-amber-300'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span className="hidden sm:inline font-mono">CRT</span>
        </button>

        <button
          onClick={onToggleMute}
          title={isMuted ? '取消靜音 (播放 16-bit 音效與主題曲)' : '靜音'}
          className={`p-2 rounded border text-xs transition-all flex items-center gap-1 ${
            !isMuted
              ? 'bg-blue-950/80 border-blue-500 text-cyan-300'
              : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-white'
          }`}
        >
          {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline font-mono">{!isMuted ? 'BGM' : 'MUTE'}</span>
        </button>
      </div>
    </header>
  );
};
