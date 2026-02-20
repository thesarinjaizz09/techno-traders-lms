import { Badge } from "@/components/ui/badge";
import { onlineMembers } from "../utils";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

export function MembersPanel() {
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