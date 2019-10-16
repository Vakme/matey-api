import {prop, Typegoose} from "typegoose";

enum SUBTYPE {
    COMMON = "common",
    PERSONAL = "personal",
}
export enum TYPE {
    INCOME = "income",
    OUTCOME = "outcome",
}

export class Fund extends Typegoose {
    @prop({ required: true })
    public date: Date;

    @prop({ required: true })
    public name: string;

    @prop({ min: 0, required: true })
    public value: number;

    @prop({maxlength: 50})
    public description?: string;

    @prop({required: true, enum: TYPE, default: "outcome"})
    public type: TYPE;

    @prop({enum: SUBTYPE})
    public subtype?: SUBTYPE;
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
