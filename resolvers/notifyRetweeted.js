import { util } from "@aws-appsync/utils";

export function request(ctx) {
	const { id, userId, tweetId, retweetId, retweetedBy } = ctx.args;

	return {
		operation: "PutItem",
		key: util.dynamodb.toMapValues({ id, userId }),
		attributeValues: util.dynamodb.toMapValues({
			tweetId,
			retweetId,
			retweetedBy,
			type: "Retweeted",
			__typename: "Retweeted",
			createdAt: util.time.nowISO8601(),
		}),
	};
}

export function response(ctx) {
	return ctx.result;
}
