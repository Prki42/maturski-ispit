import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import React, { useState, useEffect, FC, useContext } from "react";
import Question from "../components/Question";
import styles from "../styles/Quiz.module.css";
import QuestionType, { objToQuestion } from "../types/QuestionType";
import { ApiUrlContext } from "../contexts/ApiUrl";

interface Props {
  n: number;
}

const Quiz: FC<Props> = ({ n }): JSX.Element => {
  const [score, setScore] = useState<Map<number, boolean>>(
    new Map<number, boolean>()
  );
  const [finalScore, setFinalScore] = useState<number>(0);
  const [quizRunning, setQuizRunning] = useState<boolean>(true);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [questionsError, setQuestionsError] = useState<boolean>(false);
  const [questionsLoaded, setQuestionsLoaded] = useState<boolean>(false);

  let router = useRouter();

  const api = useContext(ApiUrlContext);

  const endQuiz = () => {
    setQuizRunning(false);
    setFinalScore(calcScore());
  };

  const startQuiz = () => {
    setScore(new Map<number, boolean>());
    setFinalScore(0);
    setQuestionsLoaded(false);
    setQuestionsError(false);
    setQuizRunning(true);

    let url = api + "/" + n;
    fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        if (data["error"]) {
          setQuestionsError(true);
        } else {
          let qs: [Object] = data["questions"];
          try {
            let qsObj = qs.map((x) => objToQuestion(x));
            setQuestions(qsObj);
            setQuestionsLoaded(true);
            setQuizRunning(true);
          } catch {
            setQuestionsError(true);
          }
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    startQuiz();
  }, []);

  const calcScore = (): number => {
    return Array.from(score.values()).filter((x) => x).length;
  };

  const updateScore = (correct: boolean, idx: number) => {
    setScore(new Map<number, boolean>(score.set(idx, correct)));
  };

  return (
    <div className="container">
      {questionsError ? (
        <p>Error</p>
      ) : (
        <>
          {!questionsLoaded ? (
            <p>Loading</p>
          ) : (
            <>
              <ol className={styles.questionList}>
                {questions.map((question, idx) => {
                  return (
                    <li key={idx} className={styles.singleQuestion}>
                      <Question
                        questionObj={question}
                        didAnswerCorrect={(correct: boolean) =>
                          updateScore(correct, idx)
                        }
                        quizRunning={quizRunning}
                      ></Question>
                    </li>
                  );
                })}
              </ol>
              {!quizRunning && (
                <div className={styles.result}>
                  <p className={styles.score}>
                    Rezultat: {finalScore + "/" + questions.length}
                  </p>
                  <p>
                    {finalScore / questions.length < 0.1 &&
                      "Profound Mental Retardation"}
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
      <div className={styles.actionContainer}>
        {quizRunning && questionsLoaded ? (
          <button onClick={endQuiz}>Završi</button>
        ) : (
          <button onClick={startQuiz}>Probaj ponovo</button>
        )}
        <button onClick={() => router.push("/")}>Nazad</button>
      </div>
    </div>
  );
};

export default Quiz;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const n = context.query.n;
  if (!n) {
    return {
      props: { n: 10 },
    };
  }
  return {
    props: { n: n },
  };
};
