import { HiveHelper } from 'src/services/HiveHelper'
import { HiveData } from 'src/services/HiveData'

const TAG = 'HiveApi'

const hiveHelper = new HiveHelper()
export class HiveApi {
  constructor() { }

  /**
    * 注册所有的脚本： 
    * channel、post、Public post、subscription、comment、like、DisplayName
  */
  registeScripting(): Promise<string> {
    return hiveHelper.registeScripting()
  }

  /**
    * 创建存储feeds版本号等信息的表格
    *
    * @param lasterVersion: 最新的feeds版本号
    * @param preVersion: feeds前一个版本
    * @param registScripting: 是否已经注册了脚本，默认值=false
    * @return 最新的feeds存储信息: 
    *         {"laster_version": 2.1.1,
              "pre_version": 2.1.0,
              "regist_scripting": true}
    * @throws HiveError
  */
  createFeedsScripting(lasterVersion: string, preVersion: string, registScripting: boolean = false): Promise<string> {
    return hiveHelper.createFeedsScripting(lasterVersion, preVersion, registScripting)
  }

  /**
    * 更新feeds版本号等信息
    *
    * @param lasterVersion: 最新的feeds版本号
    * @param preVersion: feeds前一个版本
    * @param registScripting: 是否已经注册了脚本，默认值=false
    * @return 最新的feeds存储信息: 
    *         {"laster_version": 2.1.1,
              "pre_version": 2.1.0,
              "regist_scripting": true}
    * @throws HiveError
  */
  updateFeedsScripting(lasterVersion: string, preVersion: string, registScripting: boolean = false) {
    return hiveHelper.updateFeedsScripting(lasterVersion, preVersion, registScripting)
  }

  /**
    * 查询feeds版本号等信息
    *
    * @return 返回服务器存储的的feeds信息: 
    *         {"laster_version": 2.1.1,
              "pre_version": 2.1.0,
              "regist_scripting": true}
    * @throws HiveError
  */
  queryFeedsScripting(): Promise<any> {
    return hiveHelper.queryFeedsScripting()
  }

  /**
    * 创建所有的collection：
    *
    * @return true：所有collection创建成功，返回true，否则抛出异常: 
    *       feeds_scripting: 存储feeds信息：版本号等
            channels: 存储所有的channle 信息，已订阅者可以访问，仅自己写入
            posts: 存储所有的post: 已订阅者可以访问，仅自己写入
            subscriptions: 存储所有的订阅者的信息，订阅者可写入
            comments: 存储所有的评论， 订阅者可写入
            likes: 存储所有的like，订阅者可写入
            backup_subscribed_channel: 存储备份，仅自己写入
    * @throws HiveError
  */
  createAllCollections(): Promise<string> {
    return hiveHelper.createAllCollections()
  }

  /**
    * 删除指定的collection：
    * @param collectionName: 要删除的collection name
    * @return void：删除collection成功，否则抛出异常
    * @throws HiveError
  */
  deleteCollection(collectionName: string): Promise<void> {
    return hiveHelper.deleteCollection(collectionName)
  }

  /**
    * 删除所有的的collection：
    * @param collectionName: 要删除的collection name
    * @return true：删除所有的collection成功，返回true，否则抛出异常 
    * @throws HiveError
  */
  deleteAllCollections(): Promise<string> {
    return hiveHelper.deleteAllCollections()
  }
  /** Channel */
  createChannel(channelName: string, intro: string, avatarAddress: string, tippingAddress: string = '', type: string = 'public', nft: string = '', memo: string, category: string = '', proof: string = ''): Promise<any> {
    return hiveHelper.createChannel(channelName, intro, avatarAddress, tippingAddress, type, nft, memo, category, proof)
  }

  updateChannel(channelId: string, newName: string, newIntro: string, newAvatar: string, newType: string, newMemo: string,
    newTippingAddress: string, newNft: string) {
    return hiveHelper.updateChannel(channelId, newName, newIntro, newAvatar, newType, newMemo, newTippingAddress, newNft)
  }

  queryChannelInfo(targetDid: string, channelId: string): Promise<any> {
    return hiveHelper.queryChannelInfo(targetDid, channelId)
  }

  /** Post */
  publishPost(channelId: string, tag: string, content: string, type: string = 'public', status: number = HiveData.PostCommentStatus.available, memo: string, proof: string): Promise<{ targetDid: string, postId: string, createdAt: number, updatedAt: number }> {
    return hiveHelper.publishPost(channelId, tag, content, type, status, memo, proof)
  }

  updatePost(postId: string, channelId: string, newType: string, newTag: string, newContent: string, newStatus: number, newUpdateAt: number, newMemo: string, newProof: string) {
    return hiveHelper.updatePost(postId, channelId, newType, newTag, newContent, newStatus, newUpdateAt, newMemo, newProof)
  }

  deletePost(postId: string, channelId: string): Promise<{ updatedAt: number, status: number }> {
    return hiveHelper.deletePost(postId, channelId)
  }

  queryPostByChannelId(targetDid: string, channelId: string) {
    return hiveHelper.queryPostByChannelId(targetDid, channelId)
  }

  queryPostByRangeOfTime(targetDid: string, channelId: string, star: number, end: number) {
    return hiveHelper.queryPostRangeOfTimeScripting(targetDid, channelId, star, end)
  }
  queryPostById(targetDid: string, channelId: string, postId: string) {
    return hiveHelper.queryPostById(targetDid, channelId, postId)
  }

  /** Suscription */
  subscribeChannel(targetDid: string, channelId: string, displayName: string, updatedAt: number, status: number = HiveData.PostCommentStatus.available): Promise<any> {
    return hiveHelper.subscribeChannel(targetDid, channelId, displayName, updatedAt, status)
  }

  updateSubscription(targetDid: string, channelId: string, status: number): Promise<{ updatedAt: number }> {
    return hiveHelper.updateSubscription(targetDid, channelId, status)
  }

  unSubscribeChannel(targetDid: string, channelId: string) {
    return hiveHelper.unsubscribeChannel(targetDid, channelId)
  }

  querySubscrptionInfoByChannelId(targetDid: string, channelId: string) {
    return hiveHelper.querySubscriptionInfoByChannelId(targetDid, channelId)
  }

  querySubscriptionInfoByUserDID(targetDid: string, userDid: string) {
    return hiveHelper.querySubscriptionByUserDID(targetDid, userDid)
  }

  querySubscriptionByUserDIDAndChannelId(targetDid: string, userDid: string, channelId: string) {
    return hiveHelper.querySubscriptionByUserDIDAndChannelId(targetDid, userDid, channelId)
  }

  /** Comment */
  createComment(targetDid: string, channelId: string, postId: string, refcommentId: string, content: string): Promise<{ commentId: string, createrDid: string, createdAt: number }> {
    return hiveHelper.createComment(targetDid, channelId, postId, refcommentId, content)
  }

  updateComment(targetDid: string, channelId: string, postId: string, commentId: string, content: string): Promise<{ updatedAt: number }> {
    return hiveHelper.updateComment(targetDid, channelId, postId, commentId, content)
  }

  deleteComment(targetDid: string, channelId: string, postId: string, commentId: string): Promise<any> {
    return hiveHelper.deleteComment(targetDid, channelId, postId, commentId)
  }

  queryCommentByPostId(targetDid: string, channelId: string, postId: string) {
    return hiveHelper.queryCommentByPostId(targetDid, channelId, postId)
  }

  queryCommentByID(targetDid: string, channelId: string, postId: string, commentId: string): Promise<any> {
    return hiveHelper.queryCommentByID(targetDid, channelId, postId, commentId)
  }

  queryCommentByChannel(targetDid: string, channelId: string) {
    return hiveHelper.queryCommentByChannel(targetDid, channelId)
  }

  queryCommentByRangeOfTime(targetDid: string, channelId: string, postId: string, star: number, end: number) {
    return hiveHelper.queryCommentRangeOfTimeScripting(targetDid, channelId, postId, star, end)
  }

  /** Like */
  queryLikeByChannel(targetDid: string, channelId: string): Promise<any> {
    return hiveHelper.queryLikeByChannel(targetDid, channelId)
  }

  queryLikeById(targetDid: string, channelId: string, postId: string, commentId: string): Promise<any> {
    return hiveHelper.queryLikeById(targetDid, channelId, postId, commentId)
  }

  queryLikeByUser(targetDid: string, channelId: string, postId: string, commentId: string, userDid: string): Promise<any> {
    // TODO userDid: string
    return hiveHelper.queryLikeById(targetDid, channelId, postId, commentId)
  }

  queryLikeByPost(targetDid: string, channelId: string, postId: string): Promise<any> {
    return hiveHelper.queryLikeByPost(targetDid, channelId, postId)
  }

  queryLikeByRangeOfTime(targetDid: string, channelId: string, postId: string, star: number, end: number) {
    return hiveHelper.queryLikeRangeOfTimeScripting(targetDid, channelId, postId, star, end)
  }

  addLike(targetDid: string, likeId: string, channelId: string, postId: string, commentId: string): Promise<{ createdAt: number }> {
    return hiveHelper.addLike(targetDid, likeId, channelId, postId, commentId)
  }

  removeLike(targetDid: string, channelId: string, postId: string, commentId: string): Promise<any> {
    return hiveHelper.removeLike(targetDid, channelId, postId, commentId)
  }

  updateLike(targetDid: string, likeId: string, status: number): Promise<{ updatedAt: number }> {
    return hiveHelper.updateLike(targetDid, likeId, status)
  }

  /** Download data */
  downloadScripting(targetDid: string, avatarHiveURL: string): Promise<any> {
    return hiveHelper.downloadScripting(targetDid, avatarHiveURL)
  }

  downloadCustomeAvatar(remoteHiveUrlPath: string): Promise<any> {
    return hiveHelper.downloadFile(remoteHiveUrlPath)
  }

  parseDidDocumentAvatar(userDid: string) {
    return hiveHelper.parseDidDocumentAvatar(userDid)
  }

  downloadEssAvatar(avatarParam: string, avatarScriptName: string, tarDID: string, tarAppDID: string): Promise<string> {
    return hiveHelper.downloadEssAvatar(avatarParam, avatarScriptName, tarDID, tarAppDID)
  }

  uploadMediaDataWithString(data: string): Promise<string> {
    return hiveHelper.uploadMediaDataWithString(data)
  }

  uploadMediaDataWithBuffer(data: Buffer): Promise<string> {
    return hiveHelper.uploadMediaDataWithBuffer(data)
  }

  /** selfData */
  querySelfChannels(): Promise<any> {
    return hiveHelper.querySelfChannels()
  }

  querySelfPosts(): Promise<any> {
    return hiveHelper.querySelfPosts()
  }

  querySelfPostsByChannel(channelId: string): Promise<any> {
    return hiveHelper.querySelfPostsByChannel(channelId)
  }

  queryUserDisplayName(targetDid: string, channelId: string, userDid: string): Promise<any> {
    return hiveHelper.queryUserDisplayName(targetDid, channelId, userDid)
  }

  querySubscription(targetDid: string, channelId: string): Promise<any> {
    return hiveHelper.querySubscriptionInfoByChannelId(targetDid, channelId)
  }

  prepareConnection() {
    return hiveHelper.prepareConnection()
  }

  backupSubscribedChannel(targetDid: string, channelId: string) {
    return hiveHelper.backupSubscribedChannel(targetDid, channelId)
  }

  queryBackupData(): Promise<any> {
    return hiveHelper.queryBackupData()
  }

  removeBackupData(targetDid: string, channelId: string) {
    return hiveHelper.removeBackupData(targetDid, channelId)
  }

  queryCommentsFromPosts(targetDid: string, postIds: string[]): Promise<any> {
    return hiveHelper.queryCommentsFromPosts(targetDid, postIds)
  }

  querySelfLikeById(targetDid: string, channelId: string, likeId: string) {
    return hiveHelper.querySelfLikeById(targetDid, channelId, likeId)
  }

  queryPublicPostById(targetDid: string, channelId: string, postId: string): Promise<any> {
    return hiveHelper.queryPublicPostById(targetDid, channelId, postId)
  }

  queryPublicPostByChannelId(targetDid: string, channelId: string): Promise<any> {
    return hiveHelper.queryPublicPostByChannelId(targetDid, channelId)
  }

  queryPublicPostRangeOfTime(targetDid: string, channelId: string, start: number, end: number): Promise<any> {
    return hiveHelper.queryPublicPostRangeOfTime(targetDid, channelId, start, end)
  }
}
