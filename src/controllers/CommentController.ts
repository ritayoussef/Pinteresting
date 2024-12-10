import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";
import Comment, { CommentsProps } from "../models/Comments";
import { createUTCDate } from "../utils";

export default class CommentController {
    private sql: postgres.Sql<any>;

    constructor(sql: postgres.Sql<any>) {
        this.sql = sql;
    }

    registerRoutes(router: Router) {
        router.get("/comment", this.getCommentForm);
        router.post("/comments", this.createComment);
        // Add other routes for fetching, updating, and deleting comments
    }

    createComment = async (req: Request, res: Response) => {
        // Extract necessary data from the request body
        const { content, postId, userId } = req.body;

        // Check if required fields are present
        if (!content || !postId || !userId) {
            return res.send({
                statusCode: StatusCode.BadRequest,
                message: "Request body must include content, postId, and userId.",
            });
        }

        // Create a new comment
        const commentProps: CommentsProps = {
            content,
            createdAt: createUTCDate(),
            postId,
            userId,
        };

        try {
            const comment = await Comment.create(this.sql, commentProps);
            return res.send({
                statusCode: StatusCode.Created,
                message: "Comment created successfully!",
                payload: { comment: comment.props },
            });
        } catch (error) {
            console.error("Error while creating comment:", error);
            return res.send({
                statusCode: StatusCode.InternalServerError,
                message: "Error creating comment",
            });
        }
    };

    getComment = async (req: Request, res: Response) => {
        const id = req.getId();

        if (!id) {
            return res.send({
                statusCode: StatusCode.BadRequest,
                message: "Invalid comment ID",
            });
        }

        try {
            const comment = await Comment.read(this.sql, id);
            if (!comment) {
                return res.send({
                    statusCode: StatusCode.NotFound,
                    message: "Comment not found",
                });
            }
            return res.send({
                statusCode: StatusCode.OK,
                message: "Comment retrieved successfully",
                payload: { comment: comment.props },
            });
        } catch (error) {
            console.error("Error while fetching comment:", error);
            return res.send({
                statusCode: StatusCode.InternalServerError,
                message: "Error fetching comment",
            });
        }
    };

    // Method to fetch all comments for a specific post
    getCommentsForPost = async (req: Request, res: Response) => {
        const postId = req.getId();

        if (!postId) {
            return res.send({
                statusCode: StatusCode.BadRequest,
                message: "Invalid post ID",
            });
        }

        try {
            const comments = await Comment.readAllByPost(this.sql, postId);
            return res.send({
                statusCode: StatusCode.OK,
                message: "Comments retrieved successfully",
                template: "ShowView",
                payload: { comments: comments.map(comment => comment.props) },
            });
        } catch (error) {
            console.error("Error while fetching comments for post:", error);
            return res.send({
                statusCode: StatusCode.InternalServerError,
                message: "Error fetching comments for post",
            });
        }
    };

    // Method to update a comment
    updateComment = async (req: Request, res: Response) => {
        const id = req.getId();
        const updateProps: Partial<CommentsProps> = req.body;

        if (!id) {
            return res.send({
                statusCode: StatusCode.BadRequest,
                message: "Invalid comment ID",
            });
        }

        try {
            const comment = await Comment.read(this.sql, id);
            if (!comment) {
                return res.send({
                    statusCode: StatusCode.NotFound,
                    message: "Comment not found",
                });
            }
            await comment.update(updateProps);
            return res.send({
                statusCode: StatusCode.OK,
                message: "Comment updated successfully",
                payload: { comment: comment.props },
            });
        } catch (error) {
            console.error("Error while updating comment:", error);
            return res.send({
                statusCode: StatusCode.InternalServerError,
                message: "Error updating comment",
            });
        }
    };

    // Method to delete a comment
    deleteComment = async (req: Request, res: Response) => {
        const id = req.getId();

        if (!id) {
            return res.send({
                statusCode: StatusCode.BadRequest,
                message: "Invalid comment ID",
            });
        }

        try {
            const comment = await Comment.read(this.sql, id);
            if (!comment) {
                return res.send({
                    statusCode: StatusCode.NotFound,
                    message: "Comment not found",
                });
            }
            await comment.delete();
            return res.send({
                statusCode: StatusCode.OK,
                message: "Comment deleted successfully",
                payload: { comment: comment.props },
            });
        } catch (error) {
            console.error("Error while deleting comment:", error);
            return res.send({
                statusCode: StatusCode.InternalServerError,
                message: "Error deleting comment",
            });
        }
    };

    getCommentForm = async (req: Request, res: Response) => {
		// Get the userId from the session
		const userId = req.session.get("userId");
		
		// Check if the user is authenticated
		if (!userId) {
			return res.send({
				statusCode: StatusCode.Unauthorized,
				message: "Unauthorized",
				redirect: "/login",		
			});
		}

        await res.send({
            statusCode: StatusCode.OK,
            message: "Comment form",
            template: "CommentsOnPost",
            payload: { 
                title: "New Comment", // Add tags to the payload
            },
        });
	};
}
