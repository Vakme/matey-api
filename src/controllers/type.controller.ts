import {Body, CurrentUser, Get, HttpCode, JsonController, Post} from "routing-controllers";
import {ConflictError} from "../errors/ConflictError";
import TypeModel, {Type} from "../models/type/type";

@JsonController()
export default class TypeController {
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
}
