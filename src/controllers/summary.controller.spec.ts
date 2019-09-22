import mockingoose from "mockingoose";
import {Fund} from "../models/fund/fund";
import UserModel from "../models/user/user";
import SummaryController from "./summary.controller";

const summaryController = new SummaryController();

describe("test summary controller", () => {

    it("should calculate summary", () => {
        const user = {
            email: "name@email.com",
            funds: [] as Fund[],
            partner: "name2@email.com"
        };
        const summaryDividedObj = [{
            summary: 100,
            user: "name@email.com"
        }, {
            summary: 50,
            user: "name2@email.com"
        }];
        const exp = {
            creditor: "name@email.com",
            diff: 50
        };
        mockingoose(UserModel).toReturn(user, "findOne");
        mockingoose(UserModel).toReturn(summaryDividedObj, "aggregate");
        return summaryController.sumUpFunds("name@email.com").then((doc) => {
            expect(JSON.parse(JSON.stringify(doc))).toMatchObject(exp);
        });
    });

});
