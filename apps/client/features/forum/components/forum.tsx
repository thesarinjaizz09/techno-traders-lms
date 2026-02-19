"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  Globe,
  GlobeLock,
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
  User,
  UserCircle,
  Users,
} from "lucide-react";

import { openSans } from "@/fonts";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea";
import { useMessages, useMessagesCache } from "../hooks/use-forum";
import { useSocket } from "@/providers/socket-provider";
import { cn } from "@/lib/utils";
import { getColorForUser } from "@/constants/chat-colors";

type Channel = {
  id: string;
  name: string;
  description: string;
  unread?: number;
};

type RouterOutput = inferRouterOutputs<AppRouter>;
type ChatMessage = RouterOutput["messages"]["getInfinite"]["items"][number] & {
  reactions?: { emoji: string; count: number }[];
};

type IncomingSocketMessage = {
  id: string;
  userId: string;
  clientMessageId?: string;
  user: string;
  role: string;
  message: string;
  createdAt: string;
  time: string;
  type?: "SYSTEM" | "USER";
};

const SKELETON_COUNT = 5; // 5-7 skeleton items for loading state
// const SKELETON_COUNT = Math.floor(Math.random() * 3) + 4; // 5-7 skeleton items for loading state

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

function isOptimisticMessageId(messageId: string) {
  return messageId.startsWith("temp-");
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
  const { data: serverMessages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMessages()

  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});

  const shouldAutoScroll = useRef(true);
  const prevScrollHeightRef = useRef<number>(0);
  const hasAutoScrolledInitially = useRef(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [composer, setComposer] = useState("");
  const [activeChannel, setActiveChannel] = useState(channels[0]?.id ?? "global-floor");
  const [unseenNewMessages, setUnseenNewMessages] = useState(0);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    console.log("Typing users updated:", { typingUsers });
  }, [typingUsers]);

  const messages = useMemo(() => {
    if (!serverMessages?.pages) return [];
    const flat = serverMessages.pages.flatMap((page) => page.items);
    // console.log("Flat messages count:", flat.length, "pages:", serverMessages.pages.length);
    return flat;
  }, [serverMessages]);

  const orderedMessages = useMemo(() => [...messages].reverse(), [messages]);

  const isNearBottom = (el: HTMLDivElement, threshold = 120) =>
    el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const el = messagesContainerRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior,
    });
  };

  const onScroll = async () => {
    const el = messagesContainerRef.current;
    if (!el) return;

    // Keep this updated on every scroll so new messages auto-stick only when user is at bottom.
    shouldAutoScroll.current = isNearBottom(el);
    if (shouldAutoScroll.current) {
      setUnseenNewMessages(0);
    }

    if (el.scrollTop < 80 && !isFetchingNextPage && hasNextPage) {
      const prevHeight = el.scrollHeight;
      await fetchNextPage();

      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight - prevHeight;
      });
    }
  };

  useEffect(() => {
    if (hasAutoScrolledInitially.current) return;
    if (isLoading) return;
    if (!messages.length) return;

    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "auto",
    });

    // Initialize the ref here (after first meaningful scroll)
    prevScrollHeightRef.current = container.scrollHeight;

    hasAutoScrolledInitially.current = true;
    shouldAutoScroll.current = true;
  }, [isLoading, messages.length]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    if (isFetchingNextPage) return; // skip while still loading

    requestAnimationFrame(() => {
      const newHeight = el.scrollHeight;
      const heightDiff = newHeight - prevScrollHeightRef.current;

      if (heightDiff > 0) {
        // Older messages added → preserve position by shifting scroll down
        el.scrollTop += heightDiff;
      }

      // Always update ref for next time
      prevScrollHeightRef.current = newHeight;
    });
  }, [serverMessages?.pages?.length, isFetchingNextPage]);

  useEffect(() => {
    if (!socket) return;

    const onMessageNew = (message: IncomingSocketMessage) => {
      const el = messagesContainerRef.current;
      const userAtBottom = el ? isNearBottom(el) : true;
      let shouldShowNewMessageIndicator = false;

      cache.setData((old) => {
        if (!old) return old;

        let didReplace = false;

        const pages = old.pages.map((page) => {
          const items = page.items.map((m: ChatMessage) => {
            if (message.clientMessageId && m.id === message.clientMessageId) {
              didReplace = true;
              return {
                id: message.id,
                user: message.user,
                role: "you",
                message: message.message,
                createdAt: message.createdAt,
                time: message.time,
                type: message.type ?? "USER",
                userId: message.userId,
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
            (m: ChatMessage) => m.id === message.id
          );

          if (!alreadyExists) {
            if (!userAtBottom) {
              shouldShowNewMessageIndicator = true;
            }

            pages[0] = {
              ...firstPage,
              items: [{
                id: message.id,
                user: message.user,
                role: message.userId === user?.id ? "you" : "member",
                message: message.message,
                createdAt: message.createdAt,
                time: message.time,
                type: message.type ?? "USER",
                userId: message.userId,
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

      if (shouldShowNewMessageIndicator) {
        setUnseenNewMessages((count) => count + 1);
      }
    };

    const onMessageSystem = (message: IncomingSocketMessage) => {
      const el = messagesContainerRef.current;
      const userAtBottom = el ? isNearBottom(el) : true;
      let shouldShowNewMessageIndicator = false;

      // console.log("System message received:", message);

      cache.prependMessage({
        id: message.id,
        user: message.user,
        role: "system",
        message: message.message,
        createdAt: message.createdAt,
        time: message.time,
        type: "SYSTEM",
        userId: message.userId,
      });

      if (!userAtBottom) {
        shouldShowNewMessageIndicator = true;
      }

      if (shouldShowNewMessageIndicator) {
        setUnseenNewMessages((count) => count + 1);
      }
    };

    socket.on("message:new", onMessageNew);
    socket.on("message:system", onMessageSystem);

    return () => {
      socket.off("message:new", onMessageNew);
      socket.off("message:system", onMessageSystem);
    };
  }, [socket, cache]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    // Auto-scroll only when user is at/near bottom.
    if (!(shouldAutoScroll.current || isNearBottom(el))) return;

    scrollToBottom("smooth");
    shouldAutoScroll.current = true;
    setUnseenNewMessages(0);
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const onTypingStart = ({ userId, name }: any) => {
      setTypingUsers((prev) => ({
        ...prev,
        [userId]: name,
      }));
    };

    const onTypingStop = ({ userId }: any) => {
      setTypingUsers((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    };

    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);

    return () => {
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
    };
  }, [socket]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    const typingCount = Object.keys(typingUsers).length;

    if (typingCount > 0 && shouldAutoScroll.current) {
      // Auto-scroll to show typing indicator if already near bottom
      scrollToBottom("smooth");
    }
  }, [typingUsers]);

  useEffect(() => {
    if (!socket) return;

    const onReconnect = () => {
      cache.invalidate(); // force server reconciliation
    };

    socket.on("connect", onReconnect);

    return () => {
      socket.off("connect", onReconnect);
    };
  }, [socket]);


  const channel = useMemo(
    () => channels.find((entry) => entry.id === activeChannel) ?? channels[0],
    [activeChannel]
  );

  const currentName = user?.name?.trim() || "You";

  const sendMessage = () => {
    if (!composer.trim() || !connected || !socket) return;

    if (isTypingRef.current) {
      // socket.emit("typing:stop");
      isTypingRef.current = false;
    }

    setShowEmojiPicker(false);

    const tempId = `temp-${user?.id}-${Date.now()}`;

    const optimistic = {
      id: tempId,
      user: currentName,
      role: "you",
      message: composer,
      createdAt: new Date().toISOString(),
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      type: "USER" as const,
      userId: user?.id ?? "temp-user",
    };

    cache.prependMessage(optimistic);

    socket.emit("message:send", { content: composer, clientMessageId: tempId }, (ack: any) => {
      if (!ack?.success) {
        cache.rollbackPrepend(tempId);
      }
    });

    setComposer("");
  };

  function getMessageDate(message?: ChatMessage) {
    if (!message?.createdAt) return null;

    const date = new Date(message.createdAt);
    if (Number.isNaN(date.getTime())) return null;

    return date;
  }

  function isSameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function formatTimeLabel(date: Date) {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatDateLabel(date: Date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function getTimestampBadgeLabel(message: ChatMessage) {
    const messageDate = getMessageDate(message);
    if (!messageDate) return message.time;

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const timeLabel = formatTimeLabel(messageDate);

    if (isSameDay(messageDate, now)) {
      return `Today`;
    }

    if (isSameDay(messageDate, yesterday)) {
      return `Yesterday`;
    }

    return `${formatDateLabel(messageDate)}`;
  }

  function getMessageTime(message: ChatMessage) {
    const messageDate = getMessageDate(message);
    if (!messageDate) return message.time;
    return formatTimeLabel(messageDate);
  }

  function shouldShowTimestamp(prev?: ChatMessage, curr?: ChatMessage) {
    if (!prev || !curr) return true;

    const prevDate = getMessageDate(prev);
    const currDate = getMessageDate(curr);
    if (!prevDate || !currDate) return true;

    if (!isSameDay(prevDate, currDate)) return true;

    const diffMs = Math.abs(currDate.getTime() - prevDate.getTime());
    return diffMs > 5 * 60 * 60 * 1000;
  }

  const onEmojiClick = (emoji: EmojiClickData) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;

    const newText =
      composer.slice(0, start) +
      emoji.emoji +
      composer.slice(end);

    setComposer(newText);

    // Restore cursor position
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + emoji.emoji.length;
    });
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
                <Tooltip>
                  {connected ? (
                    <TooltipTrigger asChild>
                      <Globe className={`size-4 ${connected ? "text-emerald-500" : "text-red-500"}`} />
                    </TooltipTrigger>
                  ) : (
                    <TooltipTrigger asChild>
                      <GlobeLock className={`size-4 ${connected ? "text-emerald-500" : "text-red-500"}`} />
                    </TooltipTrigger>
                  )}

                  <TooltipContent>
                    <p>{connected ? "Connected" : "Disconnected"}</p>
                  </TooltipContent>
                </Tooltip>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="size-4" />
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

          <div ref={messagesContainerRef} onScroll={onScroll} className="flex-1 space-y-1.5 overflow-y-auto p-3 sm:p-4 max-h-[76.5vh] scrollbar-thin scrollbar-thumb-rounded-sm scrollbar-thumb-muted/50">
            {isFetchingNextPage && (
              <div className="flex justify-center py-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              </div>
            )}

            {!isLoading && messages.length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-6">
                No messages yet
              </div>
            )}

            {isLoading && (
              <div className="p-4 space-y-3">
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <SkeletonMessage key={i} reverse={i % 3 !== 0} />
                ))}
              </div>
            )}

            {!isLoading && orderedMessages.map((item, i) => {
              const mine = item.role === "you";

              const prev = orderedMessages[i - 1];
              const showTime = shouldShowTimestamp(prev, item);

              return (
                <div key={`item-${item.id}-${Math.random()}`} className="space-y-1">
                  {showTime && (
                    <div className="flex justify-center my-4">
                      <Badge variant="secondary" className="rounded-sm px-3 py-1.5 text-muted-foreground text-xs">
                        <CalendarDays className="size-3.5 inline-block mr-1.5 text-primary" />
                        {getTimestampBadgeLabel(item)}
                      </Badge>
                    </div>
                  )}

                  {item.type === "SYSTEM" && (
                    <div key={item.id} className="flex justify-center my-4">
                      <span className="rounded-sm bg-muted px-4 py-2 text-xs text-muted-foreground flex items-center justify-center">
                        <UserCircle className={cn("size-3.5 inline-block mr-2.5", item.user === user?.name ? "text-primary" : `${getColorForUser(item.userId)?.name}`)} />
                        {item.message} at {item.time}
                      </span>
                    </div>
                  )}

                  {item.type !== "SYSTEM" && <div key={item.id} className={`flex flex-row gap-2.5 justify-start ${mine && "flex-row-reverse"}`}>
                    <Avatar className="mt-0.5 size-8 border rounded-sm">
                      <AvatarFallback className={cn("text-[11px] rounded-sm", item.user === user?.name ? "text-primary" : `${getColorForUser(item.userId)?.name}`)}>{initials(item.user)}</AvatarFallback>
                    </Avatar>

                    <div
                      className={`
    relative max-w-[85%] space-y-1 rounded-sm border px-3 py-2 sm:max-w-[72%]
    ${mine
                          ? "border-border/80 bg-muted/60"
                          : `bg-background/50 border-border/80` // Default to bg-muted if no color found
                        }
  `}
                    >
                      <div
                        className={`
      flex items-center gap-2 text-[10px] border bg-muted-foreground/20 px-2 py-1 rounded-sm w-max mb-2.5
      ${mine ? "ml-auto justify-end" : ""}
    `}
                      >
                        <span className={cn(item.user === user?.name ? "text-primary" : `${getColorForUser(item.userId)?.name}`, "font-semibold leading-relaxed")}>
                          {item.user === user?.name ? "You" : item.user}
                        </span>
                        <span className="text-muted-foreground">{getMessageTime(item)}</span>
                      </div>

                      <p className="text-[12px] leading-relaxed break-all whitespace-pre-wrap pr-10 mb-0">
                        {item.message}
                      </p>

                      {mine && (
                        <div
                          className="
        absolute bottom-2.5 right-2
        flex items-center text-muted-foreground/90
        pointer-events-none
      "
                        >
                          {isOptimisticMessageId(item.id) ? (
                            <Check className="size-3.5" />
                          ) : (
                            <CheckCheck className="size-3.5" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>}
                </div>
              );
            })}

            {!isLoading && Object.keys(typingUsers).length > 0 && (
              <div className={cn(Object.keys(typingUsers).length > 1 ? "gap-4" : "gap-3", "mt-5 pb-2 flex items-start animate-fade-in")}>
                {/* Avatar(s) of typing user(s) – show up to 3, overlap if more */}
                <div className="relative flex -space-x-1.5">
                  {Object.keys(typingUsers)
                    .slice(0, 1)
                    .map((userId) => {
                      const userName = typingUsers[userId]; // or fetch full user if you have it
                      return (
                        <Avatar key={userId} className="size-8 rounded-sm">
                          <AvatarFallback className="text-[11px] text-muted-foreground rounded-sm bg-primary/20">
                            {initials(userName || "User")}
                          </AvatarFallback>
                        </Avatar>
                      );
                    })}
                  {Object.keys(typingUsers).length > 1 && (
                    <div className="absolute -top-3.5 -right-4.5 size-5 rounded-full bg-muted flex items-center justify-center text-[10px] ml-1 border border-primary text-center flex items-center justify-center">
                      {Object.keys(typingUsers).length - 1 > 9 ? "9+" : `+${Object.keys(typingUsers).length - 1}`}
                    </div>
                  )}
                </div>

                {/* Typing bubble skeleton */}
                <div
                  className={`
        min-w-38 relative max-w-[70%] rounded-sm px-3 py-2
        bg-muted/60 border border-border/50
        shadow-sm
      `}
                >
                  {/* Animated bouncing dots */}
                  <div className="flex items-center gap-1 h-5">
                    <div className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:0ms]"></div>
                    <div className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:150ms]"></div>
                    <div className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:300ms]"></div>
                  </div>

                  {/* Subtle user names if multiple */}
                  {Object.keys(typingUsers).length >= 1 && (
                    <div className="w-fit absolute -bottom-5 left-0.5 text-[10px] text-muted-foreground/80">
                      {Object.values(typingUsers).slice(0, 2).join(", ")}
                      {Object.keys(typingUsers).length > 2 && ` + ${Object.keys(typingUsers).length - 2}..`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {unseenNewMessages > 0 && (
            <Button
              type="button"
              size="icon"
              onClick={() => {
                shouldAutoScroll.current = true;
                setUnseenNewMessages(0);
                scrollToBottom("smooth");
              }}
              className="absolute bottom-23 right-7.5 z-20 size-8.5 rounded-full shadow-md bg-primary/40 text-white hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/50 animate-fade-in"
              aria-label="Jump to latest messages"
            >
              <MessageSquare className="size-3.5" />
              <span
                className={`
        absolute -top-1.5 -right-1.5 
        min-w-[18px] h-4.5 
        flex items-center justify-center 
        rounded-full px-1 text-[9px] font-bold leading-none
        shadow-sm
        bg-red-500 text-white          /* ← change this color to match your theme */
        ring-2 ring-background/80      /* optional: helps on dark/light backgrounds */
      `}
              >
                {unseenNewMessages > 99 ? '99+' : unseenNewMessages}
              </span>
            </Button>
          )}

          <div className="border-t bg-background/65 p-2 sm:p-3">
            <div className="flex items-center justify-between rounded-sm border bg-card/80 p-2 gap-2">
              <div className="flex items-center bg-muted-foreground/10 rounded-sm py-0.5">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Emoji"
                    onClick={() => setShowEmojiPicker((v) => !v)}
                  >
                    <Smile className="size-4" />
                  </Button>

                  {showEmojiPicker && (
                    <div className="absolute bottom-12 left-0 z-50">
                      <EmojiPicker
                        theme={Theme.DARK}
                        onEmojiClick={onEmojiClick}
                        searchDisabled={false}
                        skinTonesDisabled
                        height={350}
                        width={300}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Textarea
                ref={textareaRef}
                value={composer}
                onChange={(e) => {
                  const value = e.target.value;
                  setComposer(value);

                  if (!socket || !connected) return;

                  if (!isTypingRef.current) {
                    if (!value.trim()) return;

                    isTypingRef.current = true;
                    socket.emit("typing:start");
                  }

                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                  }

                  typingTimeoutRef.current = setTimeout(() => {
                    isTypingRef.current = false;
                    socket.emit("typing:stop");
                  }, 2000);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                onBlur={() => {
                  if (isTypingRef.current) {
                    if (!socket || connected) return;

                    typingTimeoutRef.current = setTimeout(() => {
                      isTypingRef.current = false;
                      socket.emit("typing:stop");
                    }, 1000);
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

function SkeletonMessage({ reverse }: { reverse: boolean }) {
  return (
    <div className={`flex gap-2.5 ${reverse ? "flex-row-reverse" : ""}`}>
      <Avatar className="size-8 rounded-sm">
        <AvatarFallback className="animate-pulse bg-muted" />
      </Avatar>

      <div className="w-72 space-y-2 rounded-sm border bg-muted/40 p-3 animate-pulse">
        <div className="h-3 w-24 rounded bg-muted-foreground/20" />
        <div className="h-8 w-full rounded bg-muted-foreground/20" />
      </div>
    </div>
  );
}
