import { LeadStatus, Source, MailStatus, CampaignStatus, CampaignRecipientStatus } from "@/lib/generated/prisma/enums";

type ThemeKey =
  | LeadStatus
  | Source
  | MailStatus
  | CampaignStatus
  | CampaignRecipientStatus
  | "green"
  | "blue"
  | "red"
  | "purple";

export const themeMap: Record<ThemeKey, string> = {
  // Generic
  green: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  red: "bg-red-500/10 border-red-500/20 text-red-400",
  purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",

  // LeadStatus
  NEW: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  CONTACTED: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  UNQUALIFIED: "bg-red-500/10 border-red-500/20 text-red-400",
  QUALIFIED: "bg-green-500/10 border-green-500/20 text-green-400",
  CONVERTED: "bg-teal-500/10 border-teal-500/20 text-teal-400",

  // Source
  MANNUAL: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
  IMPORTED: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",

  // MailStatus
  IDLE: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
  BOUNCED: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  FAILED: "bg-red-500/10 border-red-500/20 text-red-400",
  BANNED: "bg-red-600/10 border-red-600/20 text-red-500",
  COMPLAINT: "bg-pink-500/10 border-pink-500/20 text-pink-400",

  // CampaignStatus
  DRAFT: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
  SCHEDULED: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  RUNNING: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  PAUSED: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  COMPLETED: "bg-teal-500/10 border-teal-500/20 text-teal-400",

  // CampaignRecipientStatus
  PENDING: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  SENT: "bg-sky-500/10 border-sky-500/20 text-sky-400",
};


export interface StatsProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  theme?: ThemeKey;
}

const Stats = ({ label, value, icon, theme = "green" }: StatsProps) => {
  const classes = themeMap[theme];

  return (
    <div className={`px-2 py-1 rounded-sm border ${classes} flex items-center justify-center gap-1`}>
      {icon && (
        <span className="size-3 flex items-center justify-center">
          {icon}
        </span>
      )}
      <span className="text-[11px] font-medium tracking-wider">{label}</span>
      <span className="text-[12px]">=</span>
      <span className="text-[11px] text-white tracking-wider">{value}</span>
    </div>
  );
};

export default Stats;

export const themeBorder = (key: ThemeKey) =>
  themeMap[key].split(" ").find(c => c.startsWith("border-"));

export const themeBg = (key: ThemeKey) =>
  themeMap[key].split(" ").find(c => c.startsWith("bg-"));

export const themeText = (key: ThemeKey) =>
  themeMap[key].split(" ").find(c => c.startsWith("text-"));
