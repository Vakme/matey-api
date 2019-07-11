import { Document, Model, model, Schema } from "mongoose";
import { IUser } from "../interfaces/user.interface";
interface IUserModel extends Document, IUser {}

const FundSchema: Schema = new Schema({
    date: Date,
    name: String,
    value: Number
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret._id;
        }
    }
});

const UserSchema: Schema = new Schema({
    funds: [FundSchema],
    name: String
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret._id;
        }
    }
});

export default model<IUserModel>("User", UserSchema);
