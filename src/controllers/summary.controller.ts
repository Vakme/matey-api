import {CurrentUser, Get, JsonController} from "routing-controllers";
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
}
