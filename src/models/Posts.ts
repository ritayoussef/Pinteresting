import postgres from "postgres";
import {
	camelToSnake,
	convertToCase,
	createUTCDate,
	snakeToCamel,
} from "../utils";
import { n } from "vitest/dist/reporters-P7C2ytIv";
import Tagged from "./Tagged";

export interface PostProps {
	id?: number;
    caption: string;
    picture?: string;
    createdAt: Date;
    editedAt?: Date | null;
    title: string;
    userId: number;
}

export default class Post {
	constructor(
		private sql: postgres.Sql<any>,
		public props: PostProps,
	) {}

	static async create(sql: postgres.Sql<any>, props: PostProps): Promise<Post> {
		
		const connection = await sql.reserve();
		props.createdAt = props.createdAt ?? createUTCDate();
		console.log(props.userId + "CREATE BEFORE")
		const [row] = await sql<PostProps[]>`
			INSERT INTO posts
				${sql(convertToCase(camelToSnake, props))}
			RETURNING *
		`;
		
		await connection.release();
		return new Post(sql, convertToCase(snakeToCamel, row) as PostProps);
	}
	



	static async read(sql: postgres.Sql<any>, id: number): Promise<Post | null> {
		// const connection = await sql.reserve();
	
		// const [row] = await connection<PostProps[]>`
		// 	SELECT * FROM
		// 	posts WHERE id = ${id}
		// `;
		
		// await connection.release();
	
		// if (!row) {
		// 	return null;
		// }
	
		// return new Post(sql, convertToCase(snakeToCamel, row) as PostProps);
		const result = await sql`
        SELECT *
        FROM posts
        WHERE id = ${id}
    `;
    const postsRow = result[0];
    if (!postsRow) {
        return null;
    }
    const postInstance: Post = new Post(sql, {
        id: postsRow.id,
        caption: postsRow.caption,
        picture: postsRow.picture,
        createdAt: postsRow.created_at,
        editedAt: postsRow.edited_at,
        title: postsRow.title,
        userId: postsRow.user_id,
    });
	console
    return postInstance;
	}
	
	static async readAllNoTags(sql: postgres.Sql<any>): Promise<Post[]> {
		const connection = await sql.reserve();
	
			const rows = await connection<PostProps[]>`
				SELECT *
				FROM posts
			`;
	
			await connection.release();
	
			return rows.map(
				(row) =>
					new Post(sql, convertToCase(snakeToCamel, row) as PostProps),
			);
	}

	static async readAllTags(sql: postgres.Sql<any>, tag: string): Promise<Post[]> {
		const connection = await sql.reserve();
	
			const rows = await connection<PostProps[]>`
				SELECT *
				FROM posts 
				JOIN tagged
				ON post_id = tagged.post_id
				JOIN tag
				ON tag.id = tagged.tag_id
				WHERE name = ${tag};
			`;
	
			await connection.release();
	
			return rows.map(
				(row) =>
					new Post(sql, convertToCase(snakeToCamel, row) as PostProps),
			);
	}
	static async readAllUsers(sql: postgres.Sql<any>, userId: number): Promise<Post[]> {
		const connection = await sql.reserve();
	
			const rows = await connection<PostProps[]>`
				SELECT *
				FROM posts WHERE user_id = ${userId};
				`;	
	
			await connection.release();
	
			return rows.map(
				(row) =>
					new Post(sql, convertToCase(snakeToCamel, row) as PostProps),
			);
	}
	static async readAll(sql: postgres.Sql<any>, postId: number, userId: number): Promise<Post[]> {
		const connection = await sql.reserve();
	
			const rows = await connection<PostProps[]>`
				SELECT *
				FROM posts
			`;
	
			await connection.release();
	
			return rows.map(
				(row) =>
					new Post(sql, convertToCase(snakeToCamel, row) as PostProps),
			);
	}
	 
	async update(updateProps: Partial<PostProps>) {
        const connection = await this.sql.reserve();

 		const [row] = await connection`
 			UPDATE posts
 			SET
 				${this.sql(convertToCase(camelToSnake, updateProps))}, edited_at = ${createUTCDate()}
 			WHERE
 				id = ${this.props.id}
 			RETURNING *
 		`;

 		await connection.release();

 		this.props = { ...this.props, ...convertToCase(snakeToCamel, row) };
	}


	async delete() {
        const connection = await this.sql.reserve();

 		const result = await connection`
 			DELETE FROM posts
 			WHERE id = ${this.props.id}
 		`;

 		await connection.release();

 		return result.count === 1;
	}

}