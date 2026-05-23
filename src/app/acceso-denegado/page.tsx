export default function AccessDeniedPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-6 py-16">
      <section className="w-full rounded-[2rem] border border-rose-200 bg-white p-8 shadow-lg shadow-rose-100/60">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">
          Acceso restringido
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">
          No tenés permisos para continuar
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          La sesión actual no alcanza para esta operación. Volvé a iniciar sesión
          o verificá tu acceso con el club correspondiente.
        </p>
      </section>
    </main>
  );
}
