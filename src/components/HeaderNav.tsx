import React from 'react';
import { Calculator, Target, Users, FileText, ShieldCheck, TrendingUp, Sparkles, Download } from 'lucide-react';

export type TabType = 'calculator' | 'reverse' | 'koc' | 'proposal';

interface HeaderNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  selectedClientName?: string;
  hasKocAnalysis: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  onSelectTab,
  selectedClientName,
  hasKocAnalysis,
}) => {
  return (
    <header className="bg-[#00965E] text-white shadow-md border-b border-[#007A4D] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-xs shrink-0">
              <div className="w-5 h-5 bg-[#00965E] rounded-sm transform rotate-45 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-white -rotate-45" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] tracking-wider font-extrabold px-2 py-0.5 rounded bg-white/20 text-white uppercase">
                  MANULIFE SINOCHEM
                </span>
                <span className="text-xs text-yellow-200 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 智尊精算 3.0
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 mt-0.5">
                中宏保险 | 智慧年金计算 & KOC客情系统
              </h1>
            </div>
          </div>

          {/* Right Status badge & Download ZIP */}
          <div className="flex items-center space-x-2">
            <a
              href="/project_source.zip"
              download="project_source.zip"
              title="一键下载整套源码 ZIP 包"
              className="flex items-center space-x-1.5 text-xs font-bold text-emerald-950 bg-amber-300 hover:bg-amber-200 border border-amber-400 rounded-full px-3 py-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载源码 ZIP</span>
            </a>

            <div className="hidden md:flex items-center space-x-2 text-xs text-white/90 bg-[#007A4D] border border-white/20 rounded-full px-3.5 py-1.5 shadow-xs">
              <TrendingUp className="w-3.5 h-3.5 text-yellow-300" />
              <span>适配高价值客户: <strong className="text-yellow-200 font-bold">{selectedClientName || '张立华 (张总)'}</strong></span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-2 border-t border-white/15 pt-2 pb-2 overflow-x-auto no-scrollbar">
          <button
            id="tab-btn-calculator"
            onClick={() => onSelectTab('calculator')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-white text-[#00965E] shadow-sm font-bold'
                : 'text-white/85 hover:bg-[#007A4D] hover:text-white'
            }`}
          >
            <Calculator className={`w-4 h-4 ${activeTab === 'calculator' ? 'text-[#00965E]' : 'text-white/80'}`} />
            <span>1. 收益测算 & 保单演示</span>
          </button>

          <button
            id="tab-btn-reverse"
            onClick={() => onSelectTab('reverse')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'reverse'
                ? 'bg-white text-[#00965E] shadow-sm font-bold'
                : 'text-white/85 hover:bg-[#007A4D] hover:text-white'
            }`}
          >
            <Target className={`w-4 h-4 ${activeTab === 'reverse' ? 'text-[#F27D26]' : 'text-yellow-300'}`} />
            <span>2. 50岁目标倒推试算</span>
          </button>

          <button
            id="tab-btn-koc"
            onClick={() => onSelectTab('koc')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer relative ${
              activeTab === 'koc'
                ? 'bg-white text-[#00965E] shadow-sm font-bold'
                : 'text-white/85 hover:bg-[#007A4D] hover:text-white'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'koc' ? 'text-[#00965E]' : 'text-white/80'}`} />
            <span>3. KOC精准营销</span>
            {hasKocAnalysis && (
              <span className="w-2 h-2 rounded-full bg-yellow-300 absolute top-2 right-2 animate-pulse" />
            )}
          </button>

          <button
            id="tab-btn-proposal"
            onClick={() => onSelectTab('proposal')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'proposal'
                ? 'bg-white text-[#00965E] shadow-sm font-bold'
                : 'text-white/85 hover:bg-[#007A4D] hover:text-white'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === 'proposal' ? 'text-[#00965E]' : 'text-white/80'}`} />
            <span>4. 1对1定制报告</span>
          </button>
        </div>
      </div>
    </header>
  );
};
