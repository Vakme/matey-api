import {prop, Typegoose} from "@typegoose/typegoose";

class Locales {
    @prop()
    public pl: string;

    @prop()
    public en: string;
}

export class Type extends Typegoose {
    @prop()
    public name: string;

    @prop()
    public email?: string;

    @prop()
    public locales?: Locales;
}

const TypeModel = new Type().getModelForClass(Type, {
    schemaOptions: {
        toJSON: {
            transform(doc, ret) {
                delete ret._id;
                if (ret.locales) {
                    delete ret.locales._id;
                }
            }
        }
    }
});
export default TypeModel;
