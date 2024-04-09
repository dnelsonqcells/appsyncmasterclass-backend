import { util } from "@aws-appsync/utils";

export function request(ctx) {
	const { username } = ctx.identity;
	const { id } = ctx.source;
	const sk = `FOLLOWS_${id}`;
	return {
		operation: "GetItem",
		key: util.dynamodb.toMapValues({ userId: username, sk }),
	};
}

export function response(ctx) {
	return !!ctx.result;
}
