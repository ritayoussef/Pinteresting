import postgres from "postgres";
import {
	camelToSnake,
	convertToCase,
	createUTCDate,
	snakeToCamel,
} from "../utils";

export interface FavouritesProps {
	postId: number;
    userId: number
}


export default class Favourite {
	constructor(
		private sql: postgres.Sql<any>,
		public props: FavouritesProps,
	) {}

	
	static async create(sql: postgres.Sql<any>, props: FavouritesProps): Promise<Favourite> {
        
        const connection = await sql.reserve();
        const [row] = await sql<FavouritesProps[]>`
			INSERT INTO favourites
				${sql(convertToCase(camelToSnake, props))}
			RETURNING *
		`;

		await connection.release();
        return new Favourite(sql, convertToCase(snakeToCamel, row) as FavouritesProps);

        
	}

	static async read(sql: postgres.Sql<any>, userId: number, postId: number): Promise<Favourite | null> {
		const [row] = await sql<FavouritesProps[]>`
            SELECT * FROM favourites
            WHERE post_id = ${postId} AND user_id = ${userId}
        `;
		if (!row) {
			return null;
		}
		return new Favourite(sql, convertToCase(snakeToCamel, row) as FavouritesProps);
	}
	
	static async readAll(sql: postgres.Sql<any>): Promise<Favourite[]> {
		const connection = await sql.reserve();

 		const rows = await connection<FavouritesProps[]>`
 			SELECT *
 			FROM favourites
 		`;

 		await connection.release();

 		return rows.map(
 			(row) =>
 				new Favourite(sql, convertToCase(snakeToCamel, row) as FavouritesProps),
 		);
	}

	async delete() {
        const connection = await this.sql.reserve();

 		const result = await connection`
 			DELETE FROM favourites
 			WHERE post_id = ${this.props.postId} AND user_id = ${this.props.userId}
 		`;

 		await connection.release();

 		return result.count === 1;
	}
}