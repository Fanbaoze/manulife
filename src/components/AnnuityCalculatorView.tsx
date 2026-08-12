import React, { useState, useMemo } from 'react';
import { AnnuityInput, AnnuityCalculationSummary } from '../types';
import { calculateAnnuitySchedule } from '../utils/actuaryEngine';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Layers,
  Award,
  Download,
  Filter,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Sliders,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface AnnuityCalculatorViewProps {
  input: AnnuityInput;
  onChangeInput: (newInput: AnnuityInput) => void;
  onGoToReverseTab?: () => void;
  onGoToKocTab?: () => void;
}

export const AnnuityCalculatorView: React.FC<AnnuityCalculatorViewProps> = ({
  input,
  onChangeInput,
  onGoToReverseTab,
  onGoToKocTab,
}) => {
  const [tableFilter, setTableFilter] = useState<'all' | 'milestones' | 'payouts'>('all');
  const [searchAge, setSearchAge] = useState<string>('');

  const calculationResult: AnnuityCalculationSummary = useMemo(() => {
    return calculateAnnuitySchedule(input);
  }, [input]);

  const handleInputChange = (field: keyof AnnuityInput, value: any) => {
    onChangeInput({
      ...input,
      [field]: value,
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      '保单年度',
      '年龄',
      '当期保费(元)',
      '累计已交保费(元)',
      '当年年金/生存金(元)',
      '累计已领年金(元)',
      '主险现金价值(元)',
      '万能账户价值(元)',
      '总资产价值(元)',
      '身故保障(元)',
      '累计IRR(%)',
    ];

    const rows = calculationResult.rows.map((r) => [
      r.policyYear,
      r.age,
      r.annualPremium,
      r.cumulativePremium,
      r.annuityPayout,
      r.cumulativePayout,
      r.cashValue,
      r.universalValue,
      r.totalWealthValue,
      r.deathBenefit,
      r.irrPercent + '%',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${input.productName}_年金险收益精算表_${input.issueAge}岁.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRows = useMemo(() => {
    return calculationResult.rows.filter((r) => {
      if (searchAge && !r.age.toString().includes(searchAge)) {
        return false;
      }
      if (tableFilter === 'milestones') {
        return (
          r.policyYear === 1 ||
          r.policyYear === input.payYears ||
          r.age === input.payoutStartAge ||
          r.age === 60 ||
          r.age === 70 ||
          r.age === 80 ||
          r.age === 90
        );
      }
      if (tableFilter === 'payouts') {
        return r.annuityPayout > 0;
      }
      return true;
    });
  }, [calculationResult.rows, tableFilter, searchAge, input.payYears, input.payoutStartAge]);

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      <div className="bg-[#E6F4ED] border border-[#E0E7E3] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-[#00965E] text-white rounded-xl shadow-xs mt-0.5">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#007A4D] flex items-center gap-2">
              中宏智尊·年金收益精算演示引擎
              <span className="text-xs bg-[#00965E] text-white px-2 py-0.5 rounded-md font-normal">
                主险法定复利 + 万能二次增值
              </span>
            </h2>
            <p className="text-xs text-[#4A6357] mt-0.5">
              支持精确测算1-70年现金价值递增、复利IRR、养老金领取与回本周期，全面满足高净值客户财富底座配置需求。
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onGoToReverseTab && (
            <button
              onClick={onGoToReverseTab}
              className="px-3.5 py-2 text-xs font-bold bg-white text-[#00965E] border border-[#00965E]/30 rounded-xl hover:bg-[#F0FDF4] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>倒推50岁目标领取</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#00965E]" />
            </button>
          )}
          {onGoToKocTab && (
            <button
              onClick={onGoToKocTab}
              className="px-3.5 py-2 text-xs font-bold bg-[#00965E] hover:bg-[#007A4D] text-white rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>KOC精准营销策略</span>
              <ChevronRight className="w-3.5 h-3.5 text-yellow-300" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Parameters Control + Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Panel: Parameters (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E0E7E3] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-[#00965E] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00965E]" />
              年金参数设置
            </h3>
            <span className="text-xs text-slate-500 bg-[#F0F4F2] px-2.5 py-1 rounded-md font-medium">
              实时精算
            </span>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm">
            {/* Product Preset */}
            <div>
              <label className="block text-gray-500 mb-1 italic text-xs">产品方案名称</label>
              <input
                type="text"
                value={input.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                className="w-full px-3 py-2 bg-[#F0F4F2] border-none rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#00965E]"
              />
            </div>

            {/* Issue Age & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 mb-1 italic text-xs">初始投保年龄 (岁)</label>
                <input
                  type="number"
                  min={0}
                  max={70}
                  value={input.issueAge}
                  onChange={(e) => handleInputChange('issueAge', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F0F4F2] border-none rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-[#00965E]"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1 italic text-xs">被保人性别</label>
                <select
                  value={input.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F4F2] border-none rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#00965E]"
                >
                  <option value="male">男</option>
                  <option value="female">女</option>
                </select>
              </div>
            </div>

            {/* Annual Premium & Pay Years */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 mb-1 italic text-xs">年交保费 (元)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-[#00965E] font-bold">￥</span>
                  <input
                    type="number"
                    step={5000}
                    value={input.annualPremium}
                    onChange={(e) => handleInputChange('annualPremium', Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-[#F0F4F2] border-none rounded-lg font-bold text-[#00965E] focus:ring-2 focus:ring-[#00965E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 mb-1 italic text-xs">缴费年限</label>
                <select
                  value={input.payYears}
                  onChange={(e) => handleInputChange('payYears', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F0F4F2] border-none rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#00965E]"
                >
                  <option value={1}>1年 (趸交)</option>
                  <option value={3}>3年交</option>
                  <option value={5}>5年交</option>
                  <option value={10}>10年交</option>
                  <option value={15}>15年交</option>
                  <option value={20}>20年交</option>
                </select>
              </div>
            </div>

            {/* Total Premium Display */}
            <div className="p-3 bg-[#E6F4ED] rounded-xl flex items-center justify-between text-xs text-[#007A4D]">
              <span className="font-semibold">总投保费累计:</span>
              <span className="text-sm font-extrabold text-[#00965E]">
                ￥{(input.annualPremium * input.payYears).toLocaleString()} 元
              </span>
            </div>

            {/* Payout Start Age & Frequency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 mb-1 italic text-xs">年金起领年龄</label>
                <select
                  value={input.payoutStartAge}
                  onChange={(e) => handleInputChange('payoutStartAge', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F0F4F2] border-none rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#00965E]"
                >
                  <option value={50}>50 岁 (早期领取)</option>
                  <option value={55}>55 岁 (退休标准)</option>
                  <option value={60}>60 岁 (标准养老)</option>
                  <option value={65}>65 岁 (延迟养老)</option>
                  <option value={input.issueAge + 5}>投保第5年起领</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-500 mb-1 italic text-xs">领取方式与频率</label>
                <select
                  value={input.payoutFrequency}
                  onChange={(e) => handleInputChange('payoutFrequency', e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F4F2] border-none rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#00965E]"
                >
                  <option value="yearly">按年领取 (100%基本保额)</option>
                  <option value="monthly">按月领取 (8.5%基本保额/月)</option>
                </select>
              </div>
            </div>

            {/* Dividend Tier & Guaranteed Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 mb-1 italic text-xs">主险保证利率/演示档</label>
                <select
                  value={input.dividendTier}
                  onChange={(e) => handleInputChange('dividendTier', e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F4F2] border-none rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#00965E]"
                >
                  <option value="guaranteed">保证档 (保证利率2.0%)</option>
                  <option value="medium">中档分红 (预估综合3.2%)</option>
                  <option value="high">高档分红 (预估综合4.0%)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-500 mb-1 italic text-xs">满期/首年特别金(%)</label>
                <input
                  type="number"
                  value={input.firstYearBonusPercent}
                  onChange={(e) => handleInputChange('firstYearBonusPercent', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F0F4F2] border-none rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#00965E]"
                  placeholder="如 10%"
                />
              </div>
            </div>

            {/* Universal Life Account */}
            <div className="p-3 bg-[#F0F4F2] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Layers className="w-4 h-4 text-[#00965E]" />
                  搭轮万能账户 (二次增值)
                </span>
                <input
                  type="checkbox"
                  checked={input.enableUniversalAccount}
                  onChange={(e) => handleInputChange('enableUniversalAccount', e.target.checked)}
                  className="w-4 h-4 accent-[#00965E] rounded cursor-pointer"
                />
              </div>

              {input.enableUniversalAccount && (
                <div className="pt-2 border-t border-gray-200/80 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">万能预估结算利率:</span>
                    <span className="font-bold text-[#00965E]">{input.universalAccountRate}% / 年</span>
                  </div>
                  <input
                    type="range"
                    min={2.0}
                    max={4.5}
                    step={0.1}
                    value={input.universalAccountRate}
                    onChange={(e) => handleInputChange('universalAccountRate', Number(e.target.value))}
                    className="w-full accent-[#00965E] cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-500">
                    注：年金领取的生存金若不取出，将自动进入万能账户复利积存。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Key Metrics Cards + Summary Stats (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top 4 Highlight Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Payback Year */}
            <div className="bg-white border border-[#E0E7E3] rounded-2xl p-4 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-10 h-10 bg-[#E6F4ED] rounded-bl-full flex items-start justify-end p-1.5 text-[#00965E]">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs font-medium text-gray-500">现价回本期</p>
              <p className="text-lg sm:text-xl font-black text-[#00965E] mt-1">
                第 {calculationResult.paybackPolicyYear} 年
              </p>
              <p className="text-[11px] text-[#007A4D] mt-0.5 font-medium">
                被保人 {calculationResult.paybackAge} 岁
              </p>
            </div>

            {/* Total Paid */}
            <div className="bg-white border border-[#E0E7E3] rounded-2xl p-4 shadow-xs">
              <p className="text-xs font-medium text-gray-500">累计已交总保费</p>
              <p className="text-lg sm:text-xl font-extrabold text-slate-800 mt-1">
                ￥{(calculationResult.totalPremiumPaid / 10000).toFixed(1)} 万
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {input.payYears}年交 / 年交{(input.annualPremium / 10000).toFixed(1)}万
              </p>
            </div>

            {/* 80-year Total Payout */}
            <div className="bg-white border border-[#E0E7E3] rounded-2xl p-4 shadow-xs">
              <p className="text-xs font-medium text-gray-500">80岁累计已领金</p>
              <p className="text-lg sm:text-xl font-extrabold text-[#F27D26] mt-1">
                ￥{(calculationResult.totalPayoutAtAge80 / 10000).toFixed(1)} 万
              </p>
              <p className="text-[11px] text-[#F27D26] mt-0.5">
                为保费的 {(calculationResult.totalPayoutAtAge80 / Math.max(1, calculationResult.totalPremiumPaid)).toFixed(1)} 倍
              </p>
            </div>

            {/* 80-year IRR */}
            <div className="bg-[#00965E] text-white rounded-2xl p-4 shadow-md relative">
              <span className="text-[10px] font-extrabold bg-yellow-300 text-slate-900 px-1.5 py-0.5 rounded absolute top-3 right-3">
                IRR 80岁
              </span>
              <p className="text-xs font-medium text-white/90">80岁综合复利IRR</p>
              <p className="text-xl sm:text-2xl font-black text-yellow-200 mt-1">
                {calculationResult.irrAtAge80}%
              </p>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                总利益 ￥{(calculationResult.totalBenefitAtAge80 / 10000).toFixed(1)} 万
              </p>
            </div>
          </div>

          {/* Age IRR Milestones Matrix */}
          <div className="bg-white border border-[#E0E7E3] rounded-2xl p-4 shadow-xs">
            <h4 className="text-xs font-bold text-[#00965E] mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#00965E]" />
                不同年龄节点综合回报率 (IRR) 演变矩阵
              </span>
              <span className="text-[11px] text-gray-400 font-normal">复利终值试算</span>
            </h4>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-[#F0F4F2] rounded-xl">
                <span className="text-xs text-gray-500 block">60 岁</span>
                <span className="text-base font-bold text-slate-800 block mt-0.5">
                  {calculationResult.irrAtAge60}%
                </span>
              </div>
              <div className="p-2.5 bg-[#F0F4F2] rounded-xl">
                <span className="text-xs text-gray-500 block">70 岁</span>
                <span className="text-base font-bold text-slate-800 block mt-0.5">
                  {calculationResult.irrAtAge70}%
                </span>
              </div>
              <div className="p-2.5 bg-[#E6F4ED] rounded-xl border border-[#00965E]/30">
                <span className="text-xs text-[#007A4D] font-bold block">80 岁</span>
                <span className="text-base font-black text-[#00965E] block mt-0.5">
                  {calculationResult.irrAtAge80}%
                </span>
              </div>
              <div className="p-2.5 bg-[#F0F4F2] rounded-xl">
                <span className="text-xs text-gray-500 block">90 岁</span>
                <span className="text-base font-bold text-slate-800 block mt-0.5">
                  {calculationResult.irrAtAge90}%
                </span>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white border border-[#E0E7E3] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#00965E]" />
                  现金价值与累计年金增长趋势
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  绿色区域为保单总资产(现价+万能)，橙色线为生存金领取累计
                </p>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={calculationResult.rows.filter((_, idx) => idx % 2 === 0)}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7e3" />
                  <XAxis dataKey="age" unit="岁" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `￥${Number(value).toLocaleString()} 元`,
                      name,
                    ]}
                    labelFormatter={(label) => `被保人年龄: ${label} 岁`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e0e7e3' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="totalWealthValue"
                    name="保单总资产价值(元)"
                    fill="#00965E"
                    stroke="#007A4D"
                    fillOpacity={0.18}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativePremium"
                    name="累计已交保费"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativePayout"
                    name="累计已领年金"
                    stroke="#F27D26"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Year-by-Year Detailed Schedule Table (逐年收益明细表) */}
      <div className="bg-white border border-[#E0E7E3] rounded-2xl shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 bg-white border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00965E]" />
              逐年收益明细表
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              1-70年每一年度保费、生存金领取、退保现金价值及身故保障
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Buttons */}
            <div className="flex items-center bg-[#F0F4F2] rounded-xl p-1 text-xs">
              <button
                onClick={() => setTableFilter('all')}
                className={`px-3 py-1 rounded-lg transition font-semibold cursor-pointer ${
                  tableFilter === 'all'
                    ? 'bg-[#00965E] text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                全部年度
              </button>
              <button
                onClick={() => setTableFilter('milestones')}
                className={`px-3 py-1 rounded-lg transition font-semibold cursor-pointer ${
                  tableFilter === 'milestones'
                    ? 'bg-[#00965E] text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                关键里程碑
              </button>
              <button
                onClick={() => setTableFilter('payouts')}
                className={`px-3 py-1 rounded-lg transition font-semibold cursor-pointer ${
                  tableFilter === 'payouts'
                    ? 'bg-[#00965E] text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                领取年度
              </button>
            </div>

            {/* Quick Age Search Input */}
            <input
              type="text"
              placeholder="搜索年龄(如60)"
              value={searchAge}
              onChange={(e) => setSearchAge(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#F0F4F2] border-none rounded-xl w-28 focus:ring-2 focus:ring-[#00965E] text-slate-700"
            />

            {/* CSV Export */}
            <button
              onClick={exportToCSV}
              className="px-3.5 py-1.5 text-xs font-bold bg-[#00965E] text-white rounded-xl hover:bg-[#007A4D] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-yellow-200" />
              导出Excel
            </button>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto max-h-[480px]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-white text-gray-400 uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-gray-100">
              <tr>
                <th className="py-3 px-3 text-center font-medium">保单年度</th>
                <th className="py-3 px-3 text-center font-medium">对应年龄</th>
                <th className="py-3 px-3 text-right font-medium">年交保费</th>
                <th className="py-3 px-3 text-right font-medium">累计保费</th>
                <th className="py-3 px-3 text-right font-bold text-[#F27D26]">当年生存金</th>
                <th className="py-3 px-3 text-right font-bold text-[#F27D26]">累计生存金</th>
                <th className="py-3 px-3 text-right font-bold text-[#00965E]">现金价值</th>
                {input.enableUniversalAccount && (
                  <th className="py-3 px-3 text-right font-bold text-teal-700">万能账户价值</th>
                )}
                <th className="py-3 px-3 text-right font-black text-[#007A4D]">
                  总资产价值
                </th>
                <th className="py-3 px-3 text-right font-medium text-gray-400">身故保障</th>
                <th className="py-3 px-3 text-center font-bold text-[#00965E]">IRR</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-50">
              {filteredRows.map((row) => {
                const isPaybackRow = row.policyYear === calculationResult.paybackPolicyYear;
                const isStartPayoutRow = row.age === input.payoutStartAge;
                const isKeyMilestone = [60, 70, 80, 90].includes(row.age);

                return (
                  <tr
                    key={row.policyYear}
                    className={`hover:bg-[#F0FDF4] transition-colors ${
                      isPaybackRow
                        ? 'bg-[#FEF08A]/40 font-semibold border-l-4 border-[#F27D26]'
                        : isStartPayoutRow
                        ? 'bg-[#F0FDF4] font-semibold border-l-4 border-[#00965E]'
                        : isKeyMilestone
                        ? 'bg-[#F8FAF9] font-medium'
                        : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-mono text-gray-400">
                      {String(row.policyYear).padStart(2, '0')}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-gray-800">
                      {row.age} 岁
                      {isPaybackRow && (
                        <span className="ml-1 text-[10px] bg-[#F27D26] text-white px-1.5 py-0.2 rounded font-bold">
                          回本
                        </span>
                      )}
                      {isStartPayoutRow && (
                        <span className="ml-1 text-[10px] bg-[#00965E] text-white px-1.5 py-0.2 rounded font-bold">
                          起领
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-400">
                      {row.annualPremium > 0 ? row.annualPremium.toLocaleString() : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-gray-700">
                      {row.cumulativePremium.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#F27D26]">
                      {row.annuityPayout > 0 ? row.annuityPayout.toLocaleString() : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#F27D26]">
                      {row.cumulativePayout.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#00965E]">
                      {row.cashValue.toLocaleString()}
                    </td>
                    {input.enableUniversalAccount && (
                      <td className="py-2.5 px-3 text-right font-mono text-teal-700">
                        {row.universalValue.toLocaleString()}
                      </td>
                    )}
                    <td className="py-2.5 px-3 text-right font-mono font-extrabold text-[#007A4D]">
                      {row.totalWealthValue.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-400">
                      {row.deathBenefit.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-[#00965E]">
                      {row.irrPercent}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
