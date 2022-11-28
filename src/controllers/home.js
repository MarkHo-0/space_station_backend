import {RouteFunction} from '../types/express.js'

const HOME_PAGE_THREADS_COUNT = 5

/** @type {RouteFunction} */
export function getHomeData(req, res) {
    const getThreadsFunc = req.db.thread.getHeatest(HOME_PAGE_THREADS_COUNT)
    const getSchoolNewsFunc = req.db.news.getAll()
    Promise.all([getThreadsFunc, getSchoolNewsFunc]).then(data => {
        const homeData = {
            threads: data[0],
            news: data[1],
        }
    
        //若果用戶為登入，則返回用戶名和用戶編號
        if (req.user) {
            homeData['user'] = req.user.toNameTag()
        }
        
        res.send(homeData)
    }).catch( e => {
        res.status(400).send(e)
    })
};

