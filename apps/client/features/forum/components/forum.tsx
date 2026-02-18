"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useMessages, useMessagesCache } from "../hooks/use-forum";
import { useSocket } from "@/providers/socket-provider";

type Channel = {
  id: string;
  name: string;
  description: string;
  unread?: number;
};

type ChatMessage = {
  id: string;
  user: string;
  role: string;
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
  }
];

const onlineMembers = [
  { name: "Nikhil S.", role: "Mentor", status: "Live" },
  { name: "Aarav M.", role: "Pro Member", status: "Online" },
  { name: "Rhea K.", role: "Member", status: "Online" },
  { name: "Krishna V.", role: "Member", status: "Away" },
  { name: "Anaya D.", role: "Member", status: "Online" },
  { name: "Dev P.", role: "Mentor", status: "Live" },
];

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

export default function Forum() {
  const cache = useMessagesCache();
  const { data: user } = useCurrentUser();
  const { socket, connected } = useSocket();
  const { data: serverMessages, isLoading } = useMessages()
  
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const [activeChannel, setActiveChannel] = useState(channels[0]?.id ?? "global-floor");
  const [composer, setComposer] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(serverMessages?.pages[0].items ?? []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    setMessages(serverMessages?.pages[0].items ?? []);
  }, [serverMessages]);

  const channel = useMemo(
    () => channels.find((entry) => entry.id === activeChannel) ?? channels[0],
    [activeChannel]
  );

  const currentName = user?.name?.trim() || "You";

  const sendMessage = () => {
    if (!composer.trim() || !connected || !socket) return;

    const tempId = `temp-${user?.id}-${Date.now()}`;

    const optimistic = {
      id: tempId,
      user: currentName,
      role: "you",
      message: composer,
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };

    cache.prependMessage(optimistic);

    socket.emit("message:send", { content: composer, clientMessageId: tempId }, (ack: any) => {
      if (!ack?.success) {
        cache.rollbackPrepend(tempId);
      }
    });

    setComposer("");
  };

  useEffect(() => {
    if (!socket) return;

    const onMessageNew = (
      message: ChatMessage & {
        userId: string;
        clientMessageId?: string;
      }
    ) => {
      cache.setData((old) => {
        if (!old) return old;

        let didReplace = false;

        const pages = old.pages.map((page) => {
          const items = page.items.map((m) => {
            if (
              message.clientMessageId &&
              m.id === message.clientMessageId
            ) {
              didReplace = true;
              return {
                ...message,
                role: "you",
              };
            }

            return m;
          });

          return { ...page, items };
        });

        if (!didReplace) {
          const firstPage = pages[0];

          // Dedup guard (important for reconnects)
          const alreadyExists = firstPage.items.some(
            (m) => m.id === message.id
          );

          if (!alreadyExists) {
            pages[0] = {
              ...firstPage,
              items: [
                {
                  ...message,
                  role: message.userId === user?.id ? "you" : "member",
                },
                ...firstPage.items,
              ],
            };
          }
        }

        return {
          ...old,
          pages,
        };
      });
    };


    socket.on("message:new", onMessageNew);

    return () => {
      socket.off("message:new", onMessageNew);
    };
  }, [socket, cache]);

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

          <div ref={messagesContainerRef} className="flex-1 space-y-1.5 overflow-y-auto p-3 sm:p-4 max-h-[76.5vh] scrollbar-thin scrollbar-thumb-rounded-sm scrollbar-thumb-muted/50">
            <div className="flex items-center justify-center mb-5">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
                Session Started - Today
              </Badge>
            </div>

            {[...messages].reverse().map((item) => {
              const mine = item.role === "you";

              return (
                <div key={item.id} className={`flex flex-row gap-2.5 justify-start ${mine && "flex-row-reverse"}`}>
                  <Avatar className="mt-0.5 size-8 border rounded-sm">
                    <AvatarFallback className="text-[11px] rounded-sm">{initials(item.user)}</AvatarFallback>
                  </Avatar>

                  <div
                    className={`max-w-[85%] space-y-1 rounded-sm border px-3 py-2 sm:max-w-[72%] ${mine
                      ? "border-border/80 bg-muted/60"
                      : "border-border/80 bg-background/50"
                      }`}
                  >
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className={`font-semibold leading-relaxed text-primary`}>{item.user}</span>
                      <span className="text-muted-foreground">{item.time}</span>
                    </div>
                    <p className="text-[12px] leading-relaxed break-all whitespace-pre-wrap">{item.message}</p>
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
