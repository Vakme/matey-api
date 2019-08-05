import {prop, Typegoose} from "typegoose";

enum TYPE {
    COMMON = "common",
    PERSONAL = "personal",
}

export class Fund extends Typegoose {
    @prop()
    public date: Date;

    @prop()
    public name: string;

    @prop()
    public value: number;

    @prop({enum: TYPE})
    public type?: TYPE;
}

const FundModel = new Fund().getModelForClass(Fund, {
    schemaOptions: {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id.toHexString();
                delete ret._id;
            }
        }
    }
});

export default FundModel;
