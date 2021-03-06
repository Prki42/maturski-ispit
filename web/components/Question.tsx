import React, { useState, useEffect, FC } from "react";
import { MemoizedMdWithCode } from "./MdWithCode";
import styles from "../styles/Question.module.css";
import QuestionType from "../types/QuestionType";

interface Props {
  questionObj: QuestionType;
  didAnswerCorrect: (x: boolean) => void;
  quizRunning: boolean;
}

const Question: FC<Props> = ({
  questionObj,
  didAnswerCorrect,
  quizRunning,
}) => {
  const [checked, setChecked] = useState<Map<number, boolean>>(
    new Map<number, boolean>()
  );
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const { correctAnswers, answers, question, index2016 } = questionObj;

  useEffect(() => {
    didAnswerCorrect(isCorrect);
  }, [isCorrect]);

  useEffect(() => {
    let answ = Array.from(checked)
      .filter(([_, p]) => p)
      .map(([val, _]) => val);
    if (
      answ.length === correctAnswers.length &&
      answ.every((x) => correctAnswers.includes(x))
    ) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  }, [checked]);

  const updateChecked = (n: number) => {
    setChecked(new Map<number, boolean>(checked.set(n, !isChecked(n))));
  };

  const isChecked = (idx: number): boolean => {
    return checked.get(idx) || false;
  };

  return (
    <div
      className={
        styles.questionBlock +
        " " +
        (quizRunning
          ? ""
          : isCorrect
          ? styles.correctAnswerBg
          : styles.incorrectAnswerBg)
      }
    >
      <div className={styles.question}>
        <div>{index2016}</div>
        <MemoizedMdWithCode content={question} />
      </div>
      <ol>
        {answers.map((answer, idx) => {
          return (
            <li
              key={idx}
              onClick={() => (quizRunning ? updateChecked(idx + 1) : {})}
            >
              <div className={styles.answer}>
                <input
                  type="checkbox"
                  checked={isChecked(idx + 1)}
                  disabled={!quizRunning}
                  readOnly
                ></input>
                <MemoizedMdWithCode content={answer} />
                <div className={styles.isCorrect}>
                  {!quizRunning && (
                    <>
                      {correctAnswers.includes(idx + 1) ? (
                        <p>Ta??no</p>
                      ) : (
                        <>{isChecked(idx + 1) && <p>Neta??no</p>}</>
                      )}
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default Question;
