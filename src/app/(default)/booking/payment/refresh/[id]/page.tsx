"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export default function RefreshClient() {
  const params = useParams();
  const connectedAccountId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connectedAccountId) {
      setIsLoading(true);
      setError(null);

      fetch("/api/stripe/create-account-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: connectedAccountId,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            throw new Error(data.error);
          }

          if (data.url) {
            window.location.href = data.url;
          } else {
            throw new Error("No redirect URL returned");
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Something went wrong");
          setIsLoading(false);
        });
    }
  }, [connectedAccountId]);

  return (
    <div className="container py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">College Advice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <h2 className="text-xl font-semibold">Continuing your account setup</h2>
          <p className="text-muted-foreground">
            We&apos;re redirecting you back to complete your account setup.
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && !error && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p>Preparing your onboarding form...</p>
            </div>
          )}

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
