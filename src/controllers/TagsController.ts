import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";
import Tag from "../models/Tags";

export default class TagController {
    private sql: postgres.Sql<any>;

    constructor(sql: postgres.Sql<any>) {
        this.sql = sql;
    }

    registerRoutes(router: Router) {
        router.get("/tags", this.getAllTags);
    }

    getAllTags = async (req: Request, res: Response) => {
        try {
            const tags = await Tag.readAll(this.sql);
            return res.send({
                statusCode: StatusCode.OK,
                message: "Tags retrieved successfully.",
                payload: {
                    tags: tags.map(tag => tag.props)
                },
            });
        } catch (error) {
            console.error("Error retrieving tags:", error);
            return res.send({
                statusCode: StatusCode.InternalServerError,
                message: "An unknown error occurred. Please try again.",
            });
        }
    };
}