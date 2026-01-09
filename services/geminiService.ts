
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AgentConfig, Stock, ModelSettings } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- 🕒 TEMPORAL ANCHORING & GROUNDING UTILITY ---
const getRealTimeContext = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  
  return `
=== 🕒 REAL-TIME TEMPORAL ANCHOR & GROUNDING PROTOCOL ===
CURRENT DATE: ${dateStr} (${timeStr})
CRITICAL INSTRUCTION: You are operating in REAL-TIME.

**IN-TEXT CITATION ENFORCEMENT:**
1. **MANDATORY**: You MUST embed [Source Name](URL) links directly inside your paragraphs, immediately following the claim or data point. 
2. **FORMAT**: "该公司2024年Q3营收增长了15% [上海证券交易所官网](https://...)，股价目前处于三年来低位 [东方财富实时数据](https://...)"
3. **HIERARCHY**: 
   - Tier 1: SSE/SZSE Official Announcements, CNINFO filings.
   - Tier 2: 21jingji, Caixin, Wall Street CN, Reuters, Bloomberg.
   - Tier 3: Industry-specific forums or expert analysis news.
4. **FRESHNESS**: Prioritize news from the LAST 30 DAYS. If you cite older data, prefix it with "(HISTORICAL)".
5. **FAIL-SAFE**: Every agent report MUST contain at least 3-5 distinct clickable Markdown URL citations within the body text.
`;
};

/**
 * Wrapper to handle Rate Limits (429), Empty/Error Responses, and Timeouts with exponential backoff
 */
async function generateContentWithRetry(params: any, retries = 5, initialDelay = 5000): Promise<GenerateContentResponse> {
  let currentDelay = initialDelay;
  let lastError;
  const TIMEOUT_MS = 180000; // Increased to 180 Seconds for large contexts

  for (let i = 0; i <= retries; i++) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error("REQUEST_TIMEOUT"));
        }, TIMEOUT_MS);
      });

      // Race the API call against the timeout
      // @ts-ignore
      const result = await Promise.race([
        ai.models.generateContent(params),
        timeoutPromise
      ]) as GenerateContentResponse;
      
      const text = result.text || "";
      
      // Critical Validation: Check for empty response
      const isInvalidResponse = 
        !text || 
        text.trim().length === 0 || 
        text.includes("unexpected error") || 
        text.includes("No response");

      if (isInvalidResponse) {
        throw new Error(`Invalid response content: "${text.substring(0, 50)}..."`);
      }

      return result;
    } catch (error: any) {
      lastError = error;
      
      const isTimeout = error.message === "REQUEST_TIMEOUT";
      const isRateLimit = error.code === 429 || (error.message && error.message.includes('Too many requests')) || (error.status === 'RESOURCE_EXHAUSTED');
      const isInvalidContent = error.message && error.message.includes("Invalid response content");
      const isOverloaded = error.status === 503 || error.code === 503;

      // Retry conditions
      if ((isTimeout || isRateLimit || isInvalidContent || isOverloaded) && i < retries) {
        console.warn(`[Gemini] Attempt ${i + 1} failed (${error.message}). Retrying in ${currentDelay}ms...`);
        await delay(currentDelay);
        currentDelay *= 2; // Exponential backoff (5s -> 10s -> 20s -> 40s -> 80s)
        continue;
      }
      
      if (i === retries) throw error;
    }
  }
  throw lastError;
}

/**
 * Helper to extract grounding sources from response
 */
const extractSources = (response: any) => {
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return groundingChunks
    .map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
    .filter((s: any) => s !== null) as { title: string; uri: string }[];
};

/**
 * 1. Generate Stocks based on user criteria and count
 */
export const generateStockList = async (criteria: string, count: number, settings: ModelSettings): Promise<Stock[]> => {
  try {
    const timeContext = getRealTimeContext();
    const prompt = `
      ${timeContext}
      作为一名专业的A股投资顾问，请根据用户的投资需求推荐 **${count}家** A股上市公司。
      用户需求: "${criteria}"
      
      请提供JSON格式的输出，包含公司名称(name)、股票代码(code)和推荐理由(reason)。
      必须严格返回${count}个对象。
    `;

    const response = await generateContentWithRetry({
      model: settings.modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              code: { type: Type.STRING },
              reason: { type: Type.STRING }
            }
          }
        },
        tools: [{ googleSearch: {} }],
      }
    }, 3, 3000);

    if (response && response.text) {
      return JSON.parse(response.text) as Stock[];
    }
    throw new Error("Empty response for stock list");
  } catch (error: any) {
    console.error("Error generating stock list:", error);
    throw new Error("Failed to generate stock list.");
  }
};

/**
 * 2. General Agent Response (For the 6 Analysis Agents)
 */
export const generateAgentResponse = async (
  agent: AgentConfig,
  context: string,
  settings: ModelSettings
): Promise<{ output: string; sources: { title: string; uri: string }[]; prompt: string }> => {
  const timeContext = getRealTimeContext();
  const effectiveModel = agent.modelName || settings.modelName;
  const effectiveBudget = (agent.thinkingBudget || settings.thinkingBudget);

  const systemInstruction = `${agent.systemInstruction}\n\n${timeContext}\nOutput in Chinese. You MUST use 'googleSearch' to find URLs and embed them directly into your report as [Source](URL). NO REPORT WITHOUT IN-TEXT CITATIONS.`;
    
  const response = await generateContentWithRetry({
    model: effectiveModel,
    contents: context,
    config: {
      systemInstruction,
      temperature: 0.2, 
      thinkingConfig: { thinkingBudget: effectiveBudget }, 
      tools: [{ googleSearch: {} }],
    },
  });

  return { output: response.text || "", sources: extractSources(response), prompt: systemInstruction + "\n\n" + context };
};

/**
 * 3. Sector Manager synthesis
 */
export const generateCompanyGroupSummary = async (
  stock: Stock,
  outputs: any,
  agents: AgentConfig[], 
  settings: ModelSettings
): Promise<{ output: string; sources: { title: string; uri: string }[]; prompt: string }> => {
  const timeContext = getRealTimeContext();
  const prompt = `
    ${timeContext}
    作为首席投资官，请综合以下6位专家的分析报告，为【${stock.name} (${stock.code})】撰写一份深度综述：
    1. 阿尔法猎人: ${outputs.optimist}
    2. 法务风控官: ${outputs.skeptic}
    3. 周期量化专家: ${outputs.historian}
    4. 战略护城河顾问: ${outputs.strategist}
    5. 筹码结构分析师: ${outputs.technician}
    6. 情报调查员: ${outputs.scout}
    
    字数要求：5000字以上 (MANDATORY 5000+ WORDS)。
    必须在综述正文的每一个关键论点后，通过 [Source Title](URL) 格式保留并加强专家的信源引用。禁止删除专家原本提供的引用链接。
  `;

  // Increased multiplier to 5x as requested
  const summaryBudget = Math.min(settings.thinkingBudget * 5, 32768);

  const response = await generateContentWithRetry({
    model: settings.modelName,
    contents: prompt,
    config: {
      temperature: 0.2,
      thinkingConfig: { thinkingBudget: summaryBudget },
      tools: [{ googleSearch: {} }],
    }
  });

  return { output: response.text || "", sources: extractSources(response), prompt };
};

/**
 * 4a. Review Board Member Analysis
 */
export const generateReviewBoardAnalysis = async (
  agent: AgentConfig,
  allDossiers: string,
  settings: ModelSettings
): Promise<{ output: string; sources: { title: string; uri: string }[]; prompt: string }> => {
  const timeContext = getRealTimeContext();
  const effectiveModel = agent.modelName || settings.modelName;
  const effectiveBudget = (agent.thinkingBudget || settings.thinkingBudget * 2);

  const prompt = `
    ${timeContext}
    你是【${agent.name}】（${agent.role}）。
    
    以下是本次模拟中所有候选公司的“深度调研全案”：
    ${allDossiers}
    
    请仔细阅读所有公司的专家分析，从你的专业视角出发，对这几家公司进行横向对比分析，并给出你的专家意见和排名。
    字数要求：5000字以上。你必须在自己的对比结论中，明确引用专家全案中提供的 [Source Title](URL) 链接来证明你的判定。
  `;

  const response = await generateContentWithRetry({
    model: effectiveModel,
    contents: prompt,
    config: {
      systemInstruction: agent.systemInstruction,
      temperature: 0.3,
      thinkingConfig: { thinkingBudget: effectiveBudget }, 
      tools: [{ googleSearch: {} }],
    },
  });

  return { output: response.text || "", sources: extractSources(response), prompt };
};

/**
 * 4b. Investment Committee Final Debate (Board Consensus)
 */
export const generateFinalVerdict = async (
  reviews: { 
    fundamental: string; 
    sentiment: string; 
    risk: string; 
    macro: string; 
    portfolio: string; 
    rogers: string;
    intelligence: string;
  },
  allDossiers: string,
  settings: ModelSettings
): Promise<{ output: string; sources: { title: string; uri: string }[]; prompt: string }> => {
  
  const timeContext = getRealTimeContext();
  
  const prompt = `
    ${timeContext}
    
    **【投决会主席令】**
    
    各位董事，我们已经完成了对所有候选公司的深度调研。现在进入最终的“投决会闭门辩论”环节。
    
    **第一部分：候选公司原始调研全案**
    ${allDossiers}
    
    **第二部分：各董事专家评议报告**
    - 基本面董事意见：${reviews.fundamental}
    - 市场总监意见：${reviews.sentiment}
    - 首席风控官意见：${reviews.risk}
    - 宏观策略师意见：${reviews.macro}
    - 组合经理意见：${reviews.portfolio}
    - 危机猎手罗杰斯意见：${reviews.rogers}
    - 首席情报官简报：${reviews.intelligence}
    
    **辩论任务：**
    1. **冲突点辩论**：针对各董事意见中的分歧点，进行模拟辩论。
    2. **优中选优**：综合宏观、风险、情绪、基本面、筹码和情报。
    3. **最终决议**：给出明确的投资组合建议。
    
    字数要求：10000字以上 (MANDATORY 10000+ WORDS)。
    必须在【决议书】的正文里，通过 [Source Title](URL) 格式保留关键证据的信源。如果缺少引用，该决议无效。
    
    请输出一份正式的【投资决策决议书】，极度专业。
  `;

  // Enforced 5x multiplier
  const verdictBudget = Math.min(settings.thinkingBudget * 5, 32768);

  const response = await generateContentWithRetry({
    model: settings.modelName,
    contents: prompt,
    config: {
      temperature: 0.3,
      thinkingConfig: { thinkingBudget: verdictBudget },
      tools: [{ googleSearch: {} }],
    }
  });

  return { output: response.text || "", sources: extractSources(response), prompt };
};

/**
 * 5. Comparison Tool
 */
export const generateComparisonAnalysis = async (companies: any[], settings: ModelSettings) => {
   const timeContext = getRealTimeContext();
   
   // ENHANCED PROMPT: Explicitly instructs the model to digest sub-agent reports for each candidate
   const dossiersForComparison = companies.map((c, i) => `
### [${i+1}] 候选公司: ${c.name} (${c.code})
**Sector Manager 总结:** ${c.summary}

**各专业小组原始报告:**
- 阿尔法猎人 (Growth): ${c.reports.optimist}
- 法务风控官 (Risk): ${c.reports.skeptic}
- 周期量化专家 (Cycle): ${c.reports.historian}
- 战略护城河顾问 (Strategy): ${c.reports.strategist}
- 筹码结构分析师 (Market): ${c.reports.technician}
- 情报调查员 (Scout): ${c.reports.scout}
--------------------------------------------------
   `).join('\n');

   const prompt = `
    ${timeContext}
    
    **任务：高阶投资对比战 (Investment Battle Royale)**
    
    你现在需要对以下 ${companies.length} 家候选公司进行深度横向对比。
    你拥有每家公司的 Sector Manager 总结以及 6 个专业子小组的原始分析报告。
    
    **对比候选名单:**
    ${dossiersForComparison}
    
    **核心指令：**
    1. **必须输出一张详细的对比表格 (Markdown Table)**，包含以下列：
       - 维度 (Dimension)
       - ${companies.map(c => c.name).join(' | ')}
       - 胜出者 (Winner)
       - 简评 (Comment)
       
       **必填行 (Rows):**
       - 🟢 实时股价 (Latest Price) - **必须使用 Google Search 获取最新数据**
       - 📊 动态估值 (PE/PEG)
       - 🚀 增长潜力 (Growth Upside)
       - 🛡️ 护城河强度 (Moat)
       - ⚠️ 风险系数 (Risk Level)
       - 💰 筹码结构 (Chip Structure)
       - 🏆 综合评分 (Score 0-10)

    2. **深度文字解析**：在表格下方，对“为何胜出者是它”进行不少于 500 字的深度逻辑推演。
    
    3. **引用执法**：表格中的数据点和文字解析中的论据，必须包含嵌入式链接 [Title](URL)。
    
    字数要求：2000字以上。
   `;
   
   // Increase budget for comparison as it deals with multiple contexts
   const comparisonBudget = Math.min(settings.thinkingBudget * 3, 32768);
   
  const response = await generateContentWithRetry({
    model: settings.modelName,
    contents: prompt,
    config: {
      temperature: 0.2, 
      thinkingConfig: { thinkingBudget: comparisonBudget },
      tools: [{ googleSearch: {} }],
    }
  });

  return { output: response.text || "", sources: extractSources(response), prompt };
}
