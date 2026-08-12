import React, { useState, useEffect } from 'react';
import { ClientKocProfile, KocAnalysisResult, AnnuityInput } from '../types';
import { PRESET_CLIENT_PROFILES } from '../data/presetProfiles';
import {
  Users,
  UserCheck,
  Sparkles,
  ShieldAlert,
  HeartHandshake,
  MessageSquare,
  Share2,
  Award,
  ChevronRight,
  Plus,
  RefreshCw,
  CheckCircle2,
  GraduationCap,
  Stethoscope,
  Palmtree,
  Lock,
  DollarSign,
  TrendingUp,
  FileCheck2,
  Clock,
} from 'lucide-react';

interface KocMarketingViewProps {
  annuityInput: AnnuityInput;
  selectedClient: ClientKocProfile;
  onSelectClient: (client: ClientKocProfile) => void;
  analysisResult: KocAnalysisResult | null;
  onUpdateAnalysisResult: (result: KocAnalysisResult) => void;
  onOpenProposalModal: () => void;
}

export const KocMarketingView: React.FC<KocMarketingViewProps> = ({
  annuityInput,
  selectedClient,
  onSelectClient,
  analysisResult,
  onUpdateAnalysisResult,
  onOpenProposalModal,
}) => {
  const [profiles, setProfiles] = useState<ClientKocProfile[]>(PRESET_CLIENT_PROFILES);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Profile Form State
  const [newProfile, setNewProfile] = useState<Partial<ClientKocProfile>>({
    name: '刘女士 (刘董)',
    age: 45,
    gender: 'female',
    occupation: '连锁餐饮品牌创始人',
    familyStatus: '已婚，育有两子',
    annualIncome: '300万 - 500万',
    riskPreference: '稳健型',
    primaryNeeds: ['品质养老', '资产隔离', '财富传承'],
    kocRating: 'S级(意见领袖)',
    concerns: '餐饮行业现金流波动大，希望为家庭留下一笔绝对安全的隔离防守资产。',
    influenceScore: 90,
  });

  // Run AI Analysis for the current selected client
  const runKocAiAnalysis = async (clientToAnalyze = selectedClient) => {
    setLoadingAi(true);
    try {
      const response = await fetch('/api/ai/analyze-koc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: clientToAnalyze,
          annuityPlan: {
            name: annuityInput.productName,
            annualPremium: annuityInput.annualPremium,
            payYears: annuityInput.payYears,
            startAge: annuityInput.payoutStartAge,
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        onUpdateAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error('KOC Analysis failed:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  // Run AI analysis when client changes if not loaded
  useEffect(() => {
    if (!analysisResult) {
      runKocAiAnalysis(selectedClient);
    }
  }, [selectedClient.id]);

  const handleAddNewProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ClientKocProfile = {
      id: `custom_${Date.now()}`,
      name: newProfile.name || '新高价值客户',
      age: newProfile.age || 35,
      gender: (newProfile.gender as any) || 'male',
      occupation: newProfile.occupation || '自由职业/企业主',
      familyStatus: newProfile.familyStatus || '已婚',
      annualIncome: newProfile.annualIncome || '100万+',
      riskPreference: (newProfile.riskPreference as any) || '稳健型',
      primaryNeeds: newProfile.primaryNeeds || ['品质养老'],
      kocRating: (newProfile.kocRating as any) || 'A级(高潜传播者)',
      concerns: newProfile.concerns || '无',
      influenceScore: newProfile.influenceScore || 85,
      notes: '自定义高价值客户',
      avatarBg: 'bg-teal-800',
    };

    setProfiles([created, ...profiles]);
    onSelectClient(created);
    setShowAddModal(false);
    runKocAiAnalysis(created);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#00965E] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-[#007A4D]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white/20 text-white border border-white/25 mb-2 inline-block">
              客情分析与精准营销 360 KOC SYSTEM
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-yellow-300" />
              高价值潜在客户 KOC 需求诊断与一对一定制策略
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-3xl">
              针对不同背景与家庭情况的客户，深度剖析其未来的医疗、教育、养老、资产隔离需求，对症下药提供定制化话术与KOC朋友圈裂变营销策略。
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 text-xs font-bold bg-yellow-300 hover:bg-yellow-200 text-slate-900 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>录入新高价值客户</span>
            </button>
            <button
              onClick={() => runKocAiAnalysis()}
              disabled={loadingAi}
              className="px-3.5 py-2 text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-yellow-300 ${loadingAi ? 'animate-spin' : ''}`} />
              <span>重新AI诊断</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Selector Cards */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          选择待分析的潜在高价值客户/KOC (或直接切换体验):
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {profiles.map((p) => {
            const isSelected = p.id === selectedClient.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelectClient(p);
                  runKocAiAnalysis(p);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#00965E] text-white border-[#007A4D] shadow-md ring-2 ring-yellow-300'
                    : 'bg-white hover:bg-[#F0FDF4] border-[#E0E7E3] text-slate-800 shadow-xs'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 text-[10px] bg-yellow-300 text-slate-900 font-extrabold px-2 py-0.5 rounded-md">
                    当前选定
                  </span>
                )}

                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-xs shrink-0 ${
                      isSelected ? 'bg-[#007A4D]' : p.avatarBg || 'bg-[#00965E]'
                    }`}
                  >
                    {p.name.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm flex items-center gap-1.5">
                      {p.name}
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                          isSelected ? 'bg-[#007A4D] text-yellow-200' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.age}岁
                      </span>
                    </h4>
                    <p className={`text-xs ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>
                      {p.occupation}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-100/20 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className={isSelected ? 'text-emerald-100' : 'text-gray-400'}>
                      KOC辐射力:
                    </span>
                    <span className="font-bold text-yellow-300">{p.kocRating}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.primaryNeeds.slice(0, 3).map((need) => (
                      <span
                        key={need}
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-[#007A4D] text-white border border-white/20'
                            : 'bg-[#E6F4ED] text-[#007A4D]'
                        }`}
                      >
                        {need}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Client Profile Detail + AI Analysis Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Selected Client Deep Profile Card (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E0E7E3] rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-[#00965E] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#00965E]" />
              客户 360 维度全景画像
            </h3>
            <span className="text-xs font-bold bg-[#FEF08A] text-amber-900 px-2 py-0.5 rounded">
              影响力 {selectedClient.influenceScore}/100
            </span>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm text-slate-700">
            <div>
              <span className="text-gray-400 text-xs block">客户姓名与身份:</span>
              <p className="font-bold text-slate-900 text-base">
                {selectedClient.name} ({selectedClient.age}岁 / {selectedClient.gender === 'male' ? '男' : '女'})
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{selectedClient.occupation}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[#F0F4F2] p-3 rounded-xl">
              <div>
                <span className="text-gray-400 text-[11px] block">家庭结构:</span>
                <span className="font-semibold text-slate-800 text-xs">{selectedClient.familyStatus}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">预估年收入:</span>
                <span className="font-semibold text-slate-800 text-xs">{selectedClient.annualIncome}</span>
              </div>
            </div>

            <div>
              <span className="text-gray-400 text-xs block mb-1">主要关注点与需求向量:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedClient.primaryNeeds.map((need) => (
                  <span
                    key={need}
                    className="px-2.5 py-1 bg-[#E6F4ED] text-[#007A4D] rounded-lg font-bold text-xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00965E]" />
                    {need}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-[#FEF08A]/30 border border-[#F27D26]/30 rounded-xl text-xs space-y-1">
              <span className="font-bold text-[#F27D26] block flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-[#F27D26]" />
                客户核心心理顾虑:
              </span>
              <p className="text-slate-800 leading-relaxed">{selectedClient.concerns}</p>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenProposalModal}
                className="w-full py-3 bg-[#00965E] hover:bg-[#007A4D] text-white rounded-xl font-bold shadow-sm hover:shadow transition flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 text-yellow-300" />
                <span>一键生成中宏风格定制建议书</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Custom Diagnosis & Strategy (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {loadingAi ? (
            <div className="bg-white border border-[#E0E7E3] rounded-2xl p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#00965E] animate-spin mx-auto" />
              <h4 className="font-bold text-slate-800 text-base">
                正在调用 Gemini 精算模型诊断【{selectedClient.name}】的个性化策略...
              </h4>
              <p className="text-xs text-gray-400">
                深入剖析医疗、教育金、养老年金与资产隔离需求，拟定专有营销话术
              </p>
            </div>
          ) : analysisResult ? (
            <>
              {/* Section 1: Core Pain Points & Annuity Fit */}
              <div className="bg-white border border-[#E0E7E3] rounded-2xl p-5 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#F27D26]" />
                  客户痛点诊断与年金险对症下药分析
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {analysisResult.corePainPoints.map((pt, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#F0F4F2] rounded-xl text-xs space-y-1"
                    >
                      <span className="font-bold text-[#00965E] block">痛点0{i + 1}</span>
                      <p className="text-slate-700 leading-relaxed">{pt}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 bg-[#E6F4ED] rounded-xl text-xs text-[#007A4D] space-y-1">
                  <span className="font-bold text-[#007A4D] block flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-[#00965E]" />
                    【{annuityInput.productName}】方案匹配说明:
                  </span>
                  <p className="leading-relaxed">{analysisResult.annuityFitAnalysis}</p>
                </div>
              </div>

              {/* Section 2: Lifetime Multi-Decade Timeline & Product Plan (全生命周期几十年节点预判) */}
              <div className="bg-white border border-[#E0E7E3] rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#00965E]" />
                    全生命周期未来几十年 · 关键时间节点与产品组合精算预判
                  </h4>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E6F4ED] text-[#007A4D] w-fit">
                    基于 {selectedClient.name} ({selectedClient.age}岁) 画像精准推演
                  </span>
                </div>

                {analysisResult.lifetimeMilestones && analysisResult.lifetimeMilestones.length > 0 ? (
                  <div className="space-y-3.5">
                    {analysisResult.lifetimeMilestones.map((m, idx) => (
                      <div
                        key={idx}
                        className="bg-[#FAFBF9] border border-[#E0E7E3] border-l-4 border-l-[#00965E] rounded-xl p-4 text-xs space-y-3 hover:shadow-xs transition"
                      >
                        {/* Header Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/60 pb-2">
                          <div className="flex items-center space-x-2">
                            <span className="bg-[#00965E] text-white font-extrabold px-2.5 py-1 rounded-lg text-xs shadow-xs">
                              {m.ageNode} 岁
                            </span>
                            <h5 className="font-bold text-slate-900 text-sm">{m.stageName}</h5>
                          </div>
                          <span className="text-[11px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                            距今约 {m.timeHorizonYears} 年
                          </span>
                        </div>

                        {/* Node Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Left Box: Predicted Scenario & Risks */}
                          <div className="bg-white p-3 rounded-lg border border-gray-100 space-y-2">
                            <div>
                              <span className="font-bold text-slate-800 block text-[11px] text-[#F27D26] flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#F27D26]" />
                                预判可能出现的情况/生活事件:
                              </span>
                              <p className="text-slate-700 mt-1 leading-relaxed">{m.predictedLifeScenario}</p>
                            </div>
                            <div className="pt-1.5 border-t border-dashed border-gray-100">
                              <span className="font-bold text-slate-800 block text-[11px] text-gray-500">
                                财务风险与资金需求剖析:
                              </span>
                              <p className="text-gray-600 mt-0.5 leading-relaxed">{m.riskAndNeedAnalysis}</p>
                            </div>
                          </div>

                          {/* Right Box: Corresponding Product & Solution Arrangements */}
                          <div className="bg-white p-3 rounded-lg border border-[#00965E]/20 space-y-2">
                            <span className="font-bold text-[#00965E] block text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#00965E]" />
                              对应产品组合与保单安排动作:
                            </span>

                            <div className="space-y-2">
                              {m.recommendedProductsAndArrangements?.map((pa, pIdx) => (
                                <div key={pIdx} className="bg-[#E6F4ED]/60 p-2 rounded-md border border-[#00965E]/15 text-[11px]">
                                  <div className="font-bold text-[#007A4D] flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00965E]" />
                                    {pa.productType}
                                  </div>
                                  <p className="text-slate-700 mt-1 font-medium">{pa.actionPlan}</p>
                                  {pa.financialImpact && (
                                    <p className="text-gray-500 text-[10px] mt-0.5 italic">
                                      💡 风控效用: {pa.financialImpact}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 py-2">生成中或暂无全生命周期预判数据...</p>
                )}
              </div>

              {/* Section 2: Multi-Dimensional Needs Matrix (医疗/教育/养老/传承) */}
              <div className="bg-white border border-[#E0E7E3] rounded-2xl p-5 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#00965E]" />
                  一对一多维需求延伸与配置点 (医疗/教育/养老/隔离)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Healthcare */}
                  <div className="p-3 bg-[#F0F4F2] rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-teal-600" />
                      高质医疗需求延伸
                    </span>
                    <p className="text-gray-600">{analysisResult.multiDimensionalNeedsBreakdown.medical}</p>
                  </div>

                  {/* Education */}
                  <div className="p-3 bg-[#F0F4F2] rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-[#F27D26]" />
                      子女教育金储备
                    </span>
                    <p className="text-gray-600">{analysisResult.multiDimensionalNeedsBreakdown.education}</p>
                  </div>

                  {/* Pension */}
                  <div className="p-3 bg-[#F0F4F2] rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Palmtree className="w-4 h-4 text-[#00965E]" />
                      高品质养老年金
                    </span>
                    <p className="text-gray-600">{analysisResult.multiDimensionalNeedsBreakdown.pension}</p>
                  </div>

                  {/* Legacy */}
                  <div className="p-3 bg-[#F0F4F2] rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-indigo-600" />
                      财富隔离与定向传承
                    </span>
                    <p className="text-gray-600">{analysisResult.multiDimensionalNeedsBreakdown.legacy}</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Personalized Sales Pitch Script (开场白 + 价值主张 + 异议处理) */}
              <div className="bg-white border border-[#E0E7E3] rounded-2xl p-5 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#00965E]" />
                  1对1 个性化营销沟通话术与高情商异议处理
                </h4>

                {/* Opening */}
                <div className="p-3.5 bg-[#F0F4F2] rounded-xl text-xs space-y-1">
                  <span className="font-bold text-[#00965E] block">💬 专属高情商开场白:</span>
                  <p className="text-slate-800 italic">{analysisResult.personalizedPitchScript.opening}</p>
                </div>

                {/* Value Prop */}
                <div className="p-3.5 bg-[#F0F4F2] rounded-xl text-xs space-y-1">
                  <span className="font-bold text-[#00965E] block">🎯 核心亮点切入点:</span>
                  <p className="text-slate-800">{analysisResult.personalizedPitchScript.valueProposition}</p>
                </div>

                {/* Objection Handling */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    🛡️ 预判异议与金牌应答话术:
                  </span>
                  {analysisResult.personalizedPitchScript.objectionHandling.map((item, i) => (
                    <div key={i} className="p-3 bg-[#FEF08A]/30 border border-[#F27D26]/20 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-[#F27D26]">{item.question}</p>
                      <p className="text-slate-800 leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: KOC Referral & Social Push Strategy */}
              <div className="bg-[#1A1A1A] text-white rounded-2xl p-5 shadow-md space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-yellow-300" />
                  KOC 朋友圈与圈层转介绍精准营销推文
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 space-y-1">
                    <span className="font-bold text-[#00965E] block">KOC 裂变引流建议:</span>
                    <p className="text-gray-300">{analysisResult.kocStrategy.marketingChannelAdvice}</p>
                  </div>

                  <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 space-y-1">
                    <span className="font-bold text-[#00965E] block">自然索取转介绍话术:</span>
                    <p className="text-gray-300 italic">{analysisResult.kocStrategy.referralIncentiveScript}</p>
                  </div>
                </div>

                <div className="bg-gray-900 p-3.5 rounded-xl border border-yellow-300/30 text-xs space-y-1">
                  <span className="font-bold text-yellow-300 block">
                    📱 专属朋友圈/社群营销文案 (一键复制):
                  </span>
                  <p className="text-gray-200 leading-relaxed select-all">
                    {analysisResult.kocStrategy.circlePushCopy}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Modal for Adding New Client Profile */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              录入新的潜在高价值客户档案
            </h3>

            <form onSubmit={handleAddNewProfile} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">客户姓名/称呼</label>
                  <input
                    type="text"
                    required
                    value={newProfile.name}
                    onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">年龄</label>
                  <input
                    type="number"
                    required
                    value={newProfile.age}
                    onChange={(e) => setNewProfile({ ...newProfile, age: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">职业/头衔</label>
                  <input
                    type="text"
                    value={newProfile.occupation}
                    onChange={(e) => setNewProfile({ ...newProfile, occupation: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">预估年收入</label>
                  <input
                    type="text"
                    value={newProfile.annualIncome}
                    onChange={(e) => setNewProfile({ ...newProfile, annualIncome: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">客户核心顾虑与想法</label>
                <textarea
                  rows={2}
                  value={newProfile.concerns}
                  onChange={(e) => setNewProfile({ ...newProfile, concerns: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  保存并生成策略
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
