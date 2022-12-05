import { RouteFunction } from '../types/express.js'
import { Thread } from '../models/thread.js';
import { Comment } from '../models/comment.js';

/** @type {RouteFunction} */
export function postComment(req, res) {
    

    
}

/** @type {RouteFunction} */
export function getComment(req, res) {
    
}

/** @type {RouteFunction} */
export function reactComment(req, res) {
    let cid = parseInt(req.path['cid'])
    let cr_type = parseInt (req.parms['type'])

    if ( isNaN(cid) ) 
        return res.status(400).send()

    if ( isNaN(cr_type) || cr_type !== 0 || cr_type !== 1)
        return res.status(400).send()

}

/** @type {RouteFunction} */
export function pinOrUnpinComment(req, res) {
    
}

/** @type {RouteFunction} */
export function reportComment(req, res) {

}