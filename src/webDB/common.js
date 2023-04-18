import { db } from './db'

//get the prompt from module or workflow
export async function getPromptFromMW(data) {
    let id = data.id
    let type = data.type
    let result = null
    if (type === 'module') {
        result = await db.module.get({ id: id })
    } else if (type === 'workflow') {
        result = await db.workflow.get({ id: id })
    }
    return result
}
