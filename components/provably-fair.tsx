
import { Card, CardDescription, CardHeader, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import Link from "next/link"

export default function ProvablyFairComponent() {


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="border border-border bg-card">
        <CardHeader>
          <h1 className="text-2xl font-bold">Provably Fair</h1>
          <CardDescription>
            Every coin flip is generated using a third party website:
            <br />
            • Random Look Up (<a
              href="https://randomgeneratorapi.vercel.app/verify"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 underline hover:text-green-400"
            >
              randomgeneratorapi.vercel.app/verify
            </a>
            )
            <br />
            • You can check the result by going to the website and pasting Result ID (from <span className="text-green-500">History</span> tab)
            <br />
          </CardDescription>
        </CardHeader>
      </Card>

      {/* How It Works Section */}
      <Card className="border border-border bg-card">
        <CardHeader>
          <h2 className="text-xl font-semibold">How It Works</h2>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>✅ The website will generate random numbers.</p>
          <p>✅ Those numbers are being interpretted as heads or tails.</p>
          <p>✅ 1 = Heads | 0 = Tails.</p>
        </CardContent>
      </Card>
    </div>
  )
}
