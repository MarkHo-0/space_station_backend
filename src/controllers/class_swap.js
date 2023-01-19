import { validateCourseCode } from "../utils/dataValidation";

/** @type {RouteFunction} */
export async function CLSwapWrongInput(course_Code, clNum) {
    const code = validateCourseCode
    if (!code) return res.status(422).send('please input in correct course code in format (CCEN 4003) or class number in format (CL01)')
}


