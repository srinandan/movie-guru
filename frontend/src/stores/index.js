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

import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate';

import {store as chatStore} from './chatStore'
import {store as userStore} from './userStore'
import {store as preferencesStore} from './preferenesStore'

export const store = createStore({
    modules: {
      chat: chatStore,
      user: userStore,
      preferences: preferencesStore
    },
    plugins: [
      createPersistedState({
        paths: ['user'],  // Persist the entire 'user' module's state
      }),
    ],
  })
export function init(){

  return Promise.all([]);

}
export default store;