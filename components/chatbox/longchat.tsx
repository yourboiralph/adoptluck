"use client"

import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {socket} from "@/socket"

export default function LongChat() {

    const [message, setMessage] = useState<String>("")
    const [messageReceived, setMessageReceived] = useState<String>("")

    
    const sendMessage = () => {
        // TO EMIT AN EVENT DAPAT NAAY GA LISTEN ATO NA EVENT SA BACKEND
        socket.emit('send_message', {
            message
        })
    }
    const [isConnected, setIsConnected] = useState(false);
    useEffect(() => {
        socket.connect()
        if (socket.connected) {
            onConnect();
        }

        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, []);

    useEffect(() => {
        //CALL BACK FUNCTION IF MAG ON `() => {}`
        socket.on("receive_message", (data) => {
            setMessageReceived(data.message)
        })
    }, [socket])
    return (
        <div>
            <div>
                <p>Status: { isConnected ? "connected" : "disconnected" }</p>
            </div>

            <div>
                {messageReceived}
            </div>
            <div className="fixed bottom-0 bg-white/20 backdrop-blur-lg w-full p-4">
                <div className="grid grid-cols-3 w-full gap-2">
                    <Input type="text" placeholder="Message" className="col-span-2" onChange={(e) => {
                        setMessage(e.target.value)
                    }} />
                    <Button className="bg-white" onClick={sendMessage}>Send Message</Button>
                </div>
            </div>
        </div>
    )
}