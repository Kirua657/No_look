from dotenv import find_dotenv, load_dotenv
import os, pathlib
p = find_dotenv()
print("dotenv path:", p, "| exists:", pathlib.Path(p).exists())
print("loaded:", load_dotenv(p, override=True))
print("OPENAI_API_KEY present?", bool(os.getenv("OPENAI_API_KEY")))
