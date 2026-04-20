"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import DogSelector from "@/components/DogSelector";
import ChatMessage from "@/components/ChatMessage";
import type { ChatMessageDTO, DogDTO } from "@/types";

function ChatInner() {
  const searchParams = useSearchParams();
  const initialDogId = searchParams.get("dogId");
  const scanContextId = searchParams.get("scanId");

  const [dogs, setDogs] = useState<DogDTO[]>([]);
  const [dogId, setDogId] = useState<string | null>(initialDogId);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/dogs")
      .then((r) => r.json())
      .then((data: DogDTO[]) => {
        if (!Array.isArray(data)) return;
        setDogs(data);
        if (!dogId && data[0]) setDogId(data[0].id);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMessages([]);
    setSessionId(null);
  }, [dogId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  const selectedDog = useMemo(
    () => dogs.find((d) => d.id === dogId) ?? null,
    [dogs, dogId]
  );

  async function send() {
    const text = input.trim();
    if (!text || !dogId || sending) return;

    const nowIso = new Date().toISOString();
    const userMsg: ChatMessageDTO = {
      role: "user",
      content: text,
      timestamp: nowIso,
    };
    const placeholder: ChatMessageDTO = {
      role: "assistant",
      content: "",
      timestamp: nowIso,
    };
    setMessages((prev) => [...prev, userMsg, placeholder]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dogId,
          sessionId,
          message: text,
          scanContextId: messages.length === 0 ? scanContextId : undefined,
          stream: true,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Chat failed.");
        setMessages((prev) => prev.slice(0, -2));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const events = buf.split("\n\n");
        buf = events.pop() ?? "";

        for (const evt of events) {
          const line = evt.trim();
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (!json) continue;
          try {
            const payload = JSON.parse(json);
            if (payload.error) {
              toast.error(payload.error);
              setMessages((prev) => prev.slice(0, -2));
              return;
            }
            if (payload.sessionId && !payload.done) {
              setSessionId(payload.sessionId);
            }
            if (typeof payload.delta === "string") {
              accumulated += payload.delta;
              setMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last && last.role === "assistant") {
                  next[next.length - 1] = {
                    ...last,
                    content: accumulated,
                  };
                }
                return next;
              });
            }
            if (payload.done) {
              if (typeof payload.reply === "string") {
                setMessages((prev) => {
                  const next = [...prev];
                  const last = next[next.length - 1];
                  if (last && last.role === "assistant") {
                    next[next.length - 1] = {
                      ...last,
                      content: payload.reply,
                      timestamp: new Date().toISOString(),
                    };
                  }
                  return next;
                });
              }
              if (payload.sessionId) setSessionId(payload.sessionId);
            }
          } catch {
            /* ignore malformed chunk */
          }
        }
      }
    } catch {
      toast.error("Network error. Please try again.");
      setMessages((prev) => prev.slice(0, -2));
    } finally {
      setSending(false);
    }
  }

  function newConversation() {
    setMessages([]);
    setSessionId(null);
    toast.success("Started a fresh conversation.");
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex h-[calc(100vh-120px)] max-w-3xl flex-col px-4 py-4 md:h-[calc(100vh-80px)]">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <DogSelector dogs={dogs} selectedId={dogId} onChange={setDogId} />
          </div>
          <button onClick={newConversation} className="btn-secondary text-sm">
            + New conversation
          </button>
        </div>

        <div
          ref={scrollRef}
          className="chat-scroll flex-1 space-y-3 overflow-y-auto rounded-2xl border border-black/5 bg-cream p-4"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
              <div className="text-5xl">💬</div>
              <p className="mt-3 max-w-xs text-sm">
                Ask me anything about {selectedDog?.name ?? "your dog"}
                &rsquo;s diet, health, behavior, or a recent scan.
              </p>
              <div className="mt-4 grid w-full max-w-md gap-2">
                {[
                  `What breed-specific issues should I watch for in ${selectedDog?.breed ?? "my dog"}?`,
                  "How often should I brush their teeth?",
                  "What's a healthy daily exercise routine?",
                ].map((p) => (
                  <button
                    key={p}
                    onClick={() => setInput(p)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-xs text-gray-700 hover:border-brand/30"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => {
                const isLast = i === messages.length - 1;
                const isEmptyAssistant =
                  m.role === "assistant" && m.content === "";
                if (isLast && isEmptyAssistant && sending) {
                  return (
                    <div key={i} className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-sm border border-black/5 bg-white px-4 py-2.5 text-sm text-gray-500 shadow-sm">
                        <span className="inline-flex gap-1">
                          <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
                        </span>
                      </div>
                    </div>
                  );
                }
                return <ChatMessage key={i} message={m} />;
              })}
            </>
          )}
        </div>

        <div className="mt-3 flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder={`Ask about ${selectedDog?.name ?? "your dog"}...`}
            className="input min-h-12 flex-1 resize-none"
          />
          <button
            onClick={() => void send()}
            disabled={sending || !input.trim()}
            className="btn-primary h-12 w-12 !p-0"
            aria-label="Send"
          >
            ➤
          </button>
        </div>
      </main>
    </>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatInner />
    </Suspense>
  );
}
