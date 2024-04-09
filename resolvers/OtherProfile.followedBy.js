import { util } from "@aws-appsync/utils";

export function request(ctx) {
	const { username } = ctx.identity;
	const { id } = ctx.source;
	const sk = `FOLLOWS_${username}`;
	return {
		operation: "GetItem",
		key: util.dynamodb.toMapValues({ userId: id, sk }),
	};
}

export function response(ctx) {
	return !!ctx.result;
}
