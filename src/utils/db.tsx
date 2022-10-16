import PouchDB from 'pouchdb-browser'
import PouchdbFind from 'pouchdb-find'

PouchDB.plugin(PouchdbFind);

export const LocalDB = new PouchDB('local')
export const enum QueryStep {
  self_channel = 1,
  subscribed_channel = 2,
  public_channel = 3,
  channel_dispname = 4,
  subscription_info = 5,
}