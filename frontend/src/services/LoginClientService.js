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

import {fetch as fetchPolyfill} from 'whatwg-fetch'
import store  from '../stores';

class LoginClientService {
  async login(user, inviteCode) {
    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({ inviteCode }),
        credentials: 'include', // Include cookies or authentication credentials
      };
  
      const response = await fetch(
        `${import.meta.env.VITE_CHAT_SERVER_URL}/login`,
        requestOptions
      );
  
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
      const json = await response.json();
      return json;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
    async logout(){
      const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json'},
          credentials: 'include'
        };
      const response = await fetchPolyfill(import.meta.env.VITE_CHAT_SERVER_URL + '/logout', requestOptions)
      if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        return
      } catch (error) {
        console.error(error.message);
        throw error;
      }
}

export default new LoginClientService();
