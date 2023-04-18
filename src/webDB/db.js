import Dexie from 'dexie'
import { initTemplate } from './template'

export const db = new Dexie('webDatabase')

db.version(1).stores({
    module: '++id,name,description,prompt,type,example,enabled',
    workflow: '++id,name,description,example,type,children,enabled',
})

db.on('populate', initTemplate)
