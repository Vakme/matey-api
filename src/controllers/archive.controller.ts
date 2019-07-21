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
export default class ArchiveController {
    @Get("/archive")
    public async getArchive(@CurrentUser({ required: true }) email: string) {
        const user = await UserModel.findOne({email}, {funds: 0});
        const partner = await UserModel.findOne({email: user.partner}, {funds: 0});
        return {
            me: user.toJSON(),
            partner: partner.toJSON()
        };
    }

    @HttpCode(201)
    @Post("/archive")
    public async moveToArchive(@CurrentUser({ required: true }) email: string) {
        const user = await UserModel.findOne({email});
        const partner = await UserModel.findOne({email: user.partner});
        user.archive.push.apply(user.archive, user.funds);
        partner.archive.push.apply(partner.archive, partner.funds);
        user.funds = [];
        partner.funds = [];
        await user.save();
        await partner.save();
        return {};
    }
}
