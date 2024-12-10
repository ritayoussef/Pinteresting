import postgres from "postgres";
import {
	camelToSnake,
	convertToCase,
	createUTCDate,
	snakeToCamel,
} from "../utils";

export interface TaggedProps {
	postId: number;
    tagId: number
}


export default class Tagged {
	constructor(
		private sql: postgres.Sql<any>,
		public props: TaggedProps,
	) {}

	
	static async create(sql: postgres.Sql<any>, props: TaggedProps): Promise<Tagged> {
        
        const connection = await sql.reserve();
        const [row] = await sql<TaggedProps[]>`
			INSERT INTO tagged
				${sql(convertToCase(camelToSnake, props))}
			RETURNING *
		`;

		await connection.release();
        return new Tagged(sql, convertToCase(snakeToCamel, row) as TaggedProps);

        
	}

	static async read(sql: postgres.Sql<any>, tagId: number, postId: number): Promise<Tagged | null> {
		const [row] = await sql<TaggedProps[]>`
            SELECT * FROM tagged
            WHERE post_id = ${postId} AND tag_id = ${tagId}
        `;
		if (!row) {
			return null;
		}
		return new Tagged(sql, convertToCase(snakeToCamel, row) as TaggedProps);
	}
	
	static async readAll(sql: postgres.Sql<any>): Promise<Tagged[]> {
		const connection = await sql.reserve();

 		const rows = await connection<TaggedProps[]>`
 			SELECT *
 			FROM tagged
 		`;

 		await connection.release();

 		return rows.map(
 			(row) =>
 				new Tagged(sql, convertToCase(snakeToCamel, row) as TaggedProps),
 		);
	}

	async delete() {
        const connection = await this.sql.reserve();

 		const result = await connection`
 			DELETE FROM tagged
 			WHERE post_id = ${this.props.postId} AND tag_id = ${this.props.tagId}
 		`;

 		await connection.release();

 		return result.count === 1;
	}
}