"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Users,
  QrCode,
  Banknote,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface KpiCardsProps {
  totalLeads: number;
  pendingPixCount: number;
  pendingPixAmount: number;
  totalRevenue: number;
  conversionRate: number;
}

const KpiCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <span className="text-sm font-medium text-slate-600">{title}</span>
      <Icon className="h-4 w-4 text-slate-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      )}
    </CardContent>
  </Card>
);

export function KpiCards({
  totalLeads,
  pendingPixCount,
  pendingPixAmount,
  totalRevenue,
  conversionRate,
}: KpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Total de Leads"
        value={totalLeads}
        subtitle="Todos os registros"
        icon={Users}
      />
      <KpiCard
        title="Pix Gerados"
        value={pendingPixCount}
        subtitle={formatCurrency(pendingPixAmount) + " aguardando"}
        icon={QrCode}
      />
      <KpiCard
        title="Faturamento Total"
        value={formatCurrency(totalRevenue)}
        subtitle="Pix já pagos"
        icon={Banknote}
      />
      <KpiCard
        title="Taxa de Conversão"
        value={`${conversionRate.toFixed(1)}%`}
        subtitle="Leads que pagaram"
        icon={TrendingUp}
      />
    </div>
  );
}
