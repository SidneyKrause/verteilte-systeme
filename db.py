import pymongo

try:
    client = pymongo.MongoClient(
        "mongodb://127.0.0.1:27017/?authSource=admin", serverSelectionTimeoutMS=5000
    )
    client.server_info()
    print("Connected to MongoDB successfully.")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
