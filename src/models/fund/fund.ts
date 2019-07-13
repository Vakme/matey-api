import {prop, Typegoose} from "typegoose";

export class Fund extends Typegoose {
    @prop()
    public date: Date;

    @prop()
    public name: string;

    @prop()
    public value: number;
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
