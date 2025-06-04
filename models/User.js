import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new Schema(
    {
        name: { type: String, required: false },
        email: { type: String, required: true, unique: true, index: true },
        avatar:String,
        password: { type: String , sparse:true },
        role: { type: String, required: true, enum: ["admin", "user"], default: 'user' },
        phone:String,
        yearOfGraduation:{type:String, default:""},
        specialisation:{type:String,default:0},
        program:{type:String, default:""},
        university:{type:String , default: ""},
        semester:{type:String,default:""},
        isVerified:{type:Boolean , default:false},
        googleId:String,
        solutions:{
            totalQuizSolutions: {type:Number , default:0},
            totalTestSolutions: {type:Number , default:0},
            Rank: {type:Number , default:0},
            Points: {type:Number , default:0},
            Aptitude:{
                average:{type:Number, default:0},
                attempted:{type:Number, default:0},
            },
            Miscellaneous:{
                average:{type:Number, default:0},
                attempted:{type:Number, default:0},
            },
            Core:{
                average:{type:Number, default:0},
                attempted:{type:Number, default:0},
            },
            Ease:{
                 average:{type:Number, default:0},
                attempted:{type:Number, default:0},
            },
            Medium: {
                 average:{type:Number, default:0},
                attempted:{type:Number, default:0},
            },
            Hard :{
                 average:{type:Number, default:0},
                attempted:{type:Number, default:0},
            }
        }
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
