import mockingoose from "mockingoose";
import UserModel from "../models/user/user";
import HealthController from "./health.controller";

const healthController = new HealthController();

describe("test health controller", () => {
    it("should return healthcheck", () => {
        jest.mock("mongoose");
        const health = {
            dbState: "disconnected",
            health: "ok"
        };
        return healthController.getHealthCheck().then((res) => {
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
        return healthController.getAllUsers("name@email.com").then((doc) => {
            expect(JSON.parse(JSON.stringify(doc))).toMatchObject(insDoc);
        });
    });

});
