"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type GeoRefEntry = { id: string; nombre: string };

type CityComboboxProps = {
  province: string;
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

const GEOREF_BASE = "https://apis.datos.gob.ar/georef/api";

const PROVINCE_ALIAS: Record<string, string> = {
  CABA: "Ciudad Autónoma de Buenos Aires",
};

async function fetchGeoRef(
  endpoint: string,
  province: string,
  signal: AbortSignal,
): Promise<GeoRefEntry[]> {
  const params = new URLSearchParams({
    provincia: PROVINCE_ALIAS[province] ?? province,
    campos: "id,nombre",
    max: "999",
    orden: "nombre",
  });

  const res = await fetch(`${GEOREF_BASE}/${endpoint}?${params.toString()}`, {
    signal,
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data[endpoint] ?? [];
}

function mergeAndDedupe(
  municipios: GeoRefEntry[],
  localidades: GeoRefEntry[],
): GeoRefEntry[] {
  const seen = new Set<string>();
  const result: GeoRefEntry[] = [];

  for (const entry of [...municipios, ...localidades]) {
    const key = entry.nombre.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(entry);
  }

  return result.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export function CityCombobox({
  province,
  value,
  onChange,
  placeholder = "Seleccionar ciudad",
  disabled,
}: CityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<GeoRefEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const fetchCities = useCallback(async (prov: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setCities([]);

    try {
      const [municipios, localidades] = await Promise.all([
        fetchGeoRef("municipios", prov, controller.signal),
        fetchGeoRef("localidades", prov, controller.signal),
      ]);

      setCities(mergeAndDedupe(municipios, localidades));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!province) {
      setCities([]);
      return;
    }
    void fetchCities(province);
  }, [province, fetchCities]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || !province}
          className={cn(
            "h-9 w-full min-w-0 rounded-md border border-white/10 bg-[#0A0B0D] px-3 py-1 text-sm text-[#E4E5E7] shadow-xs transition-[color,box-shadow] outline-none",
            "focus-visible:border-[#D6FF3D]/50 focus-visible:ring-[#D6FF3D]/20 focus-visible:ring-[3px]",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "flex items-center justify-between gap-2",
            !value && "text-[#6B7280]",
          )}
        >
          <span className="truncate text-left">
            {value || (!province ? "Elegí una provincia primero" : placeholder)}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] rounded-md border border-white/10 bg-[#111417] p-0 text-[#E4E5E7] shadow-md"
        align="start"
      >
        <Command shouldFilter={true} className="bg-transparent text-inherit">
          <CommandInput
            placeholder="Buscar ciudad o pueblo..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando...
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {search.trim().length >= 2 ? (
                    <button
                      type="button"
                      className="w-full px-2 py-1 text-left text-sm hover:underline"
                      onClick={() => {
                        onChange(search.trim());
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      Usar &quot;{search.trim()}&quot;
                    </button>
                  ) : (
                    "No se encontraron resultados."
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {cities.map((city) => (
                    <CommandItem
                      key={city.id}
                      value={city.nombre}
                      onSelect={(currentValue) => {
                        onChange(currentValue === value ? "" : currentValue);
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === city.nombre ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {city.nombre}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
