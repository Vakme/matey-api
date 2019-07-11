export interface IFund {
    date: Date;
    name: string;
    value: number;
}

export class Fund implements IFund {
    public date: Date;
    public name: string;
    public value: number;

}
