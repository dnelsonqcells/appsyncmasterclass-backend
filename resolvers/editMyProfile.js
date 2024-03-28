import { update } from '@aws-appsync/utils/dynamodb';
import { util } from '@aws-appsync/utils';

export function request(ctx) {
    return update({
        key: {id: ctx.identity.username},
        update: {
            name: ctx.arguments.newProfile.name,
            imageUrl: ctx.arguments.newProfile.imageUrl,
            backgroundImageUrl: ctx.arguments.newProfile.backgroundImageUrl,
            bio: ctx.arguments.newProfile.bio,
            location: ctx.arguments.newProfile.location,
            website: ctx.arguments.newProfile.website,
            birthdate: ctx.arguments.newProfile.birthdate,
        }
    })
}

export function response(ctx) {
    return ctx.result;
}
