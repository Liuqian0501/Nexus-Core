
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  SimulationState, 
  ANALYSIS_AGENTS, 
  REVIEW_BOARD_AGENTS, 
  Stock, 
  AgentResult, 
  CompanyAnalysisGroup,
  ModelSettings,
  AgentConfig
} from './types';
import * as Gemini from './services/geminiService';
import { Header } from './components/Header';
import { AgentOutputCard } from './components/AgentOutputCard';
import { SummaryCard } from './components/SummaryCard';
import { FinalVerdictCard } from './components/FinalVerdictCard';
import { AgentConfigCard } from './components/AgentConfigCard';
import { 
  Play, Sparkles, Activity, Search, BarChart3, ChevronRight, Trophy, PenLine, 
  Cpu, Hexagon, Info, X, Layers, GitMerge, Gavel, Users, CheckCircle2, 
  Square, CheckSquare, GitCompare, Scale, Target, Loader2, Zap, Brain, 
  Settings, ChevronDown, ChevronUp, Eye, EyeOff, LayoutDashboard, Sliders, 
  Crown, ShieldCheck, Terminal, Settings2, BookOpen, Network, Database, Swords, ExternalLink
} from 'lucide-react';

const STARTER_PROMPTS = [
  { id: 'ai', label: '🤖 AI算力', text: '我想挖掘A股算力产业链中的核心标的，特别是光模块、PCB and 液冷服务器环节。寻找那些有真实海外订单、业绩兑现度高、且估值尚未泡沫化的细分龙头。' },
  { id: 'dividend', label: '💰 高股息', text: '我的目标是构建一个低风险、高分红的防御性组合。请筛选股息率超过5%、自由现金流为正、且经营稳健的央国企，重点关注煤炭、水电和高速公路板块。' },
  { id: 'turnaround', label: '⚡ 新能源反转', text: '我看好光伏和锂电行业的周期见底。请找出那些在行业出清阶段市场份额反而提升、技术路线领先、且股价已跌破净资产的错杀龙头。' },
  { id: 'semi', label: '🔌 半导体替代', text: '关注半导体上游设备 and 材料的国产替代机会。寻找技术壁垒极高、正处于验证突破期、且受益于政策支持的“小而美”公司，风险偏好较高。' },
  { id: 'pharma', label: '💊 创新药出海', text: '寻找具备全球竞争力的创新药企。重点关注那些有重磅单品在美国获批上市、BD交易活跃、且现金流足以支撑研发支出的生物医药公司。' },
  { id: 'silver', label: '👵 银发经济', text: '随着老龄化加剧，寻找服务于“银发经济”的潜力股。重点关注养老器械、成人失禁用品、慢病管理药物以及老年旅游消费板块。' },
  { id: 'quantum', label: '⚛️ 量子科技', text: '寻找A股中真正具备量子计算、脑机接口或6G通信技术储备的硬科技公司。排除纯概念炒作，寻找有核心专利壁垒的企业。' },
  { id: 'hydrogen', label: '💧 绿氢能源', text: '分析氢能产业链的投资机会，重点关注制氢、储运以及燃料电池环节。寻找在成本下降曲线上具有先发优势、且有央企订单背书的设备龙头。' },
  { id: 'agtech', label: '🌾 粮食安全', text: '基于国家粮食安全战略，挖掘生物育种（转基因）、高端农机以及复合肥领域的龙头。寻找受益于土地流转改革和种业振兴政策的隐形冠军。' },
  { id: 'ma_reform', label: '🤝 并购重组', text: '在IPO收紧背景下，寻找具备强烈并购重组预期的公司。重点关注“大集团小平台”的央企上市公司，博弈资产注入机会。' },
  { id: 'consumer', label: '🍷 大消费复苏', text: '寻找具有强品牌护城河和定价权的消费品龙头。关注那些在消费降级环境下依然能保持高ROE and 毛利率稳定的公司。' },
  { id: 'robotics', label: '🦾 人形机器人', text: '挖掘人形机器人产业链中的核心零部件供应商（丝杠、减速器、传感器）。重点寻找进入特斯拉供应链或具备国产替代能力的精密制造企业。' },
  { id: 'low_altitude', label: '🚁 低空经济', text: '分析低空经济（eVTOL）产业链的爆发潜力。寻找在空管系统、碳纤维复合材料以及整机制造领域具备先发优势 and 适航取证能力的上市公司。' },
  { id: 'defense', label: '🛡️ 国防军工', text: '关注地缘政治背景下的军工板块。寻找拥有高确定性订单、受宏观经济波动影响小、且处于新型装备列装周期的主机厂 or 核心配套商。' },
  { id: 'driving', label: '🚗 智能驾驶', text: '随着L3级自动驾驶法规落地，寻找智能驾驶产业链中的增量机会。重点关注域控制器、激光雷达以及智能座舱领域的细分龙头。' },
  { id: 'resources', label: '⛏️ 有色资源', text: '基于美联储降息预期和全球通胀逻辑，寻找铜、金、铝等有色金属的上游资源股。重点关注矿产储量大、开采成本低且扩产预期明确的公司。' },
  { id: 'export', label: '🚢 出海创汇', text: '寻找“中国制造”出海逻辑最硬的板块。关注工程机械、电力设备或手动工具行业中，海外收入占比超过50%且全球市场份额持续提升的隐形冠军。' },
  { id: 'soe_value', label: '🏛️ 中特估', text: '挖掘被低估的“中国特色估值体系”概念股。寻找PB小于1、通过资产重组提升经营效率、且具备市值管理动力的核心央企。' },
  { id: 'data', label: '🧱 数据要素', text: '关注数字中国建设背景下的数据要素产业链。寻找在公共数据授权运营、数据确权以及政务IT system 改造领域具备卡位优势的科技公司。' },
  { id: 'battery', label: '🔋 固态电池', text: '分析固态电池技术突破带来的产业链变革。寻找在固态电解质、硅基负极等关键材料领域拥有核心专利并已开始送样测试的前沿材料公司。' },
  { id: 'saas', label: '☁️ 信创软件', text: '寻找国产软件替代逻辑下的核心标的。重点关注操作系统、数据库、ERP以及工业软件领域的龙头，寻找已进入央国企采购名单的公司。' },
  { id: 'med_device', label: '🩺 医疗器械', text: '挖掘医疗器械国产化率提升的机会。重点关注医学影像、高值耗材以及体外诊断领域的平台型公司，寻找具备出海能力的龙头。' },
  { id: 'cross_border', label: '📦 跨境电商', text: '寻找受益于Temu/Shein/TikTok崛起的相关产业链。关注跨境物流、品牌代工（小家电/服饰），寻找海外营收增速超30%的公司。' },
  { id: 'real_estate_service', label: '🏘️ 地产幸存者', text: '在地产行业洗牌后，寻找资产负债表健康的幸存者。重点关注轻资产运营的物业服务、以及具备护城河的防水/涂料/管材等建材龙头。' },
  { id: 'pig_cycle', label: '🐖 猪周期', text: '基于猪周期见底逻辑，寻找成本控制能力最强的养殖龙头。关注能繁母猪存栏量、单斤成本以及资金链安全度，博弈价格反转利润弹性。' },
  { id: 'precious_metal', label: '🥇 贵金属', text: '在全球地缘动荡背景下，寻找黄金、白银相关标的。关注拥有优质自有矿山、扩产预期明确且生产成本处于行业低位的资源股。' },
  { id: 'coal_power', label: '⚡ 煤电联营', text: '关注煤炭与火电的联营互保逻辑。寻找拥有高长协煤占比的火电龙头，或布局了绿电运营的传统能源转型股。' },
  { id: 'shipping', label: '⚓ 航运造船', text: '分析全球航运与造船的大周期。重点关注处于订单上行周期的造船厂，或受益于运价波动的油运/干散货航运龙头。' },
  { id: 'space', label: '🚀 商业航天', text: '挖掘卫星互联网与商业航天产业链。关注卫星制造、地面终端设备以及火箭发射配套环节，寻找参与国家级星座建设的核心供应商。' },
  { id: 'game_media', label: '🎮 游戏传媒', text: '寻找AI赋能下的游戏与传媒板块机会。关注拥有丰富IP储备、且已将AIGC技术应用于降本增效 or 新玩法开发的游戏龙头。' },
  { id: 'grid_eq', label: '🔌 特高压', text: '关注全球电网升级背景下的电力设备出海。重点寻找在特高压变压器、智能电表领域具备国际竞争力的龙头。' },
  { id: 'new_materials', label: '🧪 化工材料', text: '寻找被海外垄断材料的国产突破。重点关注PEEK、气凝胶、电子化学品领域，寻找即将放量的“专精特新”企业。' },
  { id: 'edu', label: '🎓 职业教育', text: '在政策支持职业教育的背景下，寻找基本面反转的教育股。重点关注产教融合、公考培训以及拥有优质民办高教资产的上市公司。' },
  { id: 'pet', label: '🐈 宠物经济', text: '关注“它经济”的长期增长潜力。寻找宠物食品以及宠物医疗领域的国产品牌龙头，关注自有品牌占比提升逻辑。' },
  { id: 'syn_bio', label: '🧬 合成生物', text: '挖掘合成生物学选品落地的平台型公司。关注在长链二元酸、生物基材料实现技术突破并量产的行业领军者。' }
];

const REVIEW_BOARD_KEY_MAP: Record<number, keyof SimulationState['reviewBoard']> = {
  101: 'fundamental',
  102: 'sentiment',
  103: 'risk',
  104: 'macro',
  105: 'portfolio',
  106: 'rogers',
  107: 'intelligence'
};

const App: React.FC = () => {
  // --- State ---
  const [simulation, setSimulation] = useState<SimulationState>({
    investmentCriteria: "",
    phase: 'input',
    stocks: [],
    companyAnalyses: {},
    reviewBoard: {
        fundamental: { output: null, status: 'idle', logs: [] },
        sentiment: { output: null, status: 'idle', logs: [] },
        risk: { output: null, status: 'idle', logs: [] },
        macro: { output: null, status: 'idle', logs: [] },
        portfolio: { output: null, status: 'idle', logs: [] },
        rogers: { output: null, status: 'idle', logs: [] },
        intelligence: { output: null, status: 'idle', logs: [] }
    },
    finalVerdict: { output: null, status: 'idle', logs: [] },
    comparison: { output: null, status: 'idle', logs: [] } // Init comparison state
  });

  const [targetCompanyCount, setTargetCompanyCount] = useState<number>(3);
  const [analysisAgents, setAnalysisAgents] = useState<AgentConfig[]>(ANALYSIS_AGENTS);
  const [reviewAgents, setReviewAgents] = useState<AgentConfig[]>(REVIEW_BOARD_AGENTS);
  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    modelName: 'gemini-3-flash-preview', 
    thinkingBudget: 2048,                 
  });

  const [godModeReview, setGodModeReview] = useState<boolean>(false); 
  const [godModeVerdict, setGodModeVerdict] = useState<boolean>(true); 
  const [selectedStockCode, setSelectedStockCode] = useState<string | null>(null);
  const [showAgentConfig, setShowAgentConfig] = useState(false); 
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [isReviewBoardExpanded, setIsReviewBoardExpanded] = useState<boolean>(true); 
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  // New States for Battle Royale
  const [comparisonSelection, setComparisonSelection] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showComparisonPrompt, setShowComparisonPrompt] = useState(false);

  // Derived
  const activeStock = selectedStockCode ? simulation.companyAnalyses[selectedStockCode] : null;
  const showReviewBoard = ['meta_review', 'final_decision', 'complete'].includes(simulation.phase);

  // --- Logic ---
  const handleUpdateAgent = (id: number, field: keyof AgentConfig, value: string | number) => {
    setAnalysisAgents(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
    setReviewAgents(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const agentIdToKey = (id: number) => {
    switch(id) {
        case 1: return 'optimist';
        case 2: return 'skeptic';
        case 3: return 'historian';
        case 4: return 'strategist';
        case 5: return 'technician';
        case 6: return 'scout';
        default: return 'optimist';
    }
  };

  const updateAgentState = (stockCode: string, key: string, updates: Partial<AgentResult>) => {
    setSimulation(prev => {
        const company = prev.companyAnalyses[stockCode];
        if (!company) return prev;
        // @ts-ignore
        const currentAgent = company[key] as AgentResult;
        return {
            ...prev,
            companyAnalyses: {
                ...prev.companyAnalyses,
                [stockCode]: {
                    ...company,
                    [key]: { 
                        ...(currentAgent || {}), 
                        ...updates,
                        logs: updates.logs ? [...(currentAgent?.logs || []), ...updates.logs] : currentAgent?.logs || []
                    }
                }
            }
        };
    });
  };

  const updateReviewState = (key: keyof SimulationState['reviewBoard'], updates: Partial<AgentResult>) => {
    setSimulation(prev => ({
        ...prev,
        reviewBoard: {
            ...prev.reviewBoard,
            [key]: {
                ...prev.reviewBoard[key],
                ...updates,
                logs: updates.logs ? [...(prev.reviewBoard[key].logs || []), ...updates.logs] : prev.reviewBoard[key].logs || []
            }
        }
    }));
  };

  // Toggle selection for comparison
  const handleToggleComparison = (code: string) => {
      setComparisonSelection(prev => {
          if (prev.includes(code)) return prev.filter(c => c !== code);
          if (prev.length >= 3) return prev; // Max 3
          return [...prev, code];
      });
  };

  // Run the Comparison
  const handleRunComparison = async () => {
      if (comparisonSelection.length < 2) return;
      setShowComparisonModal(true);
      setShowComparisonPrompt(false);
      setSimulation(prev => ({ ...prev, comparison: { status: 'loading', output: null, logs: [] } }));
      
      const selectedAnalyses = comparisonSelection.map(code => {
          const group = simulation.companyAnalyses[code];
          return {
              name: group.stock.name,
              code: group.stock.code,
              summary: group.summary.output,
              reports: {
                  optimist: group.optimist.output,
                  skeptic: group.skeptic.output,
                  historian: group.historian.output,
                  strategist: group.strategist.output,
                  technician: group.technician.output,
                  scout: group.scout.output
              }
          };
      });

      try {
          const result = await Gemini.generateComparisonAnalysis(selectedAnalyses, godModeVerdict ? { ...modelSettings, modelName: 'gemini-3-pro-preview' } : modelSettings);
          setSimulation(prev => ({ 
              ...prev, 
              comparison: { 
                  output: result.output, 
                  sources: result.sources, 
                  prompt: result.prompt, 
                  status: 'success', 
                  logs: ['Comparison Complete'] 
              } 
          }));
      } catch (e: any) {
           setSimulation(prev => ({ 
              ...prev, 
              comparison: { 
                  output: null, 
                  status: 'error', 
                  errorMessage: e.message,
                  logs: ['Comparison Failed'] 
              } 
          }));
      }
  };
  
  // --- Export / Download Logic ---
  const handleDownload = () => {
    let content = `# NEXUS Financial Core - Simulation Report\n\n`;
    content += `**Date:** ${new Date().toLocaleString()}\n`;
    content += `**Strategy Criteria:** ${simulation.investmentCriteria}\n\n`;
    content += `**Target Universe:** ${simulation.stocks.map(s => `${s.name} (${s.code})`).join(', ')}\n\n`;
    
    content += `---\n\n`;

    // 1. Executive Verdict
    if (simulation.finalVerdict.output) {
      content += `## 🏆 IC COMMITTEE FINAL VERDICT\n\n`;
      content += `${simulation.finalVerdict.output}\n\n`;
      if (simulation.finalVerdict.sources?.length) {
        content += `**Sources:**\n${simulation.finalVerdict.sources.map((s, i) => `${i+1}. [${s.title}](${s.uri})`).join('\n')}\n\n`;
      }
      content += `---\n\n`;
    }

    // 2. Battle Royale Comparison
    if (simulation.comparison.output) {
      content += `## ⚔️ BATTLE ROYALE COMPARISON\n\n`;
      content += `${simulation.comparison.output}\n\n`;
       if (simulation.comparison.sources?.length) {
        content += `**Sources:**\n${simulation.comparison.sources.map((s, i) => `${i+1}. [${s.title}](${s.uri})`).join('\n')}\n\n`;
      }
      content += `---\n\n`;
    }

    // 3. Review Board Analysis
    content += `## 🏛️ REVIEW BOARD ANALYSIS (Tier-3)\n\n`;
    Object.entries(simulation.reviewBoard).forEach(([key, result]) => {
      const agent = REVIEW_BOARD_AGENTS.find(a => REVIEW_BOARD_KEY_MAP[a.id] === key);
      const name = agent ? agent.name : key;
      if (result.output) {
        content += `### ${name}\n\n${result.output}\n\n`;
        if (result.sources?.length) {
            content += `**Sources:**\n${result.sources.map((s, i) => `${i+1}. [${s.title}](${s.uri})`).join('\n')}\n\n`;
        }
      }
    });
    content += `---\n\n`;

    // 4. Individual Company Dossiers
    content += `## 📂 INDIVIDUAL COMPANY DOSSIERS (Tier-2 & Tier-1)\n\n`;
    simulation.stocks.forEach(stock => {
      const analysis = simulation.companyAnalyses[stock.code];
      if (!analysis) return;

      content += `### 🏢 ${stock.name} (${stock.code})\n\n`;
      
      if (analysis.summary.output) {
        content += `#### 📋 Sector Manager Brief\n${analysis.summary.output}\n\n`;
      }

      const subAgents = [
        { k: 'optimist', name: 'Alpha Hunter' },
        { k: 'skeptic', name: 'Risk Forensic' },
        { k: 'historian', name: 'Cycle Master' },
        { k: 'strategist', name: 'The Strategist' },
        { k: 'technician', name: 'Market Structure' },
        { k: 'scout', name: 'The Scout' },
      ];

      subAgents.forEach(({ k, name }) => {
        // @ts-ignore
        const res = analysis[k] as AgentResult;
        if (res?.output) {
          content += `#### ${name}\n${res.output}\n\n`;
           if (res.sources?.length) {
            content += `**Sources:**\n${res.sources.map((s, i) => `${i+1}. [${s.title}](${s.uri})`).join('\n')}\n\n`;
           }
        }
      });
      
      content += `---\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NEXUS_Report_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStartSimulation = async () => {
    if (!simulation.investmentCriteria.trim()) return;
    setSimulation(prev => ({ ...prev, phase: 'selecting_stocks' }));
    setProcessingStatus('Acquiring Targets...');
    try {
      const stocks = await Gemini.generateStockList(simulation.investmentCriteria, targetCompanyCount, modelSettings);
      const initialAnalyses: Record<string, CompanyAnalysisGroup> = {};
      stocks.forEach(stock => {
        initialAnalyses[stock.code] = {
          stock,
          optimist: { output: null, status: 'idle', logs: [] },
          skeptic: { output: null, status: 'idle', logs: [] },
          historian: { output: null, status: 'idle', logs: [] },
          strategist: { output: null, status: 'idle', logs: [] },
          technician: { output: null, status: 'idle', logs: [] },
          scout: { output: null, status: 'idle', logs: [] },
          summary: { output: null, status: 'idle', logs: [] },
          status: 'idle'
        };
      });
      setSimulation(prev => ({ ...prev, stocks, companyAnalyses: initialAnalyses, phase: 'analyzing_companies' }));
      if (stocks.length > 0) setSelectedStockCode(stocks[0].code);
      processStocksInBatches(stocks);
    } catch (error: any) {
      alert("Failed to generate stock list. Check API Key.");
      setSimulation(prev => ({ ...prev, phase: 'input' }));
    }
  };

  const processStocksInBatches = async (stocks: Stock[]) => {
    const isFlashModel = modelSettings.modelName.includes('flash');
    const BATCH_SIZE = isFlashModel ? 10 : 2; 
    
    // Create a local collection to gather results, bypassing state closure staleness
    const collectedResults: CompanyAnalysisGroup[] = [];

    for (let i = 0; i < stocks.length; i += BATCH_SIZE) {
        const batch = stocks.slice(i, i + BATCH_SIZE);
        // We await the completion of the batch
        const batchResults = await Promise.all(batch.map(stock => processCompany(stock)));
        
        // Collect successful results
        batchResults.forEach(res => {
            if (res) collectedResults.push(res);
        });

        setProcessingStatus(`Mesh Sync: ${Math.min(i + BATCH_SIZE, stocks.length)} / ${stocks.length} Analyzed`);
    }

    startReviewPhase(collectedResults);
  };

  // Modified to return the final CompanyAnalysisGroup object
  const processCompany = async (stock: Stock): Promise<CompanyAnalysisGroup | null> => {
        setSimulation(prev => ({
            ...prev,
            companyAnalyses: { ...prev.companyAnalyses, [stock.code]: { ...prev.companyAnalyses[stock.code], status: 'loading' } }
        }));
        
        const prompt = `分析目标：${stock.name} (${stock.code})。根据角色深度分析。`;
        
        try {
            const agentPromises = analysisAgents.map(async (agent, index) => {
                const key = agentIdToKey(agent.id);
                updateAgentState(stock.code, key, { status: 'loading', logs: [`[${agent.name}] 初始化中...`, `[API] 连接 Gemini 引擎...`] });
                await new Promise(resolve => setTimeout(resolve, index * 300));

                try {
                    updateAgentState(stock.code, key, { logs: [`[SEARCH] 正在验证实时数据源...`] });
                    const res = await Gemini.generateAgentResponse(agent, prompt, modelSettings);
                    updateAgentState(stock.code, key, { output: res.output, sources: res.sources, prompt: res.prompt, status: 'success', logs: [`[SUCCESS] 分析已提交。`] });
                    return { key, output: res.output, resObj: res, success: true };
                } catch (err: any) {
                    updateAgentState(stock.code, key, { status: 'error', errorMessage: err.message, logs: [`[ERROR] ${err.message}`] });
                    return { key, output: null, success: false };
                }
            });

            const results = await Promise.all(agentPromises);
            const outputs: any = {};
            const fullResults: any = {};
            
            results.forEach((res: any) => { 
                if (res.success) {
                    outputs[res.key] = res.output;
                    fullResults[res.key] = res.resObj;
                }
            });

            updateAgentState(stock.code, 'summary', { status: 'loading', logs: ['[SECTOR] 正在汇总专家报告...'] });
            const summaryRes = await Gemini.generateCompanyGroupSummary(stock, outputs, analysisAgents, modelSettings);
            
            const finalSummary = { output: summaryRes.output, sources: summaryRes.sources, prompt: summaryRes.prompt, status: 'success' as const, logs: ['[DONE] 汇总完成。'] };

            setSimulation(prev => {
                const current = prev.companyAnalyses[stock.code];
                return {
                    ...prev,
                    companyAnalyses: {
                        ...prev.companyAnalyses,
                        [stock.code]: {
                            ...current,
                            summary: finalSummary,
                            status: 'complete'
                        }
                    }
                };
            });

            // Construct and return the full object for the batch collector
            // We use the collected outputs to build a temporary object, ensuring we don't rely on stale state
            // Note: We need to reconstruct the agent results shape
            const getAgentResult = (key: string): AgentResult => {
               const raw = fullResults[key];
               if (raw) return { output: raw.output, sources: raw.sources, prompt: raw.prompt, status: 'success', logs: [] };
               return { output: null, status: 'error', logs: [] };
            };

            return {
                stock,
                optimist: getAgentResult('optimist'),
                skeptic: getAgentResult('skeptic'),
                historian: getAgentResult('historian'),
                strategist: getAgentResult('strategist'),
                technician: getAgentResult('technician'),
                scout: getAgentResult('scout'),
                summary: finalSummary,
                status: 'complete'
            };

        } catch (err: any) { return null; }
  };

  const startReviewPhase = async (completedAnalyses: CompanyAnalysisGroup[]) => {
    setSimulation(prev => ({ ...prev, phase: 'meta_review' }));
    setProcessingStatus('召集投决会董事成员...');
    
    // We construct a massive dossier containing ALL sub-agent reports, not just the summary.
    const allDossiers = completedAnalyses.map(group => `
=== 标的资产 Dossier: ${group.stock.name} (${group.stock.code}) ===

[PART 1] 行业首席综述 (Sector Manager Summary):
${group.summary.output || "（数据缺失）"}

[PART 2] 六大专项小组原始底稿 (Sub-Agent Raw Reports):
1. 阿尔法猎人 (Alpha Hunter):
${group.optimist.output || "（无报告）"}

2. 法务风控官 (Risk Forensic):
${group.skeptic.output || "（无报告）"}

3. 周期量化专家 (Cycle Master):
${group.historian.output || "（无报告）"}

4. 战略护城河顾问 (The Strategist):
${group.strategist.output || "（无报告）"}

5. 筹码结构分析师 (Market Structure):
${group.technician.output || "（无报告）"}

6. 情报调查员 (The Scout):
${group.scout.output || "（无报告）"}
`).join("\n\n==================================================\n\n");

    const reviewSettings: ModelSettings = godModeReview ? { ...modelSettings, modelName: 'gemini-3-pro-preview', thinkingBudget: 32768 } : modelSettings;
    
    // SERIAL EXECUTION TO AVOID RATE LIMITS (429)
    // The Input Token count for 10-25 companies is massive (500k-1M+ tokens).
    // Running these in parallel guarantees hitting the 1M TPM quota.
    const finalReviews: any = {};

    for (const agent of reviewAgents) {
        const key = REVIEW_BOARD_KEY_MAP[agent.id];
        if (!key) continue;

        // Tier-3 specific logs
        updateReviewState(key, { 
          status: 'loading', 
          logs: [`[BOARD] 正在接入 Tier-3 决策网络...`, `[BOARD] 正在深度阅读 ${completedAnalyses.length} 份全量调研全案...`] 
        });

        try {
            updateReviewState(key, { logs: [`[THINKING] 正在进行跨资产关联度分析...`] });
            // Strict Serial Await
            const res = await Gemini.generateReviewBoardAnalysis(agent, allDossiers, reviewSettings);
            updateReviewState(key, { output: res.output, sources: res.sources, prompt: res.prompt, status: 'success', logs: [`[BOARD] 专家决议已归档。`] });
            finalReviews[key] = res.output;
        } catch (e: any) {
             updateReviewState(key, { status: 'error', errorMessage: e.message, logs: [`[CRITICAL] 董事会议中断: ${e.message}`] });
        }
    }

    setSimulation(prev => ({ ...prev, phase: 'final_decision', finalVerdict: { ...prev.finalVerdict, status: 'loading', logs: ['[IC] 正在通过主席投票系统汇总最终决议...'] } }));
    try {
        const verdictRes = await Gemini.generateFinalVerdict(finalReviews, allDossiers, godModeVerdict ? { ...modelSettings, modelName: 'gemini-3-pro-preview', thinkingBudget: 32768 } : modelSettings);
        setSimulation(prev => ({ ...prev, phase: 'complete', finalVerdict: { output: verdictRes.output, prompt: verdictRes.prompt, status: 'success', logs: ['[IC] 最终投资决议书已签发。'] } }));
    } catch (e: any) {
        setSimulation(prev => ({ ...prev, finalVerdict: { ...prev.finalVerdict, status: 'error', errorMessage: '投决会辩论中断' } }));
    }
  };

  const setGodMode = () => setModelSettings(prev => ({ ...prev, modelName: 'gemini-3-pro-preview', thinkingBudget: 32768 }));
  const setEcoMode = () => setModelSettings(prev => ({ ...prev, modelName: 'gemini-3-flash-preview', thinkingBudget: 2048 }));

  return (
    <div className="min-h-screen pb-20 text-slate-200">
      <Header canDownload={simulation.phase === 'complete'} onDownload={handleDownload} />
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {simulation.phase === 'input' && (
           <div className="max-w-6xl mx-auto mt-6 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="text-center space-y-4">
                  <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-500 font-sci tracking-tight uppercase">
                    NEXUS <span className="text-cyan-500">CORE</span>
                  </h1>
                  <p className="text-slate-500 font-mono text-sm tracking-[0.3em] uppercase">Autonomous Financial Swarm Intelligence</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-6">
                      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden shadow-2xl border-white/10">
                          <div className="flex items-center justify-between mb-4">
                              <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                <Terminal className="w-4 h-4" /> Strategy Protocol
                              </label>
                              <button onClick={() => setShowHowItWorks(!showHowItWorks)} className="text-[10px] font-bold text-slate-500 hover:text-cyan-400 flex items-center gap-1">
                                <Info className="w-3 h-3" /> {showHowItWorks ? 'HIDE ARCHITECTURE' : 'HOW IT WORKS'}
                              </button>
                          </div>
                          <textarea
                            value={simulation.investmentCriteria}
                            onChange={(e) => setSimulation(prev => ({ ...prev, investmentCriteria: e.target.value }))}
                            className="w-full h-44 bg-slate-950/50 border border-slate-700/30 rounded-2xl p-6 text-xl text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 transition-all font-light"
                            placeholder="Define your investment thesis or core strategy..."
                          />
                      </div>

                      {showHowItWorks && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in zoom-in-95 duration-300">
                           <div className="glass-panel p-4 rounded-2xl border-cyan-500/20">
                              <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2 mb-2"><Database className="w-4 h-4 text-cyan-400" /> Extraction</h4>
                              <p className="text-[10px] text-slate-400 leading-relaxed">System identifies high-alpha targets in A-share market based on your criteria.</p>
                           </div>
                           <div className="glass-panel p-4 rounded-2xl border-indigo-500/20">
                              <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2 mb-2"><Network className="w-4 h-4 text-indigo-400" /> Swarm Analysis</h4>
                              <p className="text-[10px] text-slate-400 leading-relaxed">6 sub-agents analyze each target, followed by a Sector Manager report.</p>
                           </div>
                           <div className="glass-panel p-4 rounded-2xl border-yellow-500/20">
                              <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2 mb-2"><Gavel className="w-4 h-4 text-yellow-400" /> Verdict</h4>
                              <p className="text-[10px] text-slate-400 leading-relaxed">7 expert IC board members debate results to produce final resolution.</p>
                           </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center gap-4 px-2">
                            <div className="h-px bg-slate-800 flex-1"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol Library (35 Presets)</span>
                            <div className="h-px bg-slate-800 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {STARTER_PROMPTS.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSimulation(prev => ({ ...prev, investmentCriteria: p.text }))}
                                    className="px-3 py-2 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-white transition-all text-center truncate"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                      </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                      <div className="glass-panel rounded-3xl p-6 space-y-6 border-white/5 shadow-xl">
                          <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scope</label>
                              <span className="text-xl font-black font-sci text-cyan-400">{targetCompanyCount} Targets</span>
                          </div>
                          <input type="range" min="1" max="25" value={targetCompanyCount} onChange={e => setTargetCompanyCount(parseInt(e.target.value))} className="w-full accent-cyan-500" />
                          
                          <div className="space-y-4 pt-4 border-t border-white/5">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Mesh Config</label>
                              <div className="grid grid-cols-2 gap-2">
                                  <button onClick={setEcoMode} className={`py-3 rounded-xl border text-[10px] font-bold ${modelSettings.modelName.includes('flash') ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>ECO FLASH</button>
                                  <button onClick={setGodMode} className={`py-3 rounded-xl border text-[10px] font-bold ${modelSettings.modelName.includes('pro') ? 'bg-purple-500/10 border-purple-500/40 text-purple-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>GOD PRO</button>
                              </div>
                              <div className="pt-2">
                                  <div className="flex items-center justify-between mb-2">
                                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><Brain className="w-3 h-3" /> Global Neural Budget</label>
                                      <span className="text-xs font-mono font-bold text-white">{modelSettings.thinkingBudget}t</span>
                                  </div>
                                  <input type="range" min="0" max="32768" step="1024" value={modelSettings.thinkingBudget} onChange={e => setModelSettings(prev => ({ ...prev, thinkingBudget: parseInt(e.target.value) }))} className="w-full accent-indigo-500" />
                              </div>
                          </div>

                          <button onClick={() => setShowAgentConfig(true)} className="w-full py-3 rounded-xl bg-slate-900/50 border border-indigo-500/30 text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/10 flex items-center justify-center gap-2">
                              <Settings2 className="w-3 h-3" /> CONFIGURE NEURAL WEIGHTS
                          </button>

                          <button onClick={handleStartSimulation} className="w-full py-6 rounded-2xl font-bold text-lg font-sci tracking-widest bg-cyan-600 hover:bg-cyan-500 text-white shadow-2xl transition-all active:scale-95">
                            RUN SIMULATION
                          </button>
                      </div>
                  </div>
              </div>
           </div>
        )}

        {simulation.phase !== 'input' && (
          <div className="grid grid-cols-12 gap-6 animate-in fade-in duration-700">
            <div className="col-span-12 lg:col-span-3">
              <div className="glass-panel rounded-2xl p-4 sticky top-24 space-y-4 h-[calc(100vh-140px)] flex flex-col">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                   <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">LIVE MESH STATUS</h3>
                   {comparisonSelection.length > 0 ? (
                       <span className="text-[9px] font-bold text-orange-400 bg-orange-950/30 px-1.5 py-0.5 rounded border border-orange-500/20">{comparisonSelection.length}/3 Selected</span>
                   ) : (
                       <span className="text-[9px] text-slate-600 font-mono">SELECT TO COMPARE</span>
                   )}
                </div>
                
                {processingStatus && <div className="p-3 bg-indigo-500/10 rounded-lg text-[10px] text-indigo-300 font-mono flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> {processingStatus}</div>}
                
                <div className="space-y-1.5 overflow-y-auto flex-1 custom-scrollbar">
                  {simulation.stocks.map(s => {
                    const isCompleted = simulation.companyAnalyses[s.code]?.status === 'complete';
                    const isSelectedForComparison = comparisonSelection.includes(s.code);
                    
                    return (
                        <div key={s.code} className={`group relative p-3 rounded-xl border transition-all ${selectedStockCode === s.code ? 'bg-cyan-900/30 border-cyan-500/50 shadow-lg' : 'bg-slate-900/40 border-white/5 hover:bg-white/5'}`}>
                            {/* Comparison Checkbox (Overlay) */}
                            {isCompleted && (
                                <div className="absolute top-3 right-3 z-10">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleToggleComparison(s.code); }}
                                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelectedForComparison ? 'bg-orange-500 border-orange-500 text-black' : 'border-slate-600 bg-slate-900/80 hover:border-orange-400'}`}
                                    >
                                        {isSelectedForComparison && <CheckSquare className="w-3 h-3" />}
                                    </button>
                                </div>
                            )}
                            
                            <div onClick={() => setSelectedStockCode(s.code)} className="cursor-pointer pr-6">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-white truncate">{s.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                     {isCompleted ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Loader2 className="w-3 h-3 text-slate-600 animate-spin" />}
                                     <span className="text-[9px] text-slate-500 font-mono">{s.code}</span>
                                </div>
                            </div>
                        </div>
                    );
                  })}
                </div>

                {/* Battle Royale Trigger */}
                {comparisonSelection.length >= 2 && (
                    <button 
                        onClick={handleRunComparison}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-bottom-2 hover:shadow-orange-500/25 transition-all active:scale-95"
                    >
                        <Swords className="w-4 h-4 animate-pulse" /> Run Battle ({comparisonSelection.length})
                    </button>
                )}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-9 space-y-8">
               {showReviewBoard && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4">
                     <div className="flex items-center gap-3">
                        <Crown className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-xl font-bold font-sci tracking-widest text-white uppercase">IC Committee Debate (Tier-3)</h2>
                     </div>
                     <FinalVerdictCard result={simulation.finalVerdict} globalSettings={modelSettings} isGodMode={godModeVerdict} />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reviewAgents.map(agent => {
                           const key = REVIEW_BOARD_KEY_MAP[agent.id];
                           const settingsForBoard = godModeReview ? { ...modelSettings, modelName: 'gemini-3-pro-preview', thinkingBudget: 32768 } : modelSettings;
                           return <AgentOutputCard key={agent.id} agent={agent} result={simulation.reviewBoard[key]} globalSettings={settingsForBoard} />;
                        })}
                     </div>
                  </div>
               )}

               {activeStock && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-6 h-6 text-cyan-500" />
                        <h2 className="text-xl font-bold font-sci tracking-widest text-white uppercase">Sector Synthesis: {activeStock.stock.name}</h2>
                    </div>
                    <SummaryCard result={activeStock.summary} globalSettings={modelSettings} />
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                       {[
                         { k: 'optimist', a: analysisAgents[0] },
                         { k: 'skeptic', a: analysisAgents[1] },
                         { k: 'historian', a: analysisAgents[2] },
                         { k: 'strategist', a: analysisAgents[3] },
                         { k: 'technician', a: analysisAgents[4] },
                         { k: 'scout', a: analysisAgents[5] }
                       ].map(item => (
                         // @ts-ignore
                         <AgentOutputCard key={item.k} agent={item.a} result={activeStock[item.k]} globalSettings={modelSettings} />
                       ))}
                    </div>
                 </div>
               )}
            </div>
          </div>
        )}
      </main>

      {/* Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/80">
          <div className="relative w-full max-w-6xl max-h-[90vh] glass-panel rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-orange-500/20">
            <div className="flex items-center justify-between p-6 border-b border-orange-500/20 bg-orange-950/20">
               <div className="flex items-center space-x-3 text-orange-400">
                 <Swords className="w-6 h-6" />
                 <h2 className="text-xl font-bold font-sci tracking-wider uppercase">High-Stakes Battle Royale</h2>
              </div>
              <div className="flex items-center gap-2">
                {simulation.comparison.status === 'success' && (
                     <button 
                        onClick={() => setShowComparisonPrompt(!showComparisonPrompt)}
                        className={`p-2 rounded-lg transition-all duration-200 border ${showComparisonPrompt ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-800 hover:text-slate-300'}`}
                        title={showComparisonPrompt ? "Show Report" : "Show Prompt"}
                     >
                         <Terminal className="w-5 h-5" />
                     </button>
                )}
                <button onClick={() => setShowComparisonModal(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all"><X className="w-6 h-6" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-950/60 relative">
               {simulation.comparison.status === 'loading' && (
                   <div className="flex flex-col items-center justify-center h-64 space-y-4">
                       <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                       <span className="text-orange-200 font-mono animate-pulse">Simulating Investment War Games...</span>
                   </div>
               )}
               
               {simulation.comparison.status === 'success' && (
                   <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                       {showComparisonPrompt ? (
                           <div className="bg-slate-950 rounded-xl border border-orange-500/30 overflow-hidden animate-in fade-in duration-300">
                             <div className="flex items-center px-4 py-2 border-b border-orange-500/20 bg-orange-950/20">
                                 <Terminal className="w-4 h-4 text-orange-400 mr-2" />
                                 <span className="text-xs font-mono text-orange-300 uppercase">Battle Instruction Source</span>
                             </div>
                             <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed custom-scrollbar max-h-[600px]">
                                 {simulation.comparison.prompt}
                             </pre>
                           </div>
                       ) : (
                           <>
                               <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    table: ({node, ...props}: any) => (
                                        <div className="overflow-x-auto my-5 rounded-lg border border-orange-500/20 bg-slate-900/50 shadow-sm">
                                            <table className="w-full text-sm text-left text-slate-300" {...props} />
                                        </div>
                                    ),
                                    thead: ({node, ...props}: any) => <thead className="text-xs uppercase bg-orange-500/10 text-orange-300 font-bold tracking-wider" {...props} />,
                                    th: ({node, ...props}: any) => <th className="px-4 py-3 border-b border-orange-500/20 whitespace-nowrap" {...props} />,
                                    td: ({node, ...props}: any) => <td className="px-4 py-3 whitespace-pre-wrap leading-relaxed min-w-[140px]" {...props} />,
                                    strong: ({node, ...props}: any) => <strong className="font-bold text-orange-200" {...props} />,
                                    h1: ({node, ...props}: any) => <h1 className="text-2xl font-bold text-orange-400 mt-6 mb-4 border-b border-orange-500/20 pb-2" {...props} />,
                                    a: ({node, ...props}: any) => <a className="text-orange-400 hover:text-orange-300 underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />,
                                }}
                               >
                                   {simulation.comparison.output || ''}
                               </ReactMarkdown>
                               
                               {/* Sources */}
                               {simulation.comparison.sources && simulation.comparison.sources.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-white/5">
                                        <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-1">
                                        <ExternalLink className="w-3 h-3" />
                                        Battle References
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {simulation.comparison.sources.map((source, idx) => (
                                            <a 
                                            key={idx}
                                            href={source.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="flex items-center space-x-2 text-xs text-slate-400 hover:text-orange-400 transition-colors p-2 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 group"
                                            >
                                            <span className="text-slate-600 font-mono group-hover:text-orange-500/70">[{idx + 1}]</span>
                                            <span className="truncate">{source.title || source.uri}</span>
                                            </a>
                                        ))}
                                        </div>
                                    </div>
                               )}
                           </>
                       )}
                   </div>
               )}

               {simulation.comparison.status === 'error' && (
                   <div className="text-rose-400 flex items-center justify-center h-64">
                       <span className="text-lg">Comparison Failed: {simulation.comparison.errorMessage}</span>
                   </div>
               )}
            </div>
          </div>
        </div>
      )}

      {showAgentConfig && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/80">
          <div className="relative w-full max-w-5xl max-h-[90vh] glass-panel rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/90">
               <div className="flex items-center space-x-3 text-indigo-400">
                 <Settings2 className="w-6 h-6" />
                 <h2 className="text-xl font-bold font-sci tracking-wider uppercase">SWARM NEURAL WEIGHTS</h2>
              </div>
              <button onClick={() => setShowAgentConfig(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-12 bg-slate-950/40">
                <section>
                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-6 pb-2 border-b border-cyan-500/20">Sector Swarm (Tier 2)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysisAgents.map(agent => <AgentConfigCard key={agent.id} agent={agent} onChange={handleUpdateAgent} />)}
                    </div>
                </section>
                <section>
                    <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-6 pb-2 border-b border-yellow-500/20">IC Committee (Tier 3)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {reviewAgents.map(agent => <AgentConfigCard key={agent.id} agent={agent} onChange={handleUpdateAgent} />)}
                    </div>
                </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
