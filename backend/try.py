from datetime import date, timedelta, datetime, timezone
# from flask_cors import CORS
# from bson import json_util
# import os
# from functools import wraps
# from unittest import result
# import bcrypt
# from bson import ObjectId
# from flask import Flask, flash, json, render_template, request, redirect, url_for, session, jsonify, send_from_directory
# from werkzeug.utils import secure_filename
# from flask_pymongo import DESCENDING, PyMongo
# import uuid
# from flask import make_response
# app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/statics')
# app.secret_key = 'secretkeyforfmcdatabase'
# app.config['MONGO_URI'] = 'mongodb://localhost:27017/fmc-database'
# app.permanent_session_lifetime = timedelta(hours=1)
# app.config['CORS_HEADERS'] = 'Content-Type'
# CORS(app, 
#     origins="http://localhost:5173",
#     allow_credentials=True,
#     supports_credentials=True
# )
# mongo = PyMongo(app)


# hashedpassword = bcrypt.hashpw('@faisaladam23'.encode('utf-8'), bcrypt.gensalt())
# print(hashedpassword)

# mongo.db.user.insert_one({
#   'email': "wizfaiz@icloud.com",
#   'username': "faisal",
#   'role': "admin-user",
#   'filenumber': "ADM001",
#   'staffphone': "1234567890",
#   'department': "Administration",
#   'password': hashedpassword
# })
def update_next_step():
    current_time = datetime.utcnow()
    print(current_time)


update_next_step()