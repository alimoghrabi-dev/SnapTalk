import FriendReqOption from "@/components/FriendReqOption";
import { Icon, Icons } from "@/components/Icons";
import MobileChatLayout from "@/components/MobileChatLayout";
import SideBarChatList from "@/components/SideBarChatList";
import SignOutButton from "@/components/SignOutButton";
import { getFriendById } from "@/helpers/get-friends-id";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { SideBarOption } from "@/types/typings";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const sideBarOptions: SideBarOption[] = [
  {
    id: 1,
    name: "Add Friend",
    href: "/dashboard/add",
    Icon: "UserPlus",
  },
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const friends = await getFriendById(session.user.id);

  const unseenReqCount = (
    (await fetchRedis(
      "smembers",
      `user:${session.user.id}:incoming_friend_requests`
    )) as User[]
  ).length;

  return (
    <div className="w-full flex h-screen">
      <div className="md:hidden">
        <MobileChatLayout
          friends={friends}
          session={session}
          sidebarOptions={sideBarOptions}
          unseenRequestCount={unseenReqCount}
        />
      </div>
      <div className="hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overscroll-y-auto border-gray-300 border-r bg-white px-6">
        <Link
          href="/dashboard"
          className="flex h-16 shrink-0 items-center gap-4">
          <Icons.Logo className="h-8 w-auto text-indigo-600" />
          <span className="text-2xl text-indigo-600 font-semibold custom-font mb-1">
            SnapTalk
          </span>
        </Link>

        <div className="text-xs font-semibold leading-6 text-gray-400">
          Your Chats
        </div>

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              {friends.length > 0 ? (
                <SideBarChatList
                  sessionId={session.user.id}
                  friends={friends}
                />
              ) : (
                <span className="font-medium">No Friends Yet.</span>
              )}
            </li>
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400">
                Overview
              </div>

              <ul role="list" className="-mx-2 mt-2 spac-y-1">
                {sideBarOptions.map((option) => {
                  const Icon = Icons[option.Icon];

                  return (
                    <li key={option.id}>
                      <Link
                        href={option.href}
                        className="text-gray-700 transition-all hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold">
                        <span className="text-gray-400 transition-all border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="truncate">{option.name}</span>
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <FriendReqOption
                    sessionId={session.user.id}
                    initialUnseenReqCount={unseenReqCount}
                  />
                </li>
              </ul>
            </li>

            <li className="-mx-6 mt-auto flex items-center">
              <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                <div className="relative h-8 w-8 bg-gray-50">
                  <Image
                    src={session.user.image || ""}
                    alt="profile image"
                    fill
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                  />
                </div>
                <span className="sr-only">Your Profile</span>
                <div className="flex flex-col">
                  <span aria-hidden="true">{session.user.name}</span>
                  <span className="text-xs text-zinc-400" aria-hidden="true">
                    {session.user.email}
                  </span>
                </div>
              </div>

              <SignOutButton className="h-full aspect-square" />
            </li>
          </ul>
        </nav>
      </div>
      <aside className="max-h-screen container py-16 md:py-12 w-full">
        {children}
      </aside>
    </div>
  );
}
