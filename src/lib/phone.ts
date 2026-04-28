export function phoneToWaDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function phoneToWaLink(phone: string): string {
  const digits = phoneToWaDigits(phone);
  return `https://wa.me/${digits}`;
}

