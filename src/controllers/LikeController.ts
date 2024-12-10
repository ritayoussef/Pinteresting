import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";
import Post, { PostProps } from "../models/Posts";
import User, { UserProps } from "../models/User";
import Likes2, {LikeProps} from "../models/Likes2"
import { createUTCDate } from "../utils";


 
export default class PostController {
	private sql: postgres.Sql<any>;

	constructor(sql: postgres.Sql<any>) {
		this.sql = sql;
	}

	registerRoutes(router: Router) {
		//router.get("/posts", this.getPostsListNoTag);
        //router.get("/posts/tag", this.getPostsListTag);
		//router.get("/posts/new", this.getNewPostsForm);
		router.post("/likes/:id/:id", this.createPost);

		// Any routes that include an `:id` parameter should be registered last.
		//router.get("/posts/:id/edit", this.getEditPostForm);
		//router.get("/posts/:id", this.getPost);
        //router.get("/posts/:user_id", this.getPostsListUser);
		//router.put("/posts/:id", this.updatePost);
		//router.delete("/posts/:id", this.deletePost);
    }

	getNewPostsForm = async (req: Request, res: Response) => {
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
			message: "New Post form",
			template: "NewPostView",
			payload: { title: "New Post" },
		});
	};

	getEditPostForm = async (req: Request, res: Response) => {
		const id = req.getId();
		let post: Post | null = null;
		// Get the userId from the session
		const userId = req.session.get("userId");
		const session = req.getSession();
		const loggedIn = session.get("loggedIn");
		// Check if the user is authenticated
		if (!userId) {
			return res.send({
				statusCode: StatusCode.Unauthorized,
				message: "Unauthorized",
				redirect: "/login",		
			});
		}
		if(!id)
		{
			return res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid ID",
				payload: { error: "", loggedIn },
			});
		}
		 

		try {
			post = await Post.read(this.sql, id);
		} catch (error) {
			const message = `Error while getting post list: ${error}`;
			console.error(message);
		}

		await res.send({
			statusCode: StatusCode.OK,
			message: "Edit post form",
			template: "EditPostView",
			payload: { post: post?.props, title: "Edit Post" },
		});
	};

	 
	getPostsListNoTag = async (req: Request, res: Response) => {
		let posts: Post[] = [];
			// Get the userId from the session
			const session = req.getSession();
			const loggedIn = session.get("loggedIn");
			const userId = req.session.get("userId");
			const id = req.getId();
			// Check if the user is authenticated
			if (!userId) {
				return res.send({
					statusCode: StatusCode.Unauthorized,
					message: "Unauthorized",
					redirect: "/login",		
				});
			}
			try {
				posts = await Post.readAllNoTags(this.sql);
			} catch (error) {
				const message = `Error while getting todo list: ${error}`;
				console.error(message);
			}
		
			const postList = posts.map((post) => {
				return {
					...post.props,
				};
			});
		
			await res.send({
				statusCode: StatusCode.OK,
				 
				message: "Post list retrieved",
				payload: {
					title: "Post List",
					posts: postList, loggedIn,
				},
				template: "HomeView",
			});
		};
	
	

    getPostsListTag = async (req: Request, res: Response) => {
		let posts: Post[] = [];
		// Get the userId from the session
		const session = req.getSession();
		const loggedIn = session.get("loggedIn");
		const userId = req.session.get("userId");
		const id = req.getId();
		// Check if the user is authenticated
		if (!userId) {
			return res.send({
				statusCode: StatusCode.Unauthorized,
				message: "Unauthorized",
				redirect: "/login",		
			});
		}

        let tag: string = req.body.tag;

		try {
			posts = await Post.readAllTags(this.sql, userId);
		} catch (error) {
			const message = `Error while getting todo list: ${error}`;
			console.error(message);
		}
	
		const postList = posts.map((post) => {
			return {
				...post.props,
			};
		});
	
		await res.send({
			statusCode: StatusCode.OK,
			 
			message: "Post list retrieved",
			payload: {
				title: "Post List",
				posts: postList, loggedIn,
			},
			template: "HomeView",
		});
	};

    getPostsListUser = async (req: Request, res: Response) => {
		let posts: Post[] = [];
			// Get the userId from the session
			const session = req.getSession();
			const loggedIn = session.get("loggedIn");
			const userId = req.session.get("userId");
			const id = req.getId();
			// Check if the user is authenticated
			if (!userId) {
				return res.send({
					statusCode: StatusCode.Unauthorized,
					message: "Unauthorized",
					redirect: "/login",		
				});
			}
			
		try {
			posts = await Post.readAllUsers(this.sql, userId);
		} catch (error) {
			const message = `Error while getting post list: ${error}`;
			console.error(message);
		}
	
		const postList = posts.map((post) => {
			return {
				...post.props,
			};
		});
		
		await res.send({
			statusCode: StatusCode.OK,		 
			message: "Post list retrieved",
			payload: {
				title: "Post List",
				posts: postList, loggedIn,
			},
			template: "HomeView",
		});
	};

	 
	getPost = async (req: Request, res: Response) => {	
		const id = req.getId();
		let post: Post | null = null;
	    const session = req.getSession();
		const logged = session.get("loggedIn");
		const userId = session.data.userId;
	 
			
		// Check if the user is authenticated
		if (!req.session.exists("userId")) {
			return res.send({
				statusCode: StatusCode.Unauthorized,
				message: "Unauthorized",
				redirect: "/login",		
			});
		}
		if (!id) {
			return res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid ID",
				payload: { error: "Invalid ID", logged, },
			});
		}
		 
		try {
			post = await Post.read(this.sql, id);
		} catch (error) {
			const message = `Error while getting post list: ${error}`;
			console.error(message);
		}
		 
		if (!post) {
			return res.send({
				statusCode: StatusCode.NotFound,
				message: "Not found",
				payload: { error: "Not found", logged, },
			});
		}
		  
		if (userId !== post.props.id) {
				 return res.send({
					 statusCode: StatusCode.Forbidden,
					 message: "Forbidden",
					 payload: { error: "Forbidden", logged, },
				 });
		}
		 
		await res.send({
			statusCode: StatusCode.OK,
			message: "Post retrieved",
			template: "ShowView",
			payload: {
				post: post?.props,
				title: post?.props.title,
				logged, 
			},
		});
	};

	 
   createPost = async (req: Request, res: Response) => {
		const session = req.getSession();
		const loggedIn = session.get("loggedIn");
        const userLikeId = req.getUserIdLF();
        const postLikeId = req.getPostIdLF();
		// Check if the user is authenticated
		if (!req.session.exists("userId")) {
			return res.send({
				statusCode: StatusCode.Unauthorized,
				message: "Unauthorized",
				redirect: "/login",
			});
		}
	
	
		const userId = req.session.get("userId");
	
		const likeProps: LikeProps = {
			userId: userLikeId,
            postId: postLikeId
		};
	
		try {
			const like = await Likes2.create(this.sql, likeProps);
			if (!like) {
				throw new Error("Like creation returned null");
			}
			
			
			return res.send({
				statusCode: StatusCode.Created,
				message: "Like created successfully!",
				
			});
		} catch (error) {
			console.error("Error while creating post:", error);
	
			return res.send({
				statusCode: StatusCode.InternalServerError,
				message: "Error creating post",
				payload: {},
			});
		}
	};
	

	updatePost = async (req: Request, res: Response) => {
		const id = req.getId();
		const postProps: Partial<PostProps> = {};
		// Get the userId from the session
		const userId = req.session.get("userId");
		const session = req.getSession();
		const loggedIn = session.get("loggedIn");
		// Check if the user is authenticated
		if (!userId) {
			return res.send({
				statusCode: StatusCode.Unauthorized,
				message: "Unauthorized",
				redirect: "/login",		
			});
		}
		if (!id) {
			return res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid ID",
				redirect: '/login',
				payload: { error: "Invalid ID", loggedIn },
			});
		}
		if (req.body.title) {
			postProps.title = req.body.title;
		}

		if (req.body.caption) {
			postProps.caption = req.body.caption;
		}

		let post: Post | null = null;

		try {
			post = await Post.read(this.sql, id);
		} catch (error) {
			console.error("Error while updating post:", error);
		}

		try {
			await post?.update(postProps);
		} catch (error) {
			console.error("Error while updating post:", error);
		}

		await res.send({
			statusCode: StatusCode.OK,
			message: "Post updated successfully!",
			payload: { post: post?.props },
			redirect: `/posts/${id}`,
		});
	};
 
	deletePost = async (req: Request, res: Response) => {
		const id = req.getId();
		let post: Post | null = null;
		const session = req.getSession();
		const loggedIn = session.get("loggedIn");
		// Get the userId from the session
	 
			
		// Check if the user is authenticated
		if (!req.session.exists("userId")) {
			return res.send({
				statusCode: StatusCode.Unauthorized,
				message: "Unauthorized",
				redirect: "/login",				 
			});
		
		}
		if (!id) {
			return res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid ID",
				redirect: '/login',
				payload: { error: "Invalid ID", loggedIn },
			});
		}
		try {
			post = await Post.read(this.sql, id);
		} catch (error) {
			console.error("Error while deleting post:", error);
		}

		try {
			await post?.delete();
		} catch (error) {
			console.error("Error while deleting post:", error);
		}

		await res.send({
			statusCode: StatusCode.OK,
			message: "Post deleted successfully!",
			payload: { post: post?.props },
			redirect: "/posts",
		});
	};
}