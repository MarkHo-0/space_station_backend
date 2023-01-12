import { UserFromDB } from "../models/user";
import { User } from "../models/user";

const regexCourse_Code = new RegExp('[A-Za-z]{4}[0-9]{4}');
const regexCLNum = new RegExp('[A-Za-z0-9]{5}');

export async function class_Swap(course_Code, clNum) {
    
    if (course_Code!=null || clNum != null ){
        return res.status(404).send('please input value');
    } else if (course_Code != regexCourse_Code || clNum != regexCLNum){
        return res.status(400).send('please input in correct format(CL05 or cl05)')
        
    } else 
        return res.status(200);
     }



