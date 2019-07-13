import {arrayProp, prop, Typegoose} from "typegoose";
import { Fund } from "./fund";

export class User extends Typegoose {

    @prop({ unique: true })
    public email: string;

    @arrayProp({items: Fund})
    public funds: Fund[];

}

const UserModel = new User().getModelForClass(User, {
    schemaOptions: {
        toJSON: {
            transform(doc, ret) {
                ret.funds.map((f: any) => {
                    f.id = f._id.toHexString();
                    delete f._id;
                });
                delete ret._id;
                delete ret.__v;
            }
        }
    }
});

export default UserModel;
