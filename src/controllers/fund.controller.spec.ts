import mockingoose from "mockingoose";
import {Fund, TYPE} from "../models/fund/fund";
import UserModel from "../models/user/user";
import FundController from "./fund.controller";

const fundController = new FundController();

describe("test fund controller", () => {

    it("should return all user funds", () => {
        const insDoc = {
            email: "name@email.com",
            funds: [
                {
                    date: "2019-06-12T06:01:17.171Z",
                    name: "tv",
                    value: 5000
                }]
        };
        mockingoose(UserModel).toReturn(insDoc, "findOne");
        const retDoc = {
            me: insDoc,
            partner: insDoc
        };
        return fundController.getUserExpenses("name@email.com").then((doc) => {
            expect(JSON.parse(JSON.stringify(doc))).toMatchObject(retDoc);
        });
    });

    it("should add expense", () => {
        const insDoc = {
            email: "name@email.com",
            funds: [] as Fund[],
            partner: "name2@email.com"
        };
        const date: Date = new Date();
        // @ts-ignore
        const newExpense: Fund = {
            date,
            name: "tandeta",
            type: TYPE.INCOME,
            value: 20
        };
        const extDoc = {
            me: {
                email: "name@email.com",
                funds: [
                    {
                        date,
                        name: "tandeta",
                        type: "income",
                        value: 20
                    }],
                partner: "name2@email.com"
            },
            partner: {
                email:  "name@email.com",
                funds: [] as Fund[],
                partner: "name2@email.com"
            },
        };
        mockingoose(UserModel).toReturn(insDoc, "findOne");
        return fundController.addExpense("name@email.com", newExpense).then((doc) => {
            expect(doc).toMatchObject(extDoc);
        });
    });

    it("should edit expense", () => {
        const date: Date = new Date();
        const ID: string = "507f191e810c19729de860ea";
        const insDoc = {
            email: "name@email.com",
            funds: [{
                _id: ID,
                date,
                name: "tandeta",
                type: TYPE.INCOME,
                value: 20
            }],
            partner: "name2@email.com"
        };
        // @ts-ignore
        const newExpense: Fund = {
            date,
            name: "tandeta",
            type: TYPE.OUTCOME,
            value: 20
        };
        const extDoc = {
            me: {
                email: "name@email.com",
                funds: [
                    {
                        date,
                        name: "tandeta",
                        type: "outcome",
                        value: 20
                    }],
                partner: "name2@email.com"
                },
            partner: {
                email:  "name@email.com",
                funds: [
                    {
                        date,
                        name: "tandeta",
                        type: "income",
                        value: 20
                    }],
                partner: "name2@email.com"
            },
        };
        mockingoose(UserModel).toReturn(insDoc, "findOne");
        return fundController.editExpense("name@email.com", ID, newExpense).then((doc) => {
            expect(doc).toMatchObject(extDoc);
        });
    });

    it("should throw 404 if updated expense does not exist", () => {
        const date: Date = new Date();
        const ID: string = "507f191e810c19729de860eb";
        const insDoc = {
            email: "name@email.com",
            funds: [{
                _id: ID,
                date,
                name: "tandeta",
                type: TYPE.INCOME,
                value: 20
            }],
            partner: "name2@email.com"
        };
        // @ts-ignore
        const newExpense: Fund = {
            date,
            name: "tandeta",
            type: TYPE.OUTCOME,
            value: 20
        };
        mockingoose(UserModel).toReturn(insDoc, "findOne");
        return fundController.editExpense("name@email.com", "507f191e810c19729de860ea", newExpense).catch((e) => {
            expect(e.httpCode).toEqual(404);
            expect(e.message).toEqual("Item does not exist");
        });
    });

    it("should remove expense", () => {
        const insDoc = {
            email: "name@email.com",
            funds: [
                {
                    _id: "507f191e810c19729de860ea",
                    date: "2019-06-12T06:01:17.171Z",
                    name: "tandeta",
                    type: TYPE.OUTCOME,
                    value: 20
                }]
        };
        mockingoose(UserModel).toReturn(insDoc, "findOne");
        return fundController.removeExpense("name@email.com", "507f191e810c19729de860ea").then((doc) => {
            expect(JSON.parse(JSON.stringify(doc))).toBeNull();
        });
    });

    it("should throw 404 if expense does not exist", () => {
        const insDoc = {
            email: "name@email.com",
            funds: [
                {
                    _id: "507f191e810c19729de860eb",
                    date: "2019-06-12T06:01:17.171Z",
                    name: "tandeta",
                    type: TYPE.OUTCOME,
                    value: 20
                }]
        };
        mockingoose(UserModel).toReturn(insDoc, "findOne");
        return fundController.removeExpense("name@email.com", "507f191e810c19729de860ea").catch((e) => {
            expect(e.httpCode).toEqual(404);
            expect(e.message).toEqual("Item does not exist");
        });
    });
});
