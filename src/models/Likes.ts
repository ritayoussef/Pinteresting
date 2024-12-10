import postgres from "postgres";
import {
	camelToSnake,
	convertToCase,
	createUTCDate,
	snakeToCamel,
} from "../utils";

export interface LikeProps {
	UserId: number;
    PostId: number
}

export default class Like {
	constructor(
		private sql: postgres.Sql<any>,
		public props: LikeProps,
	) {}

	static async create(sql: postgres.Sql<any>, props: LikeProps): Promise<Like> {
		console.log("1")
		console.log(props.PostId +" funct")
		const connection = await sql.reserve();
        const [row] = await sql<LikeProps[]>`
			INSERT INTO likes
				${sql(convertToCase(camelToSnake, props))}
			RETURNING *
		`;
		console.log(row.PostId + "row")
		await connection.release();

		console.log("1")
        return new Like(sql, convertToCase(snakeToCamel, row) as LikeProps);
	}

	static async read(sql: postgres.Sql<any>, postId: number, userId: number): Promise<Like | null> {
		console.log("2")
        const [row] = await sql<LikeProps[]>`
            SELECT * FROM likes
            WHERE post_id = ${postId} AND user_id = ${userId}
        `;
		if (!row) {
			return null;
		}

		console.log("2")
		return new Like(sql, convertToCase(snakeToCamel, row) as LikeProps);
	}

	static async readAll(sql: postgres.Sql<any>): Promise<Like[]> {
		console.log("3")

		const connection = await sql.reserve();

 		const rows = await connection<LikeProps[]>`
 			SELECT *
 			FROM likes
 		`;

 		await connection.release();

		 console.log("3")

 		return rows.map(
 			(row) =>
 				new Like(sql, convertToCase(snakeToCamel, row) as LikeProps),
 		);
	}

	

	async delete() {
        const connection = await this.sql.reserve();
		console.log("4")

 		const result = await connection`
 			DELETE FROM likes
 			WHERE post_id = ${this.props.PostId} AND user_id = ${this.props.UserId}
 		`;

 		await connection.release();

		 console.log("4")

 		return result.count === 1;
	}
}