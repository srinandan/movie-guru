/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const store = {
  namespaced: true,
  state: {
    chatMessageHistory: [],
    movies: [],
    placeHolderMovies: [],
  },
  getters: {
    messages(state) {
      return state.chatMessageHistory
    },
    movies(state) {
      return state.movies
    },
    placeHolderMovies (state) {
      return state.placeHolderMovies
    }},
    mutations: {
        add(state, message) {
          // mutate state
          state.chatMessageHistory.push(message)
        },
        clear(state) {
          // mutate state
          state.chatMessageHistory = []
        },
        addMovies(state, movies) {
          if (movies.length > 0) {
          state.movies = []
          movies.forEach(element => {
            if (element.poster=="") {
              element.poster="../assets/notfound.png"
            }
            state.movies.push(element)
          });
        }
        },
        addPlaceHolderMovies(state, movies) {
          state.placeHolderMovies = []
          movies.forEach(element => {
            if (element.poster=="") {
              element.poster="../assets/notfound.png"
            }
            state.placeHolderMovies.push(element)
          });
        },
        }
    }
export default store;
