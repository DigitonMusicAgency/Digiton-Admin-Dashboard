export type BizKitHubCustomerPayload = {
  companyName: string;
  email: string;
  country?: string;
  note?: string;
  formData?: Record<string, string>;
};

export type BizKitHubOrderPayload = {
  orderGroupId: string;
  locale: string;
  currency: string;
  customer: {
    email: string;
    companyName: string;
    country?: string;
    refNo?: string;
  };
  items: Array<{
    label: string;
    count: number;
    price: number;
    vat: number;
    unit?: string;
    productCode?: string;
  }>;
  publicNotice?: string;
  internalNotice?: string;
  formData?: Record<string, string>;
};

export type BizKitHubSyncResponse = {
  externalId: string;
  raw: unknown;
};
