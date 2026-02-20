"use client";

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import VerifyUsername from "@/components/verify-username";
import { signUpWithUsername } from "@/lib/auth/auth-actions";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    username: "",
    confirmPassword: "",
    robloxId: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [randWords, setRandWords] = useState("");
  const [usernameVerified, setUsernameVerified] = useState(false);

  const WORDS = useMemo(
    () => [
      "apple",
      "tiger",
      "cloud",
      "lucky",
      "rocket",
      "dragon",
      "silver",
      "matrix",
      "shadow",
      "pixel",
      "neon",
      "storm",
      "galaxy",
      "ember",
      "coin",
      "mint",
      "orbit",
      "panda",
      "ruby",
      "zebra",
      "alpha",
      "omega",
      "crystal",
      "nova",
      "flame",
    ],
    []
  );

  function generateRandomPhrase(wordCount = 6): string {
    const result: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * WORDS.length);
      result.push(WORDS[randomIndex]);
    }
    return result.join(" ");
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === "username") setUsernameVerified(false);
  };

  const handleVerifyUsername = async () => {
    setError("");

    const res = await fetch("/api/roblox/verify-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.username,
        phrase: randWords,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      setUsernameVerified(false);
      setError(data?.error || "Verification failed");
      return;
    }

    if (!data.verified) {
      setUsernameVerified(false);
      setError("Bio not updated yet. Paste the words into your Roblox bio then try again.");
      return;
    }

    setFormData((prev) => ({ ...prev, robloxId: data.userId }));
    setUsernameVerified(true);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usernameVerified) {
      setError("Please verify your username first.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await signUpWithUsername(
        formData.username,
        formData.password,
        formData.robloxId,
        formData.name || formData.username
      );

      if (!res?.ok) {
        setError(res?.error || "Signup failed");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      logger.log(err);
      setError(err?.message ?? "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* LEFT: FORM */}
        <div className="relative flex items-center justify-center px-6 py-12 lg:px-12">
          {/* subtle background glow */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute left-[-80px] top-[-80px] h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-[-80px] right-[-80px] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          </div>

          <div className="relative w-full max-w-md font-fredoka">
            <Card className="border-border/60 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">Register an account</CardTitle>
                    <CardDescription className="mt-1">
                      Use your Roblox username, then verify it.
                    </CardDescription>
                  </div>

                  <CardAction>
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => router.push("/login")}
                    >
                      Sign In
                    </Button>
                  </CardAction>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-5">
                  {error && (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username">Username (Roblox username)</Label>
                    <Input
                      id="username"
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleFormChange}
                      required
                    />

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <VerifyUsername
                        open={verifyOpen}
                        onOpenChange={(open) => {
                          setVerifyOpen(open);
                          if (open) setRandWords(generateRandomPhrase());
                        }}
                        randWords={randWords}
                        onConfirm={handleVerifyUsername}
                        trigger={
                          <Button type="button" variant="outline" className="w-full sm:w-auto">
                            Verify Username
                          </Button>
                        }
                      />

                      <div className="flex items-center gap-2">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs",
                            usernameVerified
                              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                              : "border border-red-500/30 bg-red-500/10 text-red-200",
                          ].join(" ")}
                        >
                          {usernameVerified ? "Verified ✅" : "Not verified"}
                        </span>
                      </div>
                    </div>

                    {!usernameVerified && (
                      <p className="text-xs text-muted-foreground">
                        Tip: Put the generated words into your Roblox bio, then click verify again.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password (not your Roblox password)</Label>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleFormChange}
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Register"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RIGHT: POSTER */}
        <div className="relative hidden lg:block">
          <Image
            src="/poster.png"
            alt="Poster"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/30 via-black/10 to-transparent" />
        </div>
      </div>
    </div>
  );
}