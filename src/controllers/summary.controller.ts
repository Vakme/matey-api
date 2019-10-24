import {IsInt, IsOptional, IsPositive, Max, Min} from "class-validator";
import {CurrentUser, Get, JsonController, QueryParams} from "routing-controllers";
import {Fund, TYPE} from "../models/fund/fund";
import UserModel from "../models/user/user";

class MonthYearQuery {

    @IsOptional()
    public month?: number;

    @IsOptional()
    public year?: number;
}

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

    @Get("/summary/chart2")
    public async typesChart(@CurrentUser({ required: true }) email: string, @QueryParams() query: MonthYearQuery) {
        const user = await UserModel.findOne({email});
        const partner = await UserModel.findOne({email: user.partner});
        const allExpenses: Fund[] = user.funds.concat(user.archive, partner.archive, partner.funds);
        return this.prepareChartData(allExpenses, query.year, query.month);

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

    private prepareDateList(expenseArray: Fund[]) {
        const dates: Set<any> = new Set(expenseArray.map((expense) => {
            return JSON.stringify({
                month: expense.date.getMonth(),
                year: expense.date.getFullYear()
            });
        }));
        return Array.from(dates).map((x) => JSON.parse(x));
    }

    private prepareChartData(expenseArray: Fund[], year?: number, month?: number) {
        const labels = this.prepareLabels(expenseArray);
        const dates = this.prepareDateList(expenseArray);
        if (!!year && !!month) {
            expenseArray = this.filterByDate(expenseArray, year, month);
        }
        const data = this.prepareData(labels, expenseArray);
        return { labels, data, dates };
    }

    private filterByDate(expenseArray: Fund[], year: number, month: number) {
        return expenseArray
            .filter((expense) =>
                // tslint:disable-next-line
                expense.date.getFullYear() == year && expense.date.getMonth() == month
            );
    }

    private prepareLabels(expenseArray: Fund[]) {
        return expenseArray
            .map((elem: Fund) => elem.name.trim())
            .filter((elem, ind, arr) => arr.indexOf(elem) === ind);
    }

    private prepareData(labels: string[], expenseArray: Fund[]) {
        const dataArr: number[] = [];
        labels.forEach((label) => {
            const sum = expenseArray
                            .filter((elem) => elem.name.trim() === label)
                            .map((elem) => elem.value)
                            .reduce((prevElem, currElem) => prevElem + currElem, 0);
            dataArr.push(sum);
        });
        return dataArr;
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
