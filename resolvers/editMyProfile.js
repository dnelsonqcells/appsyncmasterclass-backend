import { update } from '@aws-appsync/utils/dynamodb';
import { util } from '@aws-appsync/utils';

export function request(ctx) {
    const updateFields = {}

    Object.keys(ctx.arguments.newProfile).forEach(key => {
        updateFields[key] = ctx.arguments.newProfile[key]
    })
    return update({
        key: {id: ctx.identity.username},
        update: {
            ...updateFields
        }
    })
}

export function response(ctx) {
    return ctx.result;
}
