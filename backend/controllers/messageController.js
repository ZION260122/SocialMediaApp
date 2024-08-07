import Conversation from "../models/conversationMode";
import Message from "../models/messageModel";

const sendMessage = async (req, res) => {
    try {
        const {recipientId, message} = req.body;
        const senderId = req.user._id;
        
        let conversation = await Conversation.findOne({
            participants : { $all : [senderId, recipientId]}
        })

        if(!conversation) {
            conversation = new Conversation({
                participants: [senderId, recipientId],
                lastMessage : {
                    text: message, 
                    sender: senderId,
                }
            })

            await conversation.save();
        }
         const newMessage = new Message({
            conversationId : conversation._id,
            sender: senderId,
            text: message,
         });
         await promise.all([
            newMessage.save(),
            conversation.updateOne({
                lastMessage: {
                    text: message,
                    sender: senderId
                }
            })
         ])

         res.status(201).json(newMessage)


    } catch (error) {
        res.status.json({error: error.message})
    }
}

export {sendMessage}