import { HotnessManager } from "./hotnessManager.js";

let hotnessManager = null

export function initManagers() {
  hotnessManager = (new HotnessManager())
  .on('start_update', () => {
    console.log('開始更新貼文熱度值....')
  })
  .on('finish_update', () => {
    console.log('完成更新共 ' + hotnessManager.last_update_counter + ' 則貼文的熱度值。')
  })
}