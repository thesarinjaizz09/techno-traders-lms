const COUNTRY_CODES = [
  { code: "+1", label: "US" },
  { code: "+44", label: "UK" },
  { code: "+91", label: "IN" },
];

const MAIL_STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  IDLE: "secondary",
  SENT: "default",
  FAILED: "destructive",
}

const LEAD_STATUS = [
  {
    label: "NEW",
    value: "NEW",
  },
  {
    label: "CONTACTED",
    value: "CONTACTED",
  },
  {
    label: "QUALIFIED",
    value: "QUALIFIED",
  },
  {
    label: "UNQUALIFIED",
    value: "UNQUALIFIED",
  },
  {
    label: "CONVERTED",
    value: "CONVERTED",
  }
]

export { COUNTRY_CODES, MAIL_STATUS_VARIANT, LEAD_STATUS };