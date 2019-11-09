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
    Post, Put
} from "routing-controllers";
import {ConflictError} from "../errors/ConflictError";
import ShopListModel, {ShopList, ShopListItem} from "../models/shoplist/shoplist";
import UserModel from "../models/user/user";

@JsonController()
export default class ShopListController {
    @Get("/shoplist")
    public async getShopLists(@CurrentUser({required: true}) email: string) {
        const shopLists = await ShopListModel.find({users: email});
        return shopLists.map((s) => s.toJSON());
    }

    @HttpCode(201)
    @Post("/shoplist")
    public async addShopList(@CurrentUser({required: true}) email: string, @Body() shoplist: ShopList) {
        if (await ShopListModel.findOne({name: shoplist.name})) {
            throw new ConflictError("duplicated content");
        }
        const user = await UserModel.findOne({email}, {funds: 0, archive: 0});
        await ShopListModel.create({
            items: [],
            name: shoplist.name,
            users: [email, user.partner]
        });
        return await this.getShopLists(email);
    }

    @Delete("/shoplist/:id")
    @OnUndefined(204)
    public async getShopList(@CurrentUser({required: true}) email: string,
                             @Param("id") id: string) {
        const shoplist = await ShopListModel.findByIdAndDelete(id);
        if (!shoplist) {
            throw new NotFoundError("Item does not exist");
        }
        return ShopListModel.findById(id);
    }

    @HttpCode(201)
    @Post("/shoplist/:id")
    public async addShopListItem(@CurrentUser({required: true}) email: string,
                                 @Param("id") id: string,
                                 @Body() item: ShopListItem) {
        const shoplist = await ShopListModel.findById(id);
        shoplist.items.push(item);
        await shoplist.save();
        return await this.getShopLists(email);
    }

    @Put("/shoplist/:listId/items/:itemId")
    public async editShopListItem(@CurrentUser({required: true}) email: string,
                                  @Param("listId") listId: string,
                                  @Param("itemId") itemId: string,
                                  @Body() item: ShopListItem) {
        const parent: any = await ShopListModel.findById(listId);
        if (!parent || !parent.items.id(itemId)) {
            console.log(parent);
            throw new NotFoundError("Item does not exist");
        }
        parent.items.id(itemId).set(item);
        await parent.save();
        return await this.getShopLists(email);
    }

    @Delete("/shoplist/:listId/items")
    @OnUndefined(204)
    public async removeManyShopListItems(@CurrentUser({required: true}) email: string,
                                         @Param("listId") listId: string,
                                         @Body() idList: string[]) {
        const parent: any = await ShopListModel.findById(listId);
        if (!parent) {
            throw new NotFoundError("Item does not exist");
        }
        for (const itemId of idList) {
            parent.items.id(itemId).remove();
        }
        await parent.save();
        return parent.items.id(idList[0]);
    }

    @Delete("/shoplist/:listId/items/:itemId")
    @OnUndefined(204)
    public async removeShopListItem(@CurrentUser({required: true}) email: string,
                                    @Param("listId") listId: string,
                                    @Param("itemId") itemId: string) {
        const parent: any = await ShopListModel.findById(listId);
        if (!parent || !parent.items.id(itemId)) {
            throw new NotFoundError("Item does not exist");
        }
        parent.items.id(itemId).remove();
        await parent.save();
        return parent.items.id(itemId);
    }
}
