import mongoose from "mongoose";

const userSchema= new mongoose.Schema({
    name:{
        type:String,
        require: [true,'']
    },
    email:{
        type:String,
        require: [true,""]
    },
    password:{
        type:String,
        require:[true,'']
    },
    // isAdmin:{
    //     type:Boolean,
    //     default:false
    // },
    // forgotPassword:String

});

export const User= mongoose.models.users || mongoose.model('users',userSchema);
