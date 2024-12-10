import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";
import User from "../models/User";


export default class Controller {
	private sql: postgres.Sql<any>;

	constructor(sql: postgres.Sql<any>) {
		this.sql = sql;
	}

	 
	registerRoutes(router: Router) {

		router.post("/users", this.createUser);
		router.get("/users/:id", this.getUser);
		// Any routes that include a `:id` parameter should be registered last.
	}

	 
	createUser = async (req: Request, res: Response) => {
		try {
			const email = req.body.email;
			const password = req.body.password;
			const confirmPassword = req.body.confirmPassword;
			const name = req.body.name;
			console.log("1: ", email);
			console.log("2: ", password);
			console.log("3: ", confirmPassword);
			console.log("4: ", name);
			if(!email)
			{
				return res.send({
					statusCode: StatusCode.BadRequest,
					redirect: "/register?error=missing_fields",
					message: "Missing email.",
					template: "RegisterView",
				});
			}
	
			if (!password || !confirmPassword) {
				return res.send({
					statusCode: StatusCode.BadRequest,
					redirect: "/register?error=missing_fields",
					message: "Missing password.",
					template: "RegisterView",
				});
			}
	
			if (password != confirmPassword) {
				return res.send({
					statusCode: StatusCode.BadRequest,
					redirect: "/register?error=password_mismatch",
					message: "Passwords do not match",
					template: "RegisterView",
				});
			}
	
			// Check if user with email already exists
			const existingUser = await this.sql`SELECT * FROM users WHERE email = ${email}`;
			if (existingUser.length > 0) {
				return res.send({
					statusCode: StatusCode.BadRequest,
					redirect: "/register?error=email_exists",
					message: "User with this email already exists.",
					template: "RegisterView",
				});
			}
	
			// Insert new user into database
			await this.sql`INSERT INTO users (email, password, created_at, name) VALUES (${email}, ${password}, NOW(), ${name})`;
	
			return res.send({
				statusCode: StatusCode.Created,
				message: "User created",
				redirect: "/login",
				payload: {
					user: {
						email,
						password,
						createdAt: new Date().toISOString(),
						editedAt: null,
					},
				},
			});
		} catch (error) {
			console.error("Error creating user:", error);
			return res.send({
				statusCode: StatusCode.InternalServerError,
				redirect: "/register?error=unknown_error",
				message: "An unknown error occurred. Please try again.",
				template: "RegisterView"
			});
		}
	};
	

	getUser = async (req: Request, res: Response) => {
		const id = req.getId();
		if (!id) {
			return res.send({
				statusCode: StatusCode.BadRequest,
				message: "Id is required.",
			});
		}

		try {
			const user = await User.getUserById(this.sql, id);
			if (!user) {
				return res.send({
					statusCode: StatusCode.NotFound,
					message: "User not found.",
					redirect: "/users",
				});
			}

			return res.send({
				statusCode: StatusCode.OK,
				message: "User retrieved.",
				template: "AccountDetails",
				payload: {
					user: {
						email: user.props.email,
						name: user.props.name,
						biography: user.props.biography,
						profilePicture: user.props.profile_picture,
					},
				},
			});
		} catch (error) {
			console.error("Error retrieving user:", error);
			return res.send({
				statusCode: StatusCode.InternalServerError,
				message: "An unknown error occurred. Please try again.",
			});
		}
	};
}