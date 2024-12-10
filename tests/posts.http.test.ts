import postgres from "postgres";
import Post, { PostProps } from "../src/models/Posts";
import { StatusCode } from "../src/router/Response";
import { HttpResponse, clearCookieJar, makeHttpRequest } from "./client";
import { test, describe, expect, afterEach, beforeEach } from "vitest";
import { createUTCDate } from "../src/utils";
import User, { UserProps } from "../src/models/User";

describe("Post HTTP operations", () => {
	const sql = postgres({
		database: "PinDB",
	});

	 
	const createPost = async (props: Partial<PostProps> = {}) => {
		const postProps: PostProps = {
			title: props.title || "Test Post",	 
            caption: props.caption || "Happy day",
			createdAt: props.createdAt || createUTCDate(),			 
			userId: props.userId || 1,
			picture: props.picture || "http..."
		};

		return await Post.create(sql, postProps);
	};

	const createUser = async (props: Partial<UserProps> = {}) => {
        return await User.create(sql, {
            
            email: props.email || "user@email.com",
            password: props.password || "password",
            createdAt: props.createdAt || createUTCDate(),
            name: props.name || "Eric Stoian"
            // isAdmin: props.isAdmin || false, // Uncomment if implementing admin feature.
        });
    };

	const login = async (
		email: string = "user@email.com",
		password: string = "password",
	) => {
		await makeHttpRequest("POST", "/login", {
			email,
			password,
		});
	};

	beforeEach(async () => {
		await createUser();
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
        await makeHttpRequest("POST", "/logout");
		clearCookieJar();
	});

	
	test("Homepage was retrieved successfully.", async () => {
		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"GET",
			"/",
		);

		expect(statusCode).toBe(StatusCode.OK);
		expect(Object.keys(body).includes("message")).toBe(true);
		expect(Object.keys(body).includes("payload")).toBe(true);
		expect(body.message).toBe("Homepage!");
	});

	test("Invalid path returned error.", async () => {
		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"GET",
			"/tods",
		);

		expect(statusCode).toBe(StatusCode.NotFound);
		expect(Object.keys(body).includes("message")).toBe(true);
		expect(Object.keys(body).includes("payload")).toBe(false);
		expect(body.message).toBe("Invalid route: GET /tods");
	});

	test("Post was created.", async () => {
		await login();

		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"POST",
			"/posts",
			{
				title: "Test Post",
				caption: "This is a test post",
				editedAt: createUTCDate(),
				userId: 1,
			},
		);

		expect(statusCode).toBe(StatusCode.Created);
		expect(Object.keys(body).includes("message")).toBe(true);
		expect(Object.keys(body).includes("payload")).toBe(true);
		expect(body.message).toBe("Post created successfully!");
		expect(Object.keys(body.payload.post).includes("id")).toBe(true);
		expect(Object.keys(body.payload.post).includes("title")).toBe(true);
		expect(Object.keys(body.payload.post).includes("caption")).toBe(
			true,
		);
		expect(body.payload.post.id).toBe(1);
		expect(body.payload.post.title).toBe("Test Post");
		expect(body.payload.post.caption).toBe("This is a test post");	 
		expect(body.payload.post.createdAt).not.toBeNull();
		expect(body.payload.post.editedAt).toBeNull();
	}, {timeout: 60000});

	test("Post was not created due to missing title.", async () => {
		await login();

		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"POST",
			"/posts",
			{
				caption: "This is a test post",
				userId: 1,
			},
		);

		expect(statusCode).toBe(StatusCode.BadRequest);
		expect(Object.keys(body).includes("message")).toBe(true);
		expect(Object.keys(body).includes("payload")).toBe(true);
		expect(body.message).toBe(
			"Request body must include title and caption.",
		);
		expect(body.payload.post).toBeUndefined();
	});

	test("Post was not created by unauthenticated user.", async () => {
		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"POST",
			"/posts",
			{
				title: "Test Post",
				caption: "This is a test post",				 
				userId: 1,
			},
		);

		expect(statusCode).toBe(StatusCode.Unauthorized);
		expect(body.message).toBe("Unauthorized");
	});

	test("Post was retrieved.", async () => {
		await login();

		const post = await createPost();
		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"GET",
			`/posts/${post.props.id}`,
		);

		expect(statusCode).toBe(StatusCode.OK);
		expect(body.message).toBe("Post retrieved");
		expect(body.payload.post.title).toBe(post.props.title);
		expect(body.payload.post.caption).toBe(post.props.caption);
		expect(body.payload.post.createdAt).toBe(
			post.props.createdAt.toISOString(),
		);
		expect(body.payload.post.editedAt).toBeNull();
	});

	test("Post was not retrieved due to invalid ID.", async () => {
		await login();

		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"GET",
			"/posts/abc",
		);

		expect(statusCode).toBe(StatusCode.BadRequest);
		expect(body.message).toBe("Invalid ID");
	});

	test("Post was not retrieved due to non-existent ID.", async () => {
		await login();

		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"GET",
			"/posts/1",
		);

		expect(statusCode).toBe(StatusCode.NotFound);
		expect(body.message).toBe("Not found");
	});

	test("Post was not retrieved by unauthenticated user.", async () => {
		const post = await createPost();
		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"GET",
			`/posts/${post.props.id}`,
		);

		expect(statusCode).toBe(StatusCode.Unauthorized);
		expect(body.message).toBe("Unauthorized");
	});

	test("Post was updated.", async () => {
		await login();

		const post = await createPost();
		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"PUT",
			`/posts/${post.props.id}`,
			{
				title: "Updated Test Post",
			},
		);

		expect(statusCode).toBe(StatusCode.OK);
		expect(body.message).toBe("Post updated successfully!");
		expect(body.payload.post.title).toBe("Updated Test Post");
		expect(body.payload.post.caption).toBe(post.props.caption);
		expect(body.payload.post.createdAt).toBe(
			post.props.createdAt.toISOString(),
		);
		expect(body.payload.post.editedAt).not.toBeNull();
	});

	test("Post was deleted.", async () => {
		await login();

		const post = await createPost();
		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"DELETE",
			`/posts/${post.props.id}`,
		);

		expect(statusCode).toBe(StatusCode.OK);
		expect(body.message).toBe("Post deleted successfully!");
	});

	 
	test("Posts were listed.", async () => {
		await login();

		const post1 = await createPost();
		const post2 = await createPost();
		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"GET",
			"/posts",
		);

		expect(statusCode).toBe(StatusCode.OK);
		expect(body.message).toBe("Post list retrieved");
		expect(body.payload.posts).toBeInstanceOf(Array);
		expect(body.payload.posts[0].title).toBe(post1.props.title);
		expect(body.payload.posts[0].caption).toBe(post1.props.caption);
		 
		expect(body.payload.posts[0].createdAt).toBe(
			post1.props.createdAt.toISOString(),
		);
		expect(body.payload.posts[0].editedAt).toBeNull();
		expect(body.payload.posts[1].title).toBe(post2.props.title);
		expect(body.payload.posts[1].caption).toBe(post2.props.caption);	 
		expect(body.payload.posts[1].createdAt).toBe(
			post2.props.createdAt.toISOString(),
		);
		expect(body.payload.posts[1].editedAt).toBeNull();
	});

	test("Posts were not listed by unauthenticated user.", async () => {
		const { statusCode, body }: HttpResponse = await makeHttpRequest(
			"GET",
			"/posts",
		);

		expect(statusCode).toBe(StatusCode.Unauthorized);
		expect(body.message).toBe("Unauthorized");
	});
});
