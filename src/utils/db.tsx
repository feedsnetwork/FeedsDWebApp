import PouchDB from 'pouchdb-browser'
import PouchdbFind from 'pouchdb-find'

PouchDB.plugin(PouchdbFind);

export const LocalDB = new PouchDB('local')
export const enum QueryStep {
  self_channel = 1,
  subscribed_channel = 2,
  channel_dispname = 3,
  subscription_info = 4,
  subscriber_info = 5,
  post_data = 6,
  post_like = 7,
  post_image = 8,
  comment_data = 9,
}