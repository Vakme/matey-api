import mongoose from "mongoose";
import {CurrentUser, Get, JsonController} from "routing-controllers";
import UserModel from "../models/user/user";

@JsonController()
export default class HealthController {

    @Get("/")
    public async getHealthCheck() {
        // @ts-ignore
        const mongoState = mongoose.STATES[mongoose.connection ? mongoose.connection.readyState : 0];
        return {
            dbState: mongoState,
            health: "ok"
        };
    }

    @Get("/users")
    public async getAllUsers(@CurrentUser({ required: true }) email: string) {
        const users = await UserModel.find({});
        return users.map((u) => u.toJSON());
    }
}
