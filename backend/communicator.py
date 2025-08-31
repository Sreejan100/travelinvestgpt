from flask import Flask, jsonify,request 
from flask_cors import CORS
import mysql.connector
import bcrypt
from dotenv import load_dotenv
import threading
import uuid
from datetime import timedelta,datetime
import hashlib
import os
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from flask_jwt_extended import (
    JWTManager, 
    jwt_required, 
    create_access_token, 
    get_jwt_identity, 
    get_jwt
)



print("JWT_SECRET_KEY:", os.getenv("JWT_SECRET_KEY"))

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
app.config['JWT_ALGORITHM'] = 'HS256'

jwt = JWTManager(app)
CORS(app, supports_credentials=True, expose_headers=["Authorization"])



load_dotenv()
CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

connection=mysql.connector.connect(
    host="localhost",
    user="root",
    password = "Debjanilover09",
    database="travelinvestgpt"
    )


revoked_tokens = set()
blacklist_lock = threading.Lock()

# JWT token blacklist checker

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    print(f"Blacklist check - JWT payload: {jwt_payload}")
    token_id = jwt_payload.get('jti')
    
    if not token_id:
        print("No JTI in token - allowing access")
        return False
    
    with blacklist_lock:
        is_revoked = token_id in revoked_tokens
        print(f"Token {token_id} is revoked: {is_revoked}")
        return is_revoked

# Helper functions
def add_token_to_blacklist(token_id):
    with blacklist_lock:
        revoked_tokens.add(token_id)

def is_token_revoked(token_id):
    with blacklist_lock:
        return token_id in revoked_tokens


@app.route('/receive_user_input', methods=['POST'])
def receive_user_input():
    print('Request received!')
    data = request.get_json()
    text = data.get('text','')
    print(f'Received text: {text}')
    response = {'message':f'Text "{text}" received successfully'}
    return jsonify(response), 200


@app.route('/mobile_register', methods=['POST'])
def mobile_register():
    print('Registration Request from mobile app received')
    connection.autocommit =False
    try:
        data = request.get_json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        if not username or not email or not password:
            return jsonify({"message":"Missing fields"}), 500
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM User WHERE name = %s", (username,))
        results1 = cursor.fetchone()
        if results1:
            return jsonify({'message': "User already exists"}),400
        insertsql = "INSERT INTO User (name, email, password) VALUES (%s, %s, %s)"
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        data = (username, email, hashed_password)
        cursor.execute(insertsql, data)
        user_id = cursor.lastrowid
        connection.commit()
        print(f"{cursor.rowcount} records inserted")

        token_id = str(uuid.uuid4())
        jwt_token = create_access_token(
            identity=str(user_id),
            expires_delta=timedelta(days=30),
            additional_claims={
                "username": username,
                "jti":token_id,
                "email":email,
                "login_type": "email"
            }   
        )
        expires_at = (datetime.utcnow() + timedelta(days=30)).isoformat()
        try:
            cursor.execute("""
                INSERT INTO user_tokens (user_id, token_id, token_hash, expires_at) 
                VALUES (%s, %s, %s, DATE_ADD(NOW(), INTERVAL 30 DAY))
            """, (user_id, token_id, hashlib.sha256(jwt_token.encode()).hexdigest()))
            connection.commit()
        except Exception as e:
            print(f"Warning: Could not store token: {e}")

        return jsonify({
            'message': 'Registration successful',
            'username': username,
            'email': email,
            'token': jwt_token, 
        }), 200

    except Exception as e:
        connection.rollback()
        print(f"Registration error: {e}")
        return jsonify({'message': 'Registration failed'}), 500



@app.route('/mobile_login', methods=['POST'])
def mobile_login():
    print('Login request from Mobile app received')
    try:
        data=request.get_json()
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")

        if not username or not email or not password:
            return jsonify({"message":"Missing fields"}), 500
        
        cursor = connection.cursor()

        cursor.execute("Select * from User where name = %s and email = %s", (username,email))
        results = cursor.fetchone()
        if not results:
            return jsonify({"message":"User does not exist" }), 500
        
        stored_password = results[5]
        if (not bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8'))) or (email != results[2]) or (username != results[1]):
            return jsonify({'message':'Credentials does not match'}), 401
        
        user_id = results[0]
        imageurl = results[4] if len(results) > 4 else None
        token_id = str(uuid.uuid4())
        jwt_token = create_access_token(
            identity=str(user_id),
            expires_delta=timedelta(days=30),
            additional_claims={
                "username": username,
                "jti":token_id,
                "email":email,
                "login_type": "email"
            }   
        )
        expires_at = (datetime.utcnow() + timedelta(days=30)).isoformat()
        try:
            cursor.execute("""
                INSERT INTO user_tokens (user_id, token_id, token_hash, expires_at) 
                VALUES (%s, %s, %s, DATE_ADD(NOW(), INTERVAL 30 DAY))
            """, (user_id, token_id, hashlib.sha256(jwt_token.encode()).hexdigest()))
            
            connection.commit()
        except Exception as e:
            print(f"Warning: Could not store token or update last login: {e}")

        return jsonify({
            'message': 'Login Successful',
            'username':username,
            'email': email,
            'imageurl': imageurl,
            'token': jwt_token
        }), 200
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'message','Login Failed'}),500
        
    
@app.route('/mobile_profile_delete', methods=['POST'])
@jwt_required()
def mobile_profile_delete():
    print("Account deletion request received from Mobile app")
    print("Request headers:", dict(request.headers))
    connection.autocommit = False
    try:
        data = request.get_json()
        username = data.get('name')
        email = data.get('email')
        token_claims = get_jwt()
        user_id = get_jwt_identity()
        current_token_id= token_claims.get('jti')
        print(f"Deleting account for user: {username}, email: {email}")

        cursor = connection.cursor()

        try:
            cursor.execute("UPDATE user_tokens SET is_revoked = TRUE WHERE user_id = %s", (user_id,))
        except Exception as token_error:
            print(f"Warning: Could not revoke tokens: {token_error}")

        
        cursor.execute("Select * from User where name =%s and email=%s",(username,email))
        userrecord = cursor.fetchone()
        if not userrecord:
            connection.rollback()
            return jsonify({'message':"User does not exist"}), 404
        
        cursor.execute('DELETE From User where name = %s and email=%s', (username,email))

        if cursor.rowcount == 0:
            connection.rollback()
            return jsonify({'message':'Failed to delete user'}),500
        
        
        revoked_tokens.add(current_token_id)
        connection.commit()
        print(f"User record deleted successfully for user ID: {user_id}")

        return jsonify({
            'message': "User recored deleted successfully"
        }), 200
        
    except Exception as e:
        connection.rollback()
        print(f"Error during account deletion: {e}")
        return jsonify({'message': 'Account deletion failed'}), 500
    



@app.route("/mobile_profile_image_upload",methods=['POST'])
@jwt_required()
def mobile_profile_image_upload():
    print("Photo upload request received from Mobile Apps")
    connection.autocommit = False
    try:
        user_id = get_jwt_identity()
        token_claims = get_jwt()
        data = request.get_json()
        username = data.get('name')
        email = data.get('email')
        imageurl = data.get('imageurl')
        cursor = connection.cursor()
        cursor.execute(
            "UPDATE User SET image = %s WHERE name = %s AND email = %s",
            (imageurl, username, email)
        )
        connection.commit()
        print(f"Profile Image updated for user {username}")
        return jsonify({'status':'success','message':'Profile Image Updated Successfully'}), 200
    except Exception as e:
        print("DB ERROR:", str(e))
        return jsonify({'status':'error','message':str(e)}),500



@app.route("/google_authentication",methods=['POST'])
def google_authentication():
    print("Google Authentication Request received")
    data = request.get_json()
    token = data.get('idToken')
    connection.autocommit = False
    current_image=''
    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(),CLIENT_ID)
        email = idinfo['email']
        name = idinfo.get('name','')
        picture_url = idinfo.get('picture',None)
        google_id = idinfo['sub']
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM User WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            insertsql = 'INSERT INTO User(name,email,image,password) values (%s,%s,%s,%s)'
            cursor.execute(insertsql,(name,email,picture_url,None))
            user_id = cursor.lastrowid
            connection.commit()
        else:
            user_id = user[0]
            current_image = picture_url
            if user[4] is None and current_image:  
                updatesql = "UPDATE User SET profile_pic = %s WHERE email = %s and name = %s"
                cursor.execute(updatesql, (picture_url, email,name))
                connection.commit()
            else:
               current_image = user[4]

        token_id = str(uuid.uuid4())
        jwt_token = create_access_token(
            identity=str(user_id),
            expires_delta=timedelta(days=30),
            additional_claims={
                "username": name,
                "jti":token_id,
                "email":email,
                "login_type": "email"
            }   
        )
        try:
            cursor.execute("""
                INSERT INTO user_tokens (user_id, token_id, token_hash, expires_at) 
                VALUES (%s, %s, %s, DATE_ADD(NOW(), INTERVAL 30 DAY))
            """, (user_id, token_id, hashlib.sha256(jwt_token.encode()).hexdigest()))
            
            connection.commit()
        except Exception as token_error:
            print(f"Warning: Could not store token: {token_error}")

        return jsonify({'message':'Login Successful','username': name,'imageurl':current_image,'email':email,'token': jwt_token}),200
    except Exception as e:
        return jsonify({"message": "Invalid token"}), 400



if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0',port=5030)