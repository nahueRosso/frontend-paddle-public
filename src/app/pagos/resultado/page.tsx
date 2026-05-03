"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchBillingBookingStatus } from "@/lib/api/booking";
import {
  clearPendingBookingPayments,
  listPendingBookingPayments,
} from "@/lib/pending-booking-payment";
import type { BillingBookingStatusResponse } from "@/types/booking";

type ResultUiState =
  | "loading"
  | "processing"
  | "confirmed"
  | "pending"
  | "failed"
  | "expired"
  | "unknown";

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function normalizeBackendStatus(
  response: BillingBookingStatusResponse | null,
  queryStatus: string | null,
): ResultUiState {
  const paymentStatus =
    getString(response?.paymentStatus) ??
    getString(response?.billingPayment?.status) ??
    getString(response?.status);
  const bookingStatus =
    getString(response?.bookingStatus) ??
    getString(response?.booking?.status);

  if (bookingStatus === "confirmed") {
    return "confirmed";
  }

  if (bookingStatus === "expired" || bookingStatus === "cancelled") {
    return "expired";
  }

  if (paymentStatus === "approved") {
    return "processing";
  }

  if (paymentStatus === "pending" || paymentStatus === "in_process") {
    return "pending";
  }

  if (
    paymentStatus === "rejected" ||
    paymentStatus === "failure" ||
    paymentStatus === "failed" ||
    paymentStatus === "cancelled"
  ) {
    return "failed";
  }

  if (bookingStatus === "pending") {
    return queryStatus === "approved" ? "processing" : "pending";
  }

  if (queryStatus === "approved") {
    return "processing";
  }

  if (queryStatus === "pending" || queryStatus === "in_process") {
    return "pending";
  }

  if (
    queryStatus === "rejected" ||
    queryStatus === "failure" ||
    queryStatus === "failed"
  ) {
    return "failed";
  }

  return response ? "unknown" : "loading";
}

function matchPendingPayment(
  pending: ReturnType<typeof listPendingBookingPayments>[number]["value"],
  response: BillingBookingStatusResponse | null,
  externalReference: string | null,
) {
  const responseBookingId =
    getString(response?.bookingId) ?? getString(response?.booking?.id);
  const responseExternalReference =
    getString(response?.externalReference) ??
    getString(response?.billingPayment?.externalReference);

  return Boolean(
    (externalReference &&
      pending.externalReference &&
      pending.externalReference === externalReference) ||
    (responseExternalReference &&
      pending.externalReference &&
      pending.externalReference === responseExternalReference) ||
    (responseBookingId && pending.bookingId === responseBookingId),
  );
}

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const [backendResponse, setBackendResponse] =
    useState<BillingBookingStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const externalReference = searchParams.get("external_reference");
  const queryStatus = searchParams.get("status");
  const paymentId = searchParams.get("payment_id");

  const pendingPayment = useMemo(() => {
    if (!externalReference) {
      return listPendingBookingPayments()[0]?.value ?? null;
    }

    return (
      listPendingBookingPayments().find((entry) =>
        matchPendingPayment(entry.value, backendResponse, externalReference),
      )?.value ?? null
    );
  }, [backendResponse, externalReference]);

  const clubHref = pendingPayment?.slug
    ? `/clubes/${pendingPayment.slug}/turnos`
    : "/clubes";

  const uiState = normalizeBackendStatus(backendResponse, queryStatus);
  const shouldPoll =
    Boolean(externalReference) &&
    (uiState === "processing" || uiState === "pending" || uiState === "loading") &&
    attempts < 20;

  useEffect(() => {
    if (!externalReference) {
      setError("No recibimos una referencia de pago valida.");
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setIsPolling(true);
        const response = await fetchBillingBookingStatus(externalReference);
        if (!cancelled) {
          setBackendResponse(response);
          setError(null);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "No pudimos consultar el estado del pago.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsPolling(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [externalReference]);

  useEffect(() => {
    if (!shouldPoll || !externalReference) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setAttempts((current) => current + 1);

      try {
        setIsPolling(true);
        const response = await fetchBillingBookingStatus(externalReference);
        setBackendResponse(response);
        setError(null);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "No pudimos consultar el estado del pago.",
        );
      } finally {
        setIsPolling(false);
      }
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [externalReference, shouldPoll]);

  useEffect(() => {
    if (uiState !== "confirmed" && uiState !== "failed" && uiState !== "expired") {
      return;
    }

    clearPendingBookingPayments((pending) =>
      matchPendingPayment(pending, backendResponse, externalReference),
    );
  }, [backendResponse, externalReference, uiState]);

  const title =
    uiState === "confirmed"
      ? "Reserva confirmada"
      : uiState === "failed"
        ? "No pudimos confirmar el pago"
        : uiState === "expired"
          ? "La reserva expiro"
          : uiState === "pending"
            ? "Pago pendiente"
            : "Pago recibido, confirmando tu reserva...";

  const description =
    uiState === "confirmed"
      ? "El backend ya confirmo el pago y la reserva del turno."
      : uiState === "failed"
        ? "Mercado Pago no confirmo el pago o el intento fue rechazado."
        : uiState === "expired"
          ? "El turno ya no esta disponible o la reserva pending vencio antes de confirmarse."
          : uiState === "pending"
            ? "Tu pago sigue pendiente. Vamos a seguir consultando unos segundos mas."
            : "Estamos validando el pago real contra backend antes de darte la confirmacion final.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#ecfdf5_48%,_#f8fafc_100%)] px-4 py-16 dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#052e2b_45%,_#020617_100%)]">
      <Card className="w-full max-w-2xl rounded-[2rem] border-emerald-100 bg-white/90 shadow-xl shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/85 dark:shadow-emerald-950/30">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            {uiState === "confirmed" ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-300" />
            ) : uiState === "failed" || uiState === "expired" ? (
              <XCircle className="h-8 w-8 text-rose-600 dark:text-rose-300" />
            ) : uiState === "pending" ? (
              <Clock3 className="h-8 w-8 text-amber-600 dark:text-amber-300" />
            ) : (
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-300" />
            )}
            <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">
              {title}
            </CardTitle>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-slate-700 dark:text-slate-300">
              Estado reportado por Mercado Pago: <strong>{queryStatus ?? "sin dato"}</strong>
            </p>
            <p className="mt-1 text-slate-700 dark:text-slate-300">
              Referencia: <strong>{externalReference ?? "sin referencia"}</strong>
            </p>
            {paymentId ? (
              <p className="mt-1 text-slate-700 dark:text-slate-300">
                Payment ID: <strong>{paymentId}</strong>
              </p>
            ) : null}
            {backendResponse?.booking?.status || backendResponse?.bookingStatus ? (
              <p className="mt-1 text-slate-700 dark:text-slate-300">
                Estado backend de la reserva:{" "}
                <strong>
                  {getString(backendResponse?.bookingStatus) ??
                    getString(backendResponse?.booking?.status)}
                </strong>
              </p>
            ) : null}
            {backendResponse?.paymentStatus || backendResponse?.billingPayment?.status ? (
              <p className="mt-1 text-slate-700 dark:text-slate-300">
                Estado backend del pago:{" "}
                <strong>
                  {getString(backendResponse?.paymentStatus) ??
                    getString(backendResponse?.billingPayment?.status)}
                </strong>
              </p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          {shouldPoll || isPolling ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-200">
              Estamos esperando la confirmacion final del backend. Si Mercado Pago ya aprobo el pago, este paso puede tardar unos segundos mientras entra el webhook.
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400">
              <Link href={clubHref}>Volver a los turnos</Link>
            </Button>
            {pendingPayment?.checkoutUrl && (uiState === "pending" || uiState === "processing") ? (
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = pendingPayment.checkoutUrl;
                }}
                className="border-amber-300 bg-white text-amber-900 hover:bg-amber-50 dark:border-amber-900/60 dark:bg-slate-950 dark:text-amber-100 dark:hover:bg-amber-500/10"
              >
                Reabrir pago
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
