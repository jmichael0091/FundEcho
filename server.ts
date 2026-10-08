import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { evaluateApplicationsForReminders, calculateDaysRemaining } from "./server/deadlineReminderProcessor";
import { runDiscoveryEngine, classifyOpportunityLink, normalizeOpportunityUrl } from "./server/discoveryEngine";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // API Routes
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ 
      status: "ok", 
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString() 
    });
  });

  // AI Application & Proposal Assistance Endpoint
  app.post("/api/ai/application-assist", async (req: Request, res: Response) => {
    try {
      const {
        action,
        fieldKey,
        fieldLabel,
        currentText,
        userPrompt,
        opportunityContext,
        applicantContext,
        organizationContext,
      } = req.body;

      if (!action) {
        return res.status(400).json({ error: "Missing required 'action' parameter." });
      }

      const genAI = getGenAI();
      if (!genAI) {
        return res.status(503).json({
          error: "AI service is currently not configured with an API key. Please configure GEMINI_API_KEY in the Secrets panel.",
          fallbackAvailable: true,
        });
      }

      const systemInstruction = `You are FundEcho's grant proposal & funding application co-pilot.
Your mission is to help applicants craft compelling, rigorous, and authentic funding proposals for verified grants, fellowships, and funding opportunities.

CRITICAL ANTI-HALLUCINATION & INTEGRITY RULES:
1. NEVER invent personal achievements, awards, credentials, or degrees.
2. NEVER invent company revenue, financial statements, valuation, or balance sheet figures.
3. NEVER invent beneficiary metrics, survey statistics, or quantitative impact numbers unless explicitly provided by the user.
4. NEVER invent partner organizations, academic institutions, or endorsers.
5. NEVER invent false opportunity deadlines, eligibility requirements, or award terms.
6. If critical metrics, details, or data points are missing to make the proposal compelling, explicitly place clear bracketed placeholders (e.g. "[Insert your exact percentage increase here]" or "[Specify targeted community/city]") and advise what the user should provide.
7. Always maintain a professional, persuasive, and clear tone aligned with international grant evaluation standards.`;

      let promptInstruction = "";

      switch (action) {
        case "improve_writing":
          promptInstruction = `Please review and refine the following draft response for the field "${fieldLabel || fieldKey}".
Preserve all factual details, metrics, and user intent, but improve grammar, sentence flow, active voice, clarity, and persuasive power.
Current Text:
"""
${currentText || "(No initial text provided)"}
"""
${userPrompt ? `Additional user instructions: ${userPrompt}` : ""}`;
          break;

        case "expand":
          promptInstruction = `Please expand the following draft response for the field "${fieldLabel || fieldKey}" into a more detailed, well-structured proposal section.
Elaborate on methodologies, impact mechanisms, and execution feasibility based only on the user's notes and the opportunity context. If key information is required, use explicit bracketed prompts like [Insert details on X].
Current Text:
"""
${currentText || "(No initial text provided)"}
"""
${userPrompt ? `Additional user instructions: ${userPrompt}` : ""}`;
          break;

        case "make_professional":
          promptInstruction = `Please rewrite the following draft response for "${fieldLabel || fieldKey}" to elevate its formal grant-writing register.
Use precise institutional terminology, structured paragraphing, and crisp executive language suitable for grant review committees.
Current Text:
"""
${currentText || "(No initial text provided)"}
"""
${userPrompt ? `Additional user instructions: ${userPrompt}` : ""}`;
          break;

        case "shorten":
          promptInstruction = `Please condense and tighten the following text for "${fieldLabel || fieldKey}" to be more concise and punchy without losing essential points.
Eliminate wordiness, repetitive phrasing, and filler words.
Current Text:
"""
${currentText || "(No initial text provided)"}
"""
${userPrompt ? `Additional user instructions: ${userPrompt}` : ""}`;
          break;

        case "generate_draft":
          promptInstruction = `Generate a structured, high-quality initial draft for the field "${fieldLabel || fieldKey}".
Base your draft strictly on the provided opportunity context and user background. Where specific organization or applicant data is needed, insert clear bracketed guidance (e.g. "[Provide exact metric here]").
User Outline / Notes:
"""
${currentText || userPrompt || "Draft an initial proposal section based on the opportunity goals."}
"""`;
          break;

        case "explain_question":
          promptInstruction = `Provide clear, actionable reviewer guidance explaining what grant evaluators look for in the field "${fieldLabel || fieldKey}".
Include:
1. Core objective of this question
2. 3-4 Key elements winning proposals include
3. Common pitfalls or red flags to avoid
4. Recommended structure/outline to answer it effectively.`;
          break;

        default:
          promptInstruction = `Assist with the following field "${fieldLabel || fieldKey}":
${userPrompt || currentText || "Provide recommendations."}`;
      }

      const contextualPrompt = `
=== OPPORTUNITY CONTEXT ===
Title: ${opportunityContext?.title || "Funding Opportunity"}
Organization: ${opportunityContext?.organization || "Grant Provider"}
Category: ${opportunityContext?.category || "General"}
Target Audience: ${opportunityContext?.targetAudience || "Eligible Applicants"}
Key Requirements: ${(opportunityContext?.requirements || []).join("; ")}
Eligibility Summary: ${(opportunityContext?.eligibility || []).join("; ")}

=== APPLICANT & ORGANIZATION CONTEXT ===
Applicant Name: ${applicantContext?.fullName || "Applicant"}
Country: ${applicantContext?.country || "Not specified"}
Education/Background: ${applicantContext?.highestEducation || "Not specified"}
Organization Name: ${organizationContext?.orgName || "Not specified"}
Organization Type: ${organizationContext?.orgType || "Not specified"}

=== TASK REQUEST ===
${promptInstruction}
`;

      const response = await genAI.models.generateContent({
        model: "gemini-3.7-flash",
        contents: contextualPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const outputText = response.text || "";

      return res.json({
        success: true,
        action,
        fieldKey,
        resultText: outputText,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("AI Assistance Error:", err);
      return res.status(500).json({
        error: err.message || "Failed to generate AI assistance",
        fallbackAvailable: true,
      });
    }
  });

  // Server-Side Deadline Reminder Processor Endpoint (Step 23)
  app.post("/api/notifications/process-deadlines", async (req: Request, res: Response) => {
    try {
      const { applications, existingReminderIds } = req.body;

      if (!Array.isArray(applications)) {
        return res.status(400).json({
          error: "Invalid request payload. Expected 'applications' array.",
        });
      }

      const existingKeysSet = new Set<string>(
        Array.isArray(existingReminderIds) ? existingReminderIds : []
      );

      const remindersToGenerate = evaluateApplicationsForReminders(
        applications,
        existingKeysSet
      );

      return res.json({
        success: true,
        checkedCount: applications.length,
        remindersGenerated: remindersToGenerate.length,
        reminders: remindersToGenerate,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("Deadline Reminder Processing Error:", err);
      return res.status(500).json({
        error: err.message || "Failed to process deadline reminders",
      });
    }
  });

  // ===========================================================================
  // FUNDECHO - OPPORTUNITY DISCOVERY ENGINE API (STEP 4)
  // Backend foundation that discovers potential opportunity URLs from monitored
  // sources stored in "sources", records discovered URLs in "crawlResults", avoids
  // duplicate processing, creates jobs in "crawlJobs", and respects crawling rules.
  // ===========================================================================

  app.post("/api/crawler/discover", async (req: Request, res: Response) => {
    try {
      const { sourceId, sources, existingUrls, adminUserId, maxPagesPerSource } = req.body;

      if (!sources || !Array.isArray(sources) || sources.length === 0) {
        return res.status(400).json({
          error: "Missing required 'sources' array of monitored portals to crawl.",
        });
      }

      const existingUrlsSet = new Set<string>(
        Array.isArray(existingUrls) ? existingUrls.map((u: string) => String(u).trim()) : []
      );

      console.log(`[DiscoveryEngine] Processing discovery for ${sources.length} source(s) (target: ${sourceId || 'all'})...`);

      const engineResult = await runDiscoveryEngine(sources, {
        sourceId,
        existingUrlsSet,
        adminUserId,
        maxPagesPerSource: typeof maxPagesPerSource === 'number' ? maxPagesPerSource : 5,
        triggerType: 'manual_admin',
      });

      return res.json({
        success: true,
        ...engineResult,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("[DiscoveryEngine] Execution error:", err);
      return res.status(500).json({
        error: err.message || "Failed to execute opportunity discovery engine",
      });
    }
  });

  // Dry-run link classifier tester endpoint
  app.post("/api/crawler/test-url", (req: Request, res: Response) => {
    try {
      const { url, anchorText, surroundingContext } = req.body;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "Missing required 'url' string parameter." });
      }

      const normalized = normalizeOpportunityUrl(url);
      if (!normalized) {
        return res.status(400).json({ error: "Invalid URL or static file extension." });
      }

      const classification = classifyOpportunityLink(normalized, anchorText || "", surroundingContext || "");

      return res.json({
        success: true,
        originalUrl: url,
        normalizedUrl: normalized,
        ...classification,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Classification test failed" });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
