"use client";

import { cn, pusherKey } from "@/lib/utils";
import { Message } from "@/lib/validations/message";
import { FC, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";

interface MessagesComponentProps {
  initialMessages: Message[];
  sessionId: string;
  chatId: string;
  sessionImg: string | null | undefined;
  chatPartner: User;
}

const MessagesComponent: FC<MessagesComponentProps> = ({
  initialMessages,
  sessionId,
  chatId,
  sessionImg,
  chatPartner,
}) => {
  const scrollDownRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    pusherClient.subscribe(pusherKey(`chat:${chatId}`));

    const messageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev]);
    };

    pusherClient.bind("incoming-message", messageHandler);

    return () => {
      pusherClient.unsubscribe(pusherKey(`chat:${chatId}`));

      pusherClient.unbind("incoming-message", messageHandler);
    };
  }, [chatId]);

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, "HH:mm a");
  };

  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
      <div ref={scrollDownRef} />

      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId;
        const hasNextMesgFromSameUser =
          messages[index + 1]?.senderId === messages[index].senderId;

        return (
          <div
            key={`${message.id}-${message.timestamp}`}
            className="chat-message">
            <div
              className={cn("flex items-end", {
                "justify-end": isCurrentUser,
              })}>
              <div
                className={cn(
                  "flex flex-col space-y-2 text-base max-w-xs mx-2",
                  {
                    "order-1 items-end": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  }
                )}>
                <span
                  className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-indigo-600 text-white": isCurrentUser,
                    "bg-zinc-200 text-gray-900": !isCurrentUser,
                    "rounded-br-none":
                      !hasNextMesgFromSameUser && isCurrentUser,
                    "rounded-bl-none":
                      !hasNextMesgFromSameUser && !isCurrentUser,
                  })}>
                  {message.text}
                  {"  "}
                  <span className="ml-2 text-xs text-gray-400">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </span>
              </div>

              <div
                className={cn("relative h-6 w-6", {
                  "invisible mup-0": hasNextMesgFromSameUser,
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                })}>
                <Image
                  src={
                    isCurrentUser ? (sessionImg as string) : chatPartner.image
                  }
                  alt="profile picture"
                  fill
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessagesComponent;
