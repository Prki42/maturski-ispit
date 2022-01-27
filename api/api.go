package main

import (
	"compress/flate"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/Prki42/maturski-ispit/model"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

/*
If the backend codebase gets more complex switch to some other
web framework will be considered
Currently keeping it minimal with go-chi
*/

/* TODO
Question count shouldn't be higher than 300
Research if using a proper db would benefit (long-term and performance) (probably would)
*/
func loadDb(path string) (model.Questions, error) {
	f, err := ioutil.ReadFile(path)
	if err != nil {
		return model.Questions{}, err
	}
	questions := model.Questions{}
	err = json.Unmarshal(f, &questions)
	if err != nil {
		return model.Questions{}, err
	}
	return questions, nil
}

func main() {
	db, err := loadDb("./api/db.json")
	if err != nil {
		fmt.Println("Couldn't read from db\n" + err.Error())
		return
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	// TODO - do proper CORS
	r.Use(cors.AllowAll().Handler)
	r.Use(middleware.SetHeader("Content-Type", "application/json"))
	compressor := middleware.NewCompressor(flate.DefaultCompression)
	r.Use(compressor.Handler)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		resp, err := json.Marshal(db)
		if err != nil {
			http.Error(w, http.StatusText(500), 500)
			return
		}
		w.Write(resp)
	})

	r.Get("/{n}", func(w http.ResponseWriter, r *http.Request) {
		nStr := chi.URLParam(r, "n")
		n, err := strconv.Atoi(nStr)
		if err != nil || n > len(db.Questions) || n < 0 {
			w.Write([]byte("{\"error\": \"n should be in range [0, " + fmt.Sprintf("%v", len(db.Questions)) + "]\"}"))
			return
		}
		// TODO Check performance for choosing n distinct random elements this way
		rand.Seed(time.Now().UnixNano())
		rand.Shuffle(len(db.Questions), func(i, j int) {
			db.Questions[i], db.Questions[j] = db.Questions[j], db.Questions[i]
		})
		dbCopy := model.Questions{}
		dbCopy.Questions = db.Questions[0:n]
		resp, err := json.Marshal(dbCopy)
		if err != nil {
			http.Error(w, http.StatusText(500), 500)
			return
		}
		w.Write(resp)
	})

	r.Get("/max", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("{\"n\":" + fmt.Sprintf("%v", len(db.Questions)) + "}"))
	})

	// TODO load port from env
	http.ListenAndServe(":3030", r)
}
