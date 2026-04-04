export function formatClientType(value: string) {
  switch (value) {
    case "artist":
      return "Interpret";
    case "label_agency":
      return "Label / Agentura";
    case "promoter":
      return "Pořadatel";
    case "manager":
      return "Manažer";
    default:
      return value;
  }
}

export function formatClientStatus(value: string) {
  switch (value) {
    case "active":
      return "Aktivní";
    case "lead":
      return "Lead";
    case "inactive":
      return "Neaktivní";
    default:
      return value;
  }
}

export function formatPriority(value: string) {
  switch (value) {
    case "high":
      return "Vysoká";
    case "medium":
      return "Střední";
    case "low":
      return "Nízká";
    default:
      return value;
  }
}

export function formatCampaignStatus(value: string) {
  switch (value) {
    case "draft":
      return "Draft";
    case "awaiting_approval":
      return "Čeká na schválení";
    case "awaiting_assets":
      return "Čeká na podklady";
    case "preparing":
      return "Příprava";
    case "launched":
      return "Aktivní";
    case "paused":
      return "Pozastaveno";
    case "finished":
      return "Dokončeno";
    case "canceled":
      return "Zrušeno";
    default:
      return value.replaceAll("_", " ");
  }
}

export function formatPaymentStatus(value: string) {
  switch (value) {
    case "paid":
      return "Zaplaceno";
    case "awaiting_payment":
      return "Čeká na platbu";
    case "unpaid":
      return "Nezaplaceno";
    case "partially_paid":
      return "Částečně zaplaceno";
    default:
      return value.replaceAll("_", " ");
  }
}
