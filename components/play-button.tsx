"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import OwnedPetsModal from "./owned-pets-modal"
import { socket } from "@/socket"
import { Play } from "lucide-react"

export default function PlayButton() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="w-full flex items-center justify-between my-4">
      <Button className="px-20 py-6 bg-green-500 border border-green-300 hover:bg-green-400 flex items-center hover:scale-110" onClick={() => setIsOpen(true)}>
        <p>Create Lobby</p>
        <Play />
      </Button>

      <OwnedPetsModal isOpen={isOpen} setIsOpen={setIsOpen} mode={"CREATE"} />
    </div>
  )
}
