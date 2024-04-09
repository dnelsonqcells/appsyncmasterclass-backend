import { util } from "@aws-appsync/utils";

export function request(ctx) {
	return {
		operation: "Query",
		query: {
			expression: "screenName = :screenName",
			expressionValues: util.dynamodb.toMapValues({
				":screenName": ctx.args.screenName,
			}),
		},
		index: "byScreenName",
		limit: 1,
		select: "ALL_ATTRIBUTES",
	};
}

export function response(ctx) {
	return ctx.result.items.length ? ctx.result.items[0] : null;
}
