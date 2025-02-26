import vertexai
from vertexai.preview.generative_models import GenerativeModel
from vertexai.preview.vision_models import ImageGenerationModel
import csv
from PIL import Image
from io import BytesIO
import os
import time

CSV_FILENAME = "fictional_movies.csv"


def generate_fictional_movies_gemini(num_movies=1):
    """Generates a CSV file with fictitious movie titles and details using Gemini 1.5 Flash."""

    project_id = os.environ.get("PROJECT_ID")
    if project_id is None:
        raise EnvironmentError(
            "The PROJECT_ID environment variable is not set."
        )

    region = os.environ.get("REGION")
    if region is None:
        raise EnvironmentError(
            "The REGION environment variable is not set."
        )

    vertexai.init(project=project_id, location=region)
    model = GenerativeModel("gemini-1.5-flash")

    genres = ["Fantasy", "Sci-Fi", "Mystery", "Thriller", "Romance",
              "Historical Fiction", "Adventure", "Horror", "Contemporary", "Dystopian"]
    actors = ["Anya Sharma", "Kenji Tanaka", "Zara Khan", "Elias Thorne", "Clara Bellweather", "Samuel Finch", "Jesse Rivers", "Maya Greenleaf", "Frank O'Malley", "Kai Sato", "Lena Volkov", "Rex Dalton", "Rosalie Diaz", "Arthur Vance", "Beatrice Wells", "Captain Eva Rostova",
              "Xylar the AI", "Dr. Jian Wei", "Professor Alistair Finch", "Lady Seraphina Bellweather", "The Shadow Man", "Ranger Jack", "Willow the Seer", "Old Man Hemlock", "Detective Kaito", "Hacker Nova", "Corporate Enforcer Rex", "Artist Isabella", "Drifter Caleb", "Matriarch Agnes"]
    directors = ["Liam O'Connell", "Isabelle Moreau", "Ethan Pine", "Ava Sterling",
                 "Henry Clay", "Jane Doe", "John Smith", "Emily White", "David Black", "Sarah Green"]

    with open(CSV_FILENAME, 'a', newline='', encoding='utf-8') as csvfile:

        fieldnames = ['title', 'year', 'actors', 'director',
                      'plot', 'rating', 'duration', 'genres', 'index', 'poster']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter='\t')
        writer.writeheader()

        for i in range(1, num_movies + 1):
            prompt = f"""Generate a fictional movie entry with the following details:
            - Title:
            - Year:
            - Actors: (2-4 random actors from the list: {', '.join(actors)})
            - Director: (random director from the list: {', '.join(directors)})
            - Plot: (A short, imaginative plot summary)
            - Rating: (A rating between 6.0 and 9.5)
            - Duration: (Approximate length of the movie)
            - Genres: (1-2 random genres from the list: {', '.join(genres)})
            - Index: (Index number of the movie: {',', i})
            - Poster: (A placeholder cover filename)

            Format the response as a tab-separated list of values, in the order specified above and don't include the field names in the response.
            """

            response = model.generate_content(prompt)
            text_response = response.text.strip()  # get the text and strip whitespace

            values = text_response.split('\n')

            prompt = "Title:" + values[0] + ", Plot:" + values[4]

            model = ImageGenerationModel.from_pretrained(
                "imagen-3.0-generate-002")

            images = model.generate_images(
                prompt=prompt,
                # Optional parameters
                number_of_images=1,
                language="en",
                # You can't use a seed value and watermark at the same time.
                # add_watermark=False,
                # seed=100,
                aspect_ratio="1:1",
                safety_filter_level="block_some",
                person_generation="allow_adult",
            )

            output_file = values[0].lower().replace(
                "Title: ", "").replace(" ", "_") + ".png"

            images[0].save(location=output_file,
                           include_generation_parameters=False)

            writer.writerow({
                'title': values[0].replace("Title: ", ""),
                'year': values[1].replace("Year: ", ""),
                'actors': values[2].replace("Actors:", ""),
                'director': values[3].replace("Director:", ""),
                'plot': values[4].replace("Plot:", ""),
                'rating': values[5].replace("Rating:", ""),
                'duration': values[7].replace("Duration: ", ""),
                'genres': values[8].replace("Genres: ", ""),
                'index': i,
                'cover': output_file
            })

            time.sleep(28)  # there is a default quota of 2 API calls per min

    print(f"Generated {num_movies} fictional movies in {CSV_FILENAME}")


generate_fictional_movies_gemini(
    num_movies=4)
