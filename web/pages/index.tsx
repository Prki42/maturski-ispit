import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import React, { FC, FormEvent, useState } from "react";
import { getApiUrl } from "../contexts/ApiUrl";

const Home: FC<{ maxNOfQuestions: number }> = ({
  maxNOfQuestions,
}): JSX.Element => {
  const [canStartQuiz, setCanStartQuiz] = useState<boolean>(true);
  const [numberOfQuestionsField, setNumberOfQuestionsField] =
    useState<string>("10");

  let router = useRouter();

  const startQuiz = () => {
    router.push("/quiz?n=" + numberOfQuestionsField);
  };

  const isNumeric = (val: string) => {
    return /^-?\d+$/.test(val);
  };

  const inputChange = (event: FormEvent<EventTarget>) => {
    let target = event.target as HTMLInputElement;
    let val = target.value;
    setNumberOfQuestionsField(val);
    if (!isNumeric(val)) {
      setCanStartQuiz(false);
      return;
    }
    let n = Number(val);
    if (n > 0 && n <= maxNOfQuestions) {
      setCanStartQuiz(true);
      return;
    }
    setCanStartQuiz(false);
  };

  return (
    <div className="container">
      <h1>Matura</h1>
      <form>
        <input
          type="text"
          value={numberOfQuestionsField}
          onChange={inputChange}
        />{" "}
        / {maxNOfQuestions}
        <br />
        <br />
        <button
          type="submit"
          disabled={!canStartQuiz}
          onClick={(e) => {
            e.preventDefault();
            startQuiz();
          }}
        >
          Započni
        </button>
      </form>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (_) => {
  const api = getApiUrl();
  try {
    const res = await fetch(api + "/max");
    const data: { n: number } = await res.json();

    if (!data) {
      return {
        props: { maxNOfQuestions: 30 },
      };
    }

    return {
      props: { maxNOfQuestions: data.n },
    };
  } catch {
    return {
      props: { maxNOfQuestions: 30 },
    };
  }
};
