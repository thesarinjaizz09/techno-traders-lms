'use client'

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Loader2 } from "lucide-react";
import { useOnlineUsers } from "@/providers/online-users-providers";
import { usePrivateMembers } from "../hooks/use-forum";
import { channels } from "../utils";

type Member = { name: string; role: string };

export function PrivateMembersPanel({ channelId }: { channelId: string }) {
  const { privateUsers: onlineUsers } = useOnlineUsers(); // real-time online users
  const { data: membersData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = usePrivateMembers();

  const [activeTab, setActiveTab] = useState<"online" | "total">("online");

  // Flatten all pages for total members
  const totalMembers = membersData?.pages.flatMap(page => page.items) || [];

  // Current list to display
  const displayedMembers = activeTab === "online" ? onlineUsers : totalMembers;

  const channelName = channels.find(c => c.id === channelId)?.name || "Community";

  return (
    <Card className="h-full overflow-hidden border-border/80 bg-card/60 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="border-b p-4 shrink-0">
        <p className="text-sm font-semibold tracking-wide">{channelName}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Members currently participating
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 px-3 gap-2 shrink-0">
        <Button
          variant={activeTab === "online" ? "default" : "outline"}
          className={`p-3 text-xs border-2 border-muted/20 rounded-sm ${activeTab === "online" ? "border-primary" : ""}`}
          onClick={() => setActiveTab("online")}
        >
          <UserCheck className="size-3.5" />
          Online ({onlineUsers.length})
        </Button>

        <Button
          variant={activeTab === "total" ? "default" : "outline"}
          className={`p-3 text-xs border-2 border-muted/10 rounded-sm ${activeTab === "total" ? "border-primary" : ""}`}
          onClick={() => setActiveTab("total")}
        >
          <Users className="size-3.5" />
          Total
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Stats */}
        <div className="rounded-md border bg-background/50 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {activeTab === "online" ? "Online now" : "Total members"}
            </span>
            <Badge variant="secondary">
              {activeTab === "online" ? onlineUsers.length : totalMembers.length}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Loading state */}
        {isLoading && activeTab === "total" && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}

        {/* No members */}
        {displayedMembers.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-6">
            {activeTab === "online"
              ? "No active members right now"
              : "No members found"}
          </p>
        ) : (
          <div className="space-y-2">
            {displayedMembers.map((member: any, idx: number) => (
              <div
                key={member.userId || member.name || idx}
                className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {activeTab === "online" ? (
                    <span className="size-2 rounded-full bg-emerald-500" />
                  ) : (
                    <span className="size-2 rounded-full bg-muted" />
                  )}
                  <div>
                    <p className="text-xs font-medium">{member.name}</p>
                    <p className="text-[11px] text-muted-foreground">{member.role}</p>
                  </div>
                </div>

                {activeTab === "online" && (
                  <Badge className="h-5 rounded-full bg-emerald-600 px-2 text-[10px] text-white">
                    Live
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load more for total members */}
        {activeTab === "total" && hasNextPage && (
          <div className="pt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-xs"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="size-3.5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load more members"
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}