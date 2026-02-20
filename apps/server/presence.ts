export type OnlineUser = {
  userId: string;
  name: string;
  isMember: boolean;
};

const onlineUsers = new Map<string, OnlineUser>();

export function addUser(user: OnlineUser) {
  onlineUsers.set(user.userId, user);
}

export function removeUser(userId: string) {
  onlineUsers.delete(userId);
}

export function getAllUsers() {
  return Array.from(onlineUsers.values());
}
