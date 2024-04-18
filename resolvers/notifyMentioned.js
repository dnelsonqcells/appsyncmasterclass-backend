import { util } from "@aws-appsync/utils";

export function request(ctx) {
	const { id, userId, mentionedByTweetId, mentionedBy } = ctx.args;

	return {
		operation: "PutItem",
		key: util.dynamodb.toMapValues({ id, userId }),
		attributeValues: util.dynamodb.toMapValues({
			mentionedByTweetId,
			mentionedBy,
			type: "Mentioned",
			__typename: "Mentioned",
			createdAt: util.time.nowISO8601(),
		}),
	};
}

export function response(ctx) {
	return ctx.result;
}
