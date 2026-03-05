"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction, PaymentStatus } from "@/types";
import { PAYMENT_STATUS_LABELS } from "@/types";

const PAGE_SIZE = 5;
const STATUS_FILTER_OPTIONS: { value: "all" | PaymentStatus; label: string }[] = [
  { value: "all", label: "Todos os status" },
  { value: "pending_pix", label: "Pix Gerado" },
  { value: "paid", label: "Pago" },
  { value: "failed", label: "Cancelado/Expirado" },
];

interface LeadsTableProps {
  data: Transaction[];
}

export function LeadsTable({ data }: LeadsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let list = data;
    if (statusFilter !== "all") {
      list = list.filter((row) => row.paymentStatus === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (row) =>
          row.customerName.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const badgeVariant = (
    status: PaymentStatus
  ): "pending_pix" | "paid" | "failed" => status;

  return (
    <Card>
      <CardHeader className="space-y-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg">Gerenciamento de Leads</CardTitle>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as "all" | PaymentStatus);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden sm:table-cell">WhatsApp / E-mail</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  Nenhum lead encontrado.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.customerName}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="block text-slate-600">{row.whatsapp}</span>
                    <span className="block text-xs text-slate-500 truncate max-w-[200px]">
                      {row.email}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {row.certificateType}
                  </TableCell>
                  <TableCell>{formatCurrency(row.amount)}</TableCell>
                  <TableCell className="hidden md:table-cell text-slate-500 text-sm">
                    {formatDate(row.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={badgeVariant(row.paymentStatus)}>
                      {PAYMENT_STATUS_LABELS[row.paymentStatus]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-600">
              Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de{" "}
              {filtered.length}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
