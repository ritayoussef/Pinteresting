import postgres from "postgres";
import Router from "../router/Router";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import User from "../models/User";
import Cookie from "../auth/Cookie";
import SessionManager from "../auth/SessionManager";


export default class AuthController {
	private sql: postgres.Sql<any>;

	constructor(sql: postgres.Sql<any>) {
		this.sql = sql;
	}

	registerRoutes(router: Router) {
		router.get("/register", this.getRegistrationForm);
		router.get("/login", this.getLoginForm);
		router.post("/login", this.login);
		router.get("/logout", this.logout);
	}

	/**
	 * TODO: Render the registration form.
	 */
	getRegistrationForm = async (req: Request, res: Response) => {
        const searchParams = req.getSearchParams() as any;
        let errorMessage = "";
        if (searchParams.get("error") === "missing_fields") {
            errorMessage = "Email is required";
        } else if (searchParams.get("error") === "password_mismatch") {
            errorMessage = "Passwords do not match";
        } else if (searchParams.get("error") === "email_exists") {
            errorMessage = "Email is already registered.";
        } else if (searchParams.get("error") === "unknown_error") {
            errorMessage = "An unknown error occurred. Please try again.";
        }  
             
        res.send({
            statusCode: StatusCode.OK,
            message: "Registration Form",
            template: "RegisterView",
            payload: { errorMessage: errorMessage,},
        });

    };
    
    

	/**
	 * TODO: Render the login form.
	 */
	getLoginForm = async (req: Request, res: Response) => { const searchParams = req.getSearchParams() as any;
		 let errorMessage = "";
         let session = SessionManager.getInstance().createSession();
         res.setCookie(new Cookie("session_id", session.id));
         session.set("loggedIn", true);

		if (searchParams.get("error") === "missing_fields") {
			errorMessage =  "Email is required.";
		} else if (searchParams.get("error") === "invalid_credentials") {
			errorMessage = "Invalid credentials.";
		}
	    
		res.send({statusCode: StatusCode.OK, 
            message: errorMessage, 
            template: "LoginView", 
            payload:{errorMessage: errorMessage,},});
	};

    

	/**
	 * TODO: Handle login form submission.
	 */
	login = async (req: Request, res: Response) => {
        const { email, password, remember } = req.body;
    
        try {
            if (req.body.email == '') {
                return res.send({
                    statusCode: StatusCode.BadRequest,
                    message: "Email is required.",
                    redirect: "/login?error=missing_fields",
                });
            }
    
            // Check if user exists and password matches
            const user = await User.login(this.sql, email, password);   
            if(user){
            // Set session cookie
            req.session.set("loggedIn", true);
            req.session.set("userId", user.props.id);
            res.setCookie(new Cookie("session_id", req.session.id));  
        
    
            // Set remember me cookie if checkbox was checked
            if (remember) {
                res.setCookie(new Cookie("email", req.body.email));
             
            }
           
    
            return res.send({
                statusCode: StatusCode.OK,
                redirect: "/posts",
                message: "Logged in successfully!",
                payload: {
                    user: {
                        email: req.body.email,
                        password: req.body.password,
                        createdAt: true,
                
                    },
                },
            });
        }
        } catch (error) {
            console.error("Error logging in:", error);
            return res.send({
                statusCode: StatusCode.BadRequest,
                message: "Invalid credentials.",
                redirect: "/login?error=invalid_credentials",
            });
        }
    };
    
    
	/**
	 * TODO: Handle logout.
	 */
	logout = async (req: Request, res: Response) => {
		req.session.destroy();
        return res.send({
            statusCode: StatusCode.Redirect,
            redirect: '/',   
			message: "Logged out successfully!",
        });
    };

}
