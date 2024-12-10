import postgres from "postgres";
import {
	camelToSnake,
	convertToCase,
	createUTCDate,
	snakeToCamel,
} from "../utils";

export interface CommentsProps {
    id?: number;
	content: string;
    createdAt: Date;  
    editedAt?: Date;
    postId: number;
    userId: number;
}
export default class Comment {
	constructor(
		private sql: postgres.Sql<any>,
		public props: CommentsProps,
	) {}

static async create(sql: postgres.Sql<any>, props: CommentsProps): Promise<Comment> {
    const connection = await sql.reserve();

		props.createdAt = props.createdAt ?? createUTCDate();
		

		const [row] = await sql<CommentsProps[]>`
			INSERT INTO comments
				${sql(convertToCase(camelToSnake, props))}
			RETURNING *
		`;

		await connection.release();

		return new Comment(sql, convertToCase(snakeToCamel, row) as CommentsProps);
}

static async read(sql: postgres.Sql<any>, id: number): Promise<Comment | null> {
    const connection = await sql.reserve();

    const [row] = await connection<CommentsProps[]>`
        SELECT * FROM
        comments WHERE id = ${id}
    `;

    await connection.release();

    if (!row) {
        return null;
    }

    return new Comment(sql, convertToCase(snakeToCamel, row) as CommentsProps);
}


static async readAll(sql: postgres.Sql<any>, postId: number, userId: number): Promise<Comment[]> {
    const connection = await sql.reserve();

		const rows = await connection<CommentsProps[]>`
			SELECT *
			FROM comments
		`;

		await connection.release();

		return rows.map(
			(row) =>
				new Comment(sql, convertToCase(snakeToCamel, row) as CommentsProps),
		);
}

static async readAllByPost(sql: postgres.Sql<any>, postId: number): Promise<Comment[]> {
    const connection = await sql.reserve();

		const rows = await connection<CommentsProps[]>`
			SELECT *
			FROM comments WHERE post_id = ${postId}
		`;

		await connection.release();

		return rows.map(
			(row) =>
				new Comment(sql, convertToCase(snakeToCamel, row) as CommentsProps),
		);
}

async update(updateProps: Partial<CommentsProps>) {
    const connection = await this.sql.reserve();

		const [row] = await connection`
			UPDATE comments
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
			DELETE FROM comments
			WHERE id = ${this.props.id}
		`;

		await connection.release();

		return result.count === 1;
}
}