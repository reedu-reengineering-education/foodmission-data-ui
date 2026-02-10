"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Loader2, Key } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SignIn() {
    const [loading, setLoading] = useState(false);

    return (
        <Card className="max-w-lg">
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">

                    <div className={cn(
                        "w-full gap-2 flex items-center",
                        "justify-between flex-col"
                    )}>
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            disabled={loading}
                            onClick={async () => {
                                await authClient.signIn.oauth2(
                                    {
                                        providerId: "keycloak",
                                        callbackURL: "/",
                                    },
                                    {
                                        onRequest: () => {
                                            setLoading(true);
                                        },
                                        onResponse: () => {
                                            setLoading(false);
                                        },
                                    }
                                );
                            }}
                        >

                            Sign in with FOODMISSION
                        </Button>
                    </div>
                </div>
            </CardContent>

        </Card>
    );
}