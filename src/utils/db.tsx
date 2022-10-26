import PouchDB from 'pouchdb-browser'
import PouchdbFind from 'pouchdb-find'

PouchDB.plugin(PouchdbFind);

export const LocalDB = new PouchDB('local')
export const enum QueryStep {
  self_channel = 1,
  subscribed_channel = 2,
  subscription_info = 3,
  subscriber_info = 4,
  post_data = 5,
  post_like = 6,
  post_image = 7,
  comment_data = 8,
  comment_like = 9,
}