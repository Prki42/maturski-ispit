package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/Prki42/matura-pitanja/model"
	"github.com/goccy/go-yaml"
)

/* TODO
Seems like a bad practice
possibly better overall error handling?
*/
func printErrAndDie(err error, message string, errLog bool) {
	if err != nil {
		if errLog {
			fmt.Println(message + "\n" + err.Error())
		} else {
			fmt.Println(message)
		}
		os.Exit(0)
	}
}

func showHelpMessage() {
	fmt.Println("Usage:")
	fmt.Println("    command [options] {inputFile || inputDir} outputFile")
	fmt.Println("Options:")
	fmt.Println("    -h, --help\t\tDisplay this help message")
}

func escapeHTML(s string) string {
	s = strings.Replace(s, "\\u003c", "<", -1)
	s = strings.Replace(s, "\\u003e", ">", -1)
	s = strings.Replace(s, "\\u0026", "&", -1)
	s = strings.Replace(s, "\\r", "", -1)
	return s
}

type QuestionParserErrors struct {
	Index2016 int
	Errors    []string
}

func trimQuestionData(x model.Question) model.Question {
	x.Statement = strings.TrimSpace(x.Statement)
	for idx := 0; idx < len(x.Answers); idx++ {
		x.Answers[idx] = strings.TrimSpace(x.Answers[idx])
	}
	return x
}

func parseSingle(fileContent []byte) (model.Questions, []QuestionParserErrors, error) {
	questions := model.Questions{}
	err := yaml.Unmarshal(fileContent, &questions)
	if err != nil {
		return model.Questions{}, nil, err
	}
	for idx := 0; idx < len(questions.Questions); idx++ {
		questions.Questions[idx] = trimQuestionData(questions.Questions[idx])
	}
	isValid, errors := questions.Validate()
	parserErrors := make([]QuestionParserErrors, len(errors))
	if !isValid {
		for idx, errSingle := range errors {
			parserErrors[idx].Errors = errSingle
			parserErrors[idx].Index2016 = questions.Questions[idx].Index2016
		}
		return questions, parserErrors, nil
	}
	return questions, nil, nil
}

func main() {
	argLen := len(os.Args)
	if argLen != 2 && argLen != 3 {
		fmt.Println("Invalid usage")
		showHelpMessage()
		return
	}

	var inPath string
	var outFilePath string

	arg1 := strings.TrimSpace(os.Args[1])

	if arg1 != "-h" && arg1 != "--help" && argLen == 3 {
		inPath = arg1
		outFilePath = os.Args[2]
	} else {
		showHelpMessage()
		return
	}

	/* TODO
	check if outFilePath already exists and ask if sure
	add -y option to skip "are you sure" part
	*/

	filePaths := make([]string, 0)
	fileInfo, err := os.Stat(inPath)
	printErrAndDie(err, "Unable to access "+inPath, true)
	if fileInfo.IsDir() {
		files, err := ioutil.ReadDir(inPath)
		printErrAndDie(err, "Unable to read from directory "+inPath, true)
		for _, file := range files {
			if strings.HasSuffix(file.Name(), "yaml") {
				filePaths = append(filePaths, filepath.Join(inPath, file.Name()))
			}
		}
	} else {
		filePaths = append(filePaths, inPath)
	}

	allQuestions := make([]model.Question, 0)
	allValid := true
	for _, file := range filePaths {
		f, err := ioutil.ReadFile(file)
		printErrAndDie(err, "Error opening "+file, true)
		questions, parserErrors, err := parseSingle(f)
		printErrAndDie(err, "Error parsing "+file, true)
		if parserErrors != nil {
			allValid = false
			fmt.Printf("Errors on file %v:\n", file)
			for idx, singleErr := range parserErrors {
				if len(singleErr.Errors) == 0 {
					continue
				}
				fmt.Printf("  Error on entry %v", idx)
				if singleErr.Index2016 != 0 {
					fmt.Printf(" (index2016: %v)", singleErr.Index2016)
				}
				fmt.Println()
				for _, parseErr := range singleErr.Errors {
					fmt.Printf("    %v\n", parseErr)
				}
			}
			fmt.Println("----------------------------")
			break
		}
		allQuestions = append(allQuestions, questions.Questions...)
	}
	if !allValid {
		return
	}

	jsonBytes, err := json.MarshalIndent(model.Questions{Questions: allQuestions}, "", "  ")
	printErrAndDie(err, "Error generating JSON", true)

	jsonBytes = []byte(escapeHTML(string(jsonBytes)))

	err = ioutil.WriteFile(outFilePath, jsonBytes, 0644)
	printErrAndDie(err, "Error writing to "+outFilePath, true)

	fmt.Printf("%v successfully generated\n", outFilePath)
}
