from flask import Flask, request,jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin
import pandas as pd
import random
import math
import pandas as pd
import RSA_algorithm
import gmpy2



# lưu file exel 
import os

    
#================================================================

# cipherTextList = []


ciphertexts = []
decrypted_texts = []
app = Flask(__name__)
cors = CORS(app)

#------------API Mã hóa--------
@app.route('/uploadEncrypt', methods=['POST'])
def upload_file():
    ciphertext_str = ''
    if 'file' not in request.files:
        return 'No file found', 400

    file = request.files['file']
    if file.filename == '':
        return 'No file selected', 400

    # Lưu file vào thư mục tạm thời
    filename = secure_filename(file.filename)
    file.save(filename)
    print(filename)
    # In ra thông báo đã nhận được file
    print('Received file:', filename)
    

#==========================sinh khóa và lưu vào file txt======================================
    # Sinh khóa công khai và khóa bí mật
    bit_length = 2048
    (public_key, private_key, p, q) = RSA_algorithm.generate_keys(bit_length)

    # # Lưu khóa công khai và khóa bí mật vào tệp tin

    file_public,file_private = 'public_key.txt','private_key.txt'
    RSA_algorithm.save_file(public_key,private_key,p,q)
    
    RSA_algorithm.read_file(file_public,file_private)
#================================================================

    content_encrypt = RSA_algorithm.encrypt_file(filename,public_key[0],private_key[1])  
    print(content_encrypt)
    data = {
        "checks":"OK",
        "e":str(public_key[0]),
        "n":str(public_key[1]),
        "d":str(private_key[0]),
        "nn":str(private_key[1]),
        "p":str(p),
        "q":str(q),
        "content" : str(content_encrypt)
    }
    # print(ciphertext_str)
    return jsonify(data)
    

#=== sau khi mã hóa thành công thì gửi file có định dạng json lại cho phí fortend  
 
#------------API Giải  mã--------    
@app.route('/uploadDecrypt', methods=['POST'])
def uploadDecrypt():
    if 'file' not in request.files:
        return 'No file found', 400

    file = request.files['file']
    if file.filename == '':
        return 'No file selected', 400
    # Lưu file vào thư mục tạm thời
    filename = secure_filename(file.filename)
    file.save(filename)
    
    file_path = "private_key.txt"

    variable_values = []
    variables = ["d", "n", "p", "q"]

    with open(file_path, "r") as file:
        lines = file.readlines()

    for line in lines:
        line = line.strip()
        for variable in variables:
            if line.startswith(variable + ":"):
                value = line.split(":")[1].strip()
                value = int(''.join(filter(str.isdigit, value)))
                variable_values.append(value)
                break


    #================================================================
    # lấy các giá trị cần thiết d, n, p, q
    d = variable_values[0]
    n = variable_values[1]
    p = variable_values[2]
    q = variable_values[3]
    
    
    #================================================================
    # thực hiện quá trình giải mã 
    content_decrypt = RSA_algorithm.decrypt_file(filename,d,n)
    print("d",d)
    print("n",n)
    data = {
        "status": "oke",
        "content": content_decrypt
    }
    print("file : ", content_decrypt)
    return jsonify(data)
    


@app.route('/handkey', methods=['POST'])
def handkey():
    p = request.form.get('p')
    q = request.form.get('q')
    content = request.form.get('content')

    p = int(p)
    q = int(q)
    content_encrypt = ""
    # Ghi nội dung vào file self_input.txt
    filename = "self_input.txt"

    with open(filename, 'w') as file:
        file.write(content)
        
        
    public_key = None
    private_key = None    
    if RSA_algorithm.is_prime(q)==True and RSA_algorithm.is_prime(p)==True:
        result = True
        print("p va q thoa man yeu cau")
        public_key, private_key= RSA_algorithm.tinh_keys(p,q)
        content_encrypt = RSA_algorithm.encrypt_file(filename,public_key[0],private_key[1])
        file_public,file_private = 'public_key.txt','private_key.txt'
        RSA_algorithm.save_file(public_key,private_key,p,q)
        
        RSA_algorithm.read_file(file_public,file_private)
        #============================đưa ra kết quả cho api====================================
        data = {
        "status": "success",
        'result' : result,
        "e": str(public_key[0]),
        "n": str(public_key[1]),
        "d": str(private_key[0]),
        "nn": str(private_key[1]),
        'content': content_encrypt
    }
    
    else:
        result = False
        print("p or q is error")
        data = {
        "status": "success",
        'result' : result,
        "e": None,
        "n": None,
        "d": None,
        "nn": None,
        'content': None
    }
    
    print(data)
    return jsonify(data)
    
if __name__ == '__main__':
    app.run()

