"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { socket } from "@/socket";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Send } from "lucide-react";

type ChatMessage = {
    id: string;
    message: string;
    from?: string;
    image?: string;
    createdAt: number;
};

type User = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
    username: string;
};

type LongChatProps = {
    user: User;
};
export default function LongChat({ user }: LongChatProps) {
    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    const sendMessage = () => {
        const trimmed = message.trim();
        if (!trimmed) return;

        const wordCount = trimmed.split(/\s+/).length;

        if (wordCount > 30) {
            toast.error("Maximum 30 words only.")
            return;
        }

        setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), message: trimmed, from: "me", createdAt: Date.now() },
        ]);

        socket.emit("send_message", { message: trimmed, username: user.username, image: user.image });
        setMessage("");
    };


    useEffect(() => {
        socket.connect();

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, []);

    useEffect(() => {
        const onReceive = (data: { message: string; username?: string; image?: string }) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    message: data.message,
                    from: data.username ?? "other",
                    image: data.image ?? "",
                    createdAt: Date.now(),
                },
            ]);
        };

        socket.on("receive_message", onReceive);

        return () => {
            socket.off("receive_message", onReceive);
        };
    }, []);

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 w-full mt-4 overflow-y-auto overflow-x-hidden px-2 flex flex-col gap-2">
                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={`px-4 py-2 rounded-lg max-w-[75%] wrap-break-word break-all ${m.from === "me"
                            ? "bg-green-500 text-white ml-auto"
                            : "bg-blue-400 text-white mr-auto"
                            }`}
                    >
                        <div className="text-sm font-bold flex items-start">
                            <Avatar className="bg-green-500 flex items-center justify-center">
                                <AvatarImage src={m.from == "me" ? user.image ?? "" : m.image} />
                                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p>
                                    {m.from == "me" ? "Me" : m.from}
                                </p>
                                <div className="font-normal">
                                    {m.message}
                                </div>
                            </div>
                        </div>
                        
                    </div>
                ))}
            </div>

            <div className="w-full backdrop-blur-lg p-4">
                <div className="grid grid-cols-3 w-full gap-2">
                    <Input
                        value={message}
                        placeholder="Message"
                        className="col-span-2"
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button className="bg-green-500 hover:bg-green-400 text-gray-900" onClick={sendMessage}>
                        Send
                        <Send />
                    </Button>
                </div>
            </div>
        </div>
    );

}
