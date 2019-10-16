import * as EmailValidator from "email-validator";
import { arrayProp, prop, Typegoose } from "typegoose";

export class ShopListItem extends Typegoose {
    @prop({ required: true })
    public name: string;

    @prop({ required: true, default: false })
    public checked: boolean;
}

export class ShopList extends Typegoose {
    @prop({ required: true })
    public name: string;

    @arrayProp({ required: true, items: String, validate: (array) => array.forEach(EmailValidator.validate)})
    public users: string[];

    @arrayProp({items: ShopListItem })
    public items: ShopListItem[];

}

const ShopListModel = new ShopList().getModelForClass(ShopList, {
    schemaOptions: {
        toJSON: {
            transform(doc, ret) {
                if (ret.items) {
                    ret.items.map((f: any) => {
                        f.id = f._id.toHexString();
                        delete f._id;
                    });
                }
                ret.id = ret._id.toHexString();
                delete ret._id;
                delete ret.__v;
            }
        }
    }
});

export default ShopListModel;
