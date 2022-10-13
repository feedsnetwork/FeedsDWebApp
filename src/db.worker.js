import { exposeWorker } from 'react-hooks-worker';
const PouchDB = require('pouchdb-browser');

const pouchDB = PouchDB.default.defaults();
var db = new pouchDB('local');
const workDB = async ()=>{
    const dataObj = {
        _id: new Date().toISOString(),
        name: 'my post',
    }
    return await insertData(dataObj)
    // return await db.info()
}
const insertData = (data) => (
    new Promise((resolve, reject)=>{
        db.put(data, function callback(err, result) {
            if (!err) {
                resolve(result)
            }
            else
                reject(err)
        });
    })
)

exposeWorker(workDB);