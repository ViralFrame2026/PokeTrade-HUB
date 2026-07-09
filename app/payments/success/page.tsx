import { CheckCircle2 } from "lucide-react";
import { PaymentResult } from "@/components/payment-result";

export const metadata = {
  title: "Pago aprobado"
};

export default function PaymentSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  return (
    <PaymentResult
      icon={CheckCircle2}
      searchParams={searchParams}
      status="success"
      title="Pago aprobado"
    />
  );
}

