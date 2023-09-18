import FriendReq from "@/components/FriendReq";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC } from "react";
import { promise } from "zod";

const Page: FC = async () => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const incomingSenderId = (await fetchRedis(
    `smembers`,
    `user:${session.user.id}:incoming_friend_requests`
  )) as string[];

  const incomingFriendReq = await Promise.all(
    incomingSenderId.map(async (id) => {
      const sender = (await fetchRedis("get", `user:${id}`)) as string;
      const senderParsed = JSON.parse(sender);

      return { id, senderEmail: senderParsed.email };
    })
  );

  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Friend Requests</h1>
      <div className="flex flex-col gap-4">
        <FriendReq
          incomingFriendReq={incomingFriendReq}
          sessionId={session.user.id}
        />
      </div>
    </main>
  );
};

export default Page;
