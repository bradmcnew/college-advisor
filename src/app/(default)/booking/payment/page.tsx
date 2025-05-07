import PaymentClient from "~/app/(default)/booking/payment/PaymentClient";
import { requireAuth } from "~/lib/auth-utils";

export default async function PaymentPage() {
  await requireAuth();

  return <PaymentClient />;
}
