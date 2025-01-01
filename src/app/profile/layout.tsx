import { type PropsWithChildren } from "react";

export default function ProfileLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-200 via-indigo-200 to-emerald-200 px-8 py-8 pt-24 dark:from-gray-950 dark:via-slate-900 dark:to-blue-950">
      <div className="w-full max-w-2xl space-y-6 rounded-lg bg-card p-8 text-card-foreground shadow-lg transition-all duration-300 dark:shadow-primary/5 sm:p-16">
        {children}
      </div>
    </div>
  );
}
