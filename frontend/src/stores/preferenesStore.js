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

export const store = {
  namespaced: true,
    state: {
        preferences:{"likes":{
            "genres":[],
            "actors":[],
            "director":[],
            "other":[]
        }, "dislikes":{
            "genres":[],
            "actors":[],
            "director":[],
            "other":[]
        }},
    },
    getters: {
      preferences (state) {
        return state.preferences
      },
    
    },
    mutations: {
        update(state, preferences) {
          // mutate state
          state.preferences= preferences
        },

        add(state, target) {
          state.preferences[target.type][target.key].push(target.value)
        },

        delete(state, target) {
          // mutate state
          // Check if the target key exists in the preferences object
          if (state.preferences[target.type][target.key]) {
            // Use filter to create a new array without the target value
            state.preferences[target.type][target.key] = state.preferences[target.type][target.key].filter(
              (value) => value !== target.value
            );
          }
        },
      
      }


    }
  
    export default store;