import { UserFromDB } from "../models/user";
import { User } from "../models/user";

var regexConst = new RegExp('[A-Za-z]{4}[0-9]{4}');


export async function class_Swap(course_Code, clNum) {
    
    if (course_Code!=null || clNum != null || course_Code!=regexConst) 
     return res.status(404).send();
}


