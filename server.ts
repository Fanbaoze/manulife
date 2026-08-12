import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// 原来这里是初始化 Gemini Client，改成初始化豆包(火山方舟)的客户端。
// 火山方舟走 OpenAI 兼容协议，所以直接用 openai 这个包，换个 baseURL 就行。
// 环境变量改成了 ARK_API_KEY / ARK_MODEL（部署时在托管平台的环境变量里配置）。
const getArkClient = () => {
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) {
    console.warn("ARK_API_KEY is not set. AI features will run in fallback mock mode.");
    return null;
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://ark.cn-beijing.volces.com/api/v3",
  });
};

// 豆包的 chat.completions 接口不像 Gemini 那样有 responseSchema 强制结构化输出，
// 所以靠 prompt 里显式要求"只输出 JSON"，再在这里做健壮的解析（兼容它偶尔在外面包一层 ```json 代码块的情况）。
function extractJson(text: string | null | undefined): any {
  if (!text) return null;
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Helper for generating dynamic, age-appropriate, realistic life milestones based on client profile
function generateSmartMilestones(client: any, annuityPlan: any) {
  const curAge = Number(client.age) || 35;

  if (curAge < 26) {
    // 18-25岁年轻一代 / 学生 / 职场新人
    return [
      {
        ageNode: curAge + 5,
        stageName: `${curAge + 5}岁 · 职场独立期与第一桶资金沉淀`,
        timeHorizonYears: 5,
        predictedLifeScenario: "处于职场起步或研究生毕业期，个人独立可支配收入增长。面临消费冲动与市场盲目理财风险。",
        riskAndNeedAnalysis: "核心需求是强制储蓄与保本复利，作为婚前个人独立资产隔离金库，不随消费流失。",
        recommendedProductsAndArrangements: [
          {
            productType: "中宏年金险主险 (婚前独立资产底座)",
            actionPlan: "5年交费期满，锁定长期复利收益，确认为婚前个人专属财产。",
            financialImpact: "培养终身理财纪律，积累人生第一笔确定无风险资产。"
          },
          {
            productType: "中宏附加青年高端/百万医疗险",
            actionPlan: "低保费撬动高额医疗直付，防范年轻突发重疾与意外开支。",
            financialImpact: "避免大病掏空创业或个人积蓄。"
          }
        ]
      },
      {
        ageNode: curAge + 10,
        stageName: `${curAge + 10}岁 · 成家立业与家庭首道安全防火墙`,
        timeHorizonYears: 10,
        predictedLifeScenario: "步入婚姻，筹备购房或迎立第一胎，家庭财务责任激增，面临房贷与育儿起步开支。",
        riskAndNeedAnalysis: "需要高弹性的流动性支持（如保单贷款），应对买房首期或成家大额支出。",
        recommendedProductsAndArrangements: [
          {
            productType: "中宏万能账户滚存 / 80%保单质押贷款",
            actionPlan: "若遇购房或创业急需大额资金，可办理保单贷款，24小时到账，保单复利不中断。",
            financialImpact: "兼顾资产绝对安全性与高度流动性。"
          }
        ]
      },
      {
        ageNode: curAge + 20,
        stageName: `${curAge + 20}岁 · 中生代支柱与子女成长保障期`,
        timeHorizonYears: 20,
        predictedLifeScenario: "事业迎来管理层或业务骨干黄金期，子女处于小学/中学升学关键期，需防范行业周期波动。",
        riskAndNeedAnalysis: "需要确定性生存金划入账户，充当子女教育或家庭风险对冲资金。",
        recommendedProductsAndArrangements: [
          {
            productType: "中宏年金生存金定额给付",
            actionPlan: "定期领取生存金充当子女专项教育与兴趣班津贴。",
            financialImpact: "提供源源不断现金流，减轻中年家庭财务压力。"
          }
        ]
      },
      {
        ageNode: Math.max(curAge + 35, 60),
        stageName: `${Math.max(curAge + 35, 60)}岁 · 提前退休自由(FIRE)与养老年金起领`,
        timeHorizonYears: Math.max(curAge + 35, 60) - curAge,
        predictedLifeScenario: "准备逐步退出高强度一线工作，希望实现财务自由并充分享受生活，防范社保替代率不足。",
        riskAndNeedAnalysis: "长寿风险与长期通胀对冲，需要终身领取且活多久领多久的现金流。",
        recommendedProductsAndArrangements: [
          {
            productType: "中宏养老年金保证领取方案",
            actionPlan: "养老金按月自动划入个人养老账户，保证领取至85/90岁以上。",
            financialImpact: "提供媲美高管薪酬的终身现金流。"
          }
        ]
      },
      {
        ageNode: Math.max(curAge + 50, 75),
        stageName: `${Math.max(curAge + 50, 75)}岁 · 高龄尊享康养与家族财富无争端传承`,
        timeHorizonYears: Math.max(curAge + 50, 75) - curAge,
        predictedLifeScenario: "高龄健康护理与高端养老社区入住需求，同时将财富平稳留给后代。",
        riskAndNeedAnalysis: "防范遗产纠纷与法定继承繁琐手续，对接品质康养服务。",
        recommendedProductsAndArrangements: [
          {
            productType: "万能账户滚存 + 指定保单受益人",
            actionPlan: "万能账户资金直接对接养老社区，身故金直接转给指定受益人。",
            financialImpact: "保障尊严晚年，实现资产定向高效传承。"
          }
        ]
      }
    ];
  } else if (curAge < 40) {
    // 26-39岁成家立业 / 青年精英
    return [
      {
        ageNode: curAge + 5,
        stageName: `${curAge + 5}岁 · 事业上升与家庭资产防守底座筑基`,
        timeHorizonYears: 5,
        predictedLifeScenario: "事业蒸蒸日上，面临房贷与早期育儿开支，希望防范行业周期或创业波动带来的资产缩水。",
        riskAndNeedAnalysis: "5年交费期满，保单现金价值超越已交保费，建立隔离风险的无风险资产防守线。",
        recommendedProductsAndArrangements: [
          {
            productType: "中宏年金保险主险 (保本保收益)",
            actionPlan: "锁定长期复利增长，不挤占流动资金，建立家庭保密金库。",
            financialImpact: "防范经济周期风险，确保底座资金安全。"
          }
        ]
      },
      {
        ageNode: curAge + 12,
        stageName: `${curAge + 12}岁 · 子女中学/海外留学与中年生涯调整`,
        timeHorizonYears: 12,
        predictedLifeScenario: "子女进入中学或准备海外留学，年均教育支出攀升；本人面临创业二次曲线或职业转型。",
        riskAndNeedAnalysis: "需要刚性对付的教育储备金与高弹性保单借贷杠杆。",
        recommendedProductsAndArrangements: [
          {
            productType: "中宏年金生存金领取 / 80%保单借贷",
            actionPlan: "每年定期给付生存金充当留学津贴，急需资金时随时借款。",
            financialImpact: "提供确定现金流，无需变卖低估的房产或股票。"
          }
        ]
      },
      {
        ageNode: Math.max(curAge + 22, 60),
        stageName: `${Math.max(curAge + 22, 60)}岁 · 优雅退休与高品质养老金起领`,
        timeHorizonYears: Math.max(curAge + 22, 60) - curAge,
        predictedLifeScenario: "逐步退出一线高强度工作，社保养老金替代率仅30-40%，希望维持品质旅游与休闲生活。",
        riskAndNeedAnalysis: "终身源源不断的现金流保障，抵御通货膨胀。",
        recommendedProductsAndArrangements: [
          {
            productType: "中宏养老金保证领取方案",
            actionPlan: "养老年金按月自动发放，保证领取至85岁以上。",
            financialImpact: "终身品质现金流保障，与国同寿。"
          }
        ]
      },
      {
        ageNode: Math.max(curAge + 32, 75),
        stageName: `${Math.max(curAge + 32, 75)}岁 · 高龄康养与重疾护理保障`,
        timeHorizonYears: Math.max(curAge + 32, 75) - curAge,
        predictedLifeScenario: "身体机能下降，需要高端护理社区入住、长期看护或专业医疗介护。",
        riskAndNeedAnalysis: "对冲大额护理费用，锁定尊享养老社区入住权。",
        recommendedProductsAndArrangements: [
          {
            productType: "万能账户滚存金 + 中宏尊享养老社区入住权",
            actionPlan: "万能账户经过30年复利滚存翻倍，直接支付康养费用。",
            financialImpact: "老有所养、老有所尊，不拖累子女。"
          }
        ]
      },
      {
        ageNode: Math.max(curAge + 42, 85),
        stageName: `${Math.max(curAge + 42, 85)}岁 · 家族财富定向传承与免争端安排`,
        timeHorizonYears: Math.max(curAge + 42, 85) - curAge,
        predictedLifeScenario: "百年后家族资产传承，希望将积累财富隐私、无继承纠纷地定向留给后代。",
        riskAndNeedAnalysis: "防范遗产纠纷与法定公证繁琐手续。",
        recommendedProductsAndArrangements: [
          {
            productType: "保单指定受益人架构",
            actionPlan: "身故赔付款直接划入受益人账户，免去公证与继承争端。",
            financialImpact: "实现财富高效隐私传承。"
          }
        ]
      }
    ];
  } else if (curAge < 55) {
    // 40-54岁中年成熟期
    return [
      {
        ageNode: curAge + 5,
        stageName: `${curAge + 5}岁 · 子女大学留学/立业与事业高峰封顶`,
        timeHorizonYears: 5,
        predictedLifeScenario: "子女面临大学/留学大额开支或立业成家；本人处于事业收入高位，需锁定既得利润。",
        riskAndNeedAnalysis: "将高收入转化为法定确定性收益，防止资本市场波动侵蚀家庭核心财富。",
        recommendedProductsAndArrangements: [
          {
            productType: "中宏年金险 (教育与立业专款)",
            actionPlan: "定期领取生存金作为子女创业起步金或海外留学尾款。",
            financialImpact: "完成家庭责任接力，锁定确定性收益。"
          }
        ]
      },
      {
        ageNode: Math.max(curAge + 10, 60),
        stageName: `${Math.max(curAge + 10, 60)}岁 · 退休交接与高品质养老年金起领`,
        timeHorizonYears: Math.max(curAge + 10, 60) - curAge,
        predictedLifeScenario: "退出企业一线管理，开启休闲养老生活，需补充充足现金流维持消费水准。",
        riskAndNeedAnalysis: "对冲社保养老金缺口，保证每月确定性收入。",
        recommendedProductsAndArrangements: [
          {
            productType: "中宏养老年金按月领取",
            actionPlan: "每月固定养老金打入银行卡，充当品质生活基金。",
            financialImpact: "保持退休前的高品质生活不打折。"
          }
        ]
      },
      {
        ageNode: Math.max(curAge + 20, 72),
        stageName: `${Math.max(curAge + 20, 72)}岁 · 银发康养与高端医疗绿通保障`,
        timeHorizonYears: Math.max(curAge + 20, 72) - curAge,
        predictedLifeScenario: "面对高龄慢性病或重疾风险，追求优质医疗资源与高端养老社区护理。",
        riskAndNeedAnalysis: "需要医疗直付与专属康养机构入住保障。",
        recommendedProductsAndArrangements: [
          {
            productType: "万能账户二次增值 + 高端养老社区",
            actionPlan: "万能账户自由提取用于看护，锁定养老社区床位。",
            financialImpact: "安享尊严晚年，减轻子女照料负担。"
          }
        ]
      },
      {
        ageNode: Math.max(curAge + 30, 82),
        stageName: `${Math.max(curAge + 30, 82)}岁 · 资产隔离与定向家族传承`,
        timeHorizonYears: Math.max(curAge + 30, 82) - curAge,
        predictedLifeScenario: "财富平稳交接给第二代或第三代孙辈。",
        riskAndNeedAnalysis: "规避遗产继承繁琐程序，实现隐私传承。",
        recommendedProductsAndArrangements: [
          {
            productType: "保单指定受益人定向赔付",
            actionPlan: "身故金直接转给指定受益人，无需公证。",
            financialImpact: "保全家族财富，平稳接力。"
          }
        ]
      },
      {
        ageNode: Math.max(curAge + 38, 90),
        stageName: `${Math.max(curAge + 38, 90)}岁 · 百年长寿财富终极保障`,
        timeHorizonYears: Math.max(curAge + 38, 90) - curAge,
        predictedLifeScenario: "百岁长寿人生，享受四代同堂的家族荣耀。",
        riskAndNeedAnalysis: "终身源源不断现金流保障。",
        recommendedProductsAndArrangements: [
          {
            productType: "终身年金持续给付",
            actionPlan: "活多久领多久，终身不断流。",
            financialImpact: "成为家族长寿与财富的象征。"
          }
        ]
      }
    ];
  } else {
    // 55岁以上资深/退休客户
    return [
      {
        ageNode: curAge + 3,
        stageName: `${curAge + 3}岁 · 即期/近即期养老金起领与品质享老`,
        timeHorizonYears: 3,
        predictedLifeScenario: "正式退休，享受闲适时光，每月大额补充养老金充当旅居、爱好开支。",
        riskAndNeedAnalysis: "需要无风险、按时发放的补充养老现金流。",
        recommendedProductsAndArrangements: [
          {
            productType: "中宏养老年金按月/年领取",
            actionPlan: "养老年金即期开始领取，直接补充每月生活费。",
            financialImpact: "资金充沛，不依赖子女补贴。"
          }
        ]
      },
      {
        ageNode: curAge + 10,
        stageName: `${curAge + 10}岁 · 银发黄金游历与健康医疗保障`,
        timeHorizonYears: 10,
        predictedLifeScenario: "身体尚佳，频繁参与旅居养老；同时防范突发重疾或慢病就医风险。",
        riskAndNeedAnalysis: "医疗费用对冲与优质就医绿通通道。",
        recommendedProductsAndArrangements: [
          {
            productType: "中宏高端医疗/重疾绿通",
            actionPlan: "享受专家预约与直付结算，解决看病难问题。",
            financialImpact: "保障品质医疗，安心养老。"
          }
        ]
      },
      {
        ageNode: curAge + 18,
        stageName: `${curAge + 18}岁 · 高龄介护与专属养老社区入住`,
        timeHorizonYears: 18,
        predictedLifeScenario: "日常照料需求上升，希望入住设施齐备的高端养老社区，接受专业护理。",
        riskAndNeedAnalysis: "保证入住权益与高额护理费用支持。",
        recommendedProductsAndArrangements: [
          {
            productType: "万能账户滚存 + 尊享养老社区入住权",
            actionPlan: "万能账户滚存收益直接支付社区月费。",
            financialImpact: "体面尊严晚年，减轻子女看护负担。"
          }
        ]
      },
      {
        ageNode: curAge + 25,
        stageName: `${curAge + 25}岁 · 家族财富无争端定向传承`,
        timeHorizonYears: 25,
        predictedLifeScenario: "将积累的财富平稳定向传承给儿女或孙辈。",
        riskAndNeedAnalysis: "防范家庭继承争端与法定公证繁琐手续。",
        recommendedProductsAndArrangements: [
          {
            productType: "指定保单受益人",
            actionPlan: "保单赔付款直接划入受益人账户，免去公证。",
            financialImpact: "爱与财富精准传递。"
          }
        ]
      },
      {
        ageNode: curAge + 32,
        stageName: `${curAge + 32}岁 · 百年长寿与家族精神永续`,
        timeHorizonYears: 32,
        predictedLifeScenario: "长寿人生典范，见证第三、第四代成长。",
        riskAndNeedAnalysis: "终身资金安全无虞。",
        recommendedProductsAndArrangements: [
          {
            productType: "终身养老年金",
            actionPlan: "与国同寿，领至终老。",
            financialImpact: "为后代树立长远规划典范。"
          }
        ]
      }
    ];
  }
}

// AI Endpoint: Client KOC Needs Analysis & Marketing Strategy Generation
app.post("/api/ai/analyze-koc", async (req, res) => {
  try {
    const { client, annuityPlan } = req.body;
    const ai = getArkClient();
    const curAge = Number(client.age) || 35;

    // Helper for generating dynamic, age-appropriate, realistic life milestones
    const fallbackMilestones = generateSmartMilestones(client, annuityPlan);

    if (!ai) {
      // Fallback structured response if key isn't provided
      return res.json({
        success: true,
        source: "fallback",
        analysis: {
          corePainPoints: [
            `${client.age || 35}岁${client.occupation || "专业人士"}阶段主要关注${client.primaryNeeds?.join("、") || "资产保值与未来规划"}。`,
            "对未来宏观利率下行与通胀贬值存在一定忧虑，希望锁定确定性的长期现金流。",
            "希望规划具有高度确定性，在未来关键人生节点提供稳健支撑。"
          ],
          annuityFitAnalysis: `针对客户${client.name || "客户"}（${client.occupation || "专业人士"}，${client.age || 35}岁），配置${annuityPlan?.name || "中宏尊享年金保险"}可完美契合其需求。年交${annuityPlan?.annualPremium || 50000}元，${annuityPlan?.payYears || 5}年交，兼顾安全性与现金流弹力。`,
          lifetimeMilestones: fallbackMilestones,
          personalizedPitchScript: {
            opening: `“${client.name || "尊敬的客户"}，您好！了解到您近期对${client.primaryNeeds?.[0] || "长期资产配置"}比较关心。在当前的低利率环境下，如何把当下的确定收益锁定为未来几十年的稳定现金流，是很多客户最关注的话题……”`,
            valueProposition: `“这款年金方案最大的亮点在于‘保本保收益，复利滚存’。不仅主险有法定确定的现金价值，搭配万能账户后更能实现二次增值，相当于为您建立了一个专款专用的家庭金库。”`,
            objectionHandling: [
              {
                question: "“我现在流动资金想留着做其他投资，买年金是不是流动性太差了？”",
                answer: "“非常理解您的顾虑！年金险的核心在于‘强制储蓄与底座资产’。保单具有保单贷款功能（可贷现金价值80%），既不影响应急流动性，又能确保核心资产绝对安全。”"
              },
              {
                question: "“万一未来利率回升，买年金是不是不划算？”",
                answer: "“这正是‘主险确定+万能浮动’的优势所在。主险帮您锁定了下限保底收益，万能账户则能享有市场高收益时的浮动分红红利，下可保底、上不封顶。”"
              }
            ]
          },
          kocStrategy: {
            kocInfluenceRating: client.kocRating || "A级 (具备良好社交辐射力与信任感)",
            marketingChannelAdvice: "建议通过1对1私享财富茶叙或朋友圈“确定性资产配置”深度洞察文章切入，激发其同圈层好友的共鸣。",
            referralIncentiveScript: "“您看这次帮您搭建的个人/家庭长期规划方案特别清晰。您身边如果有同龄的朋友也在考虑未来现金流，我可以为您朋友也提供一份一对一的隐私精算测算。”",
            circlePushCopy: `“【财富洞察】低利率时代，聪明人如何锁定未来确定性现金流？看这份专属于${client.age || 35}岁精英的精算方案……”`
          },
          multiDimensionalNeedsBreakdown: {
            medical: "高质医疗：建议搭配中宏高端医疗附加险，锁定优质医疗资源与重疾绿通服务。",
            education: curAge < 45 ? "教育/立业金：可将生存金设定为专项储备基金，保障留学或创业起步。" : "家族成长：为孙辈提供教育信托基金支持。",
            pension: "品质养老：按期领取补充社保养老金缺口，维持高端生活品质。",
            legacy: "资产隔离与传承：指定受益人，实现财富定向传承与家庭资产隔离。"
          }
        }
      });
    }

    const prompt = `
你是一位专业的资深保险精算师与中宏保险（Manulife）高价值客户营销战术专家。
请根据以下客户画像及拟定的年金险产品方案，进行深入的客情分析（KOC分析）、未来几十年全生命周期的节点与风险预判及一对一定制化营销策略生成。

【客户画像】
姓名/代称: ${client.name || "尊贵客户"}
年龄: ${client.age || 35}岁
性别: ${client.gender || "男"}
职业: ${client.occupation || "专业人士"}
家庭状况: ${client.familyStatus || "未婚/已婚"}
预估年收入: ${client.annualIncome || "50-100万"}
风险偏好: ${client.riskPreference || "稳健型"}
核心需求偏好: ${client.primaryNeeds?.join(", ") || "品质养老, 资产保值"}
KOC社交影响力: ${client.kocRating || "A级高潜"}
客户顾虑: ${client.concerns || "担心流动性锁死、担心通胀降息"}

【拟匹配年金险方案】
方案名称: ${annuityPlan?.name || "中宏智尊年金保险方案"}
年交保费: ${annuityPlan?.annualPremium || 50000} 元
交费年期: ${annuityPlan?.payYears || 5} 年
领取起始年龄: ${annuityPlan?.startAge || 60} 岁
预估满期现金价值/万能滚存: ${annuityPlan?.projectedValue || "根据精算表展示"}

请以结构化 JSON 格式输出深度分析结果，JSON 必须包含以下字段：
1. corePainPoints (Array of string): 3条精准的客户核心痛点与未来风险解析。
2. annuityFitAnalysis (string): 年金险方案如何精准对症下药的深度匹配说明（200字以内）。
3. lifetimeMilestones (Array of Objects): 【极度关键！严禁套用固定模板，必须严格按照客户实际年龄(${client.age}岁)、家庭状况(${client.familyStatus})与职业推演！】
   - 若客户只有18-24岁（年轻/学生/职场新人，未婚无子）：绝对不能出现“子女教育/留学/升学”！节点必须推演为“25岁左右·职场独立资产沉淀与婚前独立金库”、“30岁左右·成家立业与婚育储备”、“40岁左右·中生代家庭与教育准备”、“55岁左右·提前退休养老锁利”、“70岁左右·高龄康养传承”！
   - 若客户为25-39岁（青年/年轻家庭）：推演事业上升、婚育/子女教育、养老金起领、高龄护理等。
   - 若客户为40-54岁（中年精英）：推演子女大学留学/立业金、退休交接、品质养老、家族传承等。
   - 若客户为55岁以上（退休/资深）：推演即期养老金领取、银发旅居、高端社区入住、一代传二代定向传承等。
   具体属性：
   - ageNode (number): 年龄节点（如 25, 30, 40, 55, 70）
   - stageName (string): 阶段名称（如 "25岁·职场探索期与首笔个人独立资产沉淀"）
   - timeHorizonYears (number): 距今多少年
   - predictedLifeScenario (string): 真实预判该节点可能出现的人生情境（符合年龄常理）
   - riskAndNeedAnalysis (string): 风险与资金需求深度分析
   - recommendedProductsAndArrangements (Array of { productType: string, actionPlan: string, financialImpact: string }): 对应的产品安排与保单操作动作
4. personalizedPitchScript (Object): 
   - opening (string): 专属开场白话术。
   - valueProposition (string): 核心价值主张与亮点阐述。
   - objectionHandling (Array of {question: string, answer: string}): 2条常见的客户异议及金牌应对话术（针对流动性、利率等）。
5. kocStrategy (Object):
   - kocInfluenceRating (string): KOC社交影响力评估。
   - marketingChannelAdvice (string): 适合该客户的接触点与精准营销渠道建议。
   - referralIncentiveScript (string): 引导其转介绍圈层好友的自然话术。
   - circlePushCopy (string): 适合发给该客户或朋友圈的定制推文/短文案（100字内）。
6. multiDimensionalNeedsBreakdown (Object):
   - medical (string): 医疗保障延伸分析及对症建议。
   - education (string): 子女教育/个人提升金规划延伸分析。
   - pension (string): 养老年金补充分析。
   - legacy (string): 财富传承与资产隔离分析。

只输出一个 JSON 对象本身，不要任何 markdown 代码块标记（不要\`\`\`json），不要任何解释性文字。
`;

    let parsedData = null;
    try {
      const completion = await ai.chat.completions.create({
        model: process.env.ARK_MODEL as string,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
      parsedData = extractJson(completion.choices?.[0]?.message?.content);
    } catch (genAiErr) {
      console.warn("豆包API调用失败，使用精算引擎fallback:", genAiErr);
    }

    if (parsedData && parsedData.corePainPoints) {
      return res.json({ success: true, source: "ai", analysis: parsedData });
    }

    // Fallback if parsing or API failed
    return res.json({
      success: true,
      source: "fallback",
      analysis: {
        corePainPoints: [
          `${client.age || 35}岁阶段主要关注${client.primaryNeeds?.join("、") || "资产保值与养老规划"}。`,
          "对未来宏观利率下行与通胀贬值存在一定忧虑，希望锁定确定性的长期现金流。",
          "希望规划具有高度确定性，且能在关键节点（如子女留学、自己退休）提供稳健支撑。"
        ],
        annuityFitAnalysis: `针对客户${client.name || "客户"}（${client.occupation || "专业人士"}，${client.age || 35}岁），配置${annuityPlan?.name || "中宏尊享年金保险"}可完美契合其需求。年交${annuityPlan?.annualPremium || 50000}元，${annuityPlan?.payYears || 5}年交，可在退休后每年提供确定生存金，兼顾安全性与现金流弹力。`,
        lifetimeMilestones: fallbackMilestones,
        personalizedPitchScript: {
          opening: `“${client.name || "张总"}，您好！了解到您近期对${client.primaryNeeds?.[0] || "长期资产配置"}比较关心。在当前的低利率环境下，如何把当下的确定收益锁定为未来30年的稳定现金流，是很多高净值客户最关注的话题……”`,
          valueProposition: `“这款年金方案最大的亮点在于‘保本保收益，复利滚存’。不仅主险有法定确定的现金价值，搭配万能账户后更能实现二次增值，相当于为您建立了一个专款专用的是家庭金库。”`,
          objectionHandling: [
            {
              question: "“我现在流动资金想留着做其他投资，买年金是不是流动性太差了？”",
              answer: "“非常理解您的顾虑！年金险的核心在于‘强制储蓄与底座资产’。保单具有保单贷款功能（可贷现金价值80%），既不影响应急流动性，又能确保核心资产绝对安全。”"
            },
            {
              question: "“万一未来利率回升，买年金是不是不划算？”",
              answer: "“这正是‘主险确定+万能浮动’的优势所在。主险帮您锁定了下限保底收益，万能账户则能享有市场高收益时的浮动分红红利，下可保底、上不封顶。”"
            }
          ]
        },
        kocStrategy: {
          kocInfluenceRating: client.kocRating || "S级 (具备高度社交辐射力与朋友圈信任感)",
          marketingChannelAdvice: "建议通过1对1私享财富茶叙或朋友圈“确定性资产配置”深度洞察文章切入，激发其同圈层好友的共鸣。",
          referralIncentiveScript: "“张哥，您看这次帮您和嫂子搭建的养老规划方案特别清晰。您身边如果有同龄的高管朋友也在考虑退休现金流，我可以为您朋友也提供一份一对一的隐私精算测算。”",
          circlePushCopy: `“【财富洞察】低利率时代，聪明人如何锁定未来30年确定性现金流？看这份专属于${client.age || 35}岁精英家庭的养老精算方案……”`
        },
        multiDimensionalNeedsBreakdown: {
          medical: "高质医疗：建议搭配中宏高端医疗附加险，锁定优质医疗资源与重疾绿通服务。",
          education: "子女教育：可将年金第5-10年的生存金设定为教育信托基金，保障海外留学或立业金。",
          pension: "品质养老：55/60岁起领，补充社保养老金缺口，维持高端生活品质。",
          legacy: "资产隔离与传承：指定受益人，实现财富定向传承与家庭资产隔离。"
        }
      }
    });
  } catch (error: any) {
    console.error("Error in /api/ai/analyze-koc:", error);
    res.status(500).json({ success: false, error: error.message || "AI Analysis failed" });
  }
});

// AI Endpoint: Reverse Target Payout & Premium Adjustment Calculation Advice
app.post("/api/ai/reverse-calculate", async (req, res) => {
  try {
    const { targetStartAge, targetAnnualPayout, currentAge, payYears, adjustmentType, userNotes } = req.body;
    const ai = getArkClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "fallback",
        suggestion: {
          recommendedAnnualPremium: Math.round((targetAnnualPayout * 10) / payYears),
          payYearsOptions: [
            { years: 3, annualPremium: Math.round((targetAnnualPayout * 11) / 3), totalPremium: Math.round(targetAnnualPayout * 11) },
            { years: 5, annualPremium: Math.round((targetAnnualPayout * 10) / 5), totalPremium: Math.round(targetAnnualPayout * 10) },
            { years: 10, annualPremium: Math.round((targetAnnualPayout * 9.5) / 10), totalPremium: Math.round(targetAnnualPayout * 9.5) }
          ],
          actuarialAdvice: `要在${targetStartAge}岁起每年领${targetAnnualPayout.toLocaleString()}元，建议首期或年交保费在￥${Math.round((targetAnnualPayout * 10) / payYears).toLocaleString()}元左右。若选择增加保费或早期万能追加，可大幅缩短回本周期并提升长期IRR。`,
          adjustmentStrategy: "前期保费可按5年交建立基础杠杆，若后续有大额资金进账，可通过万能账户随时追加；若资金紧张，可在第5年后利用减额交清保持保单效力。"
        }
      });
    }

    const prompt = `
你是一位精通年金险精算与现金流配置的资深精算专家。
客户提出了明确的目标领取诉求：
- 当前年龄: ${currentAge || 30} 岁
- 目标开始领取年龄: ${targetStartAge || 50} 岁
- 目标每年领取金额: ${targetAnnualPayout || 50000} 元
- 拟选交费年期: ${payYears || 5} 年
- 保费调整偏好: ${adjustmentType || "平摊交费/前期加保/万能账户追加"}
- 额外备注: ${userNotes || "无"}

请根据年金险的复利及现值/终值精算原理，给出精算建议与保费推算方案。以 JSON 格式输出：
1. recommendedAnnualPremium (Number): 建议的年交保费预估值（整数人民币元）。
2. payYearsOptions (Array of {years: number, annualPremium: number, totalPremium: number, commentary: string}): 比较 3年交、5年交、10年交不同方案下的年交保费与总投入成本对比。
3. actuarialAdvice (string): 精算师专业点评（包含资金时间价值、复利空间、IRR预估）。
4. adjustmentStrategy (string): 具体的保费增减额（如前期追加保费、后期减额交清、万能账户二次增值）操作策略说明。

只输出一个 JSON 对象本身，不要任何 markdown 代码块标记（不要\`\`\`json），不要任何解释性文字。
`;

    let parsed = null;
    try {
      const completion = await ai.chat.completions.create({
        model: process.env.ARK_MODEL as string,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
      parsed = extractJson(completion.choices?.[0]?.message?.content);
    } catch (genAiErr) {
      console.warn("豆包API调用失败(reverse-calculate)，使用fallback:", genAiErr);
    }

    if (parsed && parsed.recommendedAnnualPremium) {
      return res.json({ success: true, source: "ai", suggestion: parsed });
    }

    return res.json({
      success: true,
      source: "fallback",
      suggestion: {
        recommendedAnnualPremium: Math.round((targetAnnualPayout * 10) / payYears),
        payYearsOptions: [
          { years: 3, annualPremium: Math.round((targetAnnualPayout * 11) / 3), totalPremium: Math.round(targetAnnualPayout * 11) },
          { years: 5, annualPremium: Math.round((targetAnnualPayout * 10) / 5), totalPremium: Math.round(targetAnnualPayout * 10) },
          { years: 10, annualPremium: Math.round((targetAnnualPayout * 9.5) / 10), totalPremium: Math.round(targetAnnualPayout * 9.5) }
        ],
        actuarialAdvice: `要在${targetStartAge}岁起每年领${targetAnnualPayout.toLocaleString()}元，建议首期或年交保费在￥${Math.round((targetAnnualPayout * 10) / payYears).toLocaleString()}元左右。若选择增加保费或早期万能追加，可大幅缩短回本周期并提升长期IRR。`,
        adjustmentStrategy: "前期保费可按5年交建立基础杠杆，若后续有大额资金进账，可通过万能账户随时追加；若资金紧张，可在第5年后利用减额交清保持保单效力。"
      }
    });
  } catch (error: any) {
    console.error("Error in /api/ai/reverse-calculate:", error);
    res.status(500).json({ success: false, error: error.message || "Calculation failed" });
  }
});

// Vite middleware for dev or Static serve for prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
