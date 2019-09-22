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
import {Fund} from "../models/fund/fund";
import UserModel from "../models/user/user";

@JsonController()
export default class FundController {

    @Get("/funds")
    public async getUserExpenses(@CurrentUser({ required: true }) email: string) {
        const user = await UserModel.findOne({email}, {archive: 0});
        const partner = await UserModel.findOne({email: user.partner}, {archive: 0});
        return {
            me: user.toJSON(),
            partner: partner.toJSON()
        };
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
        return await this.getPartnerAndReturn(parent);
    }

    @HttpCode(201)
    @Post("/funds")
    public async addExpense(@CurrentUser({ required: true }) email: string, @Body() fund: Fund) {
        const parent: any = await UserModel.findOne({email}, {archive: 0});
        parent.funds.push(fund);
        await parent.save();
        return await this.getPartnerAndReturn(parent);
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

    private async getPartnerAndReturn(me: any) {
        const partner = await UserModel.findOne({email: me.partner}, {archive: 0});
        return {
            me: me.toJSON(),
            partner: partner.toJSON()
        };
    }
}
