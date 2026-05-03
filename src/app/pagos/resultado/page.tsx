import { Suspense } from "react";

import ResultadoPagoClient from "./ResultadoPagoClient";

export default function ResultadoPagoPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-600">Cargando resultado...</div>}>
      <ResultadoPagoClient />
    </Suspense>
  );
}
