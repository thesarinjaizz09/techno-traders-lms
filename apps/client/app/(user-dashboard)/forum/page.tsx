"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Hash,
  Menu,
  MessageSquare,
  Mic,
  Paperclip,
  Pin,
  Search,
  SendHorizontal,
  Settings2,
  Smile,
  Users,
} from "lucide-react";

import { openSans } from "@/fonts";
import { useCurrentUser } from "@/features/users/hooks/use-users";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

type Channel = {
  id: string;
  name: string;
  description: string;
  unread?: number;
};

type ChatMessage = {
  id: number;
  user: string;
  role: "mentor" | "member" | "you";
  message: string;
  time: string;
  reactions?: { emoji: string; count: number }[];
};

const channels: Channel[] = [
  {
    id: "global-floor",
    name: "global-floor",
    description: "Live market talk, setups, and execution updates.",
    unread: 8,
  },
  {
    id: "options-lab",
    name: "options-lab",
    description: "Greeks, spreads, IV crush and expiry strategies.",
    unread: 3,
  },
  {
    id: "swing-ideas",
    name: "swing-ideas",
    description: "Position trade ideas for multi-day setups.",
  },
  {
    id: "risk-control",
    name: "risk-control",
    description: "Capital protection and risk discipline reviews.",
  },
];

const onlineMembers = [
  { name: "Nikhil S.", role: "Mentor", status: "Live" },
  { name: "Aarav M.", role: "Pro Member", status: "Online" },
  { name: "Rhea K.", role: "Member", status: "Online" },
  { name: "Krishna V.", role: "Member", status: "Away" },
  { name: "Anaya D.", role: "Member", status: "Online" },
  { name: "Dev P.", role: "Mentor", status: "Live" },
];

const seedMessages: ChatMessage[] = [
  {
    id: 1,
    user: "Nikhil S.",
    role: "mentor",
    message:
      "NIFTY is respecting VWAP on 15m. Keep entries only if premium decay slows after the first 45 minutes.",
    time: "09:31",
    reactions: [
      { emoji: "FIRE", count: 5 },
      { emoji: "CHECK", count: 3 },
    ],
  },
  {
    id: 2,
    user: "Aarav M.",
    role: "member",
    message:
      "Seeing call writers defend 22350 again. Watching for volume confirmation before scaling in.",
    time: "09:34",
    reactions: [{ emoji: "EYES", count: 4 }],
  },
  {
    id: 3,
    user: "Rhea K.",
    role: "member",
    message:
      "I exited half at 1R and moved SL to cost. Keeping the rest for a possible break above morning range.",
    time: "09:36",
  },
  {
    id: 4,
    user: "Dev P.",
    role: "mentor",
    message:
      "Good management. Also track IV rise near noon, that usually changes reward-to-risk for fresh entries.",
    time: "09:37",
    reactions: [{ emoji: "IDEA", count: 6 }],
  },
];

function roleTone(role: ChatMessage["role"]) {
  if (role === "mentor") return "text-emerald-500";
  if (role === "you") return "text-primary";
  return "text-foreground";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function MembersPanel() {
  return (
    <Card className="h-full gap-0 overflow-hidden border-border/80 bg-card/60 py-0 backdrop-blur-sm">
      <div className="border-b p-4">
        <p className="text-sm font-semibold tracking-wide">Room Activity</p>
        <p className="mt-1 text-xs text-muted-foreground">Traders currently participating.</p>
      </div>

      <div className="space-y-3 p-3">
        <div className="rounded-md border bg-background/50 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Online now</span>
            <Badge variant="secondary">{onlineMembers.length}</Badge>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Messages today</span>
            <span className="font-medium">1,283</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Pinned notes</span>
            <span className="font-medium">12</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          {onlineMembers.map((member) => {
            const live = member.status === "Live";

            return (
              <div key={member.name} className="flex items-center justify-between rounded-md px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${live
                      ? "bg-emerald-500"
                      : member.status === "Away"
                        ? "bg-amber-500"
                        : "bg-primary"
                      }`}
                  />
                  <div>
                    <p className="text-xs font-medium">{member.name}</p>
                    <p className="text-[11px] text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                {live ? (
                  <Badge className="h-5 rounded-full bg-emerald-600 px-2 text-[10px] text-white hover:bg-emerald-600">
                    Live
                  </Badge>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default function ForumPage() {
  const { data: user } = useCurrentUser();
  const [activeChannel, setActiveChannel] = useState(channels[0]?.id ?? "global-floor");
  const [composer, setComposer] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);

  const channel = useMemo(
    () => channels.find((entry) => entry.id === activeChannel) ?? channels[0],
    [activeChannel]
  );

  const currentName = user?.name?.trim() || "You";

  const sendMessage = () => {
    const value = composer.trim();
    if (!value) return;

    setMessages((previous) => [
      ...previous,
      {
        id: previous.length + 1,
        user: currentName,
        role: "you",
        message: value,
        time: new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      },
    ]);
    setComposer("");
  };

  return (
    <div className={`${openSans.className} relative h-full p-1 sm:p-4 md:px-1.5 md:py-2`}>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,oklch(0.72_0.17_293/.12),transparent_42%),radial-gradient(circle_at_bottom_right,oklch(0.71_0.2_160/.08),transparent_40%)]" />

      <div className="grid h-full grid-cols-1">
        <Card className="relative flex h-full min-h-[70vh] flex-col gap-0 overflow-hidden border-border/80 bg-card/70 py-0 backdrop-blur-md rounded-sm">
          <div className="flex items-center justify-between border-b px-3 py-2.5 sm:px-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold tracking-wide sm:text-base">
                <Hash className="size-4 text-primary" />
                <span className="truncate">{channel?.name}</span>
              </p>
              <p className="line-clamp-1 text-xs text-muted-foreground">{channel?.description}</p>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Pinned notes">
                <Pin className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Settings">
                <Settings2 className="size-4" />
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="2xl:hidden" aria-label="Open members panel">
                    <Users className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0">
                  <SheetHeader className="border-b">
                    <SheetTitle>Room Activity</SheetTitle>
                  </SheetHeader>
                  <div className="p-3">
                    <MembersPanel />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4 max-h-[76.5vh]">
            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
                Session Started - Today
              </Badge>
            </div>

            {messages.map((item) => {
              const mine = item.role === "you";

              return (
                <div key={item.id} className={`flex gap-2.5 ${mine ? "justify-end" : "justify-start"}`}>
                  {!mine ? (
                    <Avatar className="mt-0.5 size-8 border">
                      <AvatarFallback className="text-[11px]">{initials(item.user)}</AvatarFallback>
                    </Avatar>
                  ) : null}

                  <div
                    className={`max-w-[85%] space-y-1 rounded-xl border px-3 py-2 sm:max-w-[72%] ${mine
                      ? "border-primary/30 bg-primary/10"
                      : "border-border/80 bg-background/50"
                      }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`font-semibold ${roleTone(item.role)}`}>{item.user}</span>
                      <span className="text-muted-foreground">{item.time}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{item.message}</p>

                    {item.reactions?.length ? (
                      <div className="flex items-center gap-1 pt-1">
                        {item.reactions.map((reaction) => (
                          <button
                            key={`${item.id}-${reaction.emoji}`}
                            type="button"
                            className="inline-flex items-center gap-1 rounded-full border bg-background/70 px-2 py-0.5 text-xs"
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-muted-foreground">{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t bg-background/65 p-2 sm:p-3">
            <div className="flex items-center justify-between rounded-sm border bg-card/80 p-2 gap-2">
              <div className="flex items-center bg-muted-foreground/10 rounded-sm py-0.5">
                <Button variant="ghost" size="icon-sm" aria-label="Attach file">
                  <Paperclip className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="Emoji">
                  <Smile className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="Voice input">
                  <Mic className="size-4" />
                </Button>
              </div>

              <Textarea
                value={composer}
                onChange={(event) => setComposer(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={`Message #${channel?.name}`}
                className="rounded-sm max-h-40 min-h-8 resize-none border-none bg-transparent p-2 px-3 text-sm shadow-none focus-visible:ring-0"
              />

              <Button onClick={sendMessage} disabled={!composer.trim()} className="gap-1.5 py-0.5">
                <SendHorizontal className="size-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
