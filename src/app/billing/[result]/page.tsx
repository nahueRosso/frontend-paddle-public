import { redirect } from "next/navigation";

export default async function BillingRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ result: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ result }, rawSearchParams] = await Promise.all([params, searchParams]);
  const nextSearchParams = new URLSearchParams();

  nextSearchParams.set("mp_result", result);

  for (const [key, value] of Object.entries(rawSearchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        nextSearchParams.append(key, item);
      }
      continue;
    }

    if (typeof value === "string") {
      nextSearchParams.set(key, value);
    }
  }

  redirect(`/pagos/resultado?${nextSearchParams.toString()}`);
}
