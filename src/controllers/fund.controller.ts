import mongoose from "mongoose";
import {
    Body,
    CurrentUser,
    Delete,
    Get,
    HttpCode,
    InternalServerError,
    JsonController, NotFoundError,
    OnUndefined,
    Param,
    Post
} from "routing-controllers";
import {Fund} from "../models/fund";
import UserModel from "../models/user";

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
    public async getAllUsers(@CurrentUser({ required: true }) email: string) {
        const users = await UserModel.find({});
        return users.map((u) => u.toJSON());
    }

    @Get("/summary")
    public async sumUpFunds(@CurrentUser({ required: true }) email: string) {
        try {
            const summaryQuery = [{
                $project: {
                    summary: {
                        $divide: [{
                            $sum: "$funds.value"
                        }, 2]
                    },
                    user: "$email"
                }
            }];
            const sums = await UserModel.aggregate(summaryQuery);
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
        const user = await UserModel.findOne({email});
        return user.toJSON();
    }

    @HttpCode(201)
    @Post("/funds")
    public async addExpense(@CurrentUser({ required: true }) email: string, @Body() fund: Fund) {
        const parent: any = await UserModel.findOne({email});
        console.log(parent);
        parent.funds.push(fund);
        await parent.save();
        return parent.toJSON();

    }

    @Delete("/funds/:id")
    @OnUndefined(204)
    public async removeExpense(@CurrentUser({ required: true }) email: string, @Param("id") id: string) {
        const parent: any = await UserModel.findOne({email});
        if (!parent.funds.id(id)) {
            throw new NotFoundError("Item does not exist");
        }
        parent.funds.id(id).remove();
        await parent.save();
        return parent.funds.id(id);
    }
}
