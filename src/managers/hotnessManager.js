import { EventEmitter } from 'events'

import { getDB } from '../database/index.js';
import { PointerCursor } from '../utils/pagination.js'
import { getCurrentUnixTime } from '../utils/parseTime.js';

export class HotnessManager extends EventEmitter {
  /** @private */ update_function_id = 0
  /** @private */ config = new HotnessManagerConfig()
  last_update_counter = 0
  last_update_time = 0
  isUpdating = false

  constructor() {
    super()
    setImmediate(this.forceUpdate.bind(this))
  }

  /** @private */ 
  async updateThreadsHotness(cursor = new PointerCursor()) {
    if (!this.isUpdating) {
      this.isUpdating = true
      this.last_update_counter = 0
      this.emit('start_update')
    }

    //從資料庫獲取貼文的互動數據
    const threads = await getDB().thread.getInteractions(this.config.valid_threads_inDays, this.config.threads_per_fetch, cursor)      
    const curr_time = getCurrentUnixTime()

    //如果沒有數據代表所有貼文更新完畢
    if (threads.length == 0) {
      this.isUpdating = false
      this.last_update_time = curr_time
      this.emit('finish_update')   
      this.update_function_id = setTimeout(this.updateThreadsHotness.bind(this), this.config.update_interval)
      return false
    }

    let newRecords = []
    for (const thread of threads) {
      let hotness = 0

      if (thread.views_time) {
        hotness += this.calculateRepeatableEventsScore(thread.views_time, curr_time) * this.config.w_view
      }

      if (thread.reactions_time) {
        hotness += this.calculateEventsScore(thread.reactions_time, curr_time) * this.config.w_react
      }

      if (thread.comments_time) {
        hotness += this.calculateRepeatableEventsScore(thread.comments_time, curr_time) * this.config.w_comment
      }

      if(hotness > 0) newRecords.push([thread.tid, hotness])
    }

    //累積更新數量
    this.last_update_counter += newRecords.length

    //將新的熱度寫入資料庫
    await getDB().thread.createHotnessRecords(newRecords)

    //更新分頁指針
    cursor.updatePointer(threads.pop().tid)

    //為下一次小更新熱度排程
    this.update_function_id = setTimeout(this.updateThreadsHotness.bind(this), this.config.small_update_interval, cursor)
  }

  /** @private */ 
  calculateRepeatableEventsScore(events = [[]], curr_time = 0) {
    let score = 0
    for (const times of events) {
      for (let i = 0; i < times.length; i++) {
        score += 1 / (Math.log(curr_time - times[i] + 2) / LOG60) * Math.pow(this.config.decay, i)
      }
    }
    return score
  }

  /** @private */ 
  calculateEventsScore(events = [], curr_time = 0) {
    let score = 0
    for (const event_time of events) {
      score += 1 / (Math.log(curr_time - event_time + 2) / LOG60)
    }
    return score
  }

  forceUpdate() {
    if (this.isUpdating) {
      clearTimeout(this.update_function_id)
      this.isUpdating = false
    }
    this.updateThreadsHotness()
  } 
}

class HotnessManagerConfig {
  w_view = 0.2
  w_react = 0.3
  w_comment = 0.5
  decay = 0.8
  update_interval = 1000 * 60 * 5
  small_update_interval = 1000 * 3
  valid_threads_inDays = 7
  threads_per_fetch = 10
}

const LOG60 = Math.log(60)