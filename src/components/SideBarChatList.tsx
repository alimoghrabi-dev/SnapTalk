"use client";

import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor, pusherKey } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import UnseenChatToast from "./unseenChatToast";

interface SideBarChatListProps {
  friends: User[];
  sessionId: string;
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

const SideBarChatList: FC<SideBarChatListProps> = ({ friends, sessionId }) => {
  const router = useRouter();
  const pathName = usePathname();

  const [unseenMsgs, setUnseenMsgs] = useState<Message[]>([]);
  const [activeChats, setActiveChats] = useState<User[]>(friends);

  useEffect(() => {
    pusherClient.subscribe(pusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(pusherKey(`user:${sessionId}:friends`));

    const friendHandler = (newFriend: User) => {
      setActiveChats((prev) => [...prev, newFriend]);
    };

    const chatHandler = (msg: ExtendedMessage) => {
      const shouldNotify =
        pathName !==
        `/dashboard/chat/${chatHrefConstructor(sessionId, msg.senderId)}`;

      if (!shouldNotify) return;

      //notify:

      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          sessionId={sessionId}
          senderId={msg.senderId}
          senderImg={msg.senderImg}
          senderMessage={msg.text}
          senderName={msg.senderName}
        />
      ));

      setUnseenMsgs((prev) => [...prev, msg]);
    };

    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_friend", friendHandler);

    return () => {
      pusherClient.unsubscribe(pusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(pusherKey(`user:${sessionId}:friends`));

      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unbind("new_friend", friendHandler);
    };
  }, [pathName, sessionId, router]);

  useEffect(() => {
    if (pathName?.includes("chat")) {
      setUnseenMsgs((prev) => {
        return prev.filter((msg) => !pathName.includes(msg.senderId));
      });
    }
  }, [pathName]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-2">
      {friends.sort().map((friend) => {
        const unseenMsgsCount = unseenMsgs.filter((msg) => {
          return msg.senderId === friend.id;
        }).length;

        return (
          <li key={friend.id}>
            <a
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-100 group flex items-center gap-x-3 rounded-md p-2 transition-all text-sm leading-6 font-semibold"
              href={`/dashboard/chat/${chatHrefConstructor(
                sessionId,
                friend.id
              )}`}>
              {friend.name}
              {unseenMsgsCount > 0 && (
                <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                  {unseenMsgsCount}
                </div>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SideBarChatList;
