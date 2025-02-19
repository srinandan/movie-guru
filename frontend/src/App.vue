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
  <div id="app" class="flex flex-col h-full  bg-gradient-to-b  from-start via-accent to-start scrollbar scrollbar-thumb-primary scrollbar-track-accent overflow-y-auto">
    
    <!-- <div id="app" class="flex flex-col h-screen w-screen items-center justify-center min-h-screen bg-stars1 bg-cover bg-no-repeat bg-center">  -->
      <Header />
    <router-view />
    <Footer class="sticky bottom-0"/>
  </div>
</template>

<script>
import Header from './components/Header.vue';
import RequestedMovies from './components/RequestedMovies.vue';
import FeaturedMovies from './components/FeaturedMovies.vue';
import ChatWindow from './components/ChatWindow.vue';
import Footer from './components/Footer.vue';

export default {
  components: {
    Header,
    RequestedMovies,
    ChatWindow,
    Footer,
    FeaturedMovies,
  },
};
</script>

<style>
/* Hide scrollbar arrows */
::-webkit-scrollbar-button {
  display: none;
}
</style>
