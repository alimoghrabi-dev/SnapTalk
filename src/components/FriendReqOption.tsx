"use client";

import { pusherClient } from "@/lib/pusher";
import { pusherKey } from "@/lib/utils";
import { User } from "lucide-react";
import Link from "next/link";
import { FC, useEffect, useState } from "react";

type FriendReqOptionProps = {
  sessionId: string;
  initialUnseenReqCount: number;
};

const FriendReqOption: FC<FriendReqOptionProps> = ({
  initialUnseenReqCount,
  sessionId,
}) => {
  const [unseenReqCount, setUnseenReqCount] = useState<number>(
    initialUnseenReqCount
  );

  useEffect(() => {
    pusherClient.subscribe(
      pusherKey(`user:${sessionId}:incoming_friend_requests`)
    );
    pusherClient.subscribe(pusherKey(`user:${sessionId}:friends`));

    const friendReqHandler = () => {
      setUnseenReqCount((prev) => prev + 1);
    };

    const addedFriendHandler = () => {
      setUnseenReqCount((prev) => prev - 1);
    };

    pusherClient.bind("incoming_friend_requests", friendReqHandler);
    pusherClient.bind("new_friend", addedFriendHandler);

    return () => {
      pusherClient.unsubscribe(
        pusherKey(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unsubscribe(pusherKey(`user:${sessionId}:friends`));

      pusherClient.unbind("incoming_friend_requests", friendReqHandler);
      pusherClient.unbind("new_friend", addedFriendHandler);
    };
  }, [sessionId]);

  return (
    <Link
      href="/dashboard/requests"
      className="text-gray-700 transition-all hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold">
      <div className="text-gray-400 transition-all border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
        <User className="h-4 w-4" />
      </div>
      <p className="truncate">Friends Requests</p>

      {unseenReqCount > 0 && (
        <div className="rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600">
          {unseenReqCount}
        </div>
      )}
    </Link>
  );
};

export default FriendReqOption;
