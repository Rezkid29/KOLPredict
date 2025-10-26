from replit import db
import json

def export_data():
    # Retrieve all keys from the database
    all_keys = db.keys()
    exported_data = {}

    # Loop through all keys and populate the dictionary
    for key in all_keys:
        exported_data[key] = db[key]

    # Convert the dictionary to a JSON-formatted string
    json_data = json.dumps(exported_data, indent=4)

    # Print the JSON structure
    print(json_data)

if __name__ == "__main__":
    export_data()