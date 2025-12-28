import { defineStore } from "pinia";

export const useChatStore = defineStore("chat", {
  state: () => ({
    sessions: [],
    activeSessionId: null,
    selectedModel: null,
    undoStack: [],
    undoTimeout: null,
  }),

  persist: {
    paths: ["sessions", "activeSessionId"],
  },

  actions: {
    newSession(model) {
      const session = {
        id: crypto.randomUUID(),
        title: "Neuer Chat",
        model,
        messages: [
          {
            role: "assistant",
            content: "Hallo! Wie kann ich dir heute helfen?",
          },
        ],
        createdAt: Date.now(),
      };

      this.sessions.unshift(session);
      this.activeSessionId = session.id;
    },

    addMessage(message) {
      const session = this.sessions.find((s) => s.id === this.activeSessionId);
      if (session) {
        session.messages.push(message);
      }
    },

    updateTitle(id, newTitle) {
      const session = this.sessions.find((s) => s.id === id);
      if (session) session.title = newTitle;
    },

    selectSession(id) {
      this.activeSessionId = id;
    },

    selectModel(model) {
      this.selectedModel = model;
    },

    deleteSession(id) {
      const index = this.sessions.findIndex((s) => s.id === id);
      if (index === -1) return;

      // Aktion auf Stack legen
      this.undoStack.push({
        type: "session",
        payload: {
          session: JSON.parse(JSON.stringify(this.sessions[index])),
          index,
        },
        createdAt: Date.now(),
      });
      this.sessions.splice(index, 1);

      if (this.activeSessionId === id) {
        this.activeSessionId = this.sessions[0]?.id || null;
      }
    },

    deleteMessage(sessionId, index) {
      const session = this.sessions.find((s) => s.id === sessionId);
      if (!session) return;

      this.undoStack.push({
        type: "message",
        payload: {
          sessionId,
          message: JSON.parse(JSON.stringify(session.messages[index])),
          index,
        },
        createdAt: Date.now(),
      });

      session.messages.splice(index, 1);
    },

    undoLast() {
      const action = this.undoStack.pop();
      if (!action) return;

      if (action.type === "session") {
        const { session, index } = action.payload;
        this.sessions.splice(index, 0, session);
        this.activeSessionId = session.id;
      }

      if (action.type === "message") {
        const { sessionId, message, index } = action.payload;
        const session = this.sessions.find((s) => s.id === sessionId);
        if (!session) return;
        session.messages.splice(index, 0, message);
      }
    },
  },
  getters: {
    activeSession: (state) =>
      state.sessions.find((s) => s.id === state.activeSessionId),
  },
  persist: true,
});
