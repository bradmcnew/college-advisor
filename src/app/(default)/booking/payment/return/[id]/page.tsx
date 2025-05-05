"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function ReturnPage() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get("account");

  return (
    <div className="container py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">College Advice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold">Details submitted</h2>
          </div>

          <p className="text-muted-foreground">
            That&apos;s everything we need for now. Your Stripe account is being set up and you&apos;ll be able to receive payments soon.
          </p>

          {accountId && (
            <div className="bg-secondary p-4 rounded-md">
              <p>Your connected account ID: <code className="font-bold">{accountId}</code></p>
            </div>
          )}

          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>

          <div className="bg-secondary/50 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">
              This is a sample app for Stripe-hosted Connect onboarding.
              <a
                href="https://docs.stripe.com/connect/onboarding/quickstart?connect-onboarding-surface=hosted"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-primary hover:underline"
              >
                View docs
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
