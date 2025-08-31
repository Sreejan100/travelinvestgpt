from flask import Flask, jsonify,request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity,verify_jwt_in_request
from dotenv import load_dotenv
from datetime import timedelta
import os

# Load environment
load_dotenv()

app = Flask(__name__)

# Configure JWT
app.config["JWT_SECRET_KEY"] = 'YX4VhRckGpfe5j0bMxHcBsAPoS8PKIKAFRmP_IqgtxIswbqvMENCKHYpdMhxrJbufDV7X10EymuHNCDOjtujQg'
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"
jwt = JWTManager(app)

@app.route("/generate_token", methods=["GET"])
def generate_token():
    """Generate a fresh token for testing"""
    user_identity = {
        "userid": "29",
        "username": "Sreejan Chattopadhyay",
        "email": "chattopadhyaysreejan300@gmail.com",
        "login_type": "google"
    }
    token = create_access_token(
        identity="29",
        expires_delta=timedelta(days=30),
        additional_claims={
            "email": "chattopadhyaysreejan300@gmail.com",
            "login_type": "google"
        }
    )
    return jsonify(access_token=token), 200

@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    """Protected endpoint that needs header JWT"""
    print("Inside protected endpoint")
    current_user = get_jwt_identity()
    return jsonify(message="JWT validated successfully!", user=current_user), 200


@app.route("/protected_debug", methods=["GET"])
def protected_debug():
    """Debug endpoint to inspect headers and errors"""
    print("Incoming headers:", dict(request.headers))
    print("Verifying with secret:", repr(app.config["JWT_SECRET_KEY"]))
    try:
        verify_jwt_in_request()
        return jsonify({"status": "JWT is valid"}), 200
    except Exception as e:
        return jsonify({"status": "Invalid JWT", "error": str(e)}), 422
    

if __name__ == "__main__":
    print("JWT_SECRET_KEY loaded:", repr(app.config["JWT_SECRET_KEY"]))
    app.run(host="0.0.0.0", port=5030, debug=True)