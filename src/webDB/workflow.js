import { db } from './db'

function validFunc(data) {
    //valied
    if (data.name === '') {
        return {
            success: false,
            message: 'Name is required',
        }
    }
    return {
        success: true,
    }
}

export async function createWorkflow(data) {
    try {
        //valied
        let valid = validFunc(data)
        if (!valid.success) return valid
        //check
        const dulFlag = await db.workflow.get({ name: data.name })
        if (typeof dulFlag === 'undefined') {
            const id = await db.workflow.add({
                ...data,
                enabled: true,
            })
            data['id'] = id
            return {
                success: true,
                data: data,
            }
        } else {
            //not allow duplic name
            return {
                success: false,
                message: 'the workflow name has been created',
            }
        }
    } catch (err) {
        console.error('create workflow failed', err)
        return {
            success: false,
            message: 'can not create workflow, please check console log',
        }
    }
}

//delete workflow
export async function deleteWorkflow(data) {
    console.log(data)
    db.workflow
        .where('id')
        .equals(data.id)
        .delete()
        .then((res) => {
            console.log('Delete: ' + data.name)
        })
        .catch((err) => {
            console.error('Error: ' + err)
        })
}
