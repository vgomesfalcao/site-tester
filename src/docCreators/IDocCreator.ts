import { UrlMap } from "../typeObjects/UrlMap"

export interface IDocCreator{

  save(pathMapList:UrlMap[]):Promise<void>
}