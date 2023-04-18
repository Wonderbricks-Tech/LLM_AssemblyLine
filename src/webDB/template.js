import { db } from './db'

export async function initTemplate() {
    await db.module.bulkAdd([
        {
            name: 'Answer Question',
            description: '',
            prompt: 'Please answer this question',
            type: 'module',
            example: '',
            enabled: true,
        },
        {
            name: 'Write A Title',
            description: '',
            prompt: 'please add a title for what I input and return it back with input',
            type: 'module',
            example: '',
            enabled: true,
        },
    ])
}
