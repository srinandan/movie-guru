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

// Cookies: https://codesandbox.io/p/sandbox/vuex-persistedstate-with-js-cookie-0rjwk?file=%2Findex.js%3A31%2C7
// https://pusher.com/tutorials/authentication-vue-vuex/#login-action

export const store = {
  namespaced: true,
  state: {
    loggedIn: false,
    email: null,
    accessToken: null
  },
  mutations: {
    logIn(state, email) {
      state.email = email
      state.loggedIn = true
    },
    logOut(state) {
      state.email = null
      state.loggedIn = false
    }
  },
  getters: {
    loginStatus(state) {
      return state.loggedIn
    },
    email(state) {
      return state.email
    },
  },
}
export default store;
