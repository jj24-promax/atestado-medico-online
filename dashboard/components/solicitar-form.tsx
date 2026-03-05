"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRICE_BY_DAYS, DEFAULT_PRICE, type DaysOption } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

const DAYS_OPTIONS: { value: DaysOption; label: string }[] = [
  { value: "1", label: "1 dia" },
  { value: "2", label: "2 dias" },
  { value: "3", label: "3 dias" },
  { value: "4", label: "4 dias" },
  { value: "5", label: "5 dias" },
  { value: "6", label: "6 dias" },
  { value: "7", label: "7 dias" },
  { value: "mais", label: "Mais de 7 dias (avaliação médica)" },
];

export function SolicitarForm() {
  const [price, setPrice] = useState(DEFAULT_PRICE);
  const [daysValue, setDaysValue] = useState<DaysOption | "">("1");

  const handleDaysChange = (value: string) => {
    const next = value as DaysOption | "";
    setDaysValue(next);
    if (next && next in PRICE_BY_DAYS) {
      setPrice(PRICE_BY_DAYS[next as DaysOption]);
    } else {
      setPrice(DEFAULT_PRICE);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Futuro: enviar para API / integração de pagamento.
    // O valor atual está em `price` (e nos dados do form).
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <input type="hidden" name="amount" value={price} aria-hidden />
      {/* Dados pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="nome" className="text-sm font-medium text-slate-700">
                Nome completo *
              </label>
              <Input id="nome" name="nome" required placeholder="Seu nome completo" />
            </div>
            <div className="space-y-2">
              <label htmlFor="cpf" className="text-sm font-medium text-slate-700">
                CPF *
              </label>
              <Input id="cpf" name="cpf" required placeholder="000.000.000-00" maxLength={14} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                E-mail *
              </label>
              <Input id="email" name="email" type="email" required placeholder="seu@email.com" />
            </div>
            <div className="space-y-2">
              <label htmlFor="telefone" className="text-sm font-medium text-slate-700">
                Telefone (WhatsApp) *
              </label>
              <Input id="telefone" name="telefone" type="tel" required placeholder="(00) 00000-0000" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações de saúde */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações de saúde</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="sintomas" className="text-sm font-medium text-slate-700">
              Descreva brevemente seus sintomas ou motivo do afastamento *
            </label>
            <textarea
              id="sintomas"
              name="sintomas"
              required
              rows={4}
              placeholder="Ex.: Dor de cabeça, febre e mal-estar desde ontem..."
              className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="dias" className="text-sm font-medium text-slate-700">
              Quantos dias de afastamento você precisa? *
            </label>
            <input type="hidden" name="dias" value={daysValue} aria-hidden />
            <Select value={daysValue || undefined} onValueChange={handleDaysChange}>
              <SelectTrigger id="dias" className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="data-inicio" className="text-sm font-medium text-slate-700">
              Data de início do afastamento *
            </label>
            <Input id="data-inicio" name="data_inicio" type="date" required />
          </div>
        </CardContent>
      </Card>

      {/* Resumo do Pedido */}
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">Resumo do Pedido</CardTitle>
          <p className="text-sm text-slate-600">
            Valor atualizado de acordo com os dias de afastamento selecionados.
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-emerald-700">
            Valor a pagar: {formatCurrency(price)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Pagamento único. Em até 5 minutos você recebe seu atestado em PDF.
          </p>
        </CardContent>
      </Card>

      {/* Aviso legal */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Ao enviar, você declara que as informações são verdadeiras e aceita que um médico avalie
        seu caso para emissão do atestado, quando cabível. Seus dados são tratados de forma
        confidencial e segura.
      </div>

      {/* Botão de envio */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" className="sm:min-w-[200px]">
          Continuar para pagamento · {formatCurrency(price)}
        </Button>
        <Button type="button" variant="outline" asChild>
          <a href="/">Voltar ao início</a>
        </Button>
      </div>
    </form>
  );
}
