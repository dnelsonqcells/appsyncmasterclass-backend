import { runtime, util } from "@aws-appsync/utils";

export function request(ctx) {
	if (!ctx.prev.result.relationships.length) {
		runtime.earlyReturn({ profiles: [] });
	}

	return {
		operation: "BatchGetItem",
		tables: {
			"#USERS_TABLE#": {
				keys: ctx.prev.result.relationships.map((relationship) => {
					return util.dynamodb.toMapValues({
						id: relationship.userId,
					});
				}),
			},
		},
	};
}

export function response(ctx) {
	ctx.result.data["#USERS_TABLE#"].forEach((user) => {
		if (user.id === ctx.identity.username) {
			user.__typename = "MyProfile";
		} else {
			user.__typename = "OtherProfile";
		}
	});
	return {
		profiles: ctx.result.data["#USERS_TABLE#"],
		nextToken: ctx.prev.result.nextToken,
	};
}
