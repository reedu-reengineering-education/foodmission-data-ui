"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Key } from "lucide-react";

export default function SignIn({
  callbackUrl = "/",
}: {
  callbackUrl?: string;
}) {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Sign in with your FOODMISSION account to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <a
          href={`/api/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
        >
          <Button variant="outline" className="w-full gap-2">
            <Key className="size-4" />
            Sign in with FOODMISSION
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}
