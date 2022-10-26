import PouchDB from 'pouchdb-browser'
import PouchdbFind from 'pouchdb-find'

PouchDB.plugin(PouchdbFind);

export const LocalDB = new PouchDB('local')
export const enum QueryStep {
  self_channel = 1,
  subscribed_channel = 2,
  subscriber_info = 3,
  post_data = 4,
  post_like = 5,
  post_image = 6,
  comment_data = 7,
  comment_like = 8,
}