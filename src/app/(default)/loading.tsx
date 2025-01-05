import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-sky-100 to-gray-100 px-4 animate-in fade-in dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <div className="mx-auto max-w-md space-y-6 rounded-lg border border-border/40 bg-card p-8 text-card-foreground shadow-lg backdrop-blur-md transition-all duration-300 dark:shadow-primary/5 sm:p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10"></div>
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold text-primary">Loading</h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we prepare your experience...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
