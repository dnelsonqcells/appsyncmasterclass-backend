require("dotenv").config();
const AWS = require("aws-sdk");
const chance = require("chance").Chance();
const DocumentClient = new AWS.DynamoDB.DocumentClient();

const { RELATIONSHIPS_TABLE } = process.env;

const a_random_user = () => {
	const firstName = chance.first({ nationality: "en" });
	const lastName = chance.first({ nationality: "en" });
	const suffix = chance.string({
		length: 4,
		pool: "abcdefghijklmnopqrstuvwxyz",
	});
	const name = `${firstName} ${lastName} ${suffix}`;
	const password = chance.string({ length: 8 });
	const email = `${firstName}-${lastName}-${suffix}@appsyncmasterclass.com`;

	return {
		name,
		password,
		email,
	};
};

const an_authenticated_user = async () => {
	const { name, email, password } = a_random_user();

	const cognito = new AWS.CognitoIdentityServiceProvider();

	const userPoolId = process.env.CognitoUserPoolId;
	const clientId = process.env.WebCognitoUserPoolClientId;

	const signUpResp = await cognito
		.signUp({
			ClientId: clientId,
			Username: email,
			Password: password,
			UserAttributes: [{ Name: "name", Value: name }],
		})
		.promise();

	const username = signUpResp.UserSub;
	console.log(`[${email}] - user has signed up [${username}]`);

	await cognito
		.adminConfirmSignUp({
			UserPoolId: userPoolId,
			Username: username,
		})
		.promise();

	console.log(`[${email}] - confirmed sign up`);

	const auth = await cognito
		.initiateAuth({
			AuthFlow: "USER_PASSWORD_AUTH",
			ClientId: clientId,
			AuthParameters: {
				USERNAME: username,
				PASSWORD: password,
			},
		})
		.promise();

	console.log(`[${email}] - signed in`);

	return {
		username,
		name,
		email,
		idToken: auth.AuthenticationResult.IdToken,
		accessToken: auth.AuthenticationResult.AccessToken,
	};
};

const a_user_follows_another = async (userId, otherUserId) => {
	await DocumentClient.put({
		TableName: RELATIONSHIPS_TABLE,
		Item: {
			userId,
			sk: `FOLLOWS_${otherUserId}`,
			otherUserId,
			createdAt: new Date().toJSON(),
		},
	}).promise();
};

module.exports = {
	a_random_user,
	an_authenticated_user,
	a_user_follows_another,
};
