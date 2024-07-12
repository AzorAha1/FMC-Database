#!/usr/bin/python3
from flask import Flask, render_template, request, redirect, url_for
from flask_pymongo import PyMongo

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/statics')
# mongo = PyMongo(app=app)

@app.route('/', methods=['GET'])
@app.route('/login', methods=['GET', 'POST'])
def login():
    """index file"""
    return render_template('login.html', title='Home')

@app.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    """dashboard file"""
    return render_template('dashboard.html', title='Dashboard')

@app.route('/add staff', methods=['GET', 'POST'])
def staff():
    """Add Staff"""
    return render_template('add_staff.html', title='Add Staff')
@app.route('/List of staff', methods=['GET', 'POST'])
def table_list():
    """List of Staff"""
    return render_template('list.html', title='List of Staff')
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
    return render_template('add_lcm.html', title='Add_lcm')

@app.route('/List of LCM Staff', methods=['GET', 'POST'])
def list_Lcm():
    """List_Lcm"""
    return render_template('list_lcm.html', title='List_Lcm')


if __name__ == '__main__':
    app.run(debug=True)