"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import OwnedPetsModal from "./owned-pets-modal"

export default function PlayButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-full flex items-center justify-between my-4">
      <Button className="px-20 py-6" onClick={() => setIsOpen(true)}>
        Create Lobby
      </Button>

      <OwnedPetsModal isOpen={isOpen} setIsOpen={setIsOpen} mode={"CREATE"} />
    </div>
  )
}
