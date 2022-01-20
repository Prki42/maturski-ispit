package model

import "strings"

/* TOOD
Do better data modelling / switch to orm
*/

// Currently supports only "choose the correct answer" type of questions
type Question struct {
	Statement         string   `json:"question"`
	Index2016         int      `json:"index2016,omitempty" yaml:"index-2016"`
	Answers           []string `json:"answers,omitempty"`
	CorrectAnswerIdxs []int    `json:"correctAnswers,omitempty" yaml:"correct-answers"`
}

type Questions struct {
	Questions []Question `json:"questions"`
}

func (q Question) Validate() (bool, []string) {
	parseErrors := make([]string, 0)
	if strings.TrimSpace(q.Statement) == "" {
		parseErrors = append(parseErrors, "question statement empty")
	}
	if len(q.Answers) == 0 {
		parseErrors = append(parseErrors, "no answers provided")
	}
	if len(q.CorrectAnswerIdxs) == 0 {
		parseErrors = append(parseErrors, "no correct answers provided")
	}
	if q.Index2016 <= 0 {
		parseErrors = append(parseErrors, "invalid index-2016 (<=0 or missing)")
	}

	if len(parseErrors) == 0 {
		return true, nil
	}
	return false, parseErrors
}

func (qs Questions) Validate() (bool, [][]string) {
	errors := make([][]string, len(qs.Questions))
	isValid := true
	for idx, q := range qs.Questions {
		validSingle, errorSingle := q.Validate()
		errors[idx] = errorSingle
		if !validSingle {
			isValid = false
		}
	}
	return isValid, errors
}
