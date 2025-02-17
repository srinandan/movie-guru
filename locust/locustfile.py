from locust import HttpUser, task, between, events
import random
import string

class ChatUser(HttpUser):
    wait_time = between(1, 3)
    cookies = {}
    @events.test_start.add_listener

    def on_start(self):
        name= ''.join(random.choices(string.ascii_lowercase, k=8))

        headers = {
        "ApiKey": "ABC",
        "Content-Type": "application/json",
        "User": name
        }
        response = self.client.post("/login", headers=headers, json={"inviteCode": "" })
        print(f"Login Headers {response.headers}")
        print(f"Login Response {response.content}")

        # Capture 'Set-Cookie' from the response headers
        set_cookie = response.headers.get('Set-Cookie').split(';', 1)[0]
        if set_cookie:
            print(f"Extracted cookie: {set_cookie}")
            self.client.cookies.set("stored_cookie", set_cookie)  #Stores it in the locust client.
        else:
            print("No Set-Cookie header received.")

    @task
    def healthcheck(self):
        response = self.client.get("/")
    
    @task
    def chat(self):
        chat_response = self.client.post(
                "/chat",
                json={"content":"hi"}
            )
        answer = chat_response.json()["answer"]
        print(f"chat_response response is {answer}")




# class ChatUser(HttpUser):
#     wait_time = between(1, 2)
#     @task(6)
#     def conversation(self):
#         self.client.post(f"/chat")

#     @task(1)
#     def login(self):
#         self.client.post(f"/login")

#     @task(1)
#     def logout(self):
#         self.client.post(f"/logout") 

#     @task(1)
#     def delete_history(self):
#         self.client.post(f"/history") 
    
#     @task(1)
#     def get_history(self):
#         self.client.get(f"/history") 


#     @task(3)
#     def preferences(self):
#         self.client.post(f"/preferences") 
#         self.client.get(f"/preferences") 
       
#     @task(1)
#     def startup(self):
#         self.client.get(f"/startup") 
