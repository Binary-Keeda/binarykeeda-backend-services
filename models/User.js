import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new Schema(
    {
        name: { type: String, required: false },
        email: { type: String, required: true, unique: true, index: true },
        image:String,
        password: { type: String , sparse:true },
        role: { type: String, required: true, enum: ["admin", "user"], default: 'user' },
        phone:String,
        yearOfGraduation:{type:String, default:""},
        solutions:{type:String,default:0},
        program:{type:String, default:""},
        university:{type:String , default: ""},
        isVerified:{type:Boolean , default:false}
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.email =  this.email = this.email.toLowerCase();
        next();
    } catch (err) {
        next(err);
    }
});



const Users = model("Users", userSchema);

export default Users;
