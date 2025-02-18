import {fetch as fetchPolyfill} from 'whatwg-fetch'
import { ref } from 'vue';
import store  from '../stores';

class ChatClientService {
  processingRequest = ref(false);
  errorOccured = ref(false);

  async send(message){
    this.errorOccured.value = false;
    this.processingRequest.value = true
    store.commit('chat/add', {"message":message, "sender":"user"})

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ content: message }),
        credentials: 'include'
    };
    const response = await fetchPolyfill(import.meta.env.VITE_CHAT_SERVER_URL + '/chat', requestOptions)
    
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
      const json = await response.json();
      const result = json["result"];
      if(result == "SUCCESS"){
        let answer = json["answer"]
        let context = json["context"]
        store.commit('chat/add',{"message":answer, "sender":"agent", "result":result});
        store.commit('chat/addMovies', context)
      }
      else if (result == "ERROR"){
        this.errorOccured.value = true;
      }
      else if (result == "UNSAFE"){
        store.commit('chat/add',{"message":"That was a naughty query. I cannot answer that question.", "sender":"agent", "result":result});
      }

      if(json["preferences"]){
        store.commit('preferences/update', response["preferences"])
      }
      this.processingRequest.value = false;
      return json
    } catch (error) {
      this.errorOccured = true;
      console.error(error.message);
      throw error;
    }
    
  async startup(){
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
        credentials: 'include'
    };
    const response = await fetchPolyfill(import.meta.env.VITE_CHAT_SERVER_URL + '/startup', requestOptions)
    
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
      const json = await response.json();
      return json
    } catch (error) {
      console.error(error.message);
      throw error;
    }
    
    async getHistory(){
      const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json'},
          credentials: 'include'
      };
      const response = await fetchPolyfill(import.meta.env.VITE_CHAT_SERVER_URL + '/history', requestOptions)
      
      if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
      }
        const json = await response.json();
        return json
      } catch (error) {
        console.error(error.message);
        throw error;
      }

      async clearHistory(){
      const requestOptions = {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json'},
          credentials: 'include'
      };
      const response = await fetchPolyfill(import.meta.env.VITE_CHAT_SERVER_URL + '/history', requestOptions)
      
      if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
      }
        return;
      } catch (error) {
        console.error(error.message);
        throw error;
      }
      
}

export default new ChatClientService();
