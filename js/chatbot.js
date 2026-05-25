(() => {
    const SUPABASE_URL = "https://dufkdknmbtzihzwsqcqk.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_BH-Otj4ws5itGOHzSYBpGg_9-P6v970";
    const FUNCTION_NAME = "chatbot-anatopato-deepseek";
    const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`;

    const state = {
        sessionId: null,
        conversationId: null,
        isSending: false
    };

    const elements = {};

    function getElement(id) {
        const el = document.getElementById(id);
        if (!el) throw new Error(`No se encontro el elemento ${id}.`);
        return el;
    }

    function generateSessionId() {
        const seed = Date.now().toString();
        const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
        return `${seed}${suffix}`;
    }

    function loadSession() {
        const savedSession = localStorage.getItem("museo.sessionId");
        const savedConversation = localStorage.getItem("museo.conversationId");

        state.sessionId = savedSession || generateSessionId();
        state.conversationId = savedConversation || "";

        localStorage.setItem("museo.sessionId", state.sessionId);
    }

    function setStatus(text, level = "ok") {
        elements.statusText.textContent = text;
        if (level === "error") {
            elements.statusDot.style.background = "#f36b6b";
            elements.statusDot.style.boxShadow = "0 0 12px rgba(243, 107, 107, 0.8)";
        } else if (level === "busy") {
            elements.statusDot.style.background = "#f4c95d";
            elements.statusDot.style.boxShadow = "0 0 12px rgba(244, 201, 93, 0.8)";
        } else {
            elements.statusDot.style.background = "#55d6a3";
            elements.statusDot.style.boxShadow = "0 0 12px rgba(85, 214, 163, 0.8)";
        }
    }

    function scrollToBottom() {
        elements.messages.scrollTop = elements.messages.scrollHeight;
    }

    function addMessage(role, text) {
        const bubble = document.createElement("div");
        bubble.className = `chat-message chat-message--${role}`;
        const content = document.createElement("p");
        content.textContent = text;
        bubble.appendChild(content);
        elements.messages.appendChild(bubble);
        scrollToBottom();
        return bubble;
    }

    function addTyping() {
        const bubble = document.createElement("div");
        bubble.className = "chat-message chat-message--assistant";
        const typing = document.createElement("div");
        typing.className = "chat-typing";
        typing.innerHTML = "<span></span><span></span><span></span>";
        bubble.appendChild(typing);
        elements.messages.appendChild(bubble);
        scrollToBottom();
        return bubble;
    }

    function clearMessages() {
        elements.messages.innerHTML = "";
    }

    function setInputDisabled(disabled) {
        elements.input.disabled = disabled;
        elements.send.disabled = disabled;
    }

    function saveConversationId(id) {
        state.conversationId = id || "";
        if (state.conversationId) {
            localStorage.setItem("museo.conversationId", state.conversationId);
        } else {
            localStorage.removeItem("museo.conversationId");
        }
    }

    function startNewConversation() {
        saveConversationId("");
        clearMessages();
        addMessage(
            "system",
            "Hola, soy el asistente del museo. Pregunta sobre una patologia y respondere solo con la informacion del documento."
        );
        setStatus("Conversacion reiniciada", "ok");
    }

    async function sendMessage(text) {
        if (!text.trim() || state.isSending) return;

        state.isSending = true;
        setStatus("Buscando en el museo...", "busy");
        setInputDisabled(true);

        addMessage("user", text.trim());
        const typingBubble = addTyping();

        try {
            const response = await fetch(FUNCTION_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    session_id: state.sessionId,
                    conversation_id: state.conversationId || null,
                    contenido: text.trim()
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || "No se pudo obtener respuesta.");
            }

            if (data?.conversation_id) {
                saveConversationId(String(data.conversation_id));
            }

            const respuesta = (data?.respuesta || "").trim();
            typingBubble.remove();

            if (respuesta) {
                addMessage("assistant", respuesta);
                setStatus("Respuesta lista", "ok");
            } else {
                addMessage(
                    "assistant",
                    "No se encontro informacion suficiente en el documento de patologias."
                );
                setStatus("Sin informacion", "ok");
            }
        } catch (error) {
            typingBubble.remove();
            addMessage(
                "assistant",
                "Lo siento, hubo un problema al consultar el asistente. Intentalo de nuevo."
            );
            setStatus("Error al responder", "error");
            console.error(error);
        } finally {
            state.isSending = false;
            setInputDisabled(false);
            elements.input.focus();
        }
    }

    function bindEvents() {
        elements.form.addEventListener("submit", (event) => {
            event.preventDefault();
            const message = elements.input.value;
            if (!message.trim()) return;
            elements.input.value = "";
            sendMessage(message);
        });

        elements.input.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                elements.form.requestSubmit();
            }
        });

        elements.reset.addEventListener("click", () => {
            startNewConversation();
        });
    }

    function init() {
        elements.messages = getElement("chat-messages");
        elements.form = getElement("chat-form");
        elements.input = getElement("chat-input");
        elements.send = getElement("chat-send");
        elements.reset = getElement("chat-new");
        elements.statusText = getElement("chat-status-text");
        elements.statusDot = document.querySelector(".status-dot");
        if (!elements.statusDot) {
            throw new Error("No se encontro el indicador de estado del chatbot.");
        }

        loadSession();
        startNewConversation();
        bindEvents();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
