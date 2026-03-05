export type PaymentStatus = "pending_pix" | "paid" | "failed";

export type CertificateType =
  | "Atestado Médico"
  | "Atestado de Saúde Ocupacional"
  | "Atestado de Acompanhante"
  | "Declaração de Comparecimento";

export interface Transaction {
  id: string;
  customerName: string;
  email: string;
  whatsapp: string;
  certificateType: CertificateType;
  paymentStatus: PaymentStatus;
  amount: number;
  createdAt: string;
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending_pix: "Pix Gerado",
  paid: "Pago",
  failed: "Cancelado/Expirado",
};
