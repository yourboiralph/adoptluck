


// AvailableLobbies.server.tsx (NO "use client")


import { showLobbies } from "@/lib/coinflip/lobbies"
import AvailableLobbies from "./available-lobbies"
import { Suspense } from "react"
import ShowResult from "./show-result"

export default async function AvailableLobbiesServer() {
  const lobbies = await showLobbies()

  return (
    <AvailableLobbies initialLobbies={lobbies} />
  )
}
