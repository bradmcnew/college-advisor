import SetupPaymentClient from "~/app/(default)/booking/setup-payment/SetupPaymentClient";
import { requireAuth } from "~/lib/auth-utils";

export default async function SetupPaymentPage() {
  await requireAuth();
  return <SetupPaymentClient />;
}
