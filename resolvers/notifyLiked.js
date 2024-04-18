import { util } from "@aws-appsync/utils";

export function request(ctx) {
	const { id, userId, tweetId, likedBy } = ctx.args;

	return {
		operation: "PutItem",
		key: util.dynamodb.toMapValues({ id, userId }),
		attributeValues: util.dynamodb.toMapValues({
			tweetId,
			likedBy,
			type: "Liked",
			__typename: "Liked",
			createdAt: util.time.nowISO8601(),
		}),
	};
}

export function response(ctx) {
	return ctx.result;
}
