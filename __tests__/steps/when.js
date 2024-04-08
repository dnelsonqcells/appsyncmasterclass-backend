require('dotenv').config({ path: ['.env.local', '.env'] })
const AWS = require('aws-sdk')
const { GraphQL, registerFragment } = require('../../lib/graphql')


const myProfileFragment = `
fragment myProfileFields on MyProfile {
  id
  name
  screenName
  imageUrl
  backgroundImageUrl
  bio
  location
  website
  birthdate
  createdAt
  followersCount
  followingCount
  tweetsCount
  likesCounts  
}
`

const otherProfileFragment = `
fragment otherProfileFields on OtherProfile {
  id
  name
  screenName
  imageUrl
  backgroundImageUrl
  bio
  location
  website
  birthdate
  createdAt
  followersCount
  followingCount
  tweetsCount
  likesCounts
  # following
  # followedBy
}
`

const iProfileFragment = `
fragment iProfileFields on IProfile {
  ... on MyProfile {
    ... myProfileFields
  }

  ... on OtherProfile {
    ... otherProfileFields
  }
}
`

const tweetFragment = `
fragment tweetFields on Tweet {
  id
  profile {
    ... iProfileFields
  }
  createdAt
  text
  replies
  likes
  retweets
  retweeted
  liked
}
`

const retweetFragment = `
fragment retweetFields on Retweet {
  id
  profile {
    ... iProfileFields
  }
  createdAt
  retweetOf {
    ... on Tweet {
      ... tweetFields
    }

    ... on Reply {
      ... replyFields
    }
  }
}
`

const replyFragment = `
fragment replyFields on Reply {
  id
  profile {
    ... iProfileFields
  }
  createdAt
  text
  replies
  likes
  retweets
  retweeted
  liked
  inReplyToTweet {
    id
    profile {
      ... iProfileFields
    }
    createdAt
    ... on Tweet {
      replies
    }
    ... on Reply {
      replies
    }
  }
  inReplyToUsers {
    ... iProfileFields
  }
}
`

const iTweetFragment = `
fragment iTweetFields on ITweet {
  ... on Tweet {
    ... tweetFields
  }

  ... on Retweet {
    ... retweetFields
  }

  ... on Reply {
    ... replyFields
  }
}
`

const conversationFragment = `
fragment conversationFields on Conversation {
  id
  otherUser {
    ... otherProfileFields
  }
  lastMessage
  lastModified
}
`

const messageFragment = `
fragment messageFields on Message {
  messageId
  from {
    ... iProfileFields
  }
  message
  timestamp
}
`

registerFragment('myProfileFields', myProfileFragment)
registerFragment('otherProfileFields', otherProfileFragment)
registerFragment('iProfileFields', iProfileFragment)
registerFragment('tweetFields', tweetFragment)
registerFragment('retweetFields', retweetFragment)
registerFragment('replyFields', replyFragment)
registerFragment('iTweetFields', iTweetFragment)
registerFragment('conversationFields', conversationFragment)
registerFragment('messageFields', messageFragment)
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
    const getMyProfile = `query getMyProfile {
    getMyProfile {
      ... myProfileFields

      tweets {
        nextToken
        tweets {
          ... iTweetFields
        }
      }
    }
  }`

    const data = await GraphQL(process.env.API_URL, getMyProfile, {}, user.accessToken)
    const profile = data.getMyProfile

    console.warn(`[${user.username}] - fetched profile`)

    return profile
}

const a_user_calls_editMyProfile = async (user, input) => {
    const editMyProfile = `mutation editMyProfile($input: ProfileInput!) {
    editMyProfile(newProfile: $input) {
      ... myProfileFields

      tweets {
        nextToken
        tweets {
          ... iTweetFields
        }
      }
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
      ... tweetFields
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
        ... iTweetFields
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

const a_user_calls_getMyTimeline = async (user, limit, nextToken) => {
    const getMyTimeline = `query getMyTimeline($limit: Int!, $nextToken: String) {
    getMyTimeline(limit: $limit, nextToken: $nextToken) {
      nextToken
      tweets {
        ... iTweetFields
      }
    }
  }`
    const variables = {
        limit,
        nextToken
    }

    const data = await GraphQL(process.env.API_URL, getMyTimeline, variables, user.accessToken)
    const result = data.getMyTimeline

    console.log(`[${user.username}] - fetched timeline`)

    return result
}

const a_user_calls_like = async (user, tweetId) => {
    const like = `mutation like($tweetId: ID!) {
    like(tweetId: $tweetId)
  }`
    const variables = {
        tweetId
    }

    const data = await GraphQL(process.env.API_URL, like, variables, user.accessToken)
    const result = data.like

    console.log(`[${user.username}] - liked tweet [${tweetId}]`)

    return result
}

const a_user_calls_unlike = async (user, tweetId) => {
    const unlike = `mutation unlike($tweetId: ID!) {
    unlike(tweetId: $tweetId)
  }`
    const variables = {
        tweetId
    }

    const data = await GraphQL(process.env.API_URL, unlike, variables, user.accessToken)
    const result = data.unlike

    console.log(`[${user.username}] - unliked tweet [${tweetId}]`)

    return result
}

const a_user_calls_getLikes = async (user, userId, limit, nextToken) => {
    const getLikes = `query getLikes($userId: ID!, $limit: Int!, $nextToken: String) {
    getLikes(userId: $userId, limit: $limit, nextToken: $nextToken) {
      nextToken
      tweets {
        ... iTweetFields
      }
    }
  }`
    const variables = {
        userId,
        limit,
        nextToken
    }

    const data = await GraphQL(process.env.API_URL, getLikes, variables, user.accessToken)
    const result = data.getLikes

    console.log(`[${user.username}] - fetched likes`)

    return result
}

const a_user_calls_retweet = async (user, tweetId) => {
    const retweet = `mutation retweet($tweetId: ID!) {
    retweet(tweetId: $tweetId) {
      ... retweetFields
    }
  }`
    const variables = {
        tweetId
    }

    const data = await GraphQL(process.env.API_URL, retweet, variables, user.accessToken)
    const result = data.retweet

    console.log(`[${user.username}] - retweeted tweet [${tweetId}]`)

    return result
}

const we_invoke_reply = async (username, tweetId, text) => {
    const handler = require('../../functions/reply').handler

    const context = {}
    const event = {
        identity: {
            username
        },
        arguments: {
            tweetId,
            text
        }
    }

    return await handler(event, context)
}

const we_invoke_retweet = async (username, tweetId) => {
    const handler = require('../../functions/retweet').handler

    const context = {}
    const event = {
        identity: {
            username
        },
        arguments: {
            tweetId
        }
    }

    return await handler(event, context)
}

module.exports = {
    a_user_signs_up,
    we_invoke_confirmUserSignup,
    a_user_calls_getMyProfile,
    a_user_calls_editMyProfile,
    a_user_calls_getImageUploadUrl,
    we_invoke_tweet,
    a_user_calls_tweet,
    a_user_calls_getTweets,
    a_user_calls_getMyTimeline,
    a_user_calls_like,
    a_user_calls_unlike,
    a_user_calls_getLikes,
    a_user_calls_retweet,
    we_invoke_reply,
    we_invoke_retweet
}