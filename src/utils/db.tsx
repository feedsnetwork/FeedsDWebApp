import PouchDB from 'pouchdb-browser'
import PouchdbFind from 'pouchdb-find'
import upsertPlugin from "pouchdb-upsert";

PouchDB.plugin(PouchdbFind);
PouchDB.plugin(upsertPlugin);

// export const LocalDB = new PouchDB(`feeds-${sessionStorage.getItem('FEEDS_DID')}`)
export const getLocalDB = ()=>{
  // console.info(sessionStorage.getItem('FEEDS_DID'))
  return new PouchDB(`feeds-${sessionStorage.getItem('FEEDS_DID')}`)
}
export const enum QueryStep {
  self_channel = 1,
  subscribed_channel = 2,
  public_channel = 2,
  post_data = 3,
  post_like = 4,
  post_image = 5,
  comment_data = 6,
  comment_like = 7,
}
export const StepType = {
  self_channel: { index: 1, name: "self_channel" },
  subscribed_channel: { index: 2, name: "subscribed_channel" },
  public_channel: { index: 2, name: "public_channel" },
  post_data: { index: 3, name: "post_data" },
  post_like: { index: 4, name: "post_like" },
  post_image: { index: 5, name: "post_image" },
  comment_data: { index: 6, name: "comment_data" },
  comment_like: { index: 7, name: "comment_like" },
}