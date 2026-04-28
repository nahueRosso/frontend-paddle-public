import type { MetadataRoute } from "next";

import { company } from "@/config/company";

const sanitizedDomain = company.domain.replace(/[{}]/g, "").trim();
const baseUrl = sanitizedDomain ? `https://${sanitizedDomain}` : "https://example.com";

const routes = ["/", "/contacto", "/privacidad", "/terminos"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
  }));
}

