import { useEffect, useRef, useState } from "react";
import { Button, Card, TextArea } from "@heroui/react";
import { getLocalReply, profile, quickQuestions } from "../data";

const MAX_HISTORY = 10;

function TypingDots() {
  return (
    <span className="flex items-center gap-1">
      <i className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
      <i className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
      <i className="size-1.5 animate-bounce rounded-full bg-slate-400" />
    </span>
  );
}

function Bubble({ role, children }) {
  const isUser = role === "user";
  return (
    <div className={`flex max-w-[92%] items-end gap-2 ${isUser ? "self-end" : "self-start"}`}>
      {!isUser && (
        <img
          src="/photo.jpg"
          alt=""
          className="size-7 shrink-0 rounded-full object-cover object-[center_15%]"
        />
      )}
      <div
        className={`whitespace-pre-line rounded-2xl px-4 py-3 text-[13.5px] leading-7 ${
          isUser
            ? "rounded-br-md bg-[#1f66e5] text-white shadow-md shadow-blue-600/15"
            : "rounded-bl-md border border-[#e6edf7] bg-[#f2f6fc] text-[#2b3e56]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: profile.greeting },
  ]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTo({
        top: logRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, thinking]);

  async function ask(rawQuestion) {
    const question = String(rawQuestion || "").trim().slice(0, 500);
    if (!question || thinking) return;

    const nextHistory = [...history, { role: "user", content: question }].slice(
      -MAX_HISTORY
    );

    setMessages((current) => [...current, { role: "user", text: question }]);
    setHistory(nextHistory);
    setInput("");
    setThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const error = new Error(data?.error || `请求失败（${response.status}）`);
        error.status = response.status;
        throw error;
      }

      if (!data || typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("模型没有返回内容");
      }

      const reply = data.reply.trim();
      setMessages((current) => [...current, { role: "assistant", text: reply }]);
      setHistory([...nextHistory, { role: "assistant", content: reply }].slice(-MAX_HISTORY));
    } catch (error) {
      if (error?.status === 429) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            text: "问得有点快，请稍后再试。每分钟最多 10 次。",
          },
        ]);
      } else if (error?.status === 400 || error?.status === 413) {
        setMessages((current) => [
          ...current,
          { role: "assistant", text: error.message },
        ]);
      } else {
        setMessages((current) => [
          ...current,
          { role: "assistant", text: getLocalReply(question) },
          {
            role: "assistant",
            text: "（AI 分身暂时不可用，以上是本地预设回答。）",
          },
        ]);
      }
    } finally {
      setThinking(false);
    }
  }

  function reset() {
    setMessages([{ role: "assistant", text: profile.greeting }]);
    setHistory([]);
    setInput("");
  }

  function onKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      ask(input);
    }
  }

  return (
    <Card className="h-full min-h-[560px] gap-0 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white p-0 shadow-[0_30px_80px_rgba(8,24,46,0.14)]">
      <div className="flex items-center justify-between gap-4 border-b border-[#e8eef7] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-10 shrink-0">
            <img
              src="/photo.jpg"
              alt=""
              className="size-10 rounded-full object-cover object-[center_15%]"
            />
            <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#0b1f3a]">
              程志鹏 · 数字分身
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-[#7b8da3]">
              <i className="size-1.5 rounded-full bg-emerald-500" />
              可试用 · 基于公开信息
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 rounded-full text-[10.5px] text-[#5d6f87]"
          onPress={reset}
        >
          清空
        </Button>
      </div>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label="聊天记录"
        className="chat-scroll flex h-[300px] flex-col gap-4 overflow-y-auto bg-white px-5 py-5"
      >
        {messages.map((message, index) => (
          <Bubble key={index} role={message.role}>
            {message.text}
          </Bubble>
        ))}
        {thinking && (
          <Bubble role="assistant">
            <TypingDots />
          </Bubble>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-[#eef3fa] bg-white px-4 py-3">
        {quickQuestions.map((question) => (
          <Button
            key={question}
            variant="outline"
            size="sm"
            isDisabled={thinking}
            className="h-7 rounded-full border-[#e4ecf7] bg-[#f5f8fd] px-3 text-[10.5px] font-normal text-[#40536c]"
            onPress={() => ask(question)}
          >
            {question}
          </Button>
        ))}
      </div>

      <form
        className="flex items-end gap-2 bg-white px-4 pt-2"
        onSubmit={(event) => {
          event.preventDefault();
          ask(input);
        }}
      >
        <TextArea
          aria-label="输入你想问的问题"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={500}
          placeholder="输入你想问的问题…"
          className="max-h-[110px] min-h-[44px] w-full flex-1 resize-none rounded-2xl border border-[#dfe8f4] bg-[#f5f8fd] px-4 py-3 text-[13.5px] text-[#0b1f3a] placeholder:text-[#98a8ba] focus:border-[#1f66e5]"
        />
        <Button
          type="submit"
          isIconOnly
          isDisabled={thinking || !input.trim()}
          aria-label="发送问题"
          className="size-11 rounded-full bg-[#1f66e5] text-white shadow-lg shadow-blue-600/20 disabled:bg-[#94b7f6]"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m4 12 16-8-5.5 16-3-6.5L4 12Z" />
          </svg>
        </Button>
      </form>

      <div className="flex justify-between gap-3 bg-white px-5 pb-4 pt-2 text-[9px] text-[#9aa8ba]">
        <span>Enter 发送 · Shift + Enter 换行</span>
        <span>每分钟最多 10 次 · 基于公开信息</span>
      </div>
    </Card>
  );
}
