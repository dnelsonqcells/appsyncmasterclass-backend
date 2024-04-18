import { util } from "@aws-appsync/utils";

export function request(ctx) {
	const { id, userId, tweetId, repliedTweetId, repliedBy } = ctx.args;

	return {
		operation: "PutItem",
		key: util.dynamodb.toMapValues({ id, userId }),
		attributeValues: util.dynamodb.toMapValues({
			tweetId,
			repliedTweetId,
			repliedBy,
			type: "Replied",
			__typename: "Replied",
			createdAt: util.time.nowISO8601(),
		}),
	};
}

export function response(ctx) {
	return ctx.result;
}
