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
const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const OPENROUTER_MODEL = Deno.env.get("OPENROUTER_MODEL") ?? "openai/gpt-oss-120b:free";
const OPENROUTER_SITE_URL = Deno.env.get("OPENROUTER_SITE_URL") ?? "https://museo-patologias.local";
const OPENROUTER_APP_NAME = Deno.env.get("OPENROUTER_APP_NAME") ?? "Museo de Patologias";

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
    if (!OPENROUTER_API_KEY) {
      return jsonResponse({ error: "Falta OPENROUTER_API_KEY en el entorno." }, 500);
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
      throw new Error("No se pudo leer el documento de patologias.");
    }

    const contexto = (documentos ?? [])
      .map(
        (doc: DocumentoPatologia, index: number) =>
          `Documento ${index + 1}: ${doc.titulo}\n${doc.contenido}`
      )
      .join("\n\n---\n\n");

    const { data: historial, error: errorHistorial } = await supabase
      .from("mensaje")
      .select("contenido, es_usuario, fecha_creacion")
      .eq("id_conversacion", conversationId)
      .order("fecha_creacion", { ascending: true })
      .limit(12);

    if (errorHistorial) {
      throw new Error("No se pudo obtener el historial de conversacion.");
    }

    const mensajes = [
      {
        role: "system",
        content:
          "Eres el asistente virtual del Museo de Anatomía Patológica. " +
          "Tu ÚNICA fuente de información son los documentos del museo proporcionados al final de este mensaje. " +
          "REGLAS ESTRICTAS:\n" +
          "1. Responde EXCLUSIVAMENTE con información que esté textualmente en los documentos.\n" +
          "2. PROHIBIDO usar conocimiento de tu entrenamiento, internet o fuentes externas.\n" +
          "3. Si la información solicitada NO está en los documentos, responde exactamente: 'No tengo información sobre ese tema en los documentos del museo.'\n" +
          "4. No improvises, no supongas, no complementes con conocimiento propio.\n" +
          "5. Si la pregunta no está relacionada con patología o con el contenido de los documentos, indica que solo puedes responder sobre las patologías del museo.\n\n" +
          "DOCUMENTOS DEL MUSEO:\n" +
          (contexto || "No hay documentos cargados en el museo."),
      },
      ...((historial ?? []).map((msg: MensajeHistorial) => ({
        role: msg.es_usuario ? "user" : "assistant",
        content: msg.contenido,
      }))),
    ];

    const respuestaOpenRouter = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": OPENROUTER_SITE_URL,
        "X-Title": OPENROUTER_APP_NAME,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: mensajes,
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    if (!respuestaOpenRouter.ok) {
      const errorTexto = await respuestaOpenRouter.text();
      throw new Error(`OpenRouter fallo: ${errorTexto}`);
    }

    const dataOpenRouter = await respuestaOpenRouter.json();
    const respuestaAsistente = dataOpenRouter?.choices?.[0]?.message?.content?.trim();

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
