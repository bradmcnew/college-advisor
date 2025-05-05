"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

export default function PaymentPage() {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [accountLinkCreatePending, setAccountLinkCreatePending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);

  const handleCreateAccount = async () => {
    try {
      setAccountCreatePending(true);
      setError(null);

      const response = await fetch("/api/stripe/create-connected-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.account) {
        setConnectedAccountId(data.account);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong creating your account");
    } finally {
      setAccountCreatePending(false);
    }
  };

  const handleCreateAccountLink = async () => {
    try {
      if (!connectedAccountId) return;

      setAccountLinkCreatePending(true);
      setError(null);

      const response = await fetch("/api/stripe/create-account-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: connectedAccountId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong creating account link");
    } finally {
      setAccountLinkCreatePending(false);
    }
  };

  return (
    <div className="container py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">College Advice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!connectedAccountId ? (
            <>
              <h2 className="text-xl font-semibold">Get ready for take off</h2>
              <p className="text-muted-foreground">
                College Advice is the world&apos;s leading college advising platform: join our team of advisors to help students navigate their college journey.
              </p>
              <Button
                onClick={handleCreateAccount}
                disabled={accountCreatePending}
                className="w-full sm:w-auto"
              >
                {accountCreatePending ? "Creating account..." : "Create an account!"}
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold">Add information to start accepting money</h2>
              <p className="text-muted-foreground">
                College Advice partners with Stripe to help you receive payments while keeping your personal and bank details secure.
              </p>
              <Button
                onClick={handleCreateAccountLink}
                disabled={accountLinkCreatePending}
                className="w-full sm:w-auto"
              >
                {accountLinkCreatePending ? "Creating link..." : "Add information"}
              </Button>
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {(connectedAccountId || accountCreatePending || accountLinkCreatePending) && (
            <div className="bg-secondary p-4 rounded-md">
              {connectedAccountId && (
                <p>Your connected account ID is: <code className="font-bold">{connectedAccountId}</code></p>
              )}
              {accountCreatePending && <p>Creating a connected account...</p>}
              {accountLinkCreatePending && <p>Creating a new Account Link...</p>}
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
