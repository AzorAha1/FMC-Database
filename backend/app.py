#!/usr/bin/python3
from flask import Flask, render_template, request, redirect, url_for
from flask_pymongo import PyMongo

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/statics')
app.secret_key = 'secretkeyforfmcdatabase'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/fmc-database'
mongo = PyMongo(app)

@app.route('/', methods=['GET'])
@app.route('/login', methods=['GET', 'POST'])
def login():
    """index file"""
    username = request.form.get('username')
    password = request.form.get('password')
    if username == 'admin' and password == '@admin11':
        return redirect(url_for('dashboard'))
    return render_template('login.html', title='Login ')

@app.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    """dashboard file"""
    return render_template('dashboard.html', title='Dashboard')

@app.route('/add staff', methods=['GET', 'POST'])
def staff():
    """Add Staff"""
    return render_template('add_staff.html', title='Add Nominal')
@app.route('/List of staff', methods=['GET', 'POST'])
def table_list():
    """List of Staff"""
    return render_template('list.html', title='List of Nominal')
@app.route('/Confirmation', methods=['GET', 'POST'])
def confirmation():
    """Confirmation"""
    return render_template('confirmation.html', title='Confirmation')

@app.route('/appointment', methods=['GET', 'POST'])
def appointment():
    """appointment"""
    return render_template('appointment.html', title='Appointment')

@app.route('/Promotion', methods=['GET', 'POST'])
def promotion():
    """Promotion"""
    return render_template('promotion.html', title='Promotion')

@app.route('/Add LCM Staff', methods=['GET', 'POST'])
def add_lcm():
    """Add_lcm"""
    return render_template('add_lcm.html', title='Add Non-Nominal')

@app.route('/List of LCM Staff', methods=['GET', 'POST'])
def list_Lcm():
    """List_Lcm"""
    return render_template('list_lcm.html', title='List of Non-Nominal')

@app.route('/Add User', methods=['GET', 'POST'])
def user():
    """user"""
    return render_template('add_user.html', title='Add User')

@app.route('/User table', methods=['GET', 'POST'])
def table():
    """user"""
    return render_template('user_table.html', title='User table')


if __name__ == '__main__':
    app.run(debug=True)