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
import { signUpWithUsername } from "@/lib/auth/auth-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        password: "",
        username: "",
        confirmPassword: ""
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter()

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };


    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()

        if(formData.password !== formData.password) {
            setError("Password don't match")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            await signUpWithUsername(
                formData.email,
                formData.password,
                formData.username,
                formData.name
            )
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div className="flex items-center justify-center max-w-lg mx-auto h-screen">
            <div className="w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Register an account.</CardTitle>
                        <CardDescription>
                            Provide credentials for your account.
                        </CardDescription>
                        <CardAction>
                            <Button variant={"outline"}>Sign In</Button>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSignUp}>
                            <div className="grid gap-10">
                                {/* <div className="space-y-4">
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
                                </div> */}
                                <div className="space-y-4">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        type="username"
                                        name="username"
                                        placeholder="yourusername1"
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
                                <Button type="submit">Register</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
