import { validateCourseCode } from "../utils/dataValidation";

export async function CLSwapWrongInput(course_Code, clNum) {
    const code = validateCourseCode
    if (!code)  return res.status(422).send('please input in correct format(CL05 or cl05)')
}

