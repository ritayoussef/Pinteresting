import postgres from "postgres";
import { test, describe, expect, afterEach, beforeEach } from "vitest";
import { createUTCDate } from "../src/utils";
import Tagged, { TaggedProps } from "../src/models/Tagged";
import Tag, { TagProps } from "../src/models/Tags";
import Post, { PostProps } from "../src/models/Posts";
import { read } from "fs";

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

	const createTag = async (props: Partial<TagProps> = {}) => {
		return await Tag.create(sql, {
			name: props.name || "tag name"
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
		await createTag({name:"tag1"});
		await createTag({name:"tag2"});
		await createTag({name:"tag3"});
		await createPosts({title: "post1"});
		await createPosts({title: "post2"});
	});

    const createTagged = async (props: Partial<TaggedProps> = {}) => {
		return await Tagged.create(sql, {
			postId: props.postId || 1,
            tagId: props.tagId || 1
			
		});
	};
    
	test("Tagged was created.", async () => {
		const tagged = await createTagged({ postId: 1, tagId:1 });

		expect(tagged.props.postId).toBe(1);
        expect(tagged.props.tagId).toBe(1);
		
	});


    test("Tagged was retrieved.", async () => {
		 
		const tagged = await createTagged();

	  
		const readTagged = await Tagged.read(sql, tagged.props.tagId, tagged.props.postId);

		 
		expect(tagged.props.postId).toBe(1);
		expect(tagged.props.tagId).toBe(1);
		expect(readTagged?.props.postId).toBe(1)

		expect(readTagged?.props.tagId).toBe(1)
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

	test("All tagged records were retrieved", async () => {
		// Create multiple tagged records
		await createTagged({ postId: 1, tagId: 1 });
		await createTagged({ postId: 1, tagId: 2 });
		await createTagged({ postId: 2, tagId: 2 });
	
		// Retrieve all tagged records
		const allTagged = await Tagged.readAll(sql);
	
		// Check if the number of retrieved tagged records matches the expected count
		expect(allTagged.length).toBe(3);
	
		// Check if the properties of the retrieved tagged records are correct
		expect(allTagged[0].props.postId).toBe(1);
		expect(allTagged[0].props.tagId).toBe(1);
		expect(allTagged[1].props.postId).toBe(1);
		expect(allTagged[1].props.tagId).toBe(2);
		expect(allTagged[2].props.postId).toBe(2);
		expect(allTagged[2].props.tagId).toBe(2);
	});
    test("Tag was deleted.", async () => {
		const tagged = await createTagged();

		await tagged.delete();

		const deletedTagged= await Tagged.read(sql, tagged.props.tagId, tagged.props.postId,);


		expect(deletedTagged).toBeNull();
	});
	
})
