import type { MetadataRoute } from "next";

import { company } from "@/config/company";

const sanitizedDomain = company.domain.replace(/[{}]/g, "").trim();
const host = sanitizedDomain ? `https://${sanitizedDomain}` : undefined;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/login", "/auth"],
      },
    ],
    sitemap: host ? [`${host}/sitemap.xml`] : undefined,
    host,
  };
}

