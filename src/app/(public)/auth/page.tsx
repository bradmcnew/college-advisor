import { LoginPage } from "~/app/components/Login";

export default async function AuthPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-sky-100 to-gray-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <LoginPage />
    </main>
  );
}
