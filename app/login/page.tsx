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
import { signInWithEmail } from "@/lib/auth/auth-actions";
import { useState } from "react";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
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
            await signInWithEmail(
                formData.email,
                formData.password
            )
        } catch (error) {
            console.log(error)
        } finally{
            setIsLoading(false)
        }
    }


    return (
        <div className="flex items-center justify-center max-w-lg mx-auto h-screen">
            <div className="w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Login to your account.</CardTitle>
                        <CardDescription>
                            Enter your credentials to login.
                        </CardDescription>
                        <CardAction>
                            <Button variant={"outline"}>Sign Up</Button>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-10">
                                <div className="space-y-4">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="youremail@email.com"
                                        value={formData.email}
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
