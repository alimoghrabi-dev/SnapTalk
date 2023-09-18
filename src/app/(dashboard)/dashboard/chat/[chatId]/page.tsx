import ChatInp from "@/components/ChatInp";
import MessagesComponent from "@/components/MessagesComponent";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { messageArrayValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    chatId: string;
  };
}

const getChatMsgs = async (chatId: string) => {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );

    const dbMsgs = results.map((result) => JSON.parse(result) as Message);

    const reversedMsgs = dbMsgs.reverse();

    const messages = messageArrayValidator.parse(reversedMsgs);

    return messages;
  } catch (error) {
    notFound();
  }
};

const Page = async ({ params }: PageProps) => {
  const { chatId } = params;

  const session = await getServerSession(authOptions);
  if (!session) return notFound();

  const { user } = session;

  const [userId1, userId2] = chatId.split("---");

  if (user.id !== userId1 && user.id !== userId2) return notFound();

  const chatPartnerId = user.id === userId1 ? userId2 : userId1;

  const chatPartnerRaw = (await fetchRedis(
    "get",
    `user:${chatPartnerId}`
  )) as string;
  const chatPartner = JSON.parse(chatPartnerRaw);
  const initialMsgs = await getChatMsgs(chatId);

  return (
    <div className="flex-1 flex justify-between flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image
                src={chatPartner.image}
                alt={`${chatPartner.name} profile picture`}
                fill
                referrerPolicy="no-referrer"
                className="rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatPartner.name}
              </span>
            </div>
            <span className="text-sm text-gray-600">{chatPartner.email}</span>
          </div>
        </div>
      </div>

      <MessagesComponent
        chatPartner={chatPartner}
        sessionImg={session.user.image}
        chatId={chatId}
        sessionId={session.user.id}
        initialMessages={initialMsgs}
      />
      <ChatInp chatPartner={chatPartner} chatId={chatId} />
    </div>
  );
};

export default Page;
