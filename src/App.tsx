import React, { useState } from 'react';
import { HeaderNav, TabType } from './components/HeaderNav';
import { AnnuityCalculatorView } from './components/AnnuityCalculatorView';
import { ReverseGoalCalculatorView } from './components/ReverseGoalCalculatorView';
import { KocMarketingView } from './components/KocMarketingView';
import { CustomProposalDeckModal } from './components/CustomProposalDeckModal';
import { AnnuityInput, ClientKocProfile, KocAnalysisResult } from './types';
import { PRESET_CLIENT_PROFILES } from './data/presetProfiles';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('calculator');

  // Core Annuity Calculation Input State
  const [annuityInput, setAnnuityInput] = useState<AnnuityInput>({
    productName: '中宏智尊金生年金保险方案',
    issueAge: 35,
    gender: 'male',
    annualPremium: 50000,
    payYears: 5,
    payoutStartAge: 60,
    payoutFrequency: 'yearly',
    guaranteedRate: 2.0,
    dividendTier: 'medium',
    enableUniversalAccount: true,
    universalAccountRate: 3.5,
    firstYearBonusPercent: 0,
  });

  // Selected Client Profile State
  const [selectedClient, setSelectedClient] = useState<ClientKocProfile>(PRESET_CLIENT_PROFILES[0]);

  // KOC Analysis Cache
  const [kocAnalysisResult, setKocAnalysisResult] = useState<KocAnalysisResult | null>(null);

  // Proposal Deck Modal State
  const [proposalModalOpen, setProposalModalOpen] = useState<boolean>(false);

  // Apply Calculated Premium from Reverse Engine
  const handleApplyCalculatedPremium = (payYears: number, annualPremium: number, startAge: number) => {
    setAnnuityInput((prev) => ({
      ...prev,
      payYears: payYears as any,
      annualPremium: Math.round(annualPremium),
      payoutStartAge: startAge,
    }));
    setActiveTab('calculator');
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] text-[#333333] flex flex-col font-sans antialiased selection:bg-[#00965E]/20 selection:text-[#00965E]">
      {/* Navigation Header */}
      <HeaderNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'proposal') {
            setProposalModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        selectedClientName={selectedClient.name}
        hasKocAnalysis={Boolean(kocAnalysisResult)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'calculator' && (
          <AnnuityCalculatorView
            input={annuityInput}
            onChangeInput={setAnnuityInput}
            onGoToReverseTab={() => setActiveTab('reverse')}
            onGoToKocTab={() => setActiveTab('koc')}
          />
        )}

        {activeTab === 'reverse' && (
          <ReverseGoalCalculatorView
            onApplyCalculatedPremium={handleApplyCalculatedPremium}
          />
        )}

        {activeTab === 'koc' && (
          <KocMarketingView
            annuityInput={annuityInput}
            selectedClient={selectedClient}
            onSelectClient={(c) => {
              setSelectedClient(c);
              setKocAnalysisResult(null); // Reset analysis cache so it regenerates
            }}
            analysisResult={kocAnalysisResult}
            onUpdateAnalysisResult={setKocAnalysisResult}
            onOpenProposalModal={() => setProposalModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 bg-white border-t border-[#E0E7E3] text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 中宏保险 Manulife-Sinochem · 智慧年金计算 & KOC客情系统</p>
          <div className="flex items-center space-x-3 text-[11px] text-gray-400 font-medium">
            <a
              href="/project_source.zip"
              download="project_source.zip"
              className="text-[#00965E] hover:underline font-bold flex items-center gap-1"
            >
              📥 点击下载本工程完整 ZIP 源码
            </a>
            <span>•</span>
            <span>实时精算引擎</span>
            <span>•</span>
            <span>复利IRR演示</span>
          </div>
        </div>
      </footer>

      {/* Proposal Deck Printable Modal */}
      <CustomProposalDeckModal
        isOpen={proposalModalOpen}
        onClose={() => setProposalModalOpen(false)}
        client={selectedClient}
        annuityInput={annuityInput}
        analysisResult={kocAnalysisResult}
      />
    </div>
  );
}
