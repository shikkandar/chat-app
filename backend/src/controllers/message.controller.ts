import { Request, Response } from "express";
import prisma from "../Db/prisma.js";

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user?.id;

    if (!senderId) {
      res.status(400).json({ error: "Sender ID is required" });
      return;
    }

    let conversation = await prisma?.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [senderId, receiverId],
        },
      },
    });

    if (!conversation) {
      conversation = await prisma?.conversation.create({
        data: {
          participantIds: [senderId, receiverId],
        },
      });
    }

    const newMessage = await prisma?.message.create({
      data: {
        senderId,
        body: message,
        conversationId: conversation.id,
      },
    });

    if (newMessage) {
      conversation = await prisma?.conversation.update({
        where: { id: conversation.id },
        data: { messages: { connect: { id: newMessage.id } } },
      });
    }
    res.status(201).json(newMessage);

    //soket io will go here and send a new message to the receiver
  } catch (error: any) {
    console.log("Error in sendMessage", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const getMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: userToChatId } = req.params;
    const senderID = req.user?.id;

    if (!senderID || !userToChatId) {
      res
        .status(400)
        .json({ error: "Both sender and receiver IDs are required" });
      return;
    }

    const conversation = await prisma?.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [senderID, userToChatId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    res.status(200).json(conversation.messages);
  } catch (error: any) {
    console.log("Error in getMessage", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const getConversations = async (
  req: Request,
  res: Response
): Promise<void> => {
    try {
        const authUserId=req.user?.id;
        const users=await prisma?.user.findMany({
            where:{
                id:{
                    not:authUserId
                }
            },
            select:{
                id:true,
                fullname:true,
                profilePic:true
            }
        });
        res.status(200).json(users);
    } catch (error:any) {
        console.log("Error in getConversations", error.message);
        res.status(500).json({ error: "Server error" });
    }
}