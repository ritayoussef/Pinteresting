import postgres from "postgres";
import { test, describe, expect, afterEach, beforeEach } from "vitest";
import { createUTCDate } from "../src/utils";
import User, { UserProps } from "../src/models/User";
import Post, {PostProps} from "../src/models/Posts";

describe("Post CRUD operations", () => {
	// Set up the connection to the DB.
	const sql = postgres({
		database: "PinDB",
	});

	/**
	 * Clean up the database after each test. This function deletes all the rows
	 * from the todos and subtodos tables and resets the sequence for each table.
	 * @see https://www.postgresql.org/docs/13/sql-altersequence.html
	 */
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


	beforeEach(async () => {
		await createUser();
	});

	const createUser = async (props: Partial<UserProps>={})=>{
		return await User.create(sql, {
			email: props.email || "email",
			profile_picture: props.profile_picture || "pfp",
			createdAt: props.createdAt || createUTCDate(),
			password: props.password || "pswd",
			name: "hi"

		})
	}



	

	const createPost = async (props: Partial<PostProps> = {}) => {
		return await Post.create(sql, {
			caption: props.caption || "You are my sunshine",
			picture: props.picture || "https//Lebron/James/face",
			createdAt: props.createdAt || createUTCDate(),
			title: props.title || "My lovely sunshine",
            userId: props.userId || 1
			// isAdmin: props.isAdmin || false, // Uncomment if implementing admin feature.
		});
	};

	test("Post was created.", async () => {
		
		const user = await createUser({email:"hihi"})
		console.log(user.props.id + "created HERRRRRRRRRRRRRRRRRRRRRRE")
		const post = await createPost({ picture: "https.//yoohoo/Naomie/Edwards", userId: user.props.id});
		console.log(post.props.userId + "POST TO USER")
		expect(post.props.caption).toBe("You are my sunshine");
		expect(post.props.picture).toBe("https.//yoohoo/Naomie/Edwards");
		expect(post.props.createdAt).toBeTruthy();
		expect(post.props.editedAt).toBeFalsy();
        expect(post.props.title).toBe("My lovely sunshine");
		expect(post.props.userId).toBe(2);
	});

	test("Post was retrieved.", async () => {
		// Create a new todo.
		const post = await createPost();

		/**
		 * ! is a non-null assertion operator. It tells TypeScript that the value is not null or undefined.
		 * @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator
		 */
		const readPost = await Post.read(sql, post.props.id!);

		/**
		 * Check if the title, description, and status of the read todo are as expected.
		 * ?. is the optional chaining operator. It allows reading the value of a property
		 * located deep within a chain of connected objects without having to expressly validate that each reference in the chain is valid.
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
		 */
		expect(post.props.caption).toBe("You are my sunshine");
		expect(post.props.picture).toBe("https//Lebron/James/face");
		expect(readPost?.props.createdAt).toBeTruthy();
		expect(readPost?.props.editedAt).toBeFalsy();
		expect(readPost?.props.title).toBe("My lovely sunshine");
		expect(readPost?.props.id).toBe(1)
	});

	test("Posts were listed.", async () => {
		// Create a new todo.
		const post1 = await createPost();
		const post2 = await createPost();
		const post3 = await createPost();

		// List all the todos from the database.
		var posts = await Post.readAll(sql, 1, 1);

		// Check if the created todo is in the list of todos.
		expect(posts).toBeInstanceOf(Array);
		expect(posts[0].props.id).toBe(post1.props.id);
		expect(posts[1].props.id).toBe(post2.props.id);
		expect(posts[2].props.id).toBe(post3.props.id);

	});

	test("Post was updated.", async () => {
		// Create a new todo.
		const post = await createPost();

		// Update the todo in the database.
		await post.update({ title: "Updated Test Todo" });

		// Read the updated todo from the database.
		const updatedTodo = await Post.read(sql, post.props.id!);

		// Check if the title of the updated todo is as expected.
		expect(updatedTodo).not.toBeNull();
		expect(updatedTodo?.props.title).toBe("Updated Test Todo");
	});

	test("Post was deleted.", async () => {
		// Create a new todo.
		const post = await createPost();

		console.log("YES", post.props.userId)

		// Delete the todo from the database.
		await post.delete();

		// Read the deleted todo from the database.
		const deletedTodo = await Post.read(sql, post.props.id!);

		console.log("D", deletedTodo)

		// Check if the deleted todo is null.
		expect(deletedTodo).toBeNull();
	});
})
