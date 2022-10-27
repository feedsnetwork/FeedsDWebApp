import PouchDB from 'pouchdb-browser'
import PouchdbFind from 'pouchdb-find'

PouchDB.plugin(PouchdbFind);

export const LocalDB = new PouchDB('local')
export const enum QueryStep {
  self_channel = 1,
  subscribed_channel = 2,
  post_data = 3,
  post_like = 4,
  post_image = 5,
  comment_data = 6,
  comment_like = 7,
}