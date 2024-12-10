import postgres from "postgres";
import { test, describe, expect, afterEach } from "vitest";
import { createUTCDate } from "../src/utils";
import Tag, { TagProps } from "../src/models/Tags";

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

	test("Tag was created.", async () => {
		const tag = await createTag({ name: "tag name" });

		expect(tag.props.name).toBe("tag name");
		
	});

	test("Tag was not created with duplicate name.", async () => {
		await createTag({ name: "tag name" });

		await expect(async () => {
			await createTag({ name: "tag name" });
		}).rejects.toThrow("Tag with this name already exists.");
	});

    test("Tag was retrieved.", async () => {
		 
		const tag = await createTag();	 
		const readPost = await Tag.read(sql, tag.props.id!);
	 
		expect(tag.props.name).toBe("tag name");
		expect(readPost?.props.id).toBe(1)
	});

    test("Tags were listed.", async () => {
		 
		const tag1 = await createTag({name: "tag1"});
		const tag2 = await createTag({name: "tag2"});
		const tag3 = await createTag({name: "tag3"});

	 
		var tags = await Tag.readAll(sql);

		
		expect(tags).toBeInstanceOf(Array);
		expect(tags[0].props.id).toBe(tag1.props.id);
		expect(tags[1].props.id).toBe(tag2.props.id);
		expect(tags[2].props.id).toBe(tag3.props.id);

	});

    test("Tag was deleted.", async () => {
		const tag = await createTag();

		await tag.delete();

		const deletedTag= await Tag.read(sql, tag.props.id!);


		expect(deletedTag).toBeNull();
	});
	
})
