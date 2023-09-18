"use client";

import { FC, useState } from "react";
import Button from "./UI/Button";
import { addFriendValidator } from "@/lib/validations/add-friend";
import axios from "axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface AddFriendButtonProps {}

type FormData = z.infer<typeof addFriendValidator>;

const AddFriendButton: FC<AddFriendButtonProps> = ({}) => {
  const { handleSubmit, register } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator),
  });

  const [showState, setShowState] = useState<boolean>(false);
  const addFriend = async (email: string) => {
    try {
      const validatedEmail = addFriendValidator.parse({ email });

      await axios.post("/api/friends/add", { email: validatedEmail });

      setShowState(true);
    } catch (error) {
      toast.error("Something went wrong, Try again.");
    }
  };

  const onSubmit = (data: FormData) => {
    addFriend(data.email);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
      <label
        htmlFor="email"
        className="block text-sm font-medium leading-6 text-gray-900">
        Add friend by E-Mail
      </label>
      <div className="mt-2 flex gap-4">
        <input
          {...register("email")}
          type="text"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 outline-none focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="name@example.com"
        />
        <Button>Add</Button>
      </div>
      {showState && (
        <p className="mt-1 text-sm text-green-600">Friend request send.</p>
      )}
    </form>
  );
};

export default AddFriendButton;
