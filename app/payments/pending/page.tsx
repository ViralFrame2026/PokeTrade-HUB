import { Clock3 } from "lucide-react";
import { PaymentResult } from "@/components/payment-result";

export const metadata = {
  title: "Pago pendiente"
};

export default function PaymentPendingPage({
  searchParams
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  return (
    <PaymentResult
      icon={Clock3}
      searchParams={searchParams}
      status="pending"
      title="Pago pendiente"
    />
  );
}

