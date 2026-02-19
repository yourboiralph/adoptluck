// src/socket.ts (or wherever "@/socket" points)
import { io } from "socket.io-client";

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_IO_URL!, {
  autoConnect: false,       // ✅ MUST be false
  transports: ["websocket"], // optional but good
});

export async function connectAuthedSocket() {
  const res = await fetch("/api/socket-token", { credentials: "include" });
  const json = await res.json();

  console.log("[socket-token]", res.status, json);
  if (!res.ok) throw new Error(json?.error || "socket-token failed");

  socket.disconnect(); // ✅ drop previous unauth connection
  socket.auth = { token: json.token };
  socket.connect();
}

