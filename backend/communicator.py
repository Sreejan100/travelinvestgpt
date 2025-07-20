from flask import Flask, jsonify,request 
from flask_cors import CORS
import mysql.connector
import bcrypt



app = Flask(__name__)
CORS(app)

connection=mysql.connector.connect(
    host="localhost",
    user="root",
    password = "Debjanilover09",
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


@app.route('/android_register', methods=['POST'])
def android_register():
    print('Registration Request from android app received')
    connection.autocommit = False
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    cursor = connection.cursor()
    cursor.execute("Select * from User  where name = '{0}'".format(username))
    results1 = cursor.fetchone()
    if results1:
        return jsonify({'message': 'User already exists'}), 400

    insertsql="Insert into User (name, email, password) values (%s,%s,%s)"
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password,salt)
    data= (username,email,hashed_password)
    cursor.execute(insertsql, data)
    connection.commit()
    print(cursor.rowcount,"records inserted")    
    return jsonify({'message': 'Registration successful'}), 200



@app.route('/android_login', methods=['POST'])
def android_login():
    print('Login request from Android app received')
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    cursor = connection.cursor()
    cursor.execute("Select * from User where email = '{0}'".format(email))
    results1 = cursor.fetchone()

    if not results1:
        return jsonify({'message':'User does not exist'}),500
    
    if username == results1['name'] and bcrypt.checkpw(password,results1['password']):
        return jsonify({'message': 'Logged In successfully','username':results1['name']}),200
    else:
        return jsonify({'message': 'Invalid Credentials'}), 400




if __name__ == "__main__":
    app.run(debug=True)