/* TODO
Name "QuestionType" is misleading (as both types and interfaces exist in ts)
*/
interface QuestionType {
  question: string;
  index2016: number;
  answers: string[];
  correctAnswers: number[];
}

/* TODO
Possibly introduce better json validation and parsing?
*/

export const isValidQuestion = (obj: Object): boolean => {
  if (
    "question" in obj &&
    "answers" in obj &&
    "correctAnswers" in obj &&
    "index2016" in obj
  ) {
    return true;
  }
  return false;
};

export const objToQuestion = (obj: Object): QuestionType => {
  if (!isValidQuestion(obj)) {
    throw Error("couldn't parse");
  }
  return <QuestionType>obj;
};

export default QuestionType;
