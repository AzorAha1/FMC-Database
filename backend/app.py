#!/usr/bin/python3
from flask import Flask, render_template, request, redirect
from flask_pymongo import PyMongo

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/statics')
# mongo = PyMongo(app=app)

@app.route('/', methods=['GET'])
@app.route('/login', methods=['GET', 'POST'])
def index():
    """index file"""
    return render_template('login.html', title='Home')


if __name__ == '__main__':
    app.run(debug=True)