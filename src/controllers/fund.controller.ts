import mongoose from "mongoose";
import {
    Body,
    Delete,
    Get,
    HttpCode,
    InternalServerError,
    JsonController,
    OnUndefined,
    Param,
    Post
} from "routing-controllers";
import {Fund} from "../interfaces/fund.interface";
import {IUser, UserReq} from "../interfaces/user.interface";
import User from "../models/user";

@JsonController()
export class FundController {
    @Get("/")
    public async getHealthCheck() {
        // @ts-ignore
        const mongoState = mongoose.STATES[mongoose.connection.readyState];
        return {
            dbState: mongoState,
            health: "ok"
        };
    }

    @Get("/users")
    public async getAllUsers() {
        try {
            const users = await User.find({});
            return users.map((u) => u.toJSON());
        } catch (err) {
            throw new InternalServerError(err);
        }
    }

    @Get("/summary")
    public async sumUpFunds() {
        try {
            const sums = await User.aggregate([
                {
                    $project: {
                        summary: {
                            $divide: [
                                {
                                    $sum: "$funds.value"
                                }, 2
                            ]
                        },
                        user: "$username"
                    }
                }
            ]);
            return {
                creditor: sums.find((elem) =>
                    elem.summary === Math.max(...sums.map((maxElem) =>
                        parseFloat(maxElem.summary))
                    )
                ).user,
                diff: sums.reduce((prev, next) =>
                    Math.abs(prev.summary - next.summary))
            };
        } catch (err) {
            throw new InternalServerError(err);
        }
    }

    @Get("/funds")
    public async getUserExpenses() {
        try {
            const user = await User.findOne({email: "email"});
            return user.toJSON();
        } catch (err) {
            throw new InternalServerError(err);
        }
    }

    @HttpCode(201)
    @Post("/funds")
    public async addExpense(@Body() fund: Fund) {
        try {
            await User.findOneAndUpdate(
                {email: "email"},
                {$push: {funds: fund}}
            );
            const obj = await User.findOne({email: "email"});
            return obj.toJSON();
        } catch (err) {
            throw new InternalServerError(err);
        }

    }

    @Delete("/funds/:name")
    @HttpCode(204)
    public async removeExpense(@Param("name") name: string): Promise<void> {
        try {
            await User.findOneAndUpdate(
                {email: "email"},
                {$pull: {funds: {name}}}
            );
            const obj = await User.findOne({email: "email"});
            return obj.toJSON();
        } catch (err) {
            throw new InternalServerError(err);
        }
    }
}
