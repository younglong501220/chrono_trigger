import React, { useState } from 'react';
import { StoryStep, StoryChoice } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { MessageSquare, Sparkles, Send, Compass } from 'lucide-react';

interface StoryDialogModalProps {
  step: StoryStep;
  onSelectChoice: (choice: StoryChoice) => void;
  onCustomAction: (actionText: string) => void;
  onClose?: () => void;
}

export const StoryDialogModal: React.FC<StoryDialogModalProps> = ({
  step,
  onSelectChoice,
  onCustomAction,
  onClose,
}) => {
  const [customInput, setCustomInput] = useState<string>('');

  const handleChoiceClick = (choice: StoryChoice) => {
    soundManager.playSelect();
    onSelectChoice(choice);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    soundManager.playSelect();
    onCustomAction(customInput.trim());
    setCustomInput('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto snes-window-gold p-4 sm:p-6 flex flex-col gap-4 shadow-[0_10px_35px_rgba(0,0,0,0.85)]">
      {/* Speaker Bar */}
      <div className="flex items-center justify-between border-b border-amber-500/40 pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-sm sm:text-base text-amber-300 font-serif-cinzel">
            {step.speaker}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" /> {step.title}
          </span>
          {onClose && (
            <button
              onClick={() => {
                soundManager.playCursor();
                onClose();
              }}
              className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-700"
            >
              ✕ 收起
            </button>
          )}
        </div>
      </div>

      {/* Main Dialogue Box */}
      <div className="p-4 bg-slate-950/80 rounded-lg border border-blue-900/60 min-h-[110px] flex flex-col justify-center">
        <p className="text-sm sm:text-base text-slate-100 leading-relaxed whitespace-pre-line font-sans-tc">
          {step.dialogue}
        </p>
      </div>

      {/* Action Options Selection */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="text-xs font-mono text-amber-300 font-bold flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>你決定採取什麼行動？（請點選抉擇，將引發跨時空蝴蝶效應）:</span>
        </div>

        {step.choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleChoiceClick(choice)}
            className="p-3 bg-blue-950/70 hover:bg-blue-900/90 border border-blue-700/80 hover:border-amber-400 rounded-lg text-left text-xs sm:text-sm text-slate-100 font-medium transition-all group flex items-start gap-2.5 shadow-sm"
          >
            <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
              ▶
            </span>
            <span className="leading-snug">{choice.text}</span>
          </button>
        ))}

        {/* Custom Action (Option 4: 自訂行動) */}
        {step.isCustomActionAllowed && (
          <form onSubmit={handleCustomSubmit} className="mt-2 pt-2 border-t border-amber-500/30">
            <div className="text-xs text-amber-300 font-mono mb-1.5 flex items-center gap-1.5">
              <span>【選項 4】（自訂行動）輸入任何你想做的動作：</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="例如：嘗試用拔刀斬切斷電弧、呼喚警衛隊、向露卡索取能量核心..."
                className="flex-1 bg-slate-950/90 border border-blue-800 rounded px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                type="submit"
                disabled={!customInput.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs sm:text-sm rounded transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" /> 執行
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
