import mockingoose from "mockingoose";

import {Fund} from "./fund";
import model from "./user";

describe("test mongoose User model", () => {

    it("should return document without _id", () => {
        const insDoc = {
            _id: "507f191e810c19729de860ea",
            email: "name@email.com",
            funds: [] as Fund[]
        };
        const exDoc = {
            email: "name@email.com",
            funds: [] as Fund[]
        };

        mockingoose(model).toReturn(insDoc, "findOne");

        return model.findById({ _id: "507f191e810c19729de860ea" }).then((doc) => {
            expect(JSON.parse(JSON.stringify(doc))).toMatchObject(exDoc);
        });
    });

});
