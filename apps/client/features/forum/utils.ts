import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type RouterOutput = inferRouterOutputs<AppRouter>;
export type ChatMessage = RouterOutput["messages"]["getInfinite"]["items"][number] & {
    reactions?: { emoji: string; count: number }[];
};

export type Channel = {
    id: string;
    name: string;
    description: string;
    unread?: number;
};

export type IncomingSocketMessage = {
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

export const SKELETON_COUNT = 5;

export const channels: Channel[] = [
    {
        id: "global-floor",
        name: "Traders Community",
        description: "Live market talk, setups, and execution updates.",
        unread: 8,
    }
];

export const onlineMembers = [
    { name: "Nikhil S.", role: "Mentor", status: "Live" },
    { name: "Aarav M.", role: "Pro Member", status: "Online" },
    { name: "Rhea K.", role: "Member", status: "Online" },
    { name: "Krishna V.", role: "Member", status: "Away" },
    { name: "Anaya D.", role: "Member", status: "Online" },
    { name: "Dev P.", role: "Mentor", status: "Live" },
];

export function initials(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export function isOptimisticMessageId(messageId: string) {
    return messageId.startsWith("temp-");
}