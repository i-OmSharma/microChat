import mongoose, { Document, Schema, Types } from "mongoose";

export interface IChat extends Document {
    chatId: Types.ObjectId;
    sender: String;
    text?: String;
    images?: {
        url:String;
        publicId: String;
    };
    messageType: "text"|"image";
    seen: boolean;
    seenAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}


const schema = new Schema<IChat>({
    chatId:{
        type: Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    },
    sender:{
        type: String,
        required: true,   
    },
    text: String,
    images:{
        url: String,
        publicId: String,
    },
    messageType:{
        type: String,
        enum: ["text", "image"],
        default: "text",
    },
    seen:{
        type: Boolean,
        default: false,
    },
    seenAt:{
        type: Date,
        default: null
    }

}, {timestamps: true}
)

export default mongoose.model<IChat>("Messages", schema)