import {prop, Typegoose} from "typegoose";

enum SUBTYPE {
    COMMON = "common",
    PERSONAL = "personal",
}
enum TYPE {
    INCOME = "income",
    OUTCOME = "outcome",
}

export class Fund extends Typegoose {
    @prop()
    public date: Date;

    @prop()
    public name: string;

    @prop()
    public value: number;

    @prop({enum: TYPE})
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
