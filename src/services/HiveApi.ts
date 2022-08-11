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

  /**
    * 更新channel信息
    *
    * @param channelId: 需要更新的channelId
    * @param newName: 新的channel名字
    * @param newIntro: 新的channel介绍
    * @param newAvatar: 新的channel 头像
    * @param newType: 新的channel type
    * @param newMemo: 新的channel memo
    * @param newTippingAddress: 新的channel TippingAddress
    * @param newNft: 新的channel Nft

    * @return 更新channel的结果
    * @throws HiveError
  */
  updateChannel(channelId: string, newName: string, newIntro: string, newAvatar: string, newType: string, newMemo: string,
    newTippingAddress: string, newNft: string) {
    return hiveHelper.updateChannel(channelId, newName, newIntro, newAvatar, newType, newMemo, newTippingAddress, newNft)
  }

  /**
    * 查询channel信息
    *
    * @param targetDid: channel的持有者的did
    * @param channelId: channel的id
    * @return channel的信息
    * @throws HiveError
  */
  queryChannelInfo(targetDid: string, channelId: string): Promise<any> {
    return hiveHelper.queryChannelInfo(targetDid, channelId)
  }

  /**
    * 发布post
    *
    * @param channelId: 发布的post在哪个channel下
    * @param tag: post的tag
    * @param content: post的内容
    * @param type: post的type
    * @param status: post的状态: 
    *   available: 0,
        deleted: 1,
        edited: 2,
        sending: 11,
        error: 12,
    * @param memo: post的 memo
    * @param proof: post的proof
    * @return 发布成功后返回post信息{
      targetDid: xxx,
      postId: xxx, 
      createdAt: xxx,
      updatedAt: xxx
    }
    * @throws HiveError
  */
  publishPost(channelId: string, tag: string, content: string, type: string = 'public', status: number = HiveData.PostCommentStatus.available, memo: string, proof: string): Promise<{ targetDid: string, postId: string, createdAt: number, updatedAt: number }> {
    return hiveHelper.publishPost(channelId, tag, content, type, status, memo, proof)
  }

  /**
    * 更新post
    *
    * @param postId: 需要修改的post的id
    * @param channelId: post属于哪个channel
    * @param newType: post的新type
    * @param newTag: post的新tag
    * @param newContent: post的新内容
    * @param newStatus: post的新的statu: 
    *   available: 0,
        deleted: 1,
        edited: 2,
        sending: 11,
        error: 12,
    * @param newUpdateAt: post的更新时间
    * @param newMemo: post的新的memo
    * @param newProof: post的新的proof
    * @return 更新成功信息
    * @throws HiveError
  */
  updatePost(postId: string, channelId: string, newType: string, newTag: string, newContent: string, newStatus: number, newUpdateAt: number, newMemo: string, newProof: string) {
    return hiveHelper.updatePost(postId, channelId, newType, newTag, newContent, newStatus, newUpdateAt, newMemo, newProof)
  }

  /**
    * 删除post
    *
    * @param postId: 需要删除的post的id
    * @param channelId: post属于哪个channel
    * @return 删除成功信息
    * @throws HiveError
  */
  deletePost(postId: string, channelId: string): Promise<{ updatedAt: number, status: number }> {
    return hiveHelper.deletePost(postId, channelId)
  }

  /**
    * 查询指定channel下的所有post
    *
    * @param targetDid: channel的持有者
    * @param channelId: post属于哪个channel
    * @return channel下所有的post
    * @throws HiveError
  */
  queryPostByChannelId(targetDid: string, channelId: string) {
    return hiveHelper.queryPostByChannelId(targetDid, channelId)
  }

  /**
    * 查询指定targetDid且指定时间段下的所有post
    *
    * @param targetDid: channel的持有者
    * @param channelId: post属于哪个channel
    * @param star: 查询post的开始时间
    * @param end: 查询post的结束时间
    * @return 指定之间段的所有post
    * @throws HiveError
  */
  queryPostByRangeOfTime(targetDid: string, channelId: string, star: number, end: number) {
    return hiveHelper.queryPostRangeOfTimeScripting(targetDid, channelId, star, end)
  }

  /**
    * 查询指定post
    *
    * @param targetDid: channel的持有者
    * @param channelId: post属于哪个channel
    * @param postId: 查询的post的id
    * @return post信息
    * @throws HiveError
  */
  queryPostById(targetDid: string, channelId: string, postId: string) {
    return hiveHelper.queryPostById(targetDid, channelId, postId)
  }

  /**
    * Suscription 订阅
    *
    * @param targetDid: 订阅channel的持有者
    * @param channelId: 订阅的channel的id
    * @param displayName: 订阅者的名字
    * @param updatedAt: 订约时间
    * @param status: 订阅状态
    * @return 订阅成功信息
    * @throws HiveError
  */
  subscribeChannel(targetDid: string, channelId: string, displayName: string, updatedAt: number, status: number = HiveData.PostCommentStatus.available): Promise<any> {
    return hiveHelper.subscribeChannel(targetDid, channelId, displayName, updatedAt, status)
  }

  /**
    * Suscription 更新订阅信息
    *
    * @param targetDid: channel的持有者
    * @param channelId: channel的id
    * @param status: 订阅状态
    * @return 更新订阅成功信息
    * @throws HiveError
  */
  updateSubscription(targetDid: string, channelId: string, status: number): Promise<{ updatedAt: number }> {
    return hiveHelper.updateSubscription(targetDid, channelId, status)
  }

  /**
    * unSubscribeChannel 取消订阅
    *
    * @param targetDid: channel的持有者
    * @param channelId: channel的id
    * @return 取消订阅成功信息
    * @throws HiveError
  */
  unSubscribeChannel(targetDid: string, channelId: string) {
    return hiveHelper.unsubscribeChannel(targetDid, channelId)
  }

  /**
    * 查询指定channelId的Subscrption信息
    *
    * @param targetDid: channel的持有者
    * @param channelId: channel的id
    * @return 指定channelid下所有的订阅信息
    * @throws HiveError
  */
  querySubscrptionInfoByChannelId(targetDid: string, channelId: string) {
    return hiveHelper.querySubscriptionInfoByChannelId(targetDid, channelId)
  }

  /**
    * 查询指定userDid的Subscrption信息
    *
    * @param targetDid: channel的持有者
    * @param channelId: channel的id
    * @return 指定userdid下所有的订阅信息
    * @throws HiveError
  */
  querySubscriptionInfoByUserDID(targetDid: string, userDid: string) {
    return hiveHelper.querySubscriptionByUserDID(targetDid, userDid)
  }

  /**
    * 查询指定userDid且指定channelId的Subscrption信息
    *
    * @param targetDid: channel的持有者
    * @param userDid: 要查询的订阅者的did
    * @param channelId: 要查询的channel的id
    * @return 返回查询条件下channel的订阅信息
    * @throws HiveError
  */
  querySubscriptionByUserDIDAndChannelId(targetDid: string, userDid: string, channelId: string) {
    return hiveHelper.querySubscriptionByUserDIDAndChannelId(targetDid, userDid, channelId)
  }

  /**
    * Comment 添加评论
    *
    * @param targetDid: channel的持有者
    * @param channelId: channel的id
    * @param postId: 添加评论的post的id
    * @param refcommentId: 回复的评论的评论id, 如果是post下的新评论refcommentId为0
    * @param content: 评论内容
    * @return 评论成功后返回：
    *         {commentId: xxx, 
    *         createrDid: xxx, 
    *         createdAt: xxx}
    * @throws HiveError
  */
  createComment(targetDid: string, channelId: string, postId: string, refcommentId: string, content: string): Promise<{ commentId: string, createrDid: string, createdAt: number }> {
    return hiveHelper.createComment(targetDid, channelId, postId, refcommentId, content)
  }

  /**
    * Comment 更新评论
    *
    * @param targetDid: channel的持有者
    * @param channelId: channel的id
    * @param postId: 评论的post的id
    * @param commentId: 评论id
    * @param content: 评论内容
    * @return 评论成功后返回：
    *         {updatedAt: xxx}
    * @throws HiveError
  */
  updateComment(targetDid: string, channelId: string, postId: string, commentId: string, content: string): Promise<{ updatedAt: number }> {
    return hiveHelper.updateComment(targetDid, channelId, postId, commentId, content)
  }

  /**
    * Comment 删除评论
    *
    * @param targetDid: channel的持有者
    * @param channelId: channel的id
    * @param postId: 评论的post的id
    * @param commentId: 需要删除的评论id
    * @return 删除成功信息
    * @throws HiveError
  */
  deleteComment(targetDid: string, channelId: string, postId: string, commentId: string): Promise<any> {
    return hiveHelper.deleteComment(targetDid, channelId, postId, commentId)
  }

  /**
    * Comment 查询指定postId下的所有评论
    *
    * @param targetDid: channel的持有者
    * @param channelId: channel的id
    * @param postId: 评论的post的id
    * @return 满足条件下所有的评论
    * @throws HiveError
  */
  queryCommentByPostId(targetDid: string, channelId: string, postId: string) {
    return hiveHelper.queryCommentByPostId(targetDid, channelId, postId)
  }

  /**
    * Comment 查询指定postId且指定commentId下的所有评论
    *
    * @param targetDid: channel的持有者
    * @param channelId: channel的id
    * @param postId: 指定评论的post的id
    * @param commentId: 指定评论的id 
    * @return 满足条件下所有的评论
    * @throws HiveError
  */
  queryCommentByID(targetDid: string, channelId: string, postId: string, commentId: string): Promise<any> {
    return hiveHelper.queryCommentByID(targetDid, channelId, postId, commentId)
  }

  /**
    * Comment 查询指定channelId下的所有评论
    *
    * @param targetDid: channel的持有者
    * @param channelId: channel的id
    * @return 满足条件下所有的评论
    * @throws HiveError
  */
  queryCommentByChannel(targetDid: string, channelId: string) {
    return hiveHelper.queryCommentByChannel(targetDid, channelId)
  }

  /**
    * Comment 查询指定post下且指定时间段内的所有评论
    *
    * @param targetDid: channel的持有者
    * @param channelId: channel的id
    * @param postId: 指定评论的post的id
    * @param star: 指定评论的开始时间
    * @param end: 指定评论的结束时间
    * @return 满足条件下所有的评论
    * @throws HiveError
  */
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
