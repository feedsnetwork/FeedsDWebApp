
import { Executable, InsertOptions, File as HiveFile, ScriptRunner, Vault, AppContext, Logger as HiveLogger, UpdateResult, UpdateOptions, Condition, InsertResult } from "@elastosfoundation/hive-js-sdk";
import { Claims, DIDDocument, JWTParserBuilder, DID, DIDBackend, DefaultDIDAdapter, JSONObject, VerifiableCredential } from '@elastosfoundation/did-js-sdk';
let TAG: string = 'Feeds-web-dapp-HiveService';

let hiveVault
let scriptRunners = {}

export class HiveService {
  public static CREATEALLCollECTION = "feeds_createALLCollections" // 本地标识是否创建了Collection
  public static readonly CHANNEL = "channels"
  public static readonly TARGETDID = "targetDid"
  public static readonly postId = "channelId"
  private static readonly RESOLVE_CACHE = "data/didCache"

  public image = null
  public appinstanceDid: string
  private vault: Vault
  private scriptRunner: ScriptRunner
  private scriptRunners: { [key: string]: ScriptRunner } = {}

  constructor(
    // private standardAuthService: StandardAuthService,
  ) {
  }

  public async creatAppContext(appInstanceDocumentString: string, userDidString: string): Promise<AppContext> {
    return new Promise(async (resolve, reject) => {
      try {
        const currentNet = "MainNet".toLowerCase();
        HiveLogger.setDefaultLevel(HiveLogger.TRACE)
        DIDBackend.initialize(new DefaultDIDAdapter(currentNet))
        try {
          AppContext.setupResolver(currentNet, HiveService.RESOLVE_CACHE)
        } catch (error) {
        }
        const path = "/data/userDir/data/store/develop"

        // auth
        const context = await AppContext.build({
          getLocalDataDir(): string {
            return path
          },
          getAppInstanceDocument(): Promise<DIDDocument> {
            return new Promise(async (resolve, reject) => {
              try {
                let appInstanceDidDocument = DIDDocument._parseOnly(appInstanceDocumentString)
                resolve(appInstanceDidDocument)
              } catch (error) {
                reject(error)
              }
            })
          },
          getAuthorization(jwtToken: string): Promise<string> {
            return new Promise(async (resolve, reject) => {
              try {
                // const authToken = await self.standardAuthService.generateHiveAuthPresentationJWT(jwtToken)
                const authToken = generateHiveAuthPresentationJWT(jwtToken)
                resolve(authToken)
              } catch (error) {
                // Logger.error(TAG, "get Authorization Error: ", error)
                reject(error)
              }
            })
          }
        }, userDidString, Config.APPLICATION_DID);
        resolve(context)
      } catch (error) {
        // Logger.error(TAG, "creat Error: ", error)
        reject(error)
      }
    })
  }

  async creatScriptRunner(targetDid: string) {
    const appinstanceDocument = await getAppInstanceDIDDoc()
    const context = await this.creatAppContext(appinstanceDocument, targetDid)
    const scriptRunner = new ScriptRunner(context)
    if (scriptRunners === undefined) {
      scriptRunners = {}
    }
    scriptRunners[targetDid] = scriptRunner
  
    return scriptRunner
  }

  async createVault() {
    try {
      // TODO: 更改为feeds_did 
      const pasarDid = sessionStorage.getItem('PASAR_DID')
      const userDid = `did:elastos:${pasarDid}`
      const appinstanceDocument = await getAppInstanceDIDDoc()
      const context = await this.creatAppContext(appinstanceDocument, userDid)
      // const context = await getAppContext(userDid)
      const hiveVault = new Vault(context)

      const scriptRunner = await this.creatScriptRunner(userDid)
      if (scriptRunners === undefined) {
        scriptRunners = {}
      }

      scriptRunners[userDid] = scriptRunner

      return hiveVault
    }
    catch (error) {
      // Logger.error(TAG, 'Create vault error:', error);
      // this.events.publish(FeedsEvent.PublishType.authEssentialFail, { type: 1 });
      throw error
    }
  }

  parseUserDIDDocumentForUserAvatar(userDid: string): Promise<{
    avatarParam: string;
    avatarScriptName: string;
    tarDID: string;
    tarAppDID: string;
  }> {
    return new Promise(async (resolve, reject) => {
      try {
        const userDID = DID.from(userDid)
        const userDIDDocument = await userDID.resolve()

        const avatarDid = userDid + "#avatar"
        const avatarVC = userDIDDocument.getCredential(avatarDid)
        if (!avatarVC) {// 没有有头像
          // Logger.warn(TAG, 'Not found avatar from did document');
          return null;
        }

        const sub = avatarVC.getSubject()
        const pro = sub.getProperty("avatar")
        const data: string = pro["data"]
        // const type = pro["type"]
        const prefix = "hive://"
        const avatarParam = data.substr(prefix.length)
        // this.avatarParam = avatarParam
        const parts = avatarParam.split("/")
        if (parts.length < 2) // TODO 验证parts是否大于2个 ，否则 抛出异常
          throw "userDIDDocument 中缺少参数"

        const dids = parts[0].split("@")
        if (dids.length != 2) // TODO 验证dids是否等于2个 ，否则 抛出异常
          throw "userDIDDocument 中缺少参数"

        // const star = data.length - (prefix.length + parts[0].length + 1)
        const values = parts[1].split("?")
        if (values.length != 2) // TODO 验证values是否等于2个 ，否则 抛出异常
          throw "userDIDDocument 中缺少参数"

        const avatarScriptName = values[0]
        // this.avatarScriptName = avatarScriptName
        // const paramStr = values[1]
        // const scriptParam = JSON.parse(paramStr.substr(7))
        const tarDID = dids[0]
        const tarAppDID = dids[1]

        const res = {
          avatarParam: avatarParam,
          avatarScriptName: avatarScriptName,
          tarDID: tarDID,
          tarAppDID: tarAppDID
        }
        resolve(res);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getScriptRunner(userDid: string): Promise<ScriptRunner> {
    try {
      this.scriptRunner = this.scriptRunners[userDid]

      if (this.scriptRunner === undefined || this.scriptRunner === null) {
        this.scriptRunner = await this.creatScriptRunner(userDid)
      }
      return this.scriptRunner
    } catch (error) {
      throw error
    }

  }

  async getVault(): Promise<Vault> {
    if (this.vault === undefined || this.vault === null) {
      this.vault = await this.createVault()
    }
    return this.vault
  }

  async getDatabaseService() {
    return (await this.getVault()).getDatabaseService()
  }

  async getFilesService() {
    return (await this.getVault()).getFilesService()
  }

  async getScriptingService() {
    return (await this.getVault()).getScriptingService()
  }

  async createCollection(channelName: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const databaseService = await this.getDatabaseService()
        const result = await databaseService.createCollection(channelName);
        resolve(result)
      } catch (error) {
        reject(error);
      }
    })
  }

  async deleteCollection(collectionName: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const databaseService = await this.getDatabaseService()
        const result = await databaseService.deleteCollection(collectionName);
        resolve(result)
      } catch (error) {
        reject(error);
      }
    })
  }

  registerScript(scriptName: string, executable: Executable, condition?: Condition, allowAnonymousUser?: boolean, allowAnonymousApp?: boolean): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        let scriptingService = await this.getScriptingService()
        await scriptingService.registerScript(scriptName, executable,
          condition, allowAnonymousUser, allowAnonymousApp)
        resolve()
      } catch (error) {
        // this.events.publish(FeedsEvent.PublishType.authEssentialFail, { type: 0 })
        reject(error)
      }
    })
  }

  async callScript(scriptName: string, document: any, targetDid: string, appid: string): Promise<any> {
    let scriptRunner = await this.getScriptRunner(targetDid)
    let result = await scriptRunner.callScript<any>(scriptName, document, targetDid, appid)
    return result
  }

  async getMyChannelList(userDid: string) {
    // this.dataHelper.getMyChannelListWithHive(userDid)
  }

  async uploadScriting(transactionId: string, data: string) {
    const pasarDid = sessionStorage.getItem('PASAR_DID')
    const userDid = `did:elastos:${pasarDid}`
    const scriptRunner = await this.getScriptRunner(userDid)
    return scriptRunner.uploadFile(transactionId, data)
  }

  async downloadEssAvatarTransactionId(avatarParam: string, avatarScriptName: string, tarDID: string, tarAppDID: string) {
    try {
      if (avatarParam === null || avatarParam === undefined) {
        return
      }
      const pasarDid = sessionStorage.getItem('PASAR_DID')
      const userDid = `did:elastos:${pasarDid}`
      const scriptRunner = await this.getScriptRunner(userDid)
      return await scriptRunner.callScript<any>(avatarScriptName, avatarParam, tarDID, tarAppDID)
    } catch (error) {
      throw error
    }
  }

  async downloadScripting(targetDid: string, transaction_id: string) {
    try {
      const scriptRunner = await this.getScriptRunner(targetDid)
      return await scriptRunner.downloadFile(transaction_id)
    } catch (error) {
      throw error
    }
  }

  async downloadFile(remotePath: string) {
    const fileService = await this.getFilesService()
    return await fileService.download(remotePath)
  }

  async getUploadDataFromScript(targetDid: string, transactionId: string, img: any) {
    try {
      const scriptRunner = await this.getScriptRunner(targetDid)
      return scriptRunner.uploadFile(transactionId, img)
    }
    catch (error) {
      throw error
    }
  }

  async uploadDataFromScript(targetDid: string, transactionId: string, img: any) {
    try {
      const scriptRunner = await this.getScriptRunner(targetDid)
      return scriptRunner.uploadFile(transactionId, img)
    }
    catch (error) {
      throw error
    }
  }

  async uploadScriptWithBuffer(remotePath: string, img: Buffer) {
    try {
      const fileService = await this.getFilesService()
      return await fileService.upload(remotePath, img)
    }
    catch (error) {
      throw error
    }
  }

  async uploadScriptWithString(remotePath: string, img: any) {
    try {
      const fileService = await this.getFilesService()
      return await fileService.upload(remotePath, Buffer.from(img, 'utf8'))
    }
    catch (error) {
      throw error
    }
  }

  insertDBData(collectName: string, doc: any,): Promise<InsertResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const dbService = await this.getDatabaseService()
        const insertResult = await dbService.insertOne(collectName, doc, new InsertOptions(false, true));
        resolve(insertResult)
      } catch (error) {
        reject(error)
      }
    })
  }

  updateOneDBData(collectName: string, filter: JSONObject, update: JSONObject, option: UpdateOptions): Promise<UpdateResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const dbService = await this.getDatabaseService()
        const result = await dbService.updateOne(collectName, filter, update, option)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  }

  deleateOneDBData(collectName: string, fillter: JSONObject): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const dbService = await this.getDatabaseService()
        await dbService.deleteOne(collectName, fillter)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  queryDBData(collectionName: string, filter: any): Promise<JSONObject[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const dbService = await this.getDatabaseService()
        const result = dbService.findMany(collectionName, filter)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  }

  newInsertOptions() {
    return new InsertOptions(false, true);
  }
}

const storePassword = "storepass"
const generateHiveAuthPresentationJWT = async (challeng) => {
  if (challeng === null || challeng === undefined || challeng === '') {
    console.log('Params error')
  }

  // Parse, but verify on chain that this JWT is valid first 
  const JWTParser = new JWTParserBuilder().build()
  const parseResult = await JWTParser.parse(challeng)
  const claims = parseResult.getBody()
  if (claims === undefined) {
    return // 抛出error
  }
  // const _payload = claims.payload
  // const _nonce = _payload.nonce
  const hiveDid = claims.getIssuer()
  const appIdCredential = await issueDiplomaFor()
  const presentation = await createPresentation(appIdCredential, hiveDid, storePassword)
  const token = await createChallengeResponse(presentation, hiveDid, storePassword)
  return token
}


async function getAppInstanceDIDDoc() {
  const didAccess = new ConDID.DIDAccess()
  const info = await didAccess.getOrCreateAppInstanceDID()
  const instanceDIDDocument = await info.didStore.loadDid(info.did.toString())
  return instanceDIDDocument
}

async function issueDiplomaFor() {
  connectivity.setApplicationDID(ApplicationDID)
  const didAccess = new ConDID.DIDAccess()
  let credential = await didAccess.getExistingAppIdentityCredential()
  if (credential) {
    return credential
  }

  credential = await didAccess.generateAppIdCredential()

  if (credential) {
    return credential
  }
}

async function createPresentation(vc, hiveDid, storepass) {
  const access = new ConDID.DIDAccess()
  const info = await access.getOrCreateAppInstanceDID()
  const info2 = await access.getExistingAppInstanceDIDInfo()
  const vpb = await VerifiablePresentation.createFor(info.did, null, info.didStore)
  const vp = await vpb.credentials(vc).realm(hiveDid).seal(info2.storePassword)
  return vp
}

const createChallengeResponse = async (vp, hiveDid, storepass) => {
  const exp = new Date()
  const iat = new Date().getTime()
  exp.setFullYear(exp.getFullYear() + 2)
  const expTime = exp.getTime()

  // Create JWT token with presentation.
  const doc = await getAppInstanceDIDDoc()
  const info = await new ConDID.DIDAccess().getExistingAppInstanceDIDInfo()
  const token = await doc.jwtBuilder()
    .addHeader(JWTHeader.TYPE, JWTHeader.JWT_TYPE)
    .addHeader("version", "1.0")
    .setSubject("DIDAuthResponse")
    .setAudience(hiveDid)
    .setIssuedAt(iat)
    .setExpiration(expTime)
    .claimsWithJson("presentation", vp.toString(true))
    .sign(info.storePassword);
  return token
}