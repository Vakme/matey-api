import {Fund, IFund} from "./fund.interface";

export interface IUser {
    email: string;
    funds: IFund[];
}

export class UserReq implements IUser {
    public email: string;
    public funds: Fund[];

}
