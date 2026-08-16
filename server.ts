/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to avoid startup crashes if key is initially empty
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. API route for dynamic Tafsir
app.post("/api/gemini/tafsir", async (req, res) => {
  try {
    const { surahNumber, surahName, ayahNumber } = req.body;
    if (!surahNumber) {
      return res.status(400).json({ error: "surahNumber is required" });
    }

    const ai = getAi();
    let prompt = "";
    if (ayahNumber) {
      prompt = `أنت عالم مفسر للقرآن الكريم. يرجى تقديم تفسير ميسر ودقيق وموثوق (مستنداً إلى تفسير ابن كثير والسعدي والطبري) للآية رقم ${ayahNumber} من سورة ${surahName || surahNumber}. 
أظهر أولاً نص الآية الكريمة بخط قرآني واضح، ثم اذكر سبب النزول إن وجد، ثم التفسير المفصل، والفوائد والعبر المستخلصة من الآية. 
اكتب بلغة عربية فصيحة بليغة واستخدم تنسيق Markdown بشكل جميل ومنظم جداً مع فقرات واضحة وعناوين بارزة.`;
    } else {
      prompt = `أنت عالم مفسر للقرآن الكريم. يرجى تقديم تفسير شامل وتعريف متكامل لسورة ${surahName || surahNumber} (السورة رقم ${surahNumber}).
وضح الآتي:
1. مقاصد السورة ومواضيعها الرئيسية.
2. أسباب نزول السورة أو آيات مشهورة منها إن وجد.
3. فضل السورة الكريمة من الأحاديث الصحيحة.
4. خلاصة عامة أو تفسير إجمالي لآياتها.
اكتب بلغة عربية فصيحة بليغة واستخدم تنسيق Markdown بطريقة احترافية وجميلة ومريحة جداً للقراءة وبأسلوب منظم يسهل على المؤمن فهم كلام ربه.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Tafsir API Error:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء معالجة طلب التفسير" });
  }
});

// 2. API route for Islamic Q&A Companion (Streaming for real-time speed)
app.post("/api/gemini/qa/stream", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }

    const ai = getAi();
    
    const systemInstruction = `أنت عالم ومستشار إسلامي وقور واسمك "مستشار نور الإسلام". 
مهمتك إجابة تساؤلات المستخدمين الدينية والشرعية والفقهية والأخلاقية بوقار، أدب ومحبة.
استند بشكل أساسي ومباشر على القرآن الكريم، وصحيح البخاري، وصحيح مسلم، والسنّة النبوية المطهرة وفق منهج أهل السنّة والجماعة والوسطية والاعتدال.
تجنب الفتاوى الشاذة، واحرص دائماً على تيسير الدين وتوضيح المسائل الفقهية بأدلة واضحة وميسرة.
تأكد من:
1. بدء الإجابة بترحيب ودعاء سمح للمستفتي مثل "السلام عليكم ورحمة الله وبركاته، حيّاك الله وبارك فيك...".
2. ذكر الآيات والأحاديث الصحيحة بدقة وتنسيقها بشكل بارز بالماركداون.
3. كتابة الإجابة بتنسيق Markdown متقن ومنظم للغاية لكي تسهل قراءتها.
4. إبقاء الإجابة مختصرة وناقضة للهدف ومباشرة لسرعة القراءة.
5. إضافة نصيحة أخوية أو دعاء في نهاية الإجابة.`;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Streaming Q&A Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "حدث خطأ أثناء الاتصال بمستشار نور الإسلام" });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

// 2b. Standard fallback API route for Islamic Q&A
app.post("/api/gemini/qa", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }

    const ai = getAi();
    
    const systemInstruction = `أنت عالم ومستشار إسلامي وقور واسمك "مستشار نور الإسلام". 
مهمتك إجابة تساؤلات المستخدمين الدينية والشرعية والفقهية والأخلاقية بوقار، أدب ومحبة.
استند بشكل أساسي ومباشر على القرآن الكريم، وصحيح البخاري، وصحيح مسلم، والسنّة النبوية المطهرة.
اكتب إجابة مختصرة، دقيقة، ومستندة للقرآن والسنة بالماركداون.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.6,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Islamic Q&A API Error:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء الاتصال بمستشار نور الإسلام" });
  }
});

// 3. API route to send Email OTP
app.post("/api/send-email-otp", async (req, res) => {
  const { email, otpCode } = req.body || {};
  if (!email) {
    return res.status(400).json({ success: false, error: "البريد الإلكتروني مطلوب" });
  }

  const generatedOtp = otpCode || Math.floor(100000 + Math.random() * 900000).toString();

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"تطبيق نور الإسلام" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "رمز التفعيل الخاص بك - نور الإسلام",
        text: `مرحبًا بك في تطبيق نور الإسلام، رمز التفعيل الخاص بك هو: ${generatedOtp}`,
      });

      return res.status(200).json({
        success: true,
        message: "تم إرسال رمز التفعيل بنجاح إلى البريد الإلكتروني",
        otpCode: generatedOtp,
      });
    }

    // Fallback if email credentials not set in env
    console.log(`[Email OTP Simulation] Email: ${email}, OTP: ${generatedOtp}`);
    return res.status(200).json({
      success: true,
      simulated: true,
      message: "تم تجهيز المحاكاة وإرسال رمز التفعيل بنجاح",
      otpCode: generatedOtp,
    });
  } catch (error: any) {
    console.error("Email OTP Error:", error);
    return res.status(500).json({ success: false, error: error.message || "فشل إرسال البريد الإلكتروني" });
  }
});

// 4. API route to send SMS OTP (Twilio integration)
app.post("/api/send-sms-otp", async (req, res) => {
  const { phone, otpCode } = req.body || {};
  if (!phone) {
    return res.status(400).json({ success: false, error: "رقم الجوال مطلوب" });
  }

  const generatedOtp = otpCode || Math.floor(100000 + Math.random() * 900000).toString();

  try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      const twilio = (await import("twilio")).default;
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      const message = await client.messages.create({
        body: `رمز التفعيل الخاص بك في تطبيق نور الإسلام هو: ${generatedOtp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });

      return res.status(200).json({
        success: true,
        sid: message.sid,
        message: "تم إرسال رسالة الـ SMS بنجاح",
        otpCode: generatedOtp,
      });
    }

    // Fallback if Twilio env not set
    console.log(`[SMS OTP Simulation] Phone: ${phone}, OTP: ${generatedOtp}`);
    return res.status(200).json({
      success: true,
      simulated: true,
      message: "تم تجهيز المحاكاة وإرسال رمز SMS بنجاح",
      otpCode: generatedOtp,
    });
  } catch (error: any) {
    console.error("SMS OTP Error:", error);
    return res.status(500).json({ success: false, error: error.message || "فشل إرسال رسالة SMS" });
  }
});

// 5. API route to download project ZIP file directly
app.get("/api/download-zip", async (req, res) => {
  try {
    const zipPath = path.resolve(process.cwd(), "project_source.zip");
    const { execSync } = await import("child_process");
    try {
      execSync("python3 make_zip.py", { cwd: process.cwd(), timeout: 30000 });
    } catch (e) {
      console.error("Error creating zip:", e);
    }

    if (!fs.existsSync(zipPath)) {
      return res.status(500).json({ error: "ملف الـ ZIP غير موجود" });
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="Noor_Al_Islam_SourceCode.zip"');
    res.sendFile(zipPath);
  } catch (error: any) {
    console.error("Zip download error:", error);
    res.status(500).json({ error: "فشل تحميل ملف الـ ZIP" });
  }
});

// Serve static files / Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback for SPA routing in development mode
    app.get("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = await fs.promises.readFile(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
