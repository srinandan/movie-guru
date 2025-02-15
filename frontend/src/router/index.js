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

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import {store} from '../stores/index'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: "/login",
      name: "login",
      component: () => import('../views/LoginView.vue'),
    }
  ]
})

// router.beforeEach(async (to, from, next) => {
//     if (to.meta.requiresAuth) {
//       const loggedIn = store.getters['user/loginStatus']
//       if (!loggedIn && to.name !== "login") next({name: "login"})
//       }
//     next()
// })
router.beforeEach(async (to, from) => {
  if (to.meta.requiresAuth) {
    const loggedIn = store.getters['user/loginStatus']
    
    if (!loggedIn && to.name !== "login") 
      return{name: "login"}
    }
})

export default router
