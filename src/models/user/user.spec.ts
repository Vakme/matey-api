import mockingoose from "mockingoose";

import {Fund} from "../fund/fund";
import model from "./user";

describe("test mongoose User model", () => {

    it("should return document without _id", () => {
        const insDoc = {
            _id: "507f191e810c19729de860ea",
            email: "name@email.com",
        };
        const exDoc = {
            email: "name@email.com",
        };

        mockingoose(model).toReturn(insDoc, "findOne");

        return model.findById({ _id: "507f191e810c19729de860ea" }).then((doc) => {
            expect(JSON.parse(JSON.stringify(doc))).toMatchObject(exDoc);
        });
    });

    it("should return subdocument without _id", () => {
        const insDoc = {
            _id: "507f191e810c19729de860ea",
            archive: [{
                _id: "5d2a4577ea5aa62214676533",
                date: "2019-06-12T06:01:17.171Z",
                name: "tv",
                value: 5000
            }],
            email: "name@email.com",
            funds: [
                {
                    _id: "5d2a4577ea5aa62214676532",
                    date: "2019-06-12T06:01:17.171Z",
                    name: "tv",
                    value: 5000
                }]
        };
        const exDoc = {
            archive: [{
                date: "2019-06-12T06:01:17.171Z",
                id: "5d2a4577ea5aa62214676533",
                name: "tv",
                value: 5000
            }],
            email: "name@email.com",
            funds: [{
                    date: "2019-06-12T06:01:17.171Z",
                    id: "5d2a4577ea5aa62214676532",
                    name: "tv",
                    value: 5000
                }]
        };

        mockingoose(model).toReturn(insDoc, "findOne");

        return model.findById({ _id: "507f191e810c19729de860ea" }).then((doc) => {
            expect(JSON.parse(JSON.stringify(doc))).toMatchObject(exDoc);
        });
    });
});
