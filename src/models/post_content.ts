type mediaDataV3 = {
  kind: string,           //"image/video/audio"
  originMediaPath: string,
  type: string,           //"image/jpg",
  size: number,           //origin file size
  thumbnailPath: string    //"thumbnailCid"
  duration: number,
  imageIndex: number,
  additionalInfo: any,
  memo: any
} 
const enum MediaType {
  noMedia = 0,
  containsImg = 1,
  containsVideo = 2,
}
export class PostContentV3 {
  version: string = "3.0"
  content: string = ""
  mediaData: mediaDataV3[] = []
  mediaType: MediaType = MediaType.noMedia
}