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


@app.route('/mobile_register', methods=['POST'])
def mobile_register():
    print('Registration Request from mobile app received')
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
    cursor.execute("SELECT * FROM User WHERE email = %s", (email,))
    if cursor.fetchone():
        return jsonify({'message': 'Email already exists'}), 400

    insertsql="Insert into User (name, email, password) values (%s,%s,%s)"
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'),salt)
    data= (username,email,hashed_password)
    cursor.execute(insertsql, data)
    connection.commit()
    print(cursor.rowcount,"records inserted")    
    return jsonify({'message': 'Registration successful','username':username,'email':email}), 200



@app.route('/mobile_login', methods=['POST'])
def mobile_login():
    print('Login request from Mobile app received')
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    cursor = connection.cursor()
    cursor.execute("Select * from User where email = '{0}'".format(email))
    results1 = cursor.fetchone()

    if not results1:
        return jsonify({'message':'User does not exist'}),500
    
    if username == results1[1] and bcrypt.checkpw(password.encode('utf-8'),results1[5].encode('utf-8')):
       return jsonify({'message':'Login Successful','username': results1[1],'imageurl':results1[4],'email':results1[2]}),200
        
    else:
        return jsonify({'message': 'Invalid Credentials'}), 400
    
    
@app.route('/mobile_profile_delete', methods=['POST'])
def mobile_profile_delete():
    print("Account deletion request received from Mobile app")
    connection.autocommit = False
    data = request.get_json()
    username = data.get('name')
    email = data.get('email')
    cursor = connection.cursor()
    cursor.execute("Select * from User  where name = '{0}' and email = '{1}'".format(username, email))
    results2 = cursor.fetchone()
    if not results2:
        return jsonify({'message':'User does not exist'}),500
    cursor.execute("Delete from User where name = '{0}' and email = '{1}' ".format(username,email))
    connection.commit()
    print("User record deleted")
    return jsonify({'message': 'User record deleted successfully'}), 200


@app.route("/mobile_profile_image_upload",methods=['POST'])
def mobile_profile_image_upload():
    print("Photo upload request received from Mobile Apps")
    connection.autocommit = False
    data = request.get_json()
    username = data.get("name")
    email = data.get("email")
    imageurl = data.get("imageurl")
    print("DEBUG VALUES:", username, email, imageurl)
    try:
        cursor = connection.cursor()
        cursor.execute(
            "UPDATE User SET image = %s WHERE name = %s AND email = %s",
            (imageurl, username, email)
        )
        connection.commit()
        print("Profile Image updated for user {username}")
        return jsonify({'status':'success','message':'Profile Image Updated Successfully'}), 200
    except Exception as e:
        print("DB ERROR:", str(e))
        return jsonify({'status':'error','message':str(e)}),500



if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0',port=5010)