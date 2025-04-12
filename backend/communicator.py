from flask import Flask, jsonify,request 
from flask_cors import CORS


app = Flask(__name__)
CORS(app)



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

    print(f'Received email: {email}')
    print(f'Received password: {password}')
    response = {'message':f'Credentials "{email}" received successfully'}
    return jsonify(response), 200


if __name__ == "__main__":
    app.run(debug=True)