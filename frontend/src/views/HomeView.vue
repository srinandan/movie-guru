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

<script setup>
import RequestedMovies from '../components/RequestedMovies.vue';
import ChatWindow from '../components/ChatWindow.vue';
import UserComponent from '../components/UserComponent.vue';
import FeaturedMovies from '../components/FeaturedMovies.vue';
import store  from '../stores';

</script>

<template>
    <div class="md:p-5 my-5 py-5 mx-3 md:m-5 flex flex-col-reverse md:flex-row justify-around overflow-y-auto scrollbar scrollbar-thumb-primary scrollbar-track-accent md:h-[860px]">
      <div v-if="store.getters['chat/movies'].length>0" class=" rounded-lg md:w-1/2 xxl:w-2/5 justify-evenly items-center align-middle scrollbar-thin scrollbar-thumb-primary scrollbar-track-accent overflow-y-auto">
              <RequestedMovies  class="overflow-y-clip" />
      </div>
        <ChatWindow class="md:w-1/2 xxl:w-2/5 w-full"/>
    </div>
    <FeaturedMovies />
    <UserComponent class="" />
</template>