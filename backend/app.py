#!/usr/bin/python3
from datetime import timedelta, datetime
from functools import wraps
from unittest import result
import bcrypt
from bson import ObjectId
from flask import Flask, flash, render_template, request, redirect, url_for, session, jsonify
from flask_pymongo import DESCENDING, PyMongo
import uuid


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
    print('Session:', session)
    """dashboard file"""
    return render_template('dashboard.html', title='Dashboard')

@app.route('/addstaff', methods=['GET', 'POST'])
@login_required
def staff():
    """Add Staff"""
    print(session)
    unique_id = str(uuid.uuid4())
    print(unique_id)
    user_email = session.get('email')
    user = mongo.db.user.find_one({'email': user_email})
    if not user:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        staff = {
            'staff_id': unique_id,
            'firstName': request.form.get('stafffirstName'),
            'midName': request.form.get('staffmidName'),
            'lastName': request.form.get('stafflastName'),
            'dob': request.form.get('staffdob'),
            'fileNumber': request.form.get('fileNumber'),
            'department': request.form.get('department'),
            'staffdateoffirstapt': request.form.get('staffdofa'),
            'dateoffirstapt': request.form.get('staffdofa'),
            'phone': request.form.get('staffpno'),
            'staffippissNumber': request.form.get('staffippissNumber'),
            'staffrank': request.form.get('staffrank'),
            'staffsalgrade': request.form.get('staffsalgrade'),
            'staffdateofpresentapt': request.form.get('staffdopa'),
            'staffgender': request.form.get('gender'),
            'stafforigin': request.form.get('stafforigin'),
            'localgovorigin': request.form.get('localgovorigin'),
            'qualification': request.form.get('qualification')
        }
      
        permanent_staff = mongo.db.permanent_staff.insert_one(staff)

        if permanent_staff:
            print('Permanent staff added successfully!')
            flash('Permanent staff added successfully!', 'success')
            return redirect(url_for('table_list'))
        else:
            print('Failed to add Permanent staff. Please try again.', 'danger')
            flash('Failed to add Permanent staff. Please try again.', 'danger')
    return render_template('add_staff.html', title='Add Permanent and Pensionable')

@app.route('/edit_staff/<string:staff_id>', methods=['GET', 'POST'])
@login_required
def edit_staff(staff_id):
    userbysession = session.get('email')
    current_user = mongo.db.user.find_one({'email': userbysession})
    staff = mongo.db.permanent_staff.find_one({'staff_id': staff_id})
    if not staff:
        flash('Staff not found', 'error')
        return redirect(url_for('table_list'))
    if request.method == 'POST':
       updated_staff = {
            'firstName': request.form.get('stafffirstName'),
            'midName': request.form.get('staffmidName'),
            'lastName': request.form.get('stafflastName'),
            'dob': request.form.get('staffdob'),
            'fileNumber': request.form.get('fileNumber'),
            'department': request.form.get('department'),
            'phone': request.form.get('staffpno'),
            'staffippissNumber': request.form.get('staffippissNumber'),
            'staffrank': request.form.get('staffrank'),
            'staffsalgrade': request.form.get('staffsalgrade'),
            'staffdateofpresentapt': request.form.get('staffdopa'),
            'staffgender': request.form.get('gender'),
            'stafforigin': request.form.get('stafforigin'),
            'localgovorigin': request.form.get('localgovorigin'),
            'qualification': request.form.get('qualification')
        }
       result = mongo.db.permanent_staff.update_one(
            {'staff_id': staff_id},
            {'$set': updated_staff}
        )
       if result.modified_count > 0:
            flash('Staff updated successfully!', 'success')
            log_reports(action='edit', staff_id=staff_id, details=f'Permanent staff updated by {current_user["username"]}({current_user["email"]}) from {current_user["department"]} department with File Number of {current_user["filenumber"]}')
            return redirect(url_for('table_list'))
    return render_template('edit_staff.html', title='Edit Staff', staff=staff)
@app.route('/delete_staff/<string:staff_id>', methods=['GET', 'POST'])
@login_required
def delete_staff(staff_id):
    userbysession = session.get('email')
    current_user = mongo.db.user.find_one({'email': userbysession})
    staff = mongo.db.permanent_staff.find_one({'staff_id': staff_id})
    if not staff:
        flash('Staff not found', 'error')
        return redirect(url_for('table_list'))
    if request.method == 'POST':
        mongo.db.permanent_staff.delete_one({'staff_id': staff_id})
        flash('Staff deleted successfully!', 'success')
        log_reports(action='delete', staff_id=staff_id, details=f'Permanent staff deleted by {current_user["username"]}({current_user["email"]}) from {current_user["department"]} department with File Number of {current_user["filenumber"]}')
        print(f"{staff['firstName']} successfully deleted")
        redirect(url_for('table_list'))
    return render_template('delete_staff.html', title='Delete Staff', staff=staff)

@app.route('/Listofstaff', methods=['GET', 'POST'])
@login_required
def table_list():
    """List of Staff"""
    permanent_staff_list = mongo.db.permanent_staff.find()
    return render_template('list.html', title='List of Permanent and Pensionable', staff=permanent_staff_list)

@app.route('/Confirmation', methods=['GET', 'POST'])
@login_required
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
    unique_id = str(uuid.uuid4())
    print(unique_id)
    if request.method == 'POST':
        staff = {
            'lcmstaff_id': unique_id,
            'firstName': request.form.get('stafffirstName'),
            'midName': request.form.get('staffmidName'),
            'lastName': request.form.get('stafflastName'),
            'dob': request.form.get('staffdob'),
            'fileNumber': request.form.get('filenumber'),
            'department': request.form.get('staffDepartment'),
            'dateOfApt': request.form.get('staffdoa'),
            'phone': request.form.get('staffpno')
        }
        # Add the staff to the LCM staff list
        lcm_staff = mongo.db.lcm_staff.insert_one(staff)

        if lcm_staff:
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
    lcm_staff_list = mongo.db.lcm_staff.find()
    return render_template('list_lcm.html', title='List of Locum Staffs', staff=lcm_staff_list)

@app.route('/edit_lcmstaff/<string:staff_id>', methods=['GET', 'POST'])
@login_required
def edit_lcmstaff(staff_id):
    """This helps edit staff"""
    userbysession = session.get('email')
    current_user = mongo.db.user.find_one({'email': userbysession})
    staff = mongo.db.lcm_staff.find_one({'lcmstaff_id': staff_id})
    if not staff:
        flash('Staff not found', 'error')
        return redirect(url_for('list_Lcm'))
    if request.method == 'POST':
        updated_lcmstaff = {
            'firstName': request.form.get('stafffirstName'),
            'midName': request.form.get('staffmidName'),
            'lastName': request.form.get('stafflastName'),
            'dob': request.form.get('staffdob'),
            'fileNumber': request.form.get('stafffileNumber'),
            'department': request.form.get('staffdepartment'),
            'dateOfApt': request.form.get('staffdateOfApt'),
            'phone': request.form.get('staffphone')
        }
        result = mongo.db.lcm_staff.update_one(
            {'lcmstaff_id': staff_id},
            {'$set': updated_lcmstaff}
        )
        if result.modified_count > 0:
            flash('LCM staff updated successfully!', 'success')
            log_reports(action='edit', staff_id=staff_id, details=f'LCM staff updated by {current_user["username"]}({current_user["email"]}) from {current_user["department"]} department with File Number of {current_user["filenumber"]}')
        else:
            flash('No changes made to the LCM staff.', 'info')
        
        return redirect(url_for('list_Lcm'))
    return render_template('edit_lcmstaff.html', title="Edit LCM Staff", staff=staff)
@app.route('/delete_lcmstaff/<string:staff_id>', methods=['GET', 'POST'])
@login_required
def delete_lcmstaff(staff_id):
    """This helps delete staff"""
    staff = mongo.db.lcm_staff.find_one({'lcmstaff_id': staff_id})
    userbysession = session.get('email')
    current_user = mongo.db.user.find_one({'email': userbysession})
    if not staff:
        flash('Staff not found', 'error')
        return redirect(url_for('list_Lcm'))
    if request.method == 'POST':
        mongo.db.lcm_staff.delete_one({'lcmstaff_id': staff_id})
        flash('Staff deleted successfully!', 'success')
        log_reports(action='delete', staff_id=staff_id, details=f'LCM staff deleted by {current_user["username"]}({current_user["email"]}) from {current_user["department"]} department with File Number of {current_user["filenumber"]}')
        print(f"{staff['firstName']} successfully deleted")
        redirect(url_for('list_Lcm'))
    return render_template('delete_lcmstaff.html', title='Delete LCM Staff', staff=staff)
        
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

def log_reports(action, staff_id, details):
    """Log reports"""
    current_time = datetime.utcnow()
    # formatted_time = current_time.strftime('%Y-%m-%d %H:%M %p')
    report = {
        'action': action,
        'staff_id': staff_id,
        'details': details,
        'date': current_time
    }
    print(report)
    mongo.db.reports.insert_one(report)
@app.route('/reports', methods=['GET', 'POST'])
@login_required
def reports():
    """Reports"""
    reports = mongo.db.reports.find().sort('date', DESCENDING)
    return render_template('reports.html', title='Reports', reports=reports)
@app.route('/logout', methods=['GET'])
def logout():
    """Logout"""
    session.pop('email', None)
    print('Session cleared:', session) 
    print('User is logged out')
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)

