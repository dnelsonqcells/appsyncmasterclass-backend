import { util } from "@aws-appsync/utils";

export function request(ctx) {
	const { username } = ctx.identity;
	const { userId } = ctx.args;
	const sk = `FOLLOWS_${userId}`;

	return {
		operation: "TransactWriteItems",
		transactItems: [
			{
				table: "#RELATIONSHIPS_TABLE#",
				operation: "DeleteItem",
				key: util.dynamodb.toMapValues({ userId: username, sk }),
				condition: {
					expression: "attribute_exists(sk)",
				},
			},
			{
				table: "#USERS_TABLE#",
				operation: "UpdateItem",
				key: util.dynamodb.toMapValues({ id: username }),
				update: {
					expression: "ADD followingCount :minusOne",
					expressionValues: util.dynamodb.toMapValues({
						":minusOne": -1,
					}),
				},
				condition: {
					expression: "attribute_exists(id)",
				},
			},
			{
				table: "#USERS_TABLE#",
				operation: "UpdateItem",
				key: util.dynamodb.toMapValues({ id: userId }),
				update: {
					expression: "ADD followersCount :minusOne",
					expressionValues: util.dynamodb.toMapValues({
						":minusOne": -1,
					}),
				},
				condition: {
					expression: "attribute_exists(id)",
				},
			},
		],
	};
}

export function response(ctx) {
	if (ctx.result.cancellationReasons)
		return util.error("DynamoDB transaction error");
	if (ctx.error) return util.error("Failed to execute DynamoDB transaction");
	return true;
}
