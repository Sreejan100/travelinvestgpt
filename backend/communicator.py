from flask import Flask, jsonify,request 
from flask_cors import CORS
import mysql.connector


app = Flask(__name__)
CORS(app)

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Debjanilover09",
    database="travelinvestgpt"
)



@app.route('/receive_user_input', methods=['POST'])
def receive_user_input():
    print('Request received!')
    data = request.get_json()
    text = data.get('text','')
    print(f'Received text: {text}')
    response = {'message':f'Text "{text}" received successfully'}
    return jsonify(response), 200


 
@app.route('/receive_login_creds', methods=['POST'])
def receive_login_creds():
    print('Request Received!')
    data = request.get_json()
    email = data.get('email','')
    password = data.get('password','')
    cursor =None
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT email, password from users where email = %s"
        values=(email,)
        cursor.execute(sql, values)
        user = cursor.fetchone()
        if user:
            if user['password'] == password:
                response = {'message': f'Login successful'}
            else:
                response = {'message': 'Incorrect password'}
        else:
            response = {'message': 'User not found'}
    except mysql.connector.Error as err:
        print(f"Error : {err}")
        response = {'message': 'login failed due to server error'}
    finally:
        if cursor:
            cursor.close()
    return jsonify(response), 200


@app.route('/receive_registration_creds', methods=['POST'])
def receive_registration_creds():
    print('Request Recievied Successfully')
    data = request.get_json()
    name = data.get('name','')
    imageurl = data.get('imageurl','')
    email = data.get('email','')
    password = data.get('password','')
    print(f"Received name: {name}")
    print(f"Received imageurl: {imageurl}")
    print(f"Received email: {email}")
    print(f"Received password: {password}")
    cursor = None
    try:
        cursor = conn.cursor()
        sql = "INSERT INTO users (name, imageurl, email, password) VALUES (%s, %s, %s, %s)"
        values = (name, imageurl, email, password)
        cursor.execute(sql, values)
        conn.commit()
        response = {'message': f"credentials {name} and {email} received successfully!"}
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        response = {'message': 'Failed to register user.'}
    finally:
        if cursor:
            cursor.close()
    return jsonify(response), 200



if __name__ == "__main__":
    app.run(debug=True)