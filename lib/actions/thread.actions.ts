"use server"
import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";

interface Params{
    text: string,
    author: string,
    communityId: string | null,
    path: string
}


export async function createThread({ text, author, communityId, path }: Params) {

    try {
        connectToDB();
    
    const createdThread = await Thread.create({
        text,
        author,
        commmunity: null,
    });

    //Update User Model
    await User.findByIdAndUpdate( author, { $push: { threads: createdThread._Id }})

    revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Error Creating Thread: ${error.message}`)
    }
    
}

export async function fetchPosts(pagenumber = 1, pagesize = 20){

    connectToDB();

    // Calculate the number of posts to skip
    const skipAmount = (pagenumber - 1) * pagesize;

    // Fetch the post that have no parents (top-level threads...)
    const postsQuery = Thread.find({ parentId: { $in: [null, undefined]} })
    .sort({ createdAt: 'desc'})
    .skip(skipAmount)
    .limit(pagesize)
    .populate({ path: 'author', model: 'User'})
    .populate({ path: 'children', populate: {
        path: 'author',
        model: User,
        select: "_id name parentId image"
    }})

    const totalPostCount = await Thread.countDocuments({ parentId: { $in: [null, undefined]} })

    const posts = await postsQuery.exec();

    const isNext = totalPostCount > skipAmount + posts.length;

    return { posts, isNext };
}

export async function fetchThreadById(id: string) {
    connectToDB();

    try {

        //TODO Populate Community
        const thread = await Thread.findById(id).populate({ path: 'author', model: 'User', select: "_id id name image"})
        .populate({ path: 'children', populate: [
            { path: 'author', model: User, select: "_id id name image" },
            { path: 'children', model: Thread, populate: {
                path: 'author', model: User, select: "_id id parentId image"
            }}
        ]
    }).exec();

    return thread;

    } catch (error: any) {
        throw new Error(`Error fetching thread: ${error.message}`)
    }
}

export async function addCommentToThread( threadId: string, commentText: string, userId: string, path: string ) {
    connectToDB();

    try {
        // adding a comment => find the original threads by its ID
        const originalThread = await Thread.findById(threadId);

        if(!originalThread){
            throw new Error("Thread not found!");
        }

        const commentThread = new Thread({
            text: commentText,
            author: userId,
            parentId: threadId
        });
        // save a new thread function
        const saveCommentThread = await commentThread.save();

        // updating an original thread to include new comment
        originalThread.children.push(saveCommentThread._id);

        // saving the original thread
        await originalThread.save();

        revalidatePath(path);
        
    } catch (error: any) {
        throw new Error(`Error adding comment to thread: ${error.message}`)
    }
}

export async function fetchUserPosts(userId:string) {
    connectToDB();


    try {
        // finding all the user threads using the user ID

        //TODO: Populate Community
        const threads = await User.findOne({ id: userId })
        .populate({
            path: 'threads',
            model: Thread,
            populate: {
                path: 'children',
                model: Thread,
                populate: {
                    path: 'author',
                    model: User,
                    select: 'name image id'
                }
            }
        })

        return threads;
    } catch (error: any) {
        throw new Error(`Failed to fetch user posts: ${error.message}`);
        
    }
}