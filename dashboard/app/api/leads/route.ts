import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { MOCK_TRANSACTIONS } from "@/lib/mock-data";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-server";
import type { Transaction } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

function corsHeaders(origin?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  return headers;
}

/** Converte linha do Supabase (snake_case) para Transaction */
function rowToTransaction(row: {
  id: string;
  customer_name: string;
  email: string;
  whatsapp: string;
  certificate_type: string;
  payment_status: string;
  amount: number;
  created_at: string;
}): Transaction {
  return {
    id: row.id,
    customerName: row.customer_name ?? "",
    email: row.email ?? "",
    whatsapp: row.whatsapp ?? "",
    certificateType: (row.certificate_type as Transaction["certificateType"]) ?? "Atestado Médico",
    paymentStatus: (row.payment_status as Transaction["paymentStatus"]) ?? "pending_pix",
    amount: Number(row.amount) ?? 39.9,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

async function readStoredLeadsFile(): Promise<Transaction[]> {
  try {
    const raw = await fs.readFile(LEADS_FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeStoredLeadsFile(leads: Transaction[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  try {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data: rows, error } = await supabaseAdmin
        .from("leads")
        .select("id, customer_name, email, whatsapp, certificate_type, payment_status, amount, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const fromDb = (rows ?? []).map(rowToTransaction);
      const all = [...MOCK_TRANSACTIONS, ...fromDb].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return NextResponse.json(all, { headers: corsHeaders(origin) });
    }
    const stored = await readStoredLeadsFile();
    const all = [...MOCK_TRANSACTIONS, ...stored].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(all, { headers: corsHeaders(origin) });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao carregar leads" },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders("*"),
  });
}

type LeadBody = {
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
  sintomas?: string;
  dias?: string;
  data_inicio?: string;
  amount?: string | number;
};

function mapToTransaction(body: LeadBody): Transaction {
  const id = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const amount = typeof body.amount === "string" ? parseFloat(body.amount) || 39.9 : (body.amount ?? 39.9);
  return {
    id,
    customerName: body.nome?.trim() || "—",
    email: body.email?.trim() || "",
    whatsapp: body.telefone?.trim() || "",
    certificateType: "Atestado Médico",
    paymentStatus: "pending_pix",
    amount,
    createdAt: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  try {
    const body = (await request.json()) as LeadBody;
    if (!body.nome || !body.email || !body.telefone) {
      return NextResponse.json(
        { error: "Nome, e-mail e telefone são obrigatórios." },
        { status: 400, headers: corsHeaders(origin) }
      );
    }
    const amount = typeof body.amount === "string" ? parseFloat(body.amount) || 39.9 : (body.amount ?? 39.9);

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from("leads").insert({
        customer_name: body.nome.trim(),
        email: body.email.trim(),
        whatsapp: body.telefone.trim(),
        cpf: body.cpf?.trim() ?? null,
        certificate_type: "Atestado Médico",
        payment_status: "pending_pix",
        amount,
        sintomas: body.sintomas?.trim() ?? null,
        dias: body.dias ?? null,
        data_inicio: body.data_inicio ?? null,
      }).select("id").single();
      if (error) throw error;
      return NextResponse.json(
        { ok: true, id: data?.id },
        { status: 201, headers: corsHeaders(origin) }
      );
    }

    const stored = await readStoredLeadsFile();
    const newLead = mapToTransaction(body);
    stored.push(newLead);
    await writeStoredLeadsFile(stored);
    return NextResponse.json(
      { ok: true, id: newLead.id },
      { status: 201, headers: corsHeaders(origin) }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao salvar lead" },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}
