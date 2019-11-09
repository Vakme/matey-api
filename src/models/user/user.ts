import { arrayProp, prop, Typegoose } from "@typegoose/typegoose";
import * as EmailValidator from "email-validator";
import { Fund } from "../fund/fund";

export class User extends Typegoose {

    @prop({ required: true, unique: true, validate: (value) => EmailValidator.validate(value)})
    public email: string;

    @prop({ unique: true, validate: (value) => EmailValidator.validate(value)})
    public partner: string;

    @arrayProp({items: Fund})
    public funds: Fund[];

    @arrayProp({items: Fund})
    public archive: Fund[];

}

const UserModel = new User().getModelForClass(User, {
    schemaOptions: {
        toJSON: {
            transform(doc, ret) {
                if (ret.funds) {
                    ret.funds.map((f: any) => {
                        f.id = f._id.toHexString();
                        delete f._id;
                    });
                }
                if (ret.archive) {
                    ret.archive.map((f: any) => {
                        f.id = f._id.toHexString();
                        delete f._id;
                    });
                }
                delete ret._id;
                delete ret.__v;
            }
        }
    }
});

export default UserModel;
