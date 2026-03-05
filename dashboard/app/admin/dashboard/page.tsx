"use client";

import { useEffect, useState } from "react";
import { MOCK_TRANSACTIONS } from "@/lib/mock-data";
import type { Transaction } from "@/types";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { LeadsTable } from "@/components/dashboard/leads-table";
import { FileText } from "lucide-react";

function computeKpis(transactions: Transaction[]) {
  const totalLeads = transactions.length;
  const paid = transactions.filter((t) => t.paymentStatus === "paid");
  const pendingPix = transactions.filter((t) => t.paymentStatus === "pending_pix");
  const totalRevenue = paid.reduce((acc, t) => acc + t.amount, 0);
  const pendingPixAmount = pendingPix.reduce((acc, t) => acc + t.amount, 0);
  const conversionRate = totalLeads > 0 ? (paid.length / totalLeads) * 100 : 0;

  return {
    totalLeads,
    pendingPixCount: pendingPix.length,
    pendingPixAmount,
    totalRevenue,
    conversionRate,
  };
}

export default function AdminDashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.ok ? res.json() : [])
      .then((data: Transaction[]) => {
        if (Array.isArray(data) && data.length > 0) setTransactions(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = computeKpis(transactions);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-xs text-slate-500">
              Atestados Médicos · Funil de vendas
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section>
            <h2 className="sr-only">Métricas</h2>
            <KpiCards
              totalLeads={kpis.totalLeads}
              pendingPixCount={kpis.pendingPixCount}
              pendingPixAmount={kpis.pendingPixAmount}
              totalRevenue={kpis.totalRevenue}
              conversionRate={kpis.conversionRate}
            />
          </section>

          <section>
            <h2 className="sr-only">Tabela de leads</h2>
            <LeadsTable data={transactions} />
          </section>
        </div>
      </main>
    </div>
  );
}
