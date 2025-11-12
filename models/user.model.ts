import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export interface IUser {
    name: string;
    email: string;
    password: string;
    _id?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    }
}, { timestamps: true });


//hooks before saving the document (it is like middleware)

// userSchema.pre('save',async function(next){

//     this.password= await bcrypt.hash(this.password,10);

//     next();
// })
// we are commenting bcz we already use in backend part in api/login
export const User = mongoose.models?.User || mongoose.model<IUser>('User', userSchema);
