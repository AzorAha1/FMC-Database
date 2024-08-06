#!/usr/bin/python3
from datetime import timedelta
from functools import wraps
from unittest import result
import bcrypt
from bson import ObjectId
from flask import Flask, flash, render_template, request, redirect, url_for, session
from flask_pymongo import PyMongo

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/statics')
app.secret_key = 'secretkeyforfmcdatabase'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/fmc-database'
app.permanent_session_lifetime = timedelta(hours=1)
mongo = PyMongo(app)

def login_required(func):
    """this checks for the login status"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'email' not in session:
            return redirect(url_for('login'))
        return func(*args, **kwargs)
    return wrapper

@app.route('/', methods=['GET'])
@app.route('/login', methods=['GET', 'POST'])
def login():
    """index file"""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user_collection = mongo.db.user

        # Check if the user exists
        user = user_collection.find_one({'email': email})
        if user:
            # Check if the password is correct
            if bcrypt.checkpw(password.encode('utf-8'), user['password']):
                session['email'] = email
                return redirect(url_for('dashboard'))
            else:
                flash('Invalid email or password', 'danger')
                return redirect(url_for('login'))
        else:
            flash('Invalid email or password', 'danger')
            return redirect(url_for('login'))

    return render_template('login.html', title='Login')

@app.route('/dashboard', methods=['GET', 'POST'])
@login_required
def dashboard():
    """dashboard file"""
    return render_template('dashboard.html', title='Dashboard')

@app.route('/addstaff', methods=['GET', 'POST'])
@login_required
def staff():
    """Add Staff"""
    print(session)
    user_email = session.get('email')
    user = mongo.db.user.find_one({'email': user_email})
    if not user:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        staff = {
            'firstName': request.form.get('stafffirstName'),
            'midName': request.form.get('staffmidName'),
            'lastName': request.form.get('stafflastName'),
            'dob': request.form.get('staffdob'),
            'fileNumber': request.form.get('filenumber'),
            'department': request.form.get('staffDepartment'),
            'dateOfApt': request.form.get('staffdoa'),
            'phone': request.form.get('staffpno'),
            'staffippissNumber': request.form.get('staffippissNumber'),
            'staffrank': request.form.get('staffrank'),
            'staffsalgrade': request.form.get('staffsalgrade'),
            'staffdapa': request.form.get('staffdapa'),
            'staffgender': request.form.get('gender'),
            'stafforigin': request.form.get('stafforigin'),
            'localgovorigin': request.form.get('localgovorigin'),
            'qualification': request.form.get('qualification')
        }
      
        result = mongo.db.user.update_one(
            {'email': user_email},
            {'$push': {'permenentStaff': staff}}
        )

        if result.modified_count == 1:
            print('LCM staff added successfully!')
            flash('LCM staff added successfully!', 'success')
        else:
            print('Failed to add LCM staff. Please try again.', 'danger')
            flash('Failed to add LCM staff. Please try again.', 'danger')
    return render_template('add_staff.html', title='Add Permanent and Pensionable')
@app.route('/Listofstaff', methods=['GET', 'POST'])
@login_required
def table_list():
    """List of Staff"""
    user_email = session.get('email')
    user = mongo.db.user.find_one({'email': user_email})

    if not user or 'permenentStaff' not in user:
        flash('No LCM staff found', 'danger')
        return redirect(url_for('dashboard'))

    permenent_staff_list = user.get('permenentStaff', [])
    return render_template('list.html', title='List of Permanent and Pensionable', staff=permenent_staff_list)
@app.route('/Confirmation', methods=['GET', 'POST'])
# @login_required
def confirmation():
    """Confirmation"""
    return render_template('confirmation.html', title='Confirmation')

@app.route('/Promotion', methods=['GET', 'POST'])
@login_required
def promotion():
    """Promotion"""
    return render_template('promotion.html', title='Promotion')


@app.route('/addlcmstaff', methods=['GET', 'POST'])
@login_required
def add_lcm():
    """Add LCM Staff"""
    print(session)
    user_email = session.get('email')
    user = mongo.db.user.find_one({'email': user_email})
    if not user:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        staff = {
            'firstName': request.form.get('stafffirstName'),
            'midName': request.form.get('staffmidName'),
            'lastName': request.form.get('stafflastName'),
            'dob': request.form.get('staffdob'),
            'fileNumber': request.form.get('filenumber'),
            'department': request.form.get('staffDepartment'),
            'dateOfApt': request.form.get('staffdoa'),
            'phone': request.form.get('staffpno')
        }

        # Add the staff to the LCM staff list within the user's document
        result = mongo.db.user.update_one(
            {'email': user_email},
            {'$push': {'lcmStaff': staff}}
        )

        if result.modified_count == 1:
            print('LCM staff added successfully!')
            flash('LCM staff added successfully!', 'success')
        else:
            print('Failed to add LCM staff. Please try again.', 'danger')
            flash('Failed to add LCM staff. Please try again.', 'danger')
    
    return render_template('add_lcm.html', title='Add Locum Staffs')


@app.route('/listlcmstaff', methods=['GET', 'POST'])
@login_required
def list_Lcm():
    """List_Lcm"""
    user_email = session.get('email')
    user = mongo.db.user.find_one({'email': user_email})

    if not user or 'lcmStaff' not in user:
        flash('No LCM staff found', 'danger')
        return redirect(url_for('dashboard'))

    lcm_staff_list = user.get('lcmStaff', [])
    
    return render_template('list_lcm.html', title='List of Locum Staffs', staff=lcm_staff_list)

@app.route('/AddUser', methods=['GET', 'POST'])
@login_required
def add_user():
    """Add user"""
    if request.method == 'POST':
        email = request.form.get('staffemail')
        username = request.form.get('username')
        filenumber = request.form.get('filenumber')
        staffphone = request.form.get('staffpno')
        department = request.form.get('userDepartment')
        password = request.form.get('password')

        # Check if all fields are filled
        if not all([email, username, filenumber, staffphone, department, password]):
            flash("All fields are required", "danger")
            return redirect(url_for('add_user'))

        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Ensure the collection is properly assigned
        new_user = {
            'email': email,
            'username': username,
            'filenumber': filenumber,
            'staffphone': staffphone,
            'department': department,
            'password': hashed_password
        }

        user = mongo.db.user.insert_one(new_user)
        print(f'User added: {user}')
        return redirect(url_for('dashboard'))

    return render_template('add_user.html', title='Add User')


@app.route('/logout', methods=['GET'])
def logout():
    """Logout"""
    session.pop('email', None)
    print('User is logged out')
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)

