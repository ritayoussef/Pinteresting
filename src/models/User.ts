import postgres from "postgres";
import {
	camelToSnake,
	convertToCase,
	createUTCDate,
	snakeToCamel,
} from "../utils";

export interface UserProps {
	id?: number;
	email: string;
	password: string;
	createdAt: Date;
	editedAt?: Date;
	name?: string;
	profile_picture?: string;
	biography?: string;

}
export class DuplicateEmailError extends Error {
	constructor() {
		super("User with this email already exists.");
	}
}

export class InvalidCredentialsError extends Error {
	constructor() {
		super("Invalid credentials.");
	}
}

export default class User {
	constructor(
		private sql: postgres.Sql<any>,
		public props: UserProps,
	) {}

	static async create(sql: postgres.Sql<any>, props: UserProps): Promise<User> {
		const { email } = props;
		if (await User.isEmailDuplicate(sql, email)) {
			throw new DuplicateEmailError();
		}
		const [row] = await sql<UserProps[]>`
			INSERT INTO users
			${sql(convertToCase(camelToSnake, props))}
			RETURNING *
		`;
		return new User(sql, convertToCase(snakeToCamel, row) as UserProps);
	}

	static async isEmailDuplicate(sql: postgres.Sql<any>, email: string): Promise<boolean> {
		const [existingUser] = await sql`
			SELECT * FROM users
			WHERE email = ${email}
		`;
		return !!existingUser;
	}
	static async getUserByEmail(sql: postgres.Sql<any>, email: string): Promise<User|null>{
		const [row] = await sql`
			SELECT * FROM users
			WHERE email = ${email}
			
		`
		if (!row) {
			// User with the provided email and password does not exist
			return null;
		}
		return new User(sql, convertToCase(snakeToCamel, row) as UserProps);
	}

	static async getUserById(sql: postgres.Sql<any>, id: number): Promise<User|null>{
		const [row] = await sql`
			SELECT * FROM users
			WHERE id = ${id}
			
		`
		if (!row) {
			// User with the provided email and password does not exist
			return null;
		}
		return new User(sql, convertToCase(snakeToCamel, row) as UserProps);
	}
	/**
	 * TODO: To "log in" a user, we need to check if the
	 * provided email and password match an existing row
	 * in the database. If they do, we return a new User instance.
	 */
	static async login(
		sql: postgres.Sql<any>,
		email: string,
		password: string,
	): Promise<User> {

		const [row] = await sql`
			SELECT * FROM users
			WHERE email = ${email} AND password = ${password}
			
		`
		if (!row) {
			throw new InvalidCredentialsError();
		}
		return new User(sql, convertToCase(snakeToCamel, row) as UserProps)


	}
}
