import postgres from "postgres";
import {
	camelToSnake,
	convertToCase,
	createUTCDate,
	snakeToCamel,
} from "../utils";

export interface TagProps {
	id?: number;
    name: string
}

export class DuplicateTagNameError extends Error {
	constructor() {
		super("Tag with this name already exists.");
	}
}
export default class Tag {
	constructor(
		private sql: postgres.Sql<any>,
		public props: TagProps,
	) {}

	static async initializeDefaultTags(sql: postgres.Sql<any>) {
        const defaultTags = ["travel", "DIY", "Aesthetic"]; // Replace with your default tags

        for (const tagName of defaultTags) {
            const exists = await Tag.isTagNameDuplicate(sql, tagName);
            if (!exists) {
                await Tag.create(sql, { name: tagName });
            }
        }
    }
	
	static async create(sql: postgres.Sql<any>, props: TagProps): Promise<Tag> {
        
		const { name } = props;
		if (await Tag.isTagNameDuplicate(sql, name)) {
			throw new DuplicateTagNameError();
		}
        let tag = await sql`
            INSERT INTO tag (name)
            VALUES (${props.name})
            RETURNING *;
        `
        let tagz = new Tag(sql, props);
        tagz.sql = sql;
        tagz.props.id = tag[0].id
        tagz.props.name = tag[0].name;

		return new Tag(sql, tagz.props);
	}

	static async isTagNameDuplicate(sql: postgres.Sql<any>, name: string): Promise<boolean> {
		const [existingTag] = await sql`
			SELECT * FROM tag
			WHERE name = ${name}
		`;
		return !!existingTag;
	}


	static async read(sql: postgres.Sql<any>, id: number): Promise<Tag | null> {
		const [row] = await sql<TagProps[]>`
            SELECT * FROM tag
            WHERE id = ${id}
        `;
		if (!row) {
			return null;
		}
		return new Tag(sql, convertToCase(snakeToCamel, row) as TagProps);
	}
	
	static async readAll(sql: postgres.Sql<any>): Promise<Tag[]> {
		const connection = await sql.reserve();

 		const rows = await connection<TagProps[]>`
 			SELECT *
 			FROM tag
 		`;

 		await connection.release();

 		return rows.map(
 			(row) =>
 				new Tag(sql, convertToCase(snakeToCamel, row) as TagProps),
 		);
	}

	// async update(updateProps: Partial<TagProps>) {
    //     const connection = await this.sql.reserve();

 	// 	const [row] = await connection`
 	// 		UPDATE tags
 	// 		SET
 	// 			${this.sql(convertToCase(camelToSnake, updateProps))}}
 	// 		WHERE
 	// 			id = ${this.props.id}
 	// 		RETURNING *
 	// 	`;

 	// 	await connection.release();

 	// 	this.props = { ...this.props, ...convertToCase(snakeToCamel, row) };
	// }

	async delete() {
        const connection = await this.sql.reserve();

 		const result = await connection`
 			DELETE FROM tag
 			WHERE id = ${this.props.id}
 		`;

 		await connection.release();

 		return result.count === 1;
	}
}