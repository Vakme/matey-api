import {arrayProp, prop, Typegoose} from "typegoose";
import { Fund } from "../fund/fund";

export class User extends Typegoose {

    @prop({ unique: true })
    public email: string;

    @prop({ unique: true})
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
