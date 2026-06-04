"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
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