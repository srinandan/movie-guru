from locust import HttpUser, task, between, events
import random
import string

class ChatUser(HttpUser):
    wait_time = between(1, 2)

    def on_stop(self):
        self.client.post("/logout")

    def on_start(self):
        # create random name
        name=''.join(random.choices(string.ascii_lowercase, k=8))

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

    @task(1)
    def healthcheck(self):
        response = self.client.get("/")
    
    @task(3)
    def sayhi(self):
        chat_response = self.client.post(
                "/chat",
                json={"content":"hi"}
            )
        answer = chat_response.json()["answer"]
        print(f"chat_response response is {answer}")

    @task(1)
    def startup(self):
        self.client.get(
                "/startup",
            )
    
    @task(2)
    def preferences(self):
        self.client.post(f"/preferences", json={
                "Content": {
                    "likes": {"genres": ["action"]},
                    "dislikes": {}
                }
        }) 
        self.client.get(f"/preferences") 


