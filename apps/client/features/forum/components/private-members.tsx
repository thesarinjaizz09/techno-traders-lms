import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { useOnlineUsers } from "@/providers/online-users-providers";
import { channels } from "../utils";


export function PrivateMembersPanel({ channelId }: { channelId: string }) {
  const { privateUsers: users } = useOnlineUsers();

  return (
    <Card className="h-full overflow-hidden border-border/80 bg-card/60 backdrop-blur-sm p-2">
      <div className="border-b p-4">
        <p className="text-sm font-semibold tracking-wide">{channels.find(c => c.id === channelId)?.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Members currently participating.
        </p>
      </div>

      <div className="space-y-3 p-3">
        <div className="rounded-md border bg-background/50 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Online now</span>
            <Badge variant="secondary">{users.length}</Badge>
          </div>
        </div>

        <Separator />

        {users.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-4">
            No active members right now
          </p>
        ) : (
          <div className="space-y-2">
            {users.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between rounded-md px-2 py-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-xs font-medium">{member.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                </div>

                <Badge className="h-5 rounded-full bg-emerald-600 px-2 text-[10px] text-white">
                  Online
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
