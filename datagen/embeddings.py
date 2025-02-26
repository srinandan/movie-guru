import pandas as pd
import asyncio
import os
import asyncpg
from google.cloud.sql.connector import Connector, IPTypes
from google.cloud import aiplatform
import vertexai
from vertexai.language_models import TextEmbeddingModel

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_NAME = os.getenv("DB_NAME")
DB_PASS = os.getenv("DB_PASS")
PROJECT_ID = os.getenv("PROJECT_ID")
REGION = os.getenv("REGION")
# Vertex AI Model (text embedding model)
MODEL_NAME = "textembedding-gecko@001"
TABLE_NAME = "movies"

sql_file_path = "ddl.sql"
csv_file_path = "fictional_movies.csv"


async def get_connection():
    """Get a connection to the Cloud SQL database."""

    sys_conn = await asyncpg.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        ssl="disable",
    )

    try:
        with open(sql_file_path, "r") as sql_file:
            sql_content = sql_file.read()

        await sys_conn.execute(sql_content)
    except FileNotFoundError:
        print(f"Error: SQL file '{sql_file_path}' not found.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        return sys_conn


def get_embeddings(texts):
    """Generate embeddings for a list of texts using Vertex AI."""
    model = TextEmbeddingModel.from_pretrained(MODEL_NAME)
    embeddings = model.get_embeddings(texts)
    return [embedding.values for embedding in embeddings]


def init_vertex():
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


def process_and_store_data(sys_conn: any):
    """Process the CSV, generate embeddings, and store in the database."""
    df = pd.read_csv(csv_file_path)

    # Combine relevant text columns for embedding
    df["combined_text"] = df["title"] + " " + df["plot"] + " " + \
        df["actors"].fillna(
            "") + " " + df["director"].fillna("") + " " + df["genres"].fillna("")

    embeddings = get_embeddings(df["combined_text"].tolist())
    df["embedding"] = embeddings

    for index, row in df.iterrows():
        sys_conn.execute(
            f"""
            INSERT INTO {TABLE_NAME} (title, year, actors, director, plot, rating, duration, genres, csv_index, poster, embedding)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """,
            (
                row["title"],
                row["year"],
                row["actors"],
                row["director"],
                row["plot"],
                row["rating"],
                row["duration"],
                row["genres"],
                row["index"],
                row["poster"],
                row["embedding"],
            ),
        )
    sys_conn.commit()


if __name__ == "__main__":
    init_vertex()
    sys_conn = asyncio.run(get_connection())
    process_and_store_data(sys_conn)
    sys_conn.close()
