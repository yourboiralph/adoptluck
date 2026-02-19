"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { connectAuthedSocket, socket } from "@/socket";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Send } from "lucide-react";
import Image from "next/image";

type ServerChatPayload = {
  message: string;
  username: string;
  image: string;
  role: string;
  userId: string;
  createdAt: string; // ISO string from server
};

type ChatMessage = {
  id: string; // local id for React key
  message: string;
  username: string;
  image: string;
  userId: string;
  role: string;
  createdAt: string; // ISO string
};

type User = {
  id: string;
  username: string;
  image?: string | null;
  role?: string
};

type LongChatProps = {
  user: User;
};

export default function LongChat({ user }: LongChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [token, setToken] = useState<string | null>(null);

  const meFallback = useMemo(
    () => (user.username?.charAt(0) || "U").toUpperCase(),
    [user.username]
  );


  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;
  }, [messages]); // 🔥 whenever messages change


  // 1) Connect socket once + fetch token
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await connectAuthedSocket();

        const res = await fetch("/api/socket-token", { credentials: "include" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "socket-token failed");

        if (mounted) setToken(json.token);
      } catch (e: any) {
        toast.error(e?.message || "Chat setup failed");
      }
    })();

    return () => {
      mounted = false;

      // ⚠️ If other parts of your app use the same socket, DO NOT disconnect here.
      // socket.disconnect();
    };
  }, []);

  // 2) Receive messages from server (single source of truth)
  useEffect(() => {
    const onReceive = (data: ServerChatPayload) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${data.userId}:${data.createdAt}`, // stable key
          message: data.message,
          username: data.username,
          role: data.role,
          image: data.image || "",
          userId: data.userId,
          createdAt: data.createdAt,
        },
      ]);
    };

    const onBanned = (data: { reason?: string; bannedUntil?: string | null }) => {
      toast.error(data?.reason || "You are banned from chat.");
    };

    const onChatError = (data: { message?: string }) => {
      toast.error(data?.message || "Chat error");
    };

    socket.on("receive_message", onReceive);
    socket.on("chat_banned", onBanned);
    socket.on("chat_error", onChatError);

    return () => {
      socket.off("receive_message", onReceive);
      socket.off("chat_banned", onBanned);
      socket.off("chat_error", onChatError);
    };
  }, []);

  // 3) Send message (do NOT append locally)
  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    if (wordCount > 30) {
      toast.error("Maximum 30 words only.");
      return;
    }

    if (!token) {
      toast.error("Chat not ready yet (missing token).");
      return;
    }

    socket.emit(
      "send_message",
      { message: trimmed, token },
      (ack?: { ok: boolean; error?: string }) => {
        if (!ack?.ok) {
          if (ack?.error === "banned") toast.error("You are banned from chat.");
          else toast.error(ack?.error || "Message failed");
          return;
        }

        // ✅ IMPORTANT: don't add to state here (server will echo it back)
        setMessage("");
      }
    );
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div ref={containerRef} className="flex-1 w-full mt-4 overflow-y-auto overflow-x-hidden px-2 flex flex-col gap-2">
        {messages.map((m) => {
          const isMe = m.userId === user.id;
          const fallback = (m.username?.charAt(0) || "U").toUpperCase();

          return (
            <div
              key={m.id}
              className={[
                "px-4 py-2 rounded-lg max-w-[75%] wrap-break-word",
                isMe ? "bg-green-500 text-white ml-auto" : "bg-blue-400 text-white mr-auto",
              ].join(" ")}
            >
              <div className="text-sm font-bold flex items-start gap-2">
                <Avatar className={`size-10 ${isMe ? "bg-green-500" : "bg-blue-400"}`}>
                  <AvatarImage src={isMe ? user.image ?? "" : m.image} />
                  <AvatarFallback>{isMe ? meFallback : fallback}</AvatarFallback>
                </Avatar>

                <div>
                  <div className="">
                    <p>{isMe ? "Me" : m.username}</p>
                    <div className="flex items-center gap-1">
                      <p>{m?.role == "Owner" && <img src="/crown.svg" width={24} height={24} alt="crown" />}
                        {m?.role == "Admin" && <img src="/shield.svg" width={24} height={24} alt="shield" />}
                        {m?.role == "Whale" && <img src="/whale.svg" width={24} height={24} alt="whale" />}
                        {m?.role == "Shark" && <img src="/shark.svg" width={24} height={24} alt="shark" />}
                        {m?.role == "Dolphin" && <img src="/dolphin.svg" width={24} height={24} alt="dolphin" />}
                        {m?.role == "Fish" && <img src="/fish.svg" width={24} height={24} alt="fish" />}</p>
                      <p className={`text-sm font-bold
                        ${m?.role == "Owner" && "text-red-500"}
                        ${m?.role == "Admin" && "text-red-300"}
                        ${m?.role == "Whale" && "text-purple-500"}
                        ${m?.role == "Shark" && "text-blue-500"}
                        ${m?.role == "Dolphin" && "text-yellow-200"}
                        ${m?.role == "Fish" && "text-lime-300"} `}>
                        {m?.role}
                      </p>
                    </div>
                  </div>
                  <div className="font-normal break-all">{m.message}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full backdrop-blur-lg p-4">
        <div className="grid grid-cols-3 w-full gap-2">
          <Input
            value={message}
            placeholder="Message"
            className="col-span-2"
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <Button className="bg-green-500 hover:bg-green-400 text-gray-900" onClick={sendMessage}>
            Send <Send />
          </Button>
        </div>
      </div>
    </div>
  );
}
