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
  legalName: "Mi Club Pádel",
  cuit: "",
  email: "contacto@miclubpadel.com",
  phone: "+54 9 11 2345-6789",
  legalPhone: "",
  address: "Argentina",
  province: "Buenos Aires",
  locality: "Argentina",
  domain: "miclubpadel.com",
  relatedDomains: ["admin.miclubpadel.com", "api.miclubpadel.com"],
  shortDescription:
    "Plataforma de gestión, reservas y cobros online para clubes de pádel.",
  fiscalCondition: "",
  activity: "Software y servicios digitales para clubes de pádel",
  foundingDate: "2013",
  sameAs: [],
};
