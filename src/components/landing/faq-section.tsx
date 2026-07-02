"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "¿Cómo funciona la prueba gratis?",
    a: "Elegís un plan, completás los datos de tu club y listo. Tenés acceso completo durante el periodo de prueba sin necesidad de tarjeta de crédito. Al terminar, podés suscribirte o tu cuenta se pausa automáticamente.",
  },
  {
    q: "¿Necesito instalar algo?",
    a: "No. Todo funciona desde el navegador. El panel de administración está en admin.miclubpadel.com y tus jugadores usan la app en app.miclubpadel.com o directamente WhatsApp.",
  },
  {
    q: "¿Puedo cambiar de plan después?",
    a: "Sí, podés subir o bajar de plan en cualquier momento. El cambio se aplica de forma inmediata y se ajusta la facturación proporcionalmente.",
  },
  {
    q: "¿Cómo se integra con Mercado Pago?",
    a: "Conectás tu cuenta de Mercado Pago desde el panel de administración. A partir de ahí, todas las señas, inscripciones y pagos se cobran automáticamente y el dinero llega directo a tu cuenta.",
  },
  {
    q: "¿Qué pasa con mis datos si cancelo?",
    a: "Si cancelás, tu cuenta se pausa y dejás de tener acceso. Podés solicitar la eliminación completa de tus datos en cualquier momento desde la sección de seguridad.",
  },
  {
    q: "¿Funciona con WhatsApp Business?",
    a: "Sí. El bot de IA se conecta a tu WhatsApp Business para atender consultas, tomar reservas y cobrar señas de forma automática, las 24 horas del día.",
  },
];

export function FaqSection() {
  return (
    <section className="border-t border-white/[0.05] py-24">
      <div className="mx-auto max-w-[720px] px-6">
        <h2 className="text-center font-heading text-3xl font-bold text-[#F2F3F5] sm:text-4xl">
          Preguntas frecuentes
        </h2>

        <Accordion type="single" collapsible className="mt-12">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border-b border-white/[0.07]"
            >
              <AccordionTrigger className="py-5 text-left text-base font-semibold text-[#F2F3F5] hover:text-[#D6FF3D] hover:no-underline [&[data-state=open]]:text-[#D6FF3D]">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-[#9CA3AF]">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
