export interface CompanyInfo {
  brandName: string;
  legalName: string;
  cuit: string;
  email: string;
  phone: string;
  legalPhone: string;
  address: string;
  province: string;
  locality: string;
  domain: string;
  relatedDomains: string[];
  shortDescription: string;
  fiscalCondition: string;
  activity: string;
  foundingDate: string;
  sameAs: string[];
}

export const company: CompanyInfo = {
  brandName: "Mi Club Pádel",
  legalName: "ROJO RUBEN ARIEL",
  cuit: "20-25397719-2",
  email: "contacto@miclubpadel.com",
  phone: "+54 9 11 2345-6789",
  legalPhone: "+54 9 2923 507531",
  address: "Huanguelén, Provincia de Buenos Aires, Argentina",
  province: "Buenos Aires",
  locality: "Huanguelén",
  domain: "miclubpadel.com",
  relatedDomains: ["admin.miclubpadel.com", "api.miclubpadel.com"],
  shortDescription:
    "Plataforma de gestión, reservas y cobros online para clubes de pádel.",
  fiscalCondition:
    "Responsable Inscripto (IVA Inscripto, Ganancias Personas Físicas)",
  activity:
    "Fabricación de productos metálicos de tornería y/o matricería (Industria manufacturera)",
  foundingDate: "2013",
  sameAs: [],
};
