import {HttpError} from "routing-controllers";

export class ConflictError extends HttpError {
    public message: string;
    public args: any[];

    constructor(message: string, args: any[] = []) {
        super(409);
        Object.setPrototypeOf(this, ConflictError.prototype);
        this.message = message;
        this.args = args;
    }

    public toJSON() {
        return {
            message: this.message,
            status: this.httpCode,
        };
    }
}
