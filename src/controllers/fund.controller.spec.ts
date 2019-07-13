import mockingoose from "mockingoose";
import * as mongoose from "mongoose";
import {Fund} from "../models/fund/fund";
import UserModel from "../models/user/user";
import FundController from "./fund.controller";

const fundController = new FundController();

describe("test fund controller", () => {
    it("should return healthcheck", () => {
        jest.mock("mongoose");
        const health = {
            dbState: "disconnected",
            health: "ok"
        };
        return fundController.getHealthCheck().then((res) => {
            expect(res).toMatchObject(health);
        });
    });

    it("should return all users", () => {
        const insDoc = [{
            email: "name@email.com",
            funds: [
                {
                    date: "2019-06-12T06:01:17.171Z",
                    name: "tv",
                    value: 5000
                }]
        }];
        mockingoose(UserModel).toReturn(insDoc, "find");
        return fundController.getAllUsers("name@email.com").then((doc) => {
            expect(JSON.parse(JSON.stringify(doc))).toMatchObject(insDoc);
        });
    });

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
        return fundController.getUserExpenses("name@email.com").then((doc) => {
            expect(JSON.parse(JSON.stringify(doc))).toMatchObject(insDoc);
        });
    });

    it("should add expense", () => {
        const insDoc = {
            email: "name@email.com",
            funds: [] as Fund[]
        };
        const date: Date = new Date();
        // @ts-ignore
        const newExpense: Fund = {
            date,
            name: "tandeta",
            value: 20
        };
        const extDoc = {
            email: "name@email.com",
            funds: [
                {
                    date,
                    name: "tandeta",
                    value: 20
                }]
        };
        mockingoose(UserModel).toReturn(insDoc, "findOne");
        return fundController.addExpense("name@email.com", newExpense).then((doc) => {
            expect(doc).toMatchObject(extDoc);
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
                    value: 20
                }]
        };
        mockingoose(UserModel).toReturn(insDoc, "findOne");
        return fundController.removeExpense("name@email.com", "507f191e810c19729de860ea").catch((e) => {
            expect(e.httpCode).toEqual(404);
            expect(e.message).toEqual("Item does not exist");
        });
    });

    it("should calculate summary", () => {
        const summaryDividedObj = [{
            summary: 100,
            user: "a"
        },{
            summary: 50,
            user: "b"
        }];
        const exp = {
            creditor: "a",
            diff: 50
        };
        mockingoose(UserModel).toReturn(summaryDividedObj, "aggregate");
        return fundController.sumUpFunds("name@email.com").then((doc) => {
            expect(JSON.parse(JSON.stringify(doc))).toMatchObject(exp)
        });
    });
});
