"use client";

import { pusherClient } from "@/lib/pusher";
import { pusherKey } from "@/lib/utils";
import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

type FriendReqProps = {
  incomingFriendReq: incomingFriendReqProp[];
  sessionId: string;
};

const FriendReq: FC<FriendReqProps> = ({ incomingFriendReq, sessionId }) => {
  const router = useRouter();

  const [friendReq, setFriendReq] =
    useState<incomingFriendReqProp[]>(incomingFriendReq);

  useEffect(() => {
    pusherClient.subscribe(
      pusherKey(`user:${sessionId}:incoming_friend_requests`)
    );

    const friendReqHandler = ({ id, senderEmail }: incomingFriendReqProp) => {
      setFriendReq((prev) => [...prev, { id, senderEmail }]);
    };

    pusherClient.bind("incoming_friend_requests", friendReqHandler);

    return () => {
      pusherClient.unsubscribe(
        pusherKey(`user:${sessionId}:incoming_friend_requests`)
      );

      pusherClient.unbind("incoming_friend_requests", friendReqHandler);
    };
  }, [sessionId]);

  const acceptFriend = async (senderId: string) => {
    await axios.post("/api/friends/accept", { id: senderId });

    setFriendReq((prev) => prev.filter((req) => req.id !== senderId));

    router.refresh();
  };

  const denyFriend = async (senderId: string) => {
    await axios.post("/api/friends/deny", { id: senderId });

    setFriendReq((prev) => prev.filter((req) => req.id !== senderId));

    router.refresh();
  };

  return (
    <>
      {friendReq.length === 0 ? (
        <p className="text-sm text-zinc-500">No Friend Requests.</p>
      ) : (
        friendReq.map((req) => (
          <div key={req.id} className="flex gap-4 items-center">
            <UserPlus className="text-black" />
            <p className="font-medium text-lg">{req.senderEmail}</p>
            <button
              onClick={() => acceptFriend(req.id)}
              aria-label="Accept Friend"
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md">
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>

            <button
              onClick={() => denyFriend(req.id)}
              aria-label="Deny Friend"
              className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md">
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendReq;
