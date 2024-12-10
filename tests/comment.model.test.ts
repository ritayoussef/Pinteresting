import postgres from "postgres";
import Comment, { CommentsProps } from "../src/models/Comments";
import { test, describe, expect, afterEach, beforeEach } from "vitest";
import { createUTCDate } from "../src/utils";
import User, { UserProps } from "../src/models/User";
import Post, { PostProps } from "../src/models/Posts";

describe("Comment CRUD operations", () => {
	// Set up the connection to the DB.
	const sql = postgres({
		database: "PinDB",
	});

	//-----------------------------------------------------------------
	// SET UP
	//-----------------------------------------------------------------
	afterEach(async () => {
		const tablesID = ["users", "posts", "comments","tag"];
		const tablesNoId =["favourites","tagged","likes"]
		try {
			for (const table of tablesID) {
				await sql.unsafe(`DELETE FROM ${table}`);
				await sql.unsafe(
					`ALTER SEQUENCE ${table}_id_seq RESTART WITH 1;`,
				);

			}

			for (const table of tablesNoId)
			{
				await sql.unsafe(`DELETE FROM ${table}`);
			}
		} catch (error) {
			console.error(error);
		}
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

	const createPosts = async (props: Partial<PostProps>={})=>{
		return await Post.create(sql,{
			
			caption: props.caption || "post caption",
			createdAt: props.createdAt || createUTCDate(),
			title: props.title || "Post",
			picture: props.picture || "http...",
			UserId: props.UserId || 1

		})
	};

	beforeEach(async () => {
		await createUser();
		await createPosts();
	});


	
	//-----------------------------------------------------------------
	// TESTS
	//-----------------------------------------------------------------
	const createComment = async (props: Partial<CommentsProps> = {}) => {
		const commentProps: CommentsProps = {
			content: props.content || "Test Comment",
			editedAt:
				props.editedAt ||
				createUTCDate(),
			
			createdAt: props.createdAt || createUTCDate(),
			userId: props.userId || 1,
            postId: props.postId || 1,
		};

		return await Comment.create(sql, commentProps);
	};

	test("Comment was created.", async () => {
		// Create a new comment.
		const comment = await createComment({ content: "Test Comment" });

		// Check if the content of the created comment is as expected.
		expect(comment.props.content).toBe("Test Comment");
		 
     
	});

	

	test("Comment was retrieved.", async () => {
		// Create a new comment.
		const todo = await createComment();

		/**
		 * ! is a non-null assertion operator. It tells TypeScript that the value is not null or undefined.
		 * @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator
		 */
		const readComment = await Comment.read(sql, todo.props.id!);

		/**
		 * Check if the title, description, and status of the read todo are as expected.
		 * ?. is the optional chaining operator. It allows reading the value of a property
		 * located deep within a chain of connected objects without having to expressly validate that each reference in the chain is valid.
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
		 */
		expect(readComment?.props.content).toBe("Test Comment");
		 
	});

	test("Comments were listed.", async () => {
		// Create a new todo.
		const comment1 = await createComment();
		const comment2 = await createComment();
		const comment3 = await createComment();

		// List all the todos from the database.
		const comments = await Comment.readAll(sql, 1, 1);

		// Check if the created todo is in the list of todos.
		expect(comments).toBeInstanceOf(Array);
		expect(comments).toContainEqual(comment1);
		expect(comments).toContainEqual(comment2);
		expect(comments).toContainEqual(comment3);
	});


	test("Comment was updated.", async () => {
		// Create a new todo.
		const comment = await createComment();

		// Update the todo in the database.
		await comment.update({ content: "Updated Test Comment" });

		// Read the updated todo from the database.
		const updatedComment = await Comment.read(sql, comment.props.id!);

		// Check if the title of the updated todo is as expected.
		expect(updatedComment).not.toBeNull();
		expect(updatedComment?.props.content).toBe("Updated Test Comment");
	});

	test("Comment was deleted.", async () => {
		// Create a new comment.
		const comment = await createComment();

		// Delete the comment from the database.
		await comment.delete();

		// Read the deleted comment from the database.
		const deletedComment = await Comment.read(sql, comment.props.id!);

		// Check if the deleted comment is null.
		expect(deletedComment).toBeNull();
	});

	 
});
