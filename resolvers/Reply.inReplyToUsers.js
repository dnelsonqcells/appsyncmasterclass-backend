import { runtime, util } from "@aws-appsync/utils";

export function request(ctx) {
	if (!ctx.source.inReplyToUserIds.length) {
		runtime.earlyReturn([]);
	}

	const users = [];

	if (
		ctx.info.selectionSetList.length === 1 &&
		ctx.info.selectionSetList[0] === "id"
	) {
		ctx.source.inReplyToUserIds.forEach((userId) => {
			const userToReturn = { id: userId };

			if (userId === ctx.identity.username) {
				userToReturn["__typename"] = "MyProfile";
			} else {
				userToReturn["__typename"] = "OtherProfile";
			}

			users.push(userToReturn);
		});

		runtime.earlyReturn(users);
	}

	return {
		operation: "BatchGetItem",
		tables: {
			"#USERS_TABLE#": {
				keys: ctx.source.inReplyToUserIds.map((userId) => {
					return util.dynamodb.toMapValues({ id: userId });
				}),
			},
		},
	};
}

export function response(ctx) {
	if (!ctx.result.data["#USERS_TABLE#"].length) {
		return ctx.result.data["#USERS_TABLE#"];
	}

	return ctx.result.data["#USERS_TABLE#"].map((user) => {
		if (user.id === ctx.identity.username) {
			user["__typename"] = "MyProfile";
		} else {
			user["__typename"] = "OtherProfile";
		}
		return user;
	});
}
