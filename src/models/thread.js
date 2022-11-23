export class Thread {
    id = 0
    title = ''
    name = ''

    constructor(id,title) {
        this.id = id
        this.title = title
    }
}

export function threadFormDB(d) {
    return new Thread(
        d.tid,
        d.title
    )
}
