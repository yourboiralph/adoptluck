"use client";

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
import VerifyUsername from "@/components/verify-username";
import { signUpWithUsername } from "@/lib/auth/auth-actions";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: "",
        name: "",
        password: "",
        username: "",
        confirmPassword: "",
        robloxId: 0
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [verifyOpen, setVerifyOpen] = useState(false);
    const [randWords, setRandWords] = useState("");
    const [usernameVerified, setUsernameVerified] = useState(false);

    const WORDS = useMemo(
        () => [
            "apple", "tiger", "cloud", "lucky", "rocket",
            "dragon", "silver", "matrix", "shadow", "pixel",
            "neon", "storm", "galaxy", "ember", "coin",
            "mint", "orbit", "panda", "ruby", "zebra",
            "alpha", "omega", "crystal", "nova", "flame",
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

        setFormData((prev) => ({ ...prev, robloxId: data.userId }))
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
            console.log(err);
            setError(err?.message ?? "Signup failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center max-w-lg mx-auto h-screen font-fredoka">
            <div className="w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Register an account.</CardTitle>
                        <CardDescription>Provide credentials for your account.</CardDescription>

                        <CardAction>
                            <Button variant="outline" onClick={() => router.push("/login")}>
                                Sign In
                            </Button>
                        </CardAction>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSignUp}>
                            <div className="grid gap-10">
                                {error && (
                                    <div className="border border-red-700 px-2 py-1 rounded-lg bg-red-800">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <Label htmlFor="username">Username (Use your Roblox username)</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleFormChange}
                                        required
                                    />

                                    <div className="flex items-center space-x-4">
                                        <VerifyUsername
                                            open={verifyOpen}
                                            onOpenChange={(open) => {
                                                setVerifyOpen(open);

                                                // generate a fresh phrase when opening
                                                if (open) setRandWords(generateRandomPhrase());
                                            }}
                                            randWords={randWords}
                                            onConfirm={handleVerifyUsername}
                                            trigger={<Button variant="outline">Verify Username</Button>}
                                        />

                                        {usernameVerified ? (
                                            <p className="text-green-500">Username verified ✅</p>
                                        ) : (
                                            <p className="text-red-500">Username not verified.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label htmlFor="password">
                                        Password (Do not use your Roblox password)
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        placeholder="*********"
                                        value={formData.password}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="*********"
                                        value={formData.confirmPassword}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>

                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Registering..." : "Register"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
