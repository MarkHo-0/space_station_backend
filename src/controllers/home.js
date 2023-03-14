/** @typedef {import('../types/express.js').RouteFunction} RouteFunction */

import { TimebasedCursor } from '../utils/pagination.js'

/** @type {RouteFunction} */
export async function getHomeData(req, res) {
    
  const getThreadsFunc = fetchHeatestThreads(req.db.thread)
  const getSchoolNewsFunc = req.db.news.getMany(HOME_PAGE_NEWS_COUNT, 0)

  Promise.all([getThreadsFunc, getSchoolNewsFunc]).then(async (data) => {
      const homeData = {
          threads: data[0],
          news: data[1],
      }
  
      //若果用戶為登入，則返回用戶名和用戶編號
      if (req.user) {
          homeData['user'] = (await req.db.user.getDetailedOne(req.user.user_id)).toJSON(false)
      }
      
      res.send(homeData)
  }).catch( e => {
      res.status(400).send(e)
  })
};


const HOME_PAGE_THREADS_COUNT = 5
const HOME_PAGE_NEWS_COUNT = 8

/** @param {import('../database/thread.js').Thread} threadDB */
async function fetchHeatestThreads(threadDB) {
  return threadDB.getHeatestIndexes(0, 0, '', HOME_PAGE_THREADS_COUNT, new TimebasedCursor())
    .then(indexs => threadDB.getMany(indexs))
    .then(threads => threads.map(thread => thread.toJSON()))
}

