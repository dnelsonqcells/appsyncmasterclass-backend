require('dotenv').config({ path: ['.env.local', '.env'] })
const AWS = require('aws-sdk')
const { GraphQL, registerFragment } = require('../../lib/graphql')
const a_user_signs_up = async (password, name, email) => {
    const cognito = new AWS.CognitoIdentityServiceProvider()

    const userPoolId = process.env.CognitoUserPoolId
    const clientId = process.env.WebCognitoUserPoolClientId

    const signUpResp = await cognito.signUp({
        ClientId: clientId,
        Username: email,
        Password: password,
        UserAttributes: [
            { Name: 'name', Value: name }
        ]
    }).promise()

    const username = signUpResp.UserSub
    console.warn(`[${email}] - user has signed up [${username}]`)

    await cognito.adminConfirmSignUp({
        UserPoolId: userPoolId,
        Username: username
    }).promise()

    console.warn(`[${email}] - confirmed sign up`)

    return {
        username,
        name,
        email
    }
}

const we_invoke_confirmUserSignup = async (username, name, email) => {
    const handler = require('../../functions/confirm-user-signup').handler

    const context = {}
    const event = {
        "version": "1",
        "region": process.env.AwsRegion,
        "userPoolId": process.env.CognitoUserPoolId,
        "userName": username,
        "triggerSource": "PostConfirmation_ConfirmSignUp",
        "request": {
            "userAttributes": {
                "sub": username,
                "cognito:email_alias": email,
                "cognito:user_status": "CONFIRMED",
                "email_verified": "false",
                "name": name,
                "email": email
            }
        },
        "response": {}
    }

    await handler(event, context)
}

const a_user_calls_getMyProfile = async (user) => {
  //   const getMyProfile = `query getMyProfile {
  //   getMyProfile {
  //     ... myProfileFields
  //
  //     tweets {
  //       nextToken
  //       tweets {
  //         ... iTweetFields
  //       }
  //     }
  //   }
  // }`
    const getMyProfile = `query getMyProfile {
    getMyProfile {
         backgroundImageUrl
        bio
        followersCount
        createdAt
        birthdate
    }
  }`

    const data = await GraphQL(process.env.API_URL, getMyProfile, {}, user.accessToken)
    const profile = data.getMyProfile

    console.warn(`[${user.username}] - fetched profile`)

    return profile
}

const a_user_calls_editMyProfile = async (user, input) => {
  //   const editMyProfile = `mutation editMyProfile($input: ProfileInput!) {
  //   editMyProfile(newProfile: $input) {
  //     ... myProfileFields
  //
  //     tweets {
  //       nextToken
  //       tweets {
  //         ... iTweetFields
  //       }
  //     }
  //   }
  // }`
    const editMyProfile = `mutation editMyProfile($input: ProfileInput!) {
    editMyProfile(newProfile: $input) {
    backgroundImageUrl
        bio
        followersCount
        createdAt
        birthdate
        name
    }
  }`
    const variables = {
        input
    }

    const data = await GraphQL(process.env.API_URL, editMyProfile, variables, user.accessToken)
    const profile = data.editMyProfile

    console.warn(`[${user.username}] - edited profile`)

    return profile
}

const a_user_calls_getImageUploadUrl = async (user, extension, contentType) => {
    const getImageUploadUrl = `query getImageUploadUrl($extension: String, $contentType: String) {
    getImageUploadUrl(extension: $extension, contentType: $contentType)
  }`
    const variables = {
        extension,
        contentType
    }

    const data = await GraphQL(process.env.API_URL, getImageUploadUrl, variables, user.accessToken)
    const url = data.getImageUploadUrl

    console.warn(`[${url}] - got image upload url`)

    return url
}

const we_invoke_tweet = async (username, text) => {
    const handler = require('../../functions/tweet').handler

    const context = {}
    const event = {
        identity: {
            username
        },
        arguments: {
            text
        }
    }

    return await handler(event, context)
}

const a_user_calls_tweet = async (user, text) => {
    const tweet = `mutation tweet($text: String!) {
    tweet(text: $text) {
      id
      createdAt
      text
      replies
      likes
      retweets
    }
  }`
    const variables = {
        text
    }

    const data = await GraphQL(process.env.API_URL, tweet, variables, user.accessToken)
    const newTweet = data.tweet

    console.log(`[${user.username}] - posted new tweet`)

    return newTweet
}

const a_user_calls_getTweets = async (user, userId, limit, nextToken) => {
    const getTweets = `query getTweets($userId: ID!, $limit: Int!, $nextToken: String) {
    getTweets(userId: $userId, limit: $limit, nextToken: $nextToken) {
      nextToken
      tweets {
        id
        createdAt
        
        ... on Tweet {
            text
            likes
            replies
            retweets
        }
      }
    }
  }`
    const variables = {
        userId,
        limit,
        nextToken
    }

    const data = await GraphQL(process.env.API_URL, getTweets, variables, user.accessToken)
    const result = data.getTweets

    console.log(`[${user.username}] - posted new tweet`)

    return result
}

module.exports = {
    a_user_signs_up,
    we_invoke_confirmUserSignup,
    a_user_calls_getMyProfile,
    a_user_calls_editMyProfile,
    a_user_calls_getImageUploadUrl,
    we_invoke_tweet,
    a_user_calls_tweet,
    a_user_calls_getTweets
}