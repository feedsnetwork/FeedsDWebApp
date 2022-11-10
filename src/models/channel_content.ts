type ChannelDetail = {
  cname: string,
  avatar: string,
  banner: string,
  ownerDid: string,
  channelEntry: string,
  signature: string
}
export class ChannelContent {
  version: string = "2"
  type: string = "FeedsChannel"
  name: string = ""
  description: string = ""
  creator: object = {}
  data: ChannelDetail = {
    cname: "",
    avatar: "",
    banner: "",
    ownerDid: "",
    channelEntry: "",
    signature: ""
  }
}