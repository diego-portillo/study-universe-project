from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # ✅ enables CORS

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "This message came from the backend"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8082)