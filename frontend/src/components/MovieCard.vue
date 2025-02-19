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
    <div class=" flex flex-row overflow-y-auto flex-wrap justify-center items-start scrollbar-thin scrollbar-thumb-primary scrollbar-track-accent">
      <div v-for="m in movies" class="mb-4 mx-4 w-60 md:w-80 lg:w-80">
        <div class="bg-none rounded-lg ">
            <p class="text-center text-text mb-2 text-lg">{{ m.title }}</p>
        </div>
        <img :src="m.poster" :alt="m.title" class="w-full h-auto rounded-lg shadow-[2px_2px_0_rgba(255,255,255,0.3)] filter grayscale-[30%] brightness-90 border-4 border-accent"/>
        <div class="flex justify-center mt-2"> 
            <div class="flex justify-center"> 
      <button class="bg-accent text-text hover:bg-text  hover:text-accent text-md align-middle text-center rounded-lg p-2 shadow-lg" @click="tellMeMore(m.title)">Tell Me More!</button>
    </div>    </div>
      </div>
    </div>
  </template>
  
  <script>
  import ChatClientService from '../services/ChatClientService';
  
  export default {
    props: {
      movies: {
        required: true
      },
  
    },
    methods: {
      tellMeMore(title) {
        const message = "Tell me more about the movie: " + title;
        ChatClientService.send(message)
        .then(() => {})
        .catch(error => {
            console.log("Error sending chat message:", error);
          });
      }
    }
  };
  </script>