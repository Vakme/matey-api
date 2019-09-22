import {CurrentUser, Get, JsonController} from "routing-controllers";
import {Fund, TYPE} from "../models/fund/fund";
import UserModel from "../models/user/user";

@JsonController()
export default class SummaryController {
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

    @Get("/summary/chart")
    public async sumUpChart(@CurrentUser({ required: true }) email: string) {
        const user = await UserModel.findOne({email});
        const partner = await UserModel.findOne({email: user.partner});
        let incomes = [] as any[];
        let outcomes = [] as any[];
        const allExpenses: Fund[] = user.funds.concat(user.archive, partner.archive, partner.funds);
        for (const expense of allExpenses) {
            if (expense.type === TYPE.INCOME) {
               incomes = this.pushToArray(incomes, expense);
            } else {
               outcomes = this.pushToArray(outcomes, expense);
            }
        }
        const summary = await this.sumUpFunds(email);
        return {incomes, outcomes, summary};
    }

    private pushToArray(arr: any[], expense: Fund) {
        const currentIndex = arr.findIndex((x) =>
            x.name.trim() === expense.name.trim() &&
            x.month === expense.date.getMonth() &&
            x.year === expense.date.getFullYear());
        if (currentIndex >= 0) {
            arr[currentIndex].value += expense.value;
        } else {
            arr.push({
                month: expense.date.getMonth(),
                name: expense.name.trim(),
                value: expense.value,
                year: expense.date.getFullYear()
            });
        }
        return arr;
    }
}
