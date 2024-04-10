import { util } from "@aws-appsync/utils";

export function request(ctx) {
	const { nextToken, limit, userId } = ctx.args;

	return {
		operation: "Query",
		query: {
			expression: "userId = :userId AND begins_with(sk, :follows)",
			expressionValues: util.dynamodb.toMapValues({
				":userId": userId,
				":follows": "FOLLOWS_",
			}),
		},
		nextToken,
		limit,
		select: "ALL_ATTRIBUTES",
		scanIndexForward: false,
		consistentRead: false,
	};
}

export function response(ctx) {
	return { relationships: ctx.result.items, nextToken: ctx.result.nextToken };
}
