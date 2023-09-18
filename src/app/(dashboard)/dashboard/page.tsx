import Button from "@/components/UI/Button";
import { authOptions } from "@/lib/auth";
import { ArrowBigDown } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound } from "next/navigation";

const page = async ({}) => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  return (
    <div className="container py-12">
      <h1 className="text-center text-5xl font-bold text-indigo-600 custom-font mb-12">
        SnapTalk
      </h1>

      <div className="w-full flex flex-col gap-1 items-center justify-center">
        <h4 className="text-lg font-medium text-gray-900">Start Chatting</h4>
        <ArrowBigDown />
        <Link href={"/dashboard/add"}>
          <Button className="mt-2">Add Friends</Button>
        </Link>
      </div>
    </div>
  );
};

export default page;
