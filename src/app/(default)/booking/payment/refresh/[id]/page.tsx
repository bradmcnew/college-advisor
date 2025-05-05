"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export default function RefreshPage() {
  const params = useParams();
  const connectedAccountId = params.id as string;

  const [accountLinkCreatePending, setAccountLinkCreatePending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connectedAccountId) {
      setAccountLinkCreatePending(true);
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
          setAccountLinkCreatePending(false);
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
          <h2 className="text-xl font-semibold">Add information to start accepting money</h2>
          <p className="text-muted-foreground">
            College Advice partners with Stripe to help you receive payments while keeping your personal and bank details secure.
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {accountLinkCreatePending && !error && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p>Creating a new account link...</p>
            </div>
          )}

          {connectedAccountId && (
            <div className="bg-secondary p-4 rounded-md">
              <p>Your connected account ID: <code className="font-bold">{connectedAccountId}</code></p>
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
