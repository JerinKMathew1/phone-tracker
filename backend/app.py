from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

api_key = "86eaa44b6aefc92faf7fb483ca7e3fda"

@app.route("/track", methods=["POST"])
def track():
    data = request.json
    number = data["number"]

    url = f"http://apilayer.net/api/validate?access_key={api_key}&number={number}"

    response = requests.get(url)

    return jsonify(response.json())

if __name__ == "__main__":
    app.run(debug=True)