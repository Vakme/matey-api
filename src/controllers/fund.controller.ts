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
    Post,
    Put
} from "routing-controllers";
import {ConflictError} from "../errors/ConflictError";
import {Fund} from "../models/fund/fund";
import TypeModel, {Type} from "../models/type/type";
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
            },
            {
                $project: {
                    commonIncomes: {
                        $filter: {
                            input: "$funds",
                            // tslint:disable-next-line:object-literal-sort-keys
                            as: "item",
                            cond: { $and: [
                                    { $eq: [
                                            "$$item.subtype", "common"
                                        ]},
                                    { $eq: [
                                            "$$item.type", "income"
                                        ]}
                                ]
                            }
                        }
                    },
                    commonOutcomes: {
                        $filter: {
                            input: "$funds",
                            // tslint:disable-next-line:object-literal-sort-keys
                            as: "item",
                            cond: { $and: [
                                    { $eq: [
                                    "$$item.subtype", "common"
                                ]},
                                    { $eq: [
                                            "$$item.type", "outcome"
                                    ]}
                                ]
                            }
                        }
                    },
                    email: "$email"
                }
            },
            {
            $project: {
                summary: {
                    $divide: [{
                        $subtract: [
                            {$sum: "$commonOutcomes.value"},
                            {$sum: "$commonIncomes.value"}
                        ]
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
        const user = await UserModel.findOne({email}, {archive: 0});
        const partner = await UserModel.findOne({email: user.partner}, {archive: 0});
        return {
            me: user.toJSON(),
            partner: partner.toJSON()
        };
    }

    @Get("/types")
    public async getPredefinedExpenseTypes(@CurrentUser({ required: true }) email: string) {
        const types = await TypeModel.find();
        return types.map((t) => t.toJSON());
    }

    @HttpCode(201)
    @Post("/types")
    public async addPredefinedExpenseType(@CurrentUser({ required: true }) email: string, @Body() type: Type) {
        if (await TypeModel.findOne({name: type.name})) {
            throw new ConflictError("duplicated content");
        }
        await TypeModel.create({
            email,
            locales: type.locales,
            name: type.name
        });
        return await this.getPredefinedExpenseTypes(email);
    }

    @Put("/funds/:id")
    public async editExpense(@CurrentUser({ required: true }) email: string,
                             @Param("id") id: string,
                             @Body() fund: Fund) {
        const parent: any = await UserModel.findOne({email}, {archive: 0});
        if (!parent.funds.id(id)) {
            throw new NotFoundError("Item does not exist");
        }
        parent.funds.id(id).set(fund);
        await parent.save();
        const partner = await UserModel.findOne({email: parent.partner}, {archive: 0});
        return {
            me: parent.toJSON(),
            partner: partner.toJSON()
        };
    }

    @HttpCode(201)
    @Post("/funds")
    public async addExpense(@CurrentUser({ required: true }) email: string, @Body() fund: Fund) {
        const parent: any = await UserModel.findOne({email}, {archive: 0});
        parent.funds.push(fund);
        await parent.save();
        const partner = await UserModel.findOne({email: parent.partner}, {archive: 0});
        return {
            me: parent.toJSON(),
            partner: partner.toJSON()
        };

    }

    @Delete("/funds/:id")
    @OnUndefined(204)
    public async removeExpense(@CurrentUser({ required: true }) email: string, @Param("id") id: string) {
        const parent: any = await UserModel.findOne({email}, {archive: 0});
        if (!parent.funds.id(id)) {
            throw new NotFoundError("Item does not exist");
        }
        parent.funds.id(id).remove();
        await parent.save();
        return parent.funds.id(id);
    }
}
