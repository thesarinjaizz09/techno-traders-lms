"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "@/providers/socket-provider";

type OnlineUser = {
    userId: string;
    name: string;
    role: string;
    status: "Live" | "Away";
};

type PresenceUser = {
    userId: string;
    name: string;
    isMember: boolean;
};

type OnlineUsersContextValue = {
    users: OnlineUser[];
    privateUsers: OnlineUser[];
};

const OnlineUsersContext = createContext<OnlineUsersContextValue>({
    users: [],
    privateUsers: [],
});

export function OnlineUsersProvider({ children }: { children: React.ReactNode }) {
    const { socket, connected } = useSocket();
    const [users, setUsers] = useState<OnlineUser[]>([]);
    const [privateUsers, setPrivateUsers] = useState<OnlineUser[]>([]);

    useEffect(() => {
        if (!socket || !connected) {
            setUsers([]); // hard reset on disconnect
            return;
        }

        const handleOnline = (payload: any) => {
            setUsers((prev) => {
                if (prev.some((u) => u.userId === payload.userId)) return prev;

                return [
                    ...prev,
                    {
                        userId: payload.userId,
                        name: payload.name,
                        role: payload.role ?? "Member",
                        status: "Live",
                    },
                ];
            });
        };
        const handlePrivateOnline = (payload: any) => {
            setPrivateUsers((prev) => {
                if (prev.some((u) => u.userId === payload.userId)) return prev;

                return [
                    ...prev,
                    {
                        userId: payload.userId,
                        name: payload.name,
                        role: payload.role ?? "Member",
                        status: "Live",
                    },
                ];
            });
        };

        const handleOffline = ({ userId }: { userId: string }) => {
            setUsers((prev) => prev.filter((u) => u.userId !== userId));
            setPrivateUsers((prev) => prev.filter((u) => u.userId !== userId));
        };

        const handlePresenceSync = (list: PresenceUser[]) => {
            const { members, guests } = list.reduce(
                (acc, user) => {
                    const mapped: OnlineUser = {
                        userId: user.userId,
                        name: user.name,
                        role: user.isMember ? "Member" : "Guest",
                        status: "Live",
                    };

                    user.isMember ? acc.members.push(mapped) : acc.guests.push(mapped);
                    return acc;
                },
                { members: [] as OnlineUser[], guests: [] as OnlineUser[] }
            );

            setPrivateUsers(members);
            setUsers(list.map((user) => ({
                userId: user.userId,
                name: user.name,
                role: user.isMember ? "Member" : "Guest",
                status: "Live",
            })));
        };

        socket.on("presence:sync", handlePresenceSync);

        socket.on("user:online", handleOnline);
        socket.on("private:user:online", handlePrivateOnline);
        socket.on("user:offline", handleOffline);

        return () => {
            socket.off("presence:sync", handlePresenceSync);
            socket.off("user:online", handleOnline);
            socket.off("private:user:online", handlePrivateOnline);
            socket.off("user:offline", handleOffline);
        };
    }, [socket, connected]);

    return (
        <OnlineUsersContext.Provider value={{ users, privateUsers }}>
            {children}
        </OnlineUsersContext.Provider>
    );
}

export function useOnlineUsers() {
    return useContext(OnlineUsersContext);
}
