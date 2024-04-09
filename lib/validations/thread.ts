import * as z from 'zod';

export const ThreadValidation = z.object({
    thread: z.string().nonempty().min(3, { message: 'Minimum of 3 Characters'}),
    accoutId: z.string(),
})

export const CommentValidation = z.object({
    thread: z.string().nonempty().min(3, { message: 'Minimum of 3 Characters'}),
})