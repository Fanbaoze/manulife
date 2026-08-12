import React from 'react';
import { ClientKocProfile, KocAnalysisResult, AnnuityInput } from '../types';
import { calculateAnnuitySchedule } from '../utils/actuaryEngine';
import {
  ShieldCheck,
  X,
  Printer,
  Copy,
  CheckCircle2,
  Calendar,
  Award,
  Lock,
  Palmtree,
  GraduationCap,
  Stethoscope,
  Sparkles,
  Clock,
} from 'lucide-react';

interface CustomProposalDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientKocProfile;
  annuityInput: AnnuityInput;
  analysisResult: KocAnalysisResult | null;
}

export const CustomProposalDeckModal: React.FC<CustomProposalDeckModalProps> = ({
  isOpen,
  onClose,
  client,
  annuityInput,
  analysisResult,
}) => {
  if (!isOpen) return null;

  const summary = calculateAnnuitySchedule(annuityInput);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `【中宏智尊年金险·1对1专属规划建议书】
受众客户: ${client.name} (${client.age}岁)
规划方案: ${annuityInput.productName}
年交保费: ￥${annuityInput.annualPremium.toLocaleString()}元 (${annuityInput.payYears}年交)
总投保费: ￥${summary.totalPremiumPaid.toLocaleString()}元
起领年龄: ${annuityInput.payoutStartAge}岁
80岁累计收益: ￥${summary.totalPayoutAtAge80.toLocaleString()}元 (IRR ${summary.irrAtAge80}%)
核心痛点对症: ${analysisResult?.annuityFitAnalysis || '锁定长期确定性现金流'}`;

    navigator.clipboard.writeText(text);
    alert('已成功复制建议书摘要文本！');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E0E7E3] overflow-hidden my-auto print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Top Actions Bar */}
        <div className="bg-[#1A1A1A] text-white p-4 px-6 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00965E] animate-ping" />
            <span className="font-bold text-sm">中宏风格 · 1对1家庭财富与年金险规划建议书</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-yellow-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>复制摘要</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#00965E] hover:bg-[#007A4D] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印/导出PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 bg-[#F7F9F8] print:p-0">
          {/* Manulife Standard Brand Header */}
          <div className="bg-[#00965E] text-white rounded-2xl p-6 shadow-md border border-[#007A4D]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#007A4D] pb-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-yellow-300" />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-yellow-300 uppercase block">
                    MANULIFE SINOCHEM STYLE
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    中宏智尊·家庭财富与年金规划建议书
                  </h1>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-emerald-100">
                <p>建议书编号: MNL-{Date.now().toString().slice(-6)}</p>
                <p className="mt-0.5">编制日期: {new Date().toLocaleDateString('zh-CN')}</p>
              </div>
            </div>

            {/* Client Card Header */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#007A4D]/80 p-2.5 rounded-xl border border-white/10">
                <span className="text-emerald-100 block">尊敬的客户:</span>
                <span className="font-bold text-white text-sm">{client.name}</span>
              </div>
              <div className="bg-[#007A4D]/80 p-2.5 rounded-xl border border-white/10">
                <span className="text-emerald-100 block">投保年龄与职业:</span>
                <span className="font-bold text-white text-sm">
                  {client.age}岁 / {client.occupation}
                </span>
              </div>
              <div className="bg-[#007A4D]/80 p-2.5 rounded-xl border border-white/10">
                <span className="text-emerald-100 block">选定规划产品:</span>
                <span className="font-bold text-yellow-300 text-sm">{annuityInput.productName}</span>
              </div>
              <div className="bg-[#007A4D]/80 p-2.5 rounded-xl border border-white/10">
                <span className="text-emerald-100 block">交费方案:</span>
                <span className="font-bold text-white text-sm">
                  ￥{(annuityInput.annualPremium / 10000).toFixed(1)}万 / {annuityInput.payYears}年交
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Financial & Annuity Benefit Summary */}
          <div className="bg-white border border-[#E0E7E3] rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#00965E] flex items-center gap-2 border-b border-gray-100 pb-2">
              <Award className="w-4 h-4 text-[#00965E]" />
              一、核心收益精算与保单权益指标
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-[#F0F4F2] rounded-xl border border-[#E0E7E3]">
                <span className="text-xs text-gray-500 block">累计总已交保费</span>
                <span className="text-lg font-black text-slate-900 mt-1 block">
                  ￥{(summary.totalPremiumPaid / 10000).toFixed(1)} 万
                </span>
              </div>

              <div className="p-3 bg-[#E6F4ED] rounded-xl border border-[#00965E]/20">
                <span className="text-xs text-[#007A4D] block">现金价值回本期</span>
                <span className="text-lg font-black text-[#00965E] mt-1 block">
                  第 {summary.paybackPolicyYear} 年 ({summary.paybackAge}岁)
                </span>
              </div>

              <div className="p-3 bg-[#FEF08A]/30 rounded-xl border border-[#F27D26]/30">
                <span className="text-xs text-[#F27D26] block">80岁累计已领生存金</span>
                <span className="text-lg font-black text-[#F27D26] mt-1 block">
                  ￥{(summary.totalPayoutAtAge80 / 10000).toFixed(1)} 万
                </span>
              </div>

              <div className="p-3 bg-[#00965E] text-white rounded-xl">
                <span className="text-xs text-emerald-100 block">80岁综合复利IRR</span>
                <span className="text-xl font-black text-yellow-300 mt-1 block">
                  {summary.irrAtAge80}%
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Multi-Dimensional Needs Analysis (对症下药) */}
          <div className="bg-white border border-[#E0E7E3] rounded-2xl p-5 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-[#00965E] flex items-center gap-2 border-b border-gray-100 pb-2">
              <Sparkles className="w-4 h-4 text-[#F27D26]" />
              二、1对1精准多维需求对症下药分析
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F0F4F2] rounded-xl space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Palmtree className="w-4 h-4 text-[#00965E]" />
                  品质养老规划:
                </span>
                <p className="text-gray-600">
                  {analysisResult?.multiDimensionalNeedsBreakdown.pension ||
                    `${annuityInput.payoutStartAge}岁起每年提供稳定确定现金流，作为社保养老金的完美补充。`}
                </p>
              </div>

              <div className="p-3 bg-[#F0F4F2] rounded-xl space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#F27D26]" />
                  子女教育储备:
                </span>
                <p className="text-gray-600">
                  {analysisResult?.multiDimensionalNeedsBreakdown.education ||
                    '可在子女上大学/留学节点灵活提取年金或万能账户，提供坚实的教育后盾。'}
                </p>
              </div>

              <div className="p-3 bg-[#F0F4F2] rounded-xl space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  高质医疗与健康保障:
                </span>
                <p className="text-gray-600">
                  {analysisResult?.multiDimensionalNeedsBreakdown.medical ||
                    '可按需搭配中宏高端医疗附加险，享受重疾绿通与优质直付诊疗。'}
                </p>
              </div>

              <div className="p-3 bg-[#F0F4F2] rounded-xl space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  资产隔离与财富传承:
                </span>
                <p className="text-gray-600">
                  {analysisResult?.multiDimensionalNeedsBreakdown.legacy ||
                    '指定受益人结构，兼顾保单贷款流动性与婚姻/企业隔离。'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Lifetime Multi-Decade Timeline (全生命周期几十年的关键时间节点与产品组合方案) */}
          {analysisResult?.lifetimeMilestones && analysisResult.lifetimeMilestones.length > 0 && (
            <div className="bg-white border border-[#E0E7E3] rounded-2xl p-5 space-y-3 shadow-xs print:break-inside-avoid">
              <h3 className="text-sm font-bold text-[#00965E] flex items-center gap-2 border-b border-gray-100 pb-2">
                <Clock className="w-4 h-4 text-[#00965E]" />
                三、全生命周期未来几十年·关键时间节点与产品组合精算安排
              </h3>

              <div className="space-y-3">
                {analysisResult.lifetimeMilestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FAFBF9] border border-[#E0E7E3] border-l-4 border-l-[#00965E] rounded-xl text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-gray-200/60 pb-1.5">
                      <span className="font-extrabold text-slate-900 flex items-center gap-2 text-xs">
                        <span className="bg-[#00965E] text-white px-2 py-0.5 rounded text-[11px]">
                          {m.ageNode}岁
                        </span>
                        <span>{m.stageName}</span>
                      </span>
                      <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                        距今约 {m.timeHorizonYears} 年
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="font-bold text-[#F27D26] block">【预判生活情境与资金风险】</span>
                        <p className="text-gray-700 mt-0.5">{m.predictedLifeScenario}</p>
                        <p className="text-gray-500 text-[10px] mt-0.5">{m.riskAndNeedAnalysis}</p>
                      </div>

                      <div>
                        <span className="font-bold text-[#00965E] block">【匹配产品安排与保单动作】</span>
                        <div className="space-y-1 mt-0.5">
                          {m.recommendedProductsAndArrangements?.map((pa, pIdx) => (
                            <div key={pIdx} className="bg-white p-1.5 rounded border border-[#00965E]/20 text-[10px]">
                              <span className="font-bold text-[#007A4D]">{pa.productType}: </span>
                              <span className="text-slate-700">{pa.actionPlan}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Milestone Schedule Table */}
          <div className="bg-white border border-[#E0E7E3] rounded-2xl p-5 space-y-3 shadow-xs print:break-inside-avoid">
            <h3 className="text-sm font-bold text-[#00965E] flex items-center gap-2 border-b border-gray-100 pb-2">
              <Calendar className="w-4 h-4 text-[#00965E]" />
              四、关键年龄节点利益展示表 (50/60/70/80/90岁)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-white text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="py-2.5 px-3">年龄节点</th>
                    <th className="py-2.5 px-3 text-right">累计已交保费</th>
                    <th className="py-2.5 px-3 text-right text-[#F27D26]">累计已领年金</th>
                    <th className="py-2.5 px-3 text-right text-[#00965E]">退保现金价值</th>
                    <th className="py-2.5 px-3 text-right font-black text-slate-900">
                      总资产利益(元)
                    </th>
                    <th className="py-2.5 px-3 text-center text-[#007A4D]">累计IRR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-slate-700">
                  {summary.rows
                    .filter((r) => [50, 60, 70, 80, 90].includes(r.age))
                    .map((r) => (
                      <tr key={r.age} className={r.age === 80 ? 'bg-[#F0FDF4] border-l-4 border-[#00965E] font-semibold' : ''}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{r.age} 岁</td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          ￥{r.cumulativePremium.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#F27D26]">
                          ￥{r.cumulativePayout.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#00965E]">
                          ￥{r.cashValue.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-extrabold text-slate-900">
                          ￥{(r.cumulativePayout + r.totalWealthValue).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-[#007A4D]">
                          {r.irrPercent}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Proposal Sign Footer */}
          <div className="border-t border-[#E0E7E3] pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-500 gap-2">
            <div>
              <p className="font-semibold text-slate-700">中宏保险 尊享理财顾问团队 倾情编制</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                注：本建议书数据基于精算模型演示，实际利益以中宏保险官方保单合同及条款为准。
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono text-[#007A4D] font-bold border border-[#00965E]/30 px-3 py-1 rounded-lg bg-[#E6F4ED]">
                MANULIFE SINOCHEM
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
