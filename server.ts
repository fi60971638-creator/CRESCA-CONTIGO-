import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "CRESCA CONTIGO", target: "Comerciantes de Ferias Rurales", timestamp: new Date().toISOString() });
});

// Gemini AI Business Advisor Endpoint for Rural Fair Merchants
app.post("/api/advisor", async (req, res) => {
  try {
    const { businessProfile, summary, topProducts, recentExpenses, goals, creditScore } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        source: "fallback",
        analysis: "Para habilitar el análisis avanzado con inteligencia artificial en tiempo real, asegúrate de contar con la clave de API de Gemini configurada en el sistema.",
        actionPlan: [
          "Lleva el registro de tus ventas en cada feria de la semana para saber qué plaza te deja más ganancia.",
          "Calcula bien el costo de flete, combustible y derecho de sisa o puesto antes de fijar tus precios.",
          "Asegura mercadería o cosecha de buena calidad para los días centrales de feria (como ferias dominicales y ferias patronales)."
        ]
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `Actúa como un asesor financiero y comercial experto en COMERCIANTES DE FERIAS RURALES, feriantes itinerantes, productores agropecuarios y vendedores de mercados comunales para la plataforma CRESCA CONTIGO.
Datos del comerciante / negocio rural:
- Nombre del Puesto / Negocio: ${businessProfile?.name || "Comercializadora Rural"}
- Titular / Feriante: ${businessProfile?.ownerName || "Comerciante"}
- Rubro / Tipo de feria: ${businessProfile?.businessType || "Feria Agropecuaria y Abarrotes Rurales"}
- Ubicación / Circuito de ferias: ${businessProfile?.address || "Circuito de Ferias Rurales"}
- Moneda: ${businessProfile?.currencySymbol || "S/"}
- Total Ventas de feria registradas: ${businessProfile?.currencySymbol || "S/"} ${summary?.totalSales || 0}
- Total Gastos y fletes registrados: ${businessProfile?.currencySymbol || "S/"} ${summary?.totalExpenses || 0}
- Ganancia Neta Estimada: ${businessProfile?.currencySymbol || "S/"} ${summary?.netProfit || 0} (Margen: ${summary?.profitMargin || 0}%)
- Ventas este mes: ${businessProfile?.currencySymbol || "S/"} ${summary?.thisMonthSales || 0}
- Gastos este mes: ${businessProfile?.currencySymbol || "S/"} ${summary?.thisMonthExpenses || 0}
- Productos más vendidos en feria: ${JSON.stringify(topProducts || [])}
- Principales gastos (mercadería, flete, sisa/puesto, jornal): ${JSON.stringify(recentExpenses || [])}
- Nivel de Preparación para Crédito Rural: ${creditScore?.level || "Media"} (${creditScore?.score || 65}/100)

Instrucciones:
1. Brinda un diagnóstico motivador, claro y 100% adaptado a la realidad de las ferias de campo y pueblos (considerando traslados, estacionalidad, días de feria vs días de acopio, cobros en efectivo y billeteras digitales).
2. Genera 3 a 4 recomendaciones concretas y prácticas para aumentar ventas en los días de plaza, reducir mermas o costos de flete y preparar su sustento de ingresos para solicitar un microcrédito rural (Cajas Municipales/Rurales, Agrobanco, Financieras rurales).
3. Responde estrictamente en formato JSON válido con las claves: "diagnostic" (string conciso y profesional), "keyInsights" (array de strings con observaciones clave sobre su rendimiento en ferias), "actionPlan" (array de objetos con "title", "description", "expectedImpact" ['alto' | 'medio']).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = { diagnostic: responseText, keyInsights: [], actionPlan: [] };
    }

    return res.json({
      source: "gemini-ai",
      ...parsed,
    });
  } catch (error: any) {
    console.error("Error generating advisor response:", error);
    return res.status(500).json({
      error: "No se pudo generar el análisis de IA en este momento.",
      details: error.message,
    });
  }
});

// Chat endpoint with Cresca Contigo AI Rural Fair Business Advisor
app.post("/api/advisor/chat", async (req, res) => {
  try {
    const { message, history, businessContext } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        reply: "Para responder consultas personalizadas mediante IA, se requiere la clave de API activa. Mientras tanto, puedes consultar los cálculos automáticos de tus días de feria y margen neto."
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemInstruction = `Eres el "Asesor Cresca Contigo", un especialista financiero y de gestión comercial para COMERCIANTES DE FERIAS RURALES, vendedores de puestos itinerantes, productores agropecuarios y comerciantes de ferias dominicales y semanales.
Tu objetivo es ayudar a los feriantes a:
1. Comprender sus ganancias reales descontando compras por mayor, fletes de transporte, sisa/alquiler de puesto, combustible y jornales.
2. Identificar qué días de feria y qué pueblos o plazas les son más rentables.
3. Evitar fiados riesgosos o mermas de productos perecibles.
4. Construir un historial de cuentas ordenado para acceder a microcréditos rurales (Cajas Rurales, Agrobanco, MiBanco, etc.) y adquirir motofurgón, capital de mercadería o toldos.
Usa un tono empático, respetuoso, motivador y directo en moneda ${businessContext?.currencySymbol || "S/"}.
Contexto actual del puesto / comerciante rural:
${JSON.stringify(businessContext || {})}
`;

    const contents = [
      ...(history || []).map((h: { sender: string; text: string }) => ({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      reply: response.text || "No pude formular una respuesta.",
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return res.status(500).json({ error: error.message || "Error en el chat de asesoría" });
  }
});

// Serve frontend in dev / production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
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
    console.log(`Cresca Contigo server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
