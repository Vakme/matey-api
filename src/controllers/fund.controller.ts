import mongoose from "mongoose";
import {
    Body,
    CurrentUser,
    Delete,
    Get,
    HttpCode,
    JsonController,
    NotFoundError,
    OnUndefined,
    Param,
    Post
} from "routing-controllers";
import {Fund} from "../models/fund/fund";
import UserModel from "../models/user/user";

@JsonController()
export default class FundController {
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

    @Get("/summary")
    public async sumUpFunds(@CurrentUser({ required: true }) email: string) {
        const partner = await UserModel.findOne({email}, {partner: 1});
        const summaryQuery = [
            {
                $match: {
                    email: {
                        $in: [
                            email, partner.partner
                        ]
                    }
                }
            }, {
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
        console.log(sums);
        return {
            creditor: sums.find((elem) =>
                elem.summary === Math.max(...sums.map((maxElem) =>
                    parseFloat(maxElem.summary))
                )
            ).user,
            diff: sums.reduce((prev, next) =>
                Math.abs(prev.summary - next.summary))
        };
    }

    @Get("/funds")
    public async getUserExpenses(@CurrentUser({ required: true }) email: string) {
        const user = await UserModel.findOne({email});
        const partner = await UserModel.findOne({email: user.partner});
        return {
            me: user.toJSON(),
            partner: partner.toJSON()
        };
    }

    @HttpCode(201)
    @Post("/funds")
    public async addExpense(@CurrentUser({ required: true }) email: string, @Body() fund: Fund) {
        const parent: any = await UserModel.findOne({email});
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
