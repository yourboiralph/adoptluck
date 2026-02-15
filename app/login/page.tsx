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
import { signInWithUsername } from "@/lib/auth/auth-actions";
import { redirect } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await signInWithUsername(
                formData.username,
                formData.password
            )
        } catch (error) {
            console.log(error)
        } finally{
            setIsLoading(false)
        }
    }


    return (
        <div className="flex items-center justify-center max-w-lg mx-auto h-screen font-fredoka">
            <div className="w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Login to your account.</CardTitle>
                        <CardDescription>
                            Enter your credentials to login.
                        </CardDescription>
                        <CardAction>
                            <Button variant={"outline"} onClick={() => {
                                redirect('/register')
                            }}>Sign Up</Button>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-10">
                                <div className="space-y-4">
                                    <Label htmlFor="username">Username or Email</Label>
                                    <Input
                                        id="username"
                                        type="username"
                                        name="username"
                                        placeholder="username or email"
                                        value={formData.username}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label htmlFor="password">Password</Label>
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
                                <Button type="submit">Login</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
