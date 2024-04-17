import { util } from "@aws-appsync/utils";

export function request(ctx) {
	if (ctx.args.userId !== ctx.identity.username) {
		util.unauthorized();
	}

	return {};
}

export function response(ctx) {
	return ctx.result;
}
