import mongoose from "mongoose";
import {
    Body,
    CurrentUser,
    Delete,
    Get,
    HttpCode,
    InternalServerError,
    JsonController,
    Param,
    Post
} from "routing-controllers";
import {Fund} from "../interfaces/fund.interface";
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

    // TODO: Change to @Authorized - email is not needed
    @Get("/users")
    public async getAllUsers(@CurrentUser({ required: true }) email: string) {
        try {
            return await User.find({});
        } catch (err) {
            throw new InternalServerError(err);
        }
    }

    // TODO: Change to @Authorized - email is not needed
    @Get("/summary")
    public async sumUpFunds(@CurrentUser({ required: true }) email: string) {
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
    public async getUserExpenses(@CurrentUser({ required: true }) email: string) {
        try {
            const user = await User.findOne({email});
            return user.toJSON();
        } catch (err) {
            throw new InternalServerError(err);
        }
    }

    @HttpCode(201)
    @Post("/funds")
    public async addExpense(@CurrentUser({ required: true }) email: string, @Body() fund: Fund) {
        try {
            await User.findOneAndUpdate(
                {email},
                {$push: {funds: fund}}
            );
            return await User.findOne({email});
        } catch (err) {
            throw new InternalServerError(err);
        }

    }

    @Delete("/funds/:name")
    @HttpCode(204)
    public async removeExpense(@CurrentUser({ required: true }) email: string, @Param("name") name: string) {
        try {
            await User.findOneAndUpdate(
                {email},
                {$pull: {funds: {name}}}
            );
            const obj = await User.findOne({email});
            return obj.toJSON();
        } catch (err) {
            throw new InternalServerError(err);
        }
    }
}
