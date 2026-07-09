import { XCircle } from "lucide-react";
import { PaymentResult } from "@/components/payment-result";

export const metadata = {
  title: "Pago no completado"
};

export default function PaymentFailurePage({
  searchParams
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  return (
    <PaymentResult
      icon={XCircle}
      searchParams={searchParams}
      status="failure"
      title="Pago no completado"
    />
  );
}

