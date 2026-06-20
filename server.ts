import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Ensure data directory exists for persistent local storage
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const SOULS_FILE = path.join(DATA_DIR, "souls.json");

// Helper to read and write soul data
interface Soul {
  pass: string;
  plans: any[];
  routine: string;
  memos: string;
  weekdayH: number;
  weekendH: number;
  weekends: number[];
  activeIndex: number;
  lang?: string;
  createdAt?: string;
}

interface IpSouls {
  [ip: string]: {
    [username: string]: Soul;
  };
}

function loadSouls(): IpSouls {
  try {
    if (fs.existsSync(SOULS_FILE)) {
      const content = fs.readFileSync(SOULS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading souls file:", error);
  }
  return {};
}

function saveSouls(data: IpSouls) {
  try {
    fs.writeFileSync(SOULS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing souls file:", error);
  }
}

// Extract clean client IP (accounting for proxies/Cloud Run headers)
function getClientIp(req: express.Request): string {
  const xForwardedFor = req.headers["x-forwarded-for"];
  let ip = "";
  if (typeof xForwardedFor === "string") {
    ip = xForwardedFor.split(",")[0].trim();
  } else if (Array.isArray(xForwardedFor)) {
    ip = xForwardedFor[0].trim();
  } else {
    ip = req.socket.remoteAddress || "127.0.0.1";
  }

  // Normalize local loops
  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    return "127.0.0.1";
  }
  return ip;
}

// Lazy Gemini client helper
let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured yet. Configure it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Standard middlewares
  app.use(express.json());

  // API - Get current IP and all "souls" registered on this IP
  app.get("/api/souls", (req, res) => {
    const ip = getClientIp(req);
    const database = loadSouls();
    const soulsOnIp = database[ip] || {};
    
    // Return names and metadata of souls registered on this IP (omit passwords for list security)
    const list = Object.keys(soulsOnIp).map((name) => ({
      username: name,
      createdAt: soulsOnIp[name].createdAt || new Date().toISOString(),
      numRituals: soulsOnIp[name].plans?.length || 0,
    }));

    res.json({ ip, souls: list });
  });

  // API - Authenticate or register a new soul on this IP
  app.post("/api/souls/auth", (req, res) => {
    const ip = getClientIp(req);
    const { username, pass, action } = req.body;

    if (!username || !pass) {
      return res.status(400).json({ error: "Username and passkey are required." });
    }

    const trimmedName = username.trim().toLowerCase();
    const database = loadSouls();

    if (!database[ip]) {
      database[ip] = {};
    }

    const soulsOnIp = database[ip];

    if (action === "signup") {
      if (soulsOnIp[trimmedName]) {
        return res.status(400).json({ error: "That soul already exists on this IP address." });
      }
      
      const newSoul: Soul = {
        pass,
        plans: [],
        routine: "",
        memos: "",
        weekdayH: 4,
        weekendH: 8,
        weekends: [0, 6],
        activeIndex: 0,
        lang: "en",
        createdAt: new Date().toISOString(),
      };

      soulsOnIp[trimmedName] = newSoul;
      saveSouls(database);
      return res.json({ success: true, username: trimmedName, message: "New soul awakened!" });
    } else {
      // Login
      const existing = soulsOnIp[trimmedName];
      if (!existing || existing.pass !== pass) {
        return res.status(401).json({ error: "Unknown soul passcode or identity on this IP." });
      }
      return res.json({ success: true, username: trimmedName, soul: existing });
    }
  });

  // API - Sync soul data (plans/routine/memos etc) under current IP
  app.post("/api/souls/sync", (req, res) => {
    const ip = getClientIp(req);
    const { username, pass, state } = req.body;

    if (!username || !pass || !state) {
      return res.status(400).json({ error: "Incomplete sync parameters." });
    }

    const trimmedName = username.trim().toLowerCase();
    const database = loadSouls();
    const soulObj = database[ip]?.[trimmedName];

    if (!soulObj || soulObj.pass !== pass) {
      return res.status(401).json({ error: "Unauthorized soul sync." });
    }

    // Update fields
    soulObj.plans = state.plans ?? soulObj.plans;
    soulObj.routine = state.routine ?? soulObj.routine;
    soulObj.memos = state.memos ?? soulObj.memos;
    soulObj.weekdayH = state.weekdayH ?? soulObj.weekdayH;
    soulObj.weekendH = state.weekendH ?? soulObj.weekendH;
    soulObj.weekends = state.weekends ?? soulObj.weekends;
    soulObj.activeIndex = state.activeIndex ?? soulObj.activeIndex;
    soulObj.lang = state.lang ?? soulObj.lang;

    saveSouls(database);
    res.json({ success: true, soul: soulObj });
  });

  // API - Festival Check
  app.get("/api/festivals", async (req, res) => {
    const country = req.query.country || "IN";
    const year = new Date().getFullYear();
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`;

    // Static fallback list of major Indian/Global festivals in case of public API failures
    const fallbackFestivals = [
      { date: `${year}-10-24`, localName: "Diwali", name: "Deepavali" },
      { date: `${year}-03-14`, localName: "Holi", name: "Festival of Colors" },
      { date: `${year}-08-15`, localName: "Independence Day", name: "Independence Day" },
      { date: `${year}-01-26`, localName: "Republic Day", name: "Republic Day" },
      { date: `${year}-12-25`, localName: "Christmas Day", name: "Christmas" },
      { date: `${year}-05-01`, localName: "May Day", name: "Labour Day" },
      { date: `${year}-10-02`, localName: "Gandhi Jayanti", name: "Gandhi Jayanti" },
      { date: `${year}-09-05`, localName: "Ganesh Chaturthi", name: "Ganesha festival" },
    ];

    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return res.json({ source: "api", holidays: data });
      }
    } catch (e) {
      console.warn("External public holidays API failed, utilizing fallback planetary cache.", e);
    }

    // Default to Indian/Global local date matches
    return res.json({ source: "fallback", holidays: fallbackFestivals });
  });

  // API - Focused AI Alchemist Agent Chat
  app.post("/api/alchemist-bot", async (req, res) => {
    const { messages, userProfile } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Chat messages list is required." });
    }

    try {
      const ai = getGeminiClient();
      
      const langNames: Record<string, string> = {
        en: "English (Celestial Language)",
        hi: "Hindi (हिन्दी)",
        es: "Spanish (Español)",
        fr: "French (Français)",
        de: "German (Deutsch)",
        zh: "Chinese (中文)",
        ja: "Japanese (日本語)",
        ru: "Russian (Русский)",
        ar: "Arabic (العربية)"
      };
      const preferredLangName = langNames[userProfile?.lang] || "English";

      // We will model the system instruction to act as a strict medieval focus master alchemist
      const sysInstruction = `You are the Grand Archmage Alchemist of Strode - The Edupath Alchemy study platform. Your role is to guide the student of username "${userProfile?.username || "Acolyte"}" representing their soul.
You are a highly focused mentor. The student is supposed to be studying. 
If they ask questions off-topic, talk about gaming, pop culture, non-academic distractions, or irrelevant gossip, you must firmly and cleverly bring them back to their study plans (Grimoires), ritual timers, and topics!
Reference their active study goal or subject if provided (e.g. they can set up study plans for Olympiad or school).
Maintain an ancient, mystical, medieval tutor persona but keep it encouraging, sharp, and concise.
Limit responses to a maximum of 3 sentences to keep them focused on their study task. Avoid lengthy conversations. Do not output markdown code blocks unless requested.

CRITICAL: You MUST respond and speak strictly in the active preferred language: ${preferredLangName}. Even if the user texts you in another language, you must respond in ${preferredLangName}!`;

      // Use the clean chats API or generateContent
      // Let's format the chat messages correctly for gemini-3.5-flash
      const formattedContents = messages.map((m: any) => {
        return {
          role: m.role === "assistant" ? "model" as const : "user" as const,
          parts: [{ text: m.content }]
        };
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: sysInstruction,
          temperature: 0.8,
        },
      });

      res.json({ response: response.text });
    } catch (error: any) {
      console.error("Gemini AI error:", error);
      res.status(500).json({ error: error.message || "The Archmage's link to the ether was cut off." });
    }
  });

  // Serve static assets and Vite middleware in development
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
    console.log(`[Strode Backend] Awakening complete. Server running on port ${PORT}`);
  });
}

startServer();
