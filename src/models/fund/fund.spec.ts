import mockingoose from "mockingoose";

import model from "./fund";

describe("test mongoose User model", () => {

    it("should return document without _id", () => {
        const insDoc = {
            _id: "5d2a4577ea5aa62214676532",
            date: "2019-06-12T06:01:17.171Z",
            name: "tv",
            value: 5000
        };
        const exDoc = {
            date: "2019-06-12T06:01:17.171Z",
            name: "tv",
            value: 5000
        };

        mockingoose(model).toReturn(insDoc, "findOne");

        return model.findById({ _id: "507f191e810c19729de860ea" }).then((doc) => {
            expect(JSON.parse(JSON.stringify(doc))).toMatchObject(exDoc);
        });
    });
});
