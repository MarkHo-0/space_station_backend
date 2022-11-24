import {RouteFunction} from '../types/express.js'
import {thread} from '../database.js'
import {user} from '../database.js'
/** @type {RouteFunction} */
export function getHomeData(req, res) {
    con.connect(function(err){
        if (err) throw err;
        con.query ("SELECT tid, content_cid, create_time FROM thread", function(err, result, fields){
            let news = new Array["thread_post(I dont know how to import the array to news)"]
            console.log(result)
            try{
            }
            catch (e){
             console.log(e)
            };
        });
    });
};

export function getThread(req, res){
    con.connect(function(err){
        if (err) throw err;
        con.query("SELECT * FROM thread", function(err, result, fields){
            if (err) throw err;
            console.log(result)
            try{

            }
            catch (e){
                console.log(e)
            };
        });
    });
};

export function getUsers(req, res){
    con.conect(function(err){
        if (err) throw err;
        con.query("SELECT * FROM user_info", function(err, result, fields){
            if (err) throw err; 
            console.log(result)
            try{
            }
            catch (e){
                console.log(e)
                };
            }
        )}
    )}

function toApifoxModel(json) {
    return cast(JSON.parse(json), r("ApifoxModel"));
}

function apifoxModelToJson(value) {
    return JSON.stringify(uncast(value, r("ApifoxModel")), null, 2);
}

function invalidValue(typ, val, key = '') {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`,);
}

function jsonToJSProps(typ) {
    if (typ.jsonToJS === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ) {
    if (typ.jsToJSON === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val, typ, getProps, key = '') {
    function transformPrimitive(typ, val) {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs, val) {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) { }
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases, val) {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ, val) {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val) {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props, additional, val) {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems") ? transformArray(typ.arrayItems, val)
                : typ.hasOwnProperty("props") ? transformObject(getProps(typ), typ.additional, val)
                    : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast(val, typ) {
    return transform(val, typ, jsonToJSProps);
}

function uncast(val, typ) {
    return transform(val, typ, jsToJSONProps);
}

function a(typ) {
    return { arrayItems: typ };
}

function u(...typs) {
    return { unionMembers: typs };
}

function o(props, additional) {
    return { props, additional };
}

function m(additional) {
    return { props: [], additional };
}

function r(name) {
    return { ref: name };
}

const typeMap = {
    "ApifoxModel": o([
        { json: "news", js: "news", typ: a(r("News")) },
        { json: "threads", js: "threads", typ: a(r("熱門話題")) },
        { json: "user", js: "user", typ: u(undefined, r("User")) },
    ], "any"),
    "News": o([
        { json: "content", js: "content", typ: "" },
        { json: "create_time", js: "create_time", typ: 0 },
        { json: "title", js: "title", typ: "" },
        { json: "valid_time", js: "valid_time", typ: 0 },
    ], "any"),
    "熱門話題": o([
        { json: "content_cid", js: "content_cid", typ: 0 },
        { json: "create_time", js: "create_time", typ: 0 },
        { json: "fid", js: "fid", typ: 0 },
        { json: "last_update_time", js: "last_update_time", typ: 0 },
        { json: "pid", js: "pid", typ: 0 },
        { json: "pined_cid", js: "pined_cid", typ: 0 },
        { json: "sender", js: "sender", typ: r("User") },
        { json: "tid", js: "tid", typ: 0 },
        { json: "title", js: "title", typ: "" },
    ], "any"),
    "User": o([
        { json: "nickname", js: "nickname", typ: "" },
        { json: "subject_id", js: "subject_id", typ: 0 },
        { json: "uid", js: "uid", typ: 0 },
    ], "any"),
};

module.exports = {
    "apifoxModelToJson": apifoxModelToJson,
    "toApifoxModel": toApifoxModel,
};