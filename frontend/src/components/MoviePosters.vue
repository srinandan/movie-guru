<!--
 Copyright 2025 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

<template>
    <div class=" flex flex-row overflow-y-auto flex-wrap justify-center items-start mt-5 scrollbar-thin scrollbar-thumb-primary scrollbar-track-accent">
      <div v-for="m in store.getters['chat/movies']" class="mb-4 mx-4 w-60 md:w-80 lg:w-80">
        <img :src="m.poster" :alt="m.title" class="w-full h-auto rounded-lg shadow-[2px_2px_0_rgba(255,255,255,0.3)] filter grayscale-[30%] brightness-90 border-4 border-accent"/>
        <div class="bg-accent rounded-lg ">
            <p class="text-center text-text mt-2">{{ m.title }}</p>
        </div>
      </div>
    </div>
  
  </template>
  
  <script>
  import store  from '../stores';
  import ChatClientService from '../services/ChatClientService';

  export default {
    data(){
      return {
        store: store
      }
    },
    created(){
    
    ChatClientService.startup().then((response) => {
        let context = response["context"]
        let result = response["result"]
        let preferences = response["preferences"]
        if (result == "SUCCESS"){
        store.commit('chat/addPlaceHolderMovies', context)
        store.commit('preferences/update', preferences)
        }
    }
    ).catch(error => {
        console.error(error);
    })
    
  }}
</script>
  