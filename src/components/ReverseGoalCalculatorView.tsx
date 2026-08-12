import React, { useState } from 'react';
import { ReverseTargetInput, ReverseTargetResult } from '../types';
import {
  Target,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  Sliders,
  DollarSign,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface ReverseGoalCalculatorViewProps {
  onApplyCalculatedPremium: (payYears: number, annualPremium: number, startAge: number) => void;
}

export const ReverseGoalCalculatorView: React.FC<ReverseGoalCalculatorViewProps> = ({
  onApplyCalculatedPremium,
}) => {
  const [input, setInput] = useState<ReverseTargetInput>({
    currentAge: 35,
    targetStartAge: 50,
    targetAnnualPayout: 50000,
    payYears: 5,
    adjustmentType: 'flat',
    userNotes: '客户希望在50岁时每年稳定多领50,000元，补充子女大学教育金与家庭现金流。',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ReverseTargetResult | null>(null);

  // Quick preset scenario handler
  const setPresetScenario = (age: number, targetAge: number, payout: number, notes: string) => {
    const updated = {
      ...input,
      currentAge: age,
      targetStartAge: targetAge,
      targetAnnualPayout: payout,
      userNotes: notes,
    };
    setInput(updated);
    runReverseCalculation(updated);
  };

  const runReverseCalculation = async (dataToUse = input) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/reverse-calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToUse),
      });
      const data = await response.json();
      if (data.success && data.suggestion) {
        setResult(data.suggestion);
      }
    } catch (err) {
      console.error('Reverse calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial calculation on mount
  React.useEffect(() => {
    runReverseCalculation();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#00965E] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-[#007A4D]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-yellow-300 text-slate-900 mb-2 inline-block shadow-2xs">
              逆向推算与目标精算引擎
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-yellow-300" />
              “50岁多领多少钱”· 前期保费逆向精算与变动分析
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-3xl">
              直接解决客户核心疑问：“如果我想在50岁时每年多领 5 万/10 万，前期到底需要交多少保费？3年交/5年交/10年交哪个成本低？中间保费增减额怎么变？”
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setPresetScenario(35, 50, 50000, '35岁高管，计划50岁每年多领5万元做教育及自由支配金。')}
              className="px-3.5 py-1.5 text-xs bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-xl transition cursor-pointer font-medium"
            >
              场景1: 50岁领5万
            </button>
            <button
              onClick={() => setPresetScenario(40, 55, 100000, '40岁企业主，计划55岁每年多领10万元高端养老统筹金。')}
              className="px-3.5 py-1.5 text-xs bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-xl transition cursor-pointer font-medium"
            >
              场景2: 55岁领10万
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Target Inputs + Calculation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E0E7E3] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-[#00965E] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00965E]" />
              设置客户目标与保费偏好
            </h3>
            <span className="text-xs text-[#007A4D] bg-[#E6F4ED] px-2.5 py-1 rounded-md font-bold">
              目标导向
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* Current Age & Target Start Age */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 mb-1 italic text-xs">客户当前年龄 (岁)</label>
                <input
                  type="number"
                  min={18}
                  max={60}
                  value={input.currentAge}
                  onChange={(e) => setInput({ ...input, currentAge: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#F0F4F2] border-none rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-[#00965E]"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1 italic text-xs">目标开始领取年龄 (岁)</label>
                <input
                  type="number"
                  min={input.currentAge + 3}
                  max={75}
                  value={input.targetStartAge}
                  onChange={(e) => setInput({ ...input, targetStartAge: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#E6F4ED] border border-[#00965E]/40 rounded-xl font-bold text-[#00965E] focus:ring-2 focus:ring-[#00965E]"
                />
              </div>
            </div>

            {/* Target Payout Amount */}
            <div>
              <label className="block text-gray-500 mb-1 italic text-xs">
                期望在 {input.targetStartAge} 岁时每年多领取的金额 (元)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#F27D26] font-bold">￥</span>
                <input
                  type="number"
                  step={10000}
                  value={input.targetAnnualPayout}
                  onChange={(e) => setInput({ ...input, targetAnnualPayout: Number(e.target.value) })}
                  className="w-full pl-7 pr-3 py-2.5 bg-[#FEF08A]/30 border border-[#F27D26]/40 rounded-xl font-extrabold text-[#F27D26] text-base focus:ring-2 focus:ring-[#F27D26]"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                相当于每月多领 ￥{Math.round(input.targetAnnualPayout / 12).toLocaleString()} 元现金流
              </p>
            </div>

            {/* Preferred Payment Period */}
            <div>
              <label className="block text-gray-500 mb-1 italic text-xs">拟选前期交费期</label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 10].map((years) => (
                  <button
                    key={years}
                    type="button"
                    onClick={() => setInput({ ...input, payYears: years as any })}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      input.payYears === years
                        ? 'bg-[#00965E] text-white shadow-xs'
                        : 'bg-[#F0F4F2] text-slate-700 hover:bg-[#e2e9e5]'
                    }`}
                  >
                    {years} 年交
                  </button>
                ))}
              </div>
            </div>

            {/* Adjustment Type Variation */}
            <div>
              <label className="block text-gray-500 mb-1 italic text-xs">保费增减变动模拟模式</label>
              <select
                value={input.adjustmentType}
                onChange={(e) => setInput({ ...input, adjustmentType: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#F0F4F2] border-none rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-[#00965E]"
              >
                <option value="flat">平摊等额交费 (最稳健标准)</option>
                <option value="front_loaded">前期加保/集中追加 (缩短利息损耗)</option>
                <option value="universal_topup">万能账户滚动追加 (兼顾极高流动性)</option>
                <option value="back_loaded">后期减额交清/保费递减 (防范职业不确定)</option>
              </select>
            </div>

            {/* Additional Client Notes */}
            <div>
              <label className="block text-gray-500 mb-1 italic text-xs">客户背景与特别说明</label>
              <textarea
                rows={3}
                value={input.userNotes}
                onChange={(e) => setInput({ ...input, userNotes: e.target.value })}
                className="w-full px-3 py-2 bg-[#F0F4F2] border-none rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#00965E]"
                placeholder="例如：客户担心职业瓶颈，希望5年内交完，后期可灵活增减保费……"
              />
            </div>

            {/* Run Button */}
            <button
              onClick={() => runReverseCalculation()}
              disabled={loading}
              className="w-full py-3 bg-[#00965E] hover:bg-[#007A4D] text-white rounded-xl font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-yellow-300" />
                  <span>精算倒推与AI拟合中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>开始逆向精算 & 生成差异方案</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Reverse Calculation Main Card - Using Dark Strategy Style from Natural Tones */}
          <div className="bg-[#1A1A1A] text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00965E]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00965E] flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-yellow-300" />
                精算试算结论
              </span>
              <span className="text-xs text-gray-400">
                达到 {input.targetStartAge}岁 领 ￥{input.targetAnnualPayout.toLocaleString()}/年
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <p className="text-xs text-gray-400">
                  预估所需【{input.payYears}年交】年交保费约为
                </p>
                <p className="text-3xl sm:text-4xl font-black text-yellow-300 mt-1">
                  ￥
                  {result
                    ? Math.round(result.recommendedAnnualPremium).toLocaleString()
                    : Math.round((input.targetAnnualPayout * 10) / input.payYears).toLocaleString()}
                  <span className="text-sm font-normal text-gray-400 ml-1">元 / 年</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {input.payYears} 年总计需投入: ￥
                  {result
                    ? Math.round(result.recommendedAnnualPremium * input.payYears).toLocaleString()
                    : Math.round(input.targetAnnualPayout * 10).toLocaleString()}{' '}
                  元
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">客户当前年龄:</span>
                  <span className="font-bold text-white">{input.currentAge} 岁</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">距起领酝酿期:</span>
                  <span className="font-bold text-yellow-300">
                    {input.targetStartAge - input.currentAge} 年复利增值
                  </span>
                </div>
                <button
                  onClick={() =>
                    onApplyCalculatedPremium(
                      input.payYears,
                      result ? Math.round(result.recommendedAnnualPremium) : 100000,
                      input.targetStartAge
                    )
                  }
                  className="w-full py-2 bg-[#00965E] hover:bg-[#007A4D] text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <span>一键带入到【保单演示表】查看完整70年细目</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Payment Terms Comparison Table (3年 vs 5年 vs 10年) */}
          <div className="bg-white border border-[#E0E7E3] rounded-2xl p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00965E]" />
                不同交费期 (3年 / 5年 / 10年) 下的成本与杠杆精算对比
              </span>
              <span className="text-xs text-gray-400 font-normal">资金效率评估</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-white text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="py-2.5 px-3">交费期方案</th>
                    <th className="py-2.5 px-3 text-right">每年需交保费</th>
                    <th className="py-2.5 px-3 text-right">总投入成本</th>
                    <th className="py-2.5 px-3 text-center">预估回本年度</th>
                    <th className="py-2.5 px-3 text-center font-bold text-[#00965E]">
                      杠杆效能与优势点评
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-slate-700">
                  {result?.payYearsOptions ? (
                    result.payYearsOptions.map((opt) => (
                      <tr
                        key={opt.years}
                        className={input.payYears === opt.years ? 'bg-[#F0FDF4] border-l-4 border-[#00965E] font-semibold' : ''}
                      >
                        <td className="py-3 px-3 font-bold text-slate-800">
                          {opt.years} 年交
                          {input.payYears === opt.years && (
                            <span className="ml-1 text-[10px] bg-[#00965E] text-white px-1.5 py-0.2 rounded font-normal">
                              当前选择
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          ￥{Math.round(opt.annualPremium).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-extrabold text-[#F27D26]">
                          ￥{Math.round(opt.totalPremium).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          第 {opt.years + 2} - {opt.years + 3} 年
                        </td>
                        <td className="py-3 px-3 text-xs text-gray-600">
                          {opt.commentary ||
                            (opt.years === 3
                              ? '交期短，复利时间更早，总投入最低。'
                              : opt.years === 5
                              ? '平摊压力适中，资金效率与交费杠杆的最佳平衡。'
                              : '单期缴费压力小，适合现金流均匀的客户。')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr>
                        <td className="py-3 px-3 font-bold">3年交 (快速交清)</td>
                        <td className="py-3 px-3 text-right font-mono font-bold">
                          ￥{Math.round((input.targetAnnualPayout * 11) / 3).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#F27D26]">
                          ￥{Math.round(input.targetAnnualPayout * 11).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">第 5 年</td>
                        <td className="py-3 px-3 text-gray-600">
                          资金快速归位，复利起飞更快，总成本更省。
                        </td>
                      </tr>
                      <tr className="bg-[#F0FDF4] border-l-4 border-[#00965E]">
                        <td className="py-3 px-3 font-bold">5年交 (黄金推荐)</td>
                        <td className="py-3 px-3 text-right font-mono font-bold">
                          ￥{Math.round((input.targetAnnualPayout * 10) / 5).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#F27D26]">
                          ￥{Math.round(input.targetAnnualPayout * 10).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">第 7 年</td>
                        <td className="py-3 px-3 text-[#007A4D] font-medium">
                          中宏经典搭配，兼顾现金流灵活性与稳健收益。
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actuarial Strategy Advice & Adjustment Instructions */}
          <div className="bg-[#E6F4ED] border border-[#E0E7E3] rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-[#007A4D] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F27D26]" />
              精算师专业建议与保费增减变动对策
            </h4>

            <div className="p-4 bg-white border border-[#E0E7E3] rounded-xl space-y-3 text-xs text-slate-700 leading-relaxed">
              <div>
                <span className="font-bold text-[#00965E] block mb-1">📌 针对50岁多领需求的精算分析:</span>
                <p>
                  {result?.actuarialAdvice ||
                    `客户当前${input.currentAge}岁，距离${input.targetStartAge}岁起领有${
                      input.targetStartAge - input.currentAge
                    }年的酝酿期。在这段时间内，保费形成的现金价值在主险账户中以复利递增。若要保障${
                      input.targetStartAge
                    }岁起每年确定多领￥${input.targetAnnualPayout.toLocaleString()}元，5年交方案每年需投入约￥${Math.round(
                      (input.targetAnnualPayout * 10) / 5
                    ).toLocaleString()}元。`}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-2.5">
                <span className="font-bold text-[#F27D26] block mb-1">
                  💡 保费增减额与后期变动调整指引:
                </span>
                <p>
                  {result?.adjustmentStrategy ||
                    '前期按标准5年交建立基础杠杆；若未来企业或个人现金流充沛，可通过万能账户进行不定期追加；若后期遭遇流动性紧缩，可在第5年选择“减额交清”，无需继续缴纳保费且保单依然维持有效保障，最大化保护已投资金安全。'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
