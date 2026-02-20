"use client";

import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
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
import { signInWithUsername } from "@/lib/auth/auth-actions";
import { redirect } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | false>(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    try {
      await signInWithUsername(formData.username, formData.password);
    } catch (err: any) {
      setError(err?.message || "Login failed");
      logger.log(err?.message || "Login failed");
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
                    <CardTitle className="text-2xl">Login to your account</CardTitle>
                    <CardDescription className="mt-1">
                      Enter your credentials to continue.
                    </CardDescription>
                  </div>

                  <CardAction>
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => redirect("/register")}
                    >
                      Sign Up
                    </Button>
                  </CardAction>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username">Username or Email</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="username or email"
                      value={formData.username}
                      onChange={handleFormChange}
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleFormChange}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
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
            className="object-cover object-middle"
          />
          {/* overlay for readability / vibe */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/30 via-black/10 to-transparent" />
        </div>
      </div>
    </div>
  );
}