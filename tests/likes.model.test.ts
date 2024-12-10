import postgres from "postgres";
import { test, describe, expect, afterEach, beforeEach } from "vitest";
import { createUTCDate } from "../src/utils";
import Tagged, { TaggedProps } from "../src/models/Tagged";
import User, { UserProps } from "../src/models/User";
import Post, { PostProps } from "../src/models/Posts";
import { read } from "fs";
import Like,{LikeProps} from "../src/models/Likes2";

describe("User CRUD operations", () => {
	// Set up the connection to the DB.
	const sql = postgres({
		database: "PinDB",
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
        await createUser({name:"eric", email:"1"});
		await createUser({name:"rita", email:"2"});
		await createUser({name:"nae", email:"3"});
		await createPosts({title: "post1"});
		await createPosts({title: "post2"});
	});

    const createLike = async (props: Partial<LikeProps> = {}) => {
		return await Like.create(sql, {
			postId: props.postId || 1,
            userId: props.userId || 1
			
		});
	};
    
	test("Like was created.", async () => {
		const tagged = await createLike({ postId: 1, userId:1 });

		expect(tagged.props.postId).toBe(1);
        expect(tagged.props.userId).toBe(1);
		
	});


    test("Like was retrieved.", async () => {
		 
		const fav = await createLike();

		 
		const readFav = await Like.read(sql, fav.props.userId, fav.props.postId);
 
		expect(fav.props.postId).toBe(1);
		expect(fav.props.userId).toBe(1);
		expect(readFav?.props.postId).toBe(1)

		expect(readFav?.props.userId).toBe(1)
	});

    // test("Tags were listed.", async () => {
	// 	// Create a new tag.
	// 	const tag1 = await createTagged({ postId: 1, tagId:1 });
	// 	const tag2 = await createTagged({ postId: 1, tagId:2 });
	// 	//const tag3 = await createTagged({ postId: 2, tagId:1 });


	// 	// List all the todos from the database.
	// 	var tagged = await Tagged.readAll(sql);

		
	// 	expect(tagged).toBeInstanceOf(Array);
	// 	expect(tagged[0].props.tagId).toBe(tag1.props.tagId);
	// 	expect(tagged[0].props.postId).toBe(tag1.props.postId);
	// 	expect(tagged[1].props.tagId).toBe(tag2.props.tagId);
	// 	expect(tagged[1].props.postId).toBe(tag2.props.postId);
	// 	// expect(tagged[2].props.tagId).toBe(tag3.props.tagId);
	// 	// expect(tagged[2].props.postId).toBe(tag3.props.postId);

	// });

	test("All likes records were retrieved", async () => {
		// Create multiple tagged records
		await createLike({ postId: 1, userId: 1 });
		await createLike({ postId: 1, userId: 2 });
		await createLike({ postId: 2, userId: 2 });
	
		// Retrieve all tagged records
		const allFav = await Like.readAll(sql);
	
		// Check if the number of retrieved tagged records matches the expected count
		expect(allFav.length).toBe(3);
	
		// Check if the properties of the retrieved tagged records are correct
		expect(allFav[0].props.postId).toBe(1);
		expect(allFav[0].props.userId).toBe(1);
		expect(allFav[1].props.postId).toBe(1);
		expect(allFav[1].props.userId).toBe(2);
		expect(allFav[2].props.postId).toBe(2);
		expect(allFav[2].props.userId).toBe(2);
	});
    test("Tag was deleted.", async () => {
		const fav = await createLike();

		await fav.delete();

		const deletedFav= await Tagged.read(sql, fav.props.userId, fav.props.postId,);


		expect(deletedFav).toBeNull();
	});
	
})
