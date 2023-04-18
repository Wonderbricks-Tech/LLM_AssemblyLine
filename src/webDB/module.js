import { db } from './db'

function validFunc(data) {
    //valied
    if (data.name === '') {
        return {
            success: false,
            message: 'Name is required',
        }
    }
    if (data.prompt === '') {
        return {
            success: false,
            message: 'Prompt is required',
        }
    }
    return {
        success: true,
    }
}

//create new module
export async function createModule(data) {
    try {
        //valied
        let valid = validFunc(data)
        if (!valid.success) return valid
        //check
        const dulFlag = await db.module.get({ name: data.name })
        if (typeof dulFlag === 'undefined') {
            const id = await db.module.add({
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
                message: 'the module name has been created',
            }
        }
    } catch (err) {
        console.error('create module failed', err)
        return {
            success: false,
            message: 'can not create module, please check console log',
        }
    }
}

//modify module
export async function modifyModule(data) {
    try {
        //valied
        let valid = validFunc(data)
        if (!valid.success) return valid
        //check dulp
        const find = await db.module.get({ name: data.name })
        if (typeof find === 'undefined' || find.id === data.id) {
            db.module.update(data)
            return {
                success: true,
            }
        } else {
            //dul name
            return {
                success: false,
                message: 'can not update name(duplicated)',
            }
        }
    } catch (err) {
        console.error(err)
        return {
            success: false,
            message: 'can not modify module, please check console log',
        }
    }
}

//delete module
export async function deleteModule(data) {
    console.log(data)
    db.module
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
