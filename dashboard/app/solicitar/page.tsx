import { SolicitarForm } from "@/components/solicitar-form";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function SolicitarPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 text-slate-900 hover:text-emerald-600">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <span className="font-semibold">Atestado Médico Online</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Solicitar Atestado Médico
          </h1>
          <p className="mt-2 text-slate-600">
            Preencha o questionário abaixo. Em até 5 minutos você recebe seu atestado em PDF.
          </p>
        </div>

        <SolicitarForm />
      </main>
    </div>
  );
}
