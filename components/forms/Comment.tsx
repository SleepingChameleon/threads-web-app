"use client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { CommentValidation } from '@/lib/validations/thread';
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { z } from "zod"
import { Input } from "@/components/ui/input"
//import { updateUser } from '@/lib/actions/user.actions';
import { usePathname, useRouter } from 'next/navigation';
import { addCommentToThread, createThread } from '@/lib/actions/thread.actions';
import Image from 'next/image';


interface Props {
    threadId: string;
    currentUserImg: string;
    currentUserId: string;
}
const Comment = ({ threadId, currentUserId, currentUserImg }: Props ) => {


    const router = useRouter();
    const pathname = usePathname();
  
    const form = useForm({
      resolver: zodResolver(CommentValidation),
      defaultValues: {
        thread: '',
      }
    });

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        await addCommentToThread(threadId, values.thread, JSON.parse(currentUserId), pathname);
    
        form.reset();
    }

    return (
    <Form {...form}>
      <form className="comment-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
          control={form.control}
          name='thread'
          render={({ field }) => (
            <FormItem className='flex w-full items-center gap-3'>
              <FormLabel className='no-focus border border-dark-4 bg-dark-3 text-light-1'>
                <Image src={currentUserImg} alt='Profile image' width={48} height={48} className='rounded-full object-cover'/>
              </FormLabel>
              <FormControl className='border-none bg-transparent'>
                <Input type='text' placeholder="Comment..." className='no-focus text-light-1 outline-none' {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type='submit' className='comment-form_btn'>Reply</Button>
      </form>
    </Form>
    )
}

export default Comment;