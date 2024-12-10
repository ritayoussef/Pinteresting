import postgres from "postgres";
import User, { UserProps } from "../src/models/User";
import Server from "../src/Server";
import { StatusCode } from "../src/router/Response";
import { HttpResponse, clearCookieJar, makeHttpRequest } from "./client";
import { test, describe, expect, afterEach, beforeAll } from "vitest";
import { createUTCDate } from "../src/utils";

describe("User HTTP operations", () => {
	const sql = postgres({
		database: "PinDB",
	});

	const server = new Server({
		host: "localhost",
		port: 3000,
		sql,
	});

    const createUser = async (props: Partial<UserProps> = {}) => {
		return await User.create(sql, {
			
			email: props.email || "user@email.com",
			password: props.password || "password",
			createdAt: props.createdAt || createUTCDate(),
            name: props.name || "Eric Stoian"
			// isAdmin: props.isAdmin || false, // Uncomment if implementing admin feature.
		});
	};


	beforeAll(async () => {
		await server.start();
	});

	 
	afterEach(async () => {
		const tablesID = ["users", "posts", "comments","tag"];
		const tablesNoId = ["likes","favourites","tagged"];

		try {
			for (const table of tablesID) {
				await sql.unsafe(`DELETE FROM ${table}`);
				await sql.unsafe(
					`ALTER SEQUENCE ${table}_id_seq RESTART WITH 1;`,
				);
			}

			for (const table of tablesNoId) {
				await sql.unsafe(`DELETE FROM ${table}`);
			}
		} catch (error) {
			console.error(error);
		}
	});

	test("User was created.", async () => {
		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"POST",
			"/users",
			{
				email: "user@email.com",
				password: "password",
				confirmPassword: "password",
				name: "user"
			},
		);

		expect(statusCode).toBe(StatusCode.Created);
		expect(Object.keys(body).includes("message")).toBe(true);
		expect(Object.keys(body).includes("payload")).toBe(true);
		expect(body.message).toBe("User created");
		expect(Object.keys(body.payload).includes("user")).toBe(true);
		expect(body.payload.user.email).toBe("user@email.com");
		expect(body.payload.user.password).toBe("password");
		expect(body.payload.user.createdAt).not.toBeNull();
		expect(body.payload.user.editedAt).toBeNull();
	});

	test("User was not created due to missing email.", async () => {
		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"POST",
			"/users",
			{
				password: "password",
			},
		);

		expect(statusCode).toBe(StatusCode.BadRequest);
		expect(body.message).toBe("Missing email.");
	});

	test("User was not created due to missing password.", async () => {
		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"POST",
			"/users",
			{
				email: "user@email.com",
			},
		);

		expect(statusCode).toBe(StatusCode.BadRequest);
		expect(body.message).toBe("Missing password.");
	});

	test("User was not created due to mismatched passwords.", async () => {
		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"POST",
			"/users",
			{
				email: "user@email.com",
				password: "password",
				confirmPassword: "password123",
			},
		);

		expect(statusCode).toBe(StatusCode.BadRequest);
		expect(body.message).toBe("Passwords do not match");
	});

	test("User was not created due to duplicate email.", async () => {
		await createUser({ email: "user@email.com" });

		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"POST",
			"/users",
			{
				email: "user@email.com",
				password: "password",
				confirmPassword: "password",
			},
		);

		expect(statusCode).toBe(StatusCode.BadRequest);
		expect(body.message).toBe("User with this email already exists.");
	});

	test("User was logged in.", async () => {
		const user = await createUser();
		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"POST",
			"/login",
			{
				email: user.props.email,
				password: "password",
			},
		);

		expect(statusCode).toBe(StatusCode.OK);
		expect(Object.keys(body).includes("message")).toBe(true);
		expect(Object.keys(body).includes("payload")).toBe(true);
		expect(body.message).toBe("Logged in successfully!");
		expect(Object.keys(body.payload).includes("user")).toBe(true);
		expect(body.payload.user.email).toBe(user.props.email);
		expect(body.payload.user.password).toBe("password");
		expect(body.payload.user.createdAt).toBeTruthy();
		expect(body.payload.user.editedAt).toBeFalsy();
	});

	test("User was not logged in due to invalid email.", async () => {
		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"POST",
			"/login",
			{
				email: "nonexistentemail",
				password: "password",
			},
		);

		expect(statusCode).toBe(StatusCode.BadRequest);
		expect(body.message).toBe("Invalid credentials.");
	});

	test("User was not logged in due to invalid password.", async () => {
		const user = await createUser();
		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"POST",
			"/login",
			{
				email: user.props.email,
				password: "invalidpassword",
			},
		);

		expect(statusCode).toBe(StatusCode.BadRequest);
		expect(body.message).toBe("Invalid credentials.");
	});

	 
	});



