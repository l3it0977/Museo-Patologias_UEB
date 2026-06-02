// @ts-ignore - Deno resuelve modulos remotos en tiempo de ejecucion.
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
// @ts-ignore - Deno resuelve modulos remotos en tiempo de ejecucion.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_MODEL = Deno.env.get("GROQ_MODEL") ?? "llama-3.3-70b-versatile";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
}

const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_SERVICE_ROLE_KEY ?? "");

type DocumentoPatologia = {
  titulo: string;
  contenido: string;
};

type MensajeHistorial = {
  contenido: string;
  es_usuario: boolean;
};

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Metodo no permitido." }, 405);
  }

  try {
    if (!GROQ_API_KEY) {
      return jsonResponse({ error: "Falta GROQ_API_KEY en el entorno." }, 500);
    }

    const { session_id, contenido, conversation_id } = await req.json();

    if (!session_id || !contenido) {
      return jsonResponse({ error: "session_id y contenido son obligatorios." }, 400);
    }

    let conversationId = conversation_id;

    if (!conversationId) {
      const { data: existente, error: errorExistente } = await supabase
        .from("conversacion")
        .select("id")
        .eq("sesion_id", session_id)
        .order("fecha_creacion", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (errorExistente) {
        throw new Error("No se pudo consultar la conversacion.");
      }

      if (existente?.id) {
        conversationId = existente.id;
      }
    }

    if (!conversationId) {
      const { data: creada, error: errorCreacion } = await supabase
        .from("conversacion")
        .insert({
          sesion_id: session_id,
          fecha_creacion: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (errorCreacion || !creada?.id) {
        throw new Error("No se pudo crear la conversacion.");
      }

      conversationId = creada.id;
    }

    const { error: errorMensaje } = await supabase.from("mensaje").insert({
      id_conversacion: conversationId,
      contenido,
      fecha_creacion: new Date().toISOString(),
      es_usuario: true,
    });

    if (errorMensaje) {
      throw new Error("No se pudo guardar el mensaje del usuario.");
    }

    const { data: documentos, error: errorDocs } = await supabase
      .from("documentos_patologias")
      .select("titulo, contenido")
      .order("fecha_creacion", { ascending: true });

    if (errorDocs) {
      console.error("[chatbot] errorDocs:", errorDocs);
      throw new Error("No se pudo leer el documento de patologias.");
    }

    console.log(`[chatbot] Documentos recuperados: ${documentos?.length ?? 0}`);
    console.log(`[chatbot] Primeros titulos: ${(documentos ?? []).slice(0, 5).map((d: DocumentoPatologia) => d.titulo).join(" | ")}`);
    console.log(`[chatbot] Modelo en uso: ${GROQ_MODEL}`);
    console.log(`[chatbot] Pregunta del usuario: ${contenido}`);

    const contexto = (documentos ?? [])
      .map(
        (doc: DocumentoPatologia, index: number) =>
          `Documento ${index + 1}: ${doc.titulo}\n${doc.contenido}`
      )
      .join("\n\n---\n\n");

    console.log(`[chatbot] Longitud del contexto: ${contexto.length} caracteres`);

    const { data: historial, error: errorHistorial } = await supabase
      .from("mensaje")
      .select("contenido, es_usuario, fecha_creacion")
      .eq("id_conversacion", conversationId)
      .order("fecha_creacion", { ascending: true })
      .limit(12);

    if (errorHistorial) {
      throw new Error("No se pudo obtener el historial de conversacion.");
    }

    const systemPrompt =
      "Eres una guía virtual del Museo Universitario de Anatomía Patológica. Tu trabajo es explicar a los visitantes (estudiantes de medicina) las patologías descritas en los DOCUMENTOS DEL MUSEO que aparecen al final de este mensaje.\n\n" +
      "CÓMO RESPONDER:\n" +
      "- Cuando el visitante mencione una patología, IDENTIFICALA en los documentos. La búsqueda es FLEXIBLE: ignora tildes, mayúsculas y diferencias menores (ej: 'colon chagasico' coincide con 'Colon chagásico', 'leiomioma' coincide con 'Leiomioma uterino').\n" +
      "- Una vez identificada, responde con la información del documento correspondiente: definición, causa, características, hallazgos macroscópicos y microscópicos. Explica de forma clara y didáctica.\n" +
      "- Si la patología NO está en ninguno de los documentos, responde: 'Esa patología no está incluida en el museo. Las disponibles son:' y lista los títulos.\n" +
      "- Si la pregunta no tiene nada que ver con patologías (clima, deportes, etc.), responde brevemente que solo puedes hablar sobre las patologías del museo.\n" +
      "- NUNCA repitas la lista completa de patologías si el visitante ya nombró una específica que SÍ está en los documentos — en ese caso, explícala directamente.\n\n" +
      "DOCUMENTOS DEL MUSEO:\n" +
      (contexto || "No hay documentos cargados en el museo.");

    const mensajes = [
      { role: "system", content: systemPrompt },
      ...((historial ?? []).map((msg: MensajeHistorial) => ({
        role: msg.es_usuario ? "user" : "assistant",
        content: msg.contenido,
      }))),
    ];

    const respuestaGroq = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: mensajes,
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    if (!respuestaGroq.ok) {
      const errorTexto = await respuestaGroq.text();
      throw new Error(`Groq fallo: ${errorTexto}`);
    }

    const dataGroq = await respuestaGroq.json();
    console.log("[chatbot] Respuesta Groq completa:", JSON.stringify(dataGroq));
    console.log("[chatbot] finish_reason:", dataGroq?.choices?.[0]?.finish_reason);

    const respuestaAsistente = dataGroq?.choices?.[0]?.message?.content?.trim();

    if (!respuestaAsistente) {
      throw new Error("La respuesta del asistente llego vacia.");
    }

    const { error: errorRespuesta } = await supabase.from("mensaje").insert({
      id_conversacion: conversationId,
      contenido: respuestaAsistente,
      fecha_creacion: new Date().toISOString(),
      es_usuario: false,
    });

    if (errorRespuesta) {
      throw new Error("No se pudo guardar la respuesta del asistente.");
    }

    return jsonResponse({ respuesta: respuestaAsistente, conversation_id: conversationId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado.";
    return jsonResponse({ error: message }, 500);
  }
});
