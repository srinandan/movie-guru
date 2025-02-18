<template>
      <MovieCard :movies="store.getters['chat/placeHolderMovies']"></MovieCard>
  </template>
  
  <script>
  import store  from '../stores';
  import MovieCard from './MovieCard.vue';
  import ChatClientService from '../services/ChatClientService';
  export default {
    data(){
      return {
        store: store,
      }
    },
    components: {MovieCard},
    created(){
      ChatClientService.startup()
    .catch(error => {
        console.error(error);
    })
    }
   }
</script>
  