"use client";

export function CtaFinalSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.05] py-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_50%_0%,rgba(214,255,61,0.08),transparent_70%)]" />

      <div className="relative mx-auto max-w-[720px] px-6 text-center">
        <h2 className="font-heading text-3xl font-bold text-[#F2F3F5] sm:text-4xl lg:text-5xl">
          Que tu club se maneje solo
          <br />
          <span className="text-[#D6FF3D]">empieza hoy.</span>
        </h2>
        <p className="mt-5 text-lg text-[#9CA3AF]">
          Activá las reservas y el cobro por WhatsApp en minutos. Sin tarjeta, sin instalación, sin
          compromiso.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#planes"
            className="rounded-full bg-[#D6FF3D] px-8 py-3.5 text-base font-bold text-[#0A0B0D] no-underline transition-transform hover:scale-[1.02]"
          >
            Probar gratis
          </a>
          <a
            href="https://wa.me/5491178257528?text=Hola%20quiero%20agendar%20una%20demo"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/[0.14] px-8 py-3.5 text-base font-semibold text-[#E4E5E7] no-underline transition-colors hover:border-white/30"
          >
            Agendar una demo
          </a>
        </div>
      </div>
    </section>
  );
}
