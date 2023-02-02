import { UrlMap } from "../objectsType/UrlMap"

export interface IDocCreator{

  save(pathMapList:UrlMap[]):Promise<void>
}