


// AvailableLobbies.server.tsx (NO "use client")


import { showLobbies } from "@/lib/coinflip/lobbies"
import AvailableLobbies from "./available-lobbies"
import { Suspense } from "react"
import ShowResult from "./show-result"

export default async function AvailableLobbiesServer() {
  const lobbies = await showLobbies()

  return (
    <Suspense fallback={"Loading..."}>
        <AvailableLobbies initialLobbies={lobbies} />
        <ShowResult gameId={"cmlcolq730004tgj44euf6o8f"}/>
    </Suspense>
  )
}
