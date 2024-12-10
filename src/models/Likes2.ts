import postgres from "postgres";
import {
	camelToSnake,
	convertToCase,
	createUTCDate,
	snakeToCamel,
} from "../utils";

export interface LikeProps {
	postId: number;
    userId: number
}


export default class Like {
	constructor(
		private sql: postgres.Sql<any>,
		public props: LikeProps,
	) {}

	
	static async create(sql: postgres.Sql<any>, props: LikeProps): Promise<Like> {
        
        const connection = await sql.reserve();
        const [row] = await sql<LikeProps[]>`
			INSERT INTO likes
				${sql(convertToCase(camelToSnake, props))}
			RETURNING *
		`;

		await connection.release();
        return new Like(sql, convertToCase(snakeToCamel, row) as LikeProps);

        
	}

	static async read(sql: postgres.Sql<any>, userId: number, postId: number): Promise<Like | null> {
		const [row] = await sql<LikeProps[]>`
            SELECT * FROM likes
            WHERE post_id = ${postId} AND user_id = ${userId}
        `;
		if (!row) {
			return null;
		}
		return new Like(sql, convertToCase(snakeToCamel, row) as LikeProps);
	}
	
	static async readAll(sql: postgres.Sql<any>): Promise<Like[]> {
		const connection = await sql.reserve();

 		const rows = await connection<LikeProps[]>`
 			SELECT *
 			FROM likes
 		`;

 		await connection.release();

 		return rows.map(
 			(row) =>
 				new Like(sql, convertToCase(snakeToCamel, row) as LikeProps),
 		);
	}

	async delete() {
        const connection = await this.sql.reserve();

 		const result = await connection`
 			DELETE FROM likes
 			WHERE post_id = ${this.props.postId} AND user_id = ${this.props.userId}
 		`;

 		await connection.release();

 		return result.count === 1;
	}
}