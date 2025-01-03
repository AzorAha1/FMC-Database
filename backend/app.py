#!/usr/bin/python3
from datetime import timedelta, datetime, timezone
from flask_cors import CORS
from bson import json_util

from functools import wraps
from unittest import result
import bcrypt
from bson import ObjectId
from flask import Flask, flash, json, render_template, request, redirect, url_for, session, jsonify
from flask_pymongo import DESCENDING, PyMongo
import uuid
from flask import make_response


app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/statics')
app.secret_key = 'secretkeyforfmcdatabase'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/fmc-database'
app.permanent_session_lifetime = timedelta(hours=1)
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app, 
    origins="http://localhost:5173",
    allow_credentials=True,
    supports_credentials=True
)

mongo = PyMongo(app)

def login_required(func):
    """this checks for the login status"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'email' not in session:
            return redirect(url_for('login'))
        return func(*args, **kwargs)
    return wrapper


def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if session.get('role') != 'admin-user':
            return redirect(url_for('dashboard'))
        return func(*args, **kwargs)
    return wrapper
def confirmationofstaff():
    """"this function checks for the confirmation of staff"""
    dateoffirstapt = mongo.db.permenant_staff.find_one({'staffdateoffirstapt': 'staffdofa'})
    print(dateoffirstapt)

# @app.route('/login', methods=['GET', 'POST'])
# old login endpoint 
# def login():
#     """index file"""
#     if request.method == 'POST':
#         email = request.form.get('email')
#         password = request.form.get('password')
#         user_collection = mongo.db.user

#         # Check if the user exists
#         user = user_collection.find_one({'email': email})
#         if user:
#             # Check if the password is correct
#             if bcrypt.checkpw(password.encode('utf-8'), user['password']):
#                 session['email'] = email
#                 session['role'] = user.get('role')
#                 return redirect(url_for('dashboard'))
#             else:
#                 flash('Invalid email or password', 'danger')
#                 return redirect(url_for('login'))
#         else:
#             flash('Invalid email or password', 'danger')
#             return redirect(url_for('login'))

#     return render_template('login.html', title='Login')

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "Test successful"})
@app.route('/', methods=['GET'])
@app.route('/api/login', methods=['POST', 'GET'])
def login():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,GET,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    user_collection = mongo.db.user
    user = user_collection.find_one({'email': email})
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        if user.get('role') == 'admin-user' or user.get('role') == role:
            session['email'] = email
            session['role'] = role
            response = jsonify({
                'success': True, 
                'redirectUrl': url_for('dashboard'),
                'user': {
                    'email': email,
                    'role': role,
                    'isAdmin': user.get('role') == 'admin-user'
                }
            })
            # Add CORS headers to the response
            response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response

        return jsonify({
            'success': False, 
            'message': 'You do not have permission for this role'
        }), 403
            
    return jsonify({
        'success': False, 
        'message': 'Invalid email or password'
    }), 401

# old endpoint for dashboard
# @app.route('/dashboard', methods=['GET', 'POST'])
# # @login_required
# def dashboard():
#     print('Session:', session)
#     """dashboard file"""
#     lcm_staff_count = mongo.db.lcm_staff.count_documents({})
#     total_permenentstaff_count = mongo.db.permanent_staff.count_documents({})
#     allstaffscount = lcm_staff_count + total_permenentstaff_count
#     total_users = mongo.db.user.count_documents({})
#     confirmationofstaff()
#     return render_template('dashboard.html',
#                            title='Dashboard',
#                            lcm_staff_count=lcm_staff_count,
#                            total_permenentstaff_count=total_permenentstaff_count,
#                            allstaffscount=allstaffscount,
#                            total_users=total_users
#                            )

# new dashboard endpoint
@app.route('/api/dashboard', methods=['GET', 'POST'])
def dashboard():
    lcm_staff_count = mongo.db.lcm_staff.count_documents({})
    total_permenentstaff_count = mongo.db.permanent_staff.count_documents({})
    allstaffscount = lcm_staff_count + total_permenentstaff_count
    total_users = mongo.db.user.count_documents({})
    
    return jsonify({
        'lcmStaffCount': lcm_staff_count,
        'permanentStaffCount': total_permenentstaff_count,
        'allStaffCount': allstaffscount,
        'totalUsers': total_users
    })

# old endpoint for add staff
# @app.route('/addstaff', methods=['GET', 'POST'])
# @login_required
# def staff():
#     """Add Staff"""
#     print(session)
#     unique_id = str(uuid.uuid4())
#     print(unique_id)
#     user_email = session.get('email')
#     user = mongo.db.user.find_one({'email': user_email})
#     if not user:
#         return redirect(url_for('login'))
#     if request.method == 'POST':
#         two_years = timedelta(days=730)
#         current_time = datetime.utcnow()
#         staff_date_of_first_appointment = datetime.strptime(request.form.get('staffdofa'), '%Y-%m-%d')
#         if current_time - staff_date_of_first_appointment > two_years:
#             confirmation_status = 'confirmed'
#         else:
#             confirmation_status = 'unconfirmed'
#         staff = {
#             'staff_id': unique_id,
#             'firstName': request.form.get('stafffirstName'),
#             'midName': request.form.get('staffmidName'),
#             'lastName': request.form.get('stafflastName'),
#             'stafftype': request.form.get('stafftype'),
#             'dob': request.form.get('staffdob'),
#             'fileNumber': request.form.get('fileNumber'),
#             'department': request.form.get('department'),
#             'staffdateoffirstapt': request.form.get('staffdofa'),
#             'phone': request.form.get('staffpno'),
#             'staffippissNumber': request.form.get('staffippissNumber'),
#             'staffrank': request.form.get('staffrank'),
#             'staffsalgrade': request.form.get('staffsalgrade'),
#             'staffdateofpresentapt': request.form.get('staffdopa'),
#             'staffgender': request.form.get('staffgender'),
#             'stafforigin': request.form.get('stafforigin'),
#             'localgovorigin': request.form.get('localgovorigin'),
#             'qualification': request.form.get('qualification'),
#             'confirmation_status': confirmation_status
#         }
      
#         permanent_staff = mongo.db.permanent_staff.insert_one(staff)

#         if permanent_staff:
#             print('Permanent staff added successfully!')
#             flash('Permanent staff added successfully!', 'success')
#             return redirect(url_for('table_list'))
#         else:
#             print('Failed to add Permanent staff. Please try again.', 'danger')
#             flash('Failed to add Permanent staff. Please try again.', 'danger')
#     return render_template('add_staff.html', title='Add Permanent and Pensionable')

# new add staff endpoint
@app.route('/api/add_staff', methods=['POST'])
def add_staff():
    print("add_staff route hit!") 
    data = request.get_json()
    print(data)

    # Function to validate and parse date fields
    def parse_date(date_string):
        if not date_string:
            return None  # Return None if no date is provided
        try:
            return datetime.strptime(date_string, '%Y-%m-%d')  # Parse the date in YYYY-MM-DD format
        except ValueError:
            return None  # Return None if parsing fails

  

    # Validate and parse date fields
    staff_date_of_first_appointment = parse_date(data.get('staffdofa'))
    staff_date_of_present_appointment = parse_date(data.get('staffdateofpresentapt'))
    staff_dob = parse_date(data.get('staffdob'))

    # Check if any required date fields are missing or invalid
    if staff_date_of_first_appointment is None:
        return jsonify({
            'success': False,
            'message': 'Invalid or missing Date of First Appointment (staffdofa). Expected format: YYYY-MM-DD.'
        }), 400
    if staff_date_of_present_appointment is None:
        return jsonify({
            'success': False,
            'message': 'Invalid or missing Date of Present Appointment (staffdopa). Expected format: YYYY-MM-DD.'
        }), 400
    if staff_dob is None:
        return jsonify({
            'success': False,
            'message': 'Invalid or missing Date of Birth (staffdob). Expected format: YYYY-MM-DD.'
        }), 400
    


    # Define time constants
    unique_id = str(uuid.uuid4())
    two_years = timedelta(days=730)
    current_time = datetime.utcnow()

    # Check the confirmation status based on the Date of First Appointment
    if current_time - staff_date_of_first_appointment > two_years:
        confirmation_status = 'confirmed'
    else:
        confirmation_status = 'unconfirmed'
    
    # Prepare the staff data
    staff = {
        'staff_id': unique_id,
        'firstName': data['stafffirstName'],
        'midName': data['staffmidName'],
        'lastName': data['stafflastName'],
        'stafftype': data['stafftype'],
        'dob': staff_dob.strftime('%Y-%m-%d'),  # Save the parsed Date of Birth
        'fileNumber': data['fileNumber'],
        'department': data['department'],
        'staffdateoffirstapt': staff_date_of_first_appointment.strftime('%Y-%m-%d'),  # Save the parsed Date of First Appointment
        'staffpno': data['staffpno'],
        'staffippissNumber': data['staffippissNumber'],
        'staffrank': data['staffrank'],
        'staffsalgrade': data['staffsalgrade'],
        'staffdateofpresentapt': staff_date_of_present_appointment.strftime('%Y-%m-%d'),  # Save the parsed Date of Present Appointment
        'staffgender': data['staffgender'],
        'stafforigin': data['stafforigin'],
        'localgovorigin': data['localgovorigin'],
        'qualification': data['qualification'],
        'conhessLevel': data['conhessLevel'],
        'confirmation_status': confirmation_status
    }
    if request.method == 'POST': 
        print(data)    
    # Insert into the database
    permanent_staff = mongo.db.permanent_staff.insert_one(staff)

    if permanent_staff:
        return jsonify({
            'success': True,
            'message': 'Permanent staff added successfully!'
        }), 201
    else:
        return jsonify({
            'success': False,
            'message': 'Failed to add Permanent staff. Please try again.'
        }), 400
@app.route('/confirm_staff/<string:staff_id>', methods=['GET', 'POST'])
@admin_required
@login_required
def confirm_staff(staff_id):
    userbysession = session.get('email')
    current_user = mongo.db.user.find_one({'email': userbysession})
    staff = mongo.db.permanent_staff.find_one({'staff_id': staff_id})
    if not staff:
        flash('Staff not found', 'error')
        return redirect(url_for('table_list'))
    staff_date_of_first_appointment = datetime.strptime(staff['staffdateoffirstapt'], '%Y-%m-%d')
    two_years = timedelta(days=730)
    current_time = datetime.utcnow()
    if current_time - staff_date_of_first_appointment > two_years:
        if staff['confirmation_status'] == 'unconfirmed':
            if request.method == 'POST':
                mongo.db.permanent_staff.update_one(
                    {'staff_id': staff_id},
                    {'$set': {'confirmation_status': 'confirmed'}}
                    )
                flash('Staff confirmed successfully!', 'success')
                return redirect(url_for('Confirmation'))
        else:
            flash('Staff is already confirmed', 'info')
            return redirect(url_for('Confirmation'))
        return render_template('confirm_staff.html', title='Confirm Staff', staff=staff)
    else:
        remaining_days = (staff_date_of_first_appointment + two_years - current_time).days
        flash(f'Staff is not due for confirmation. {remaining_days} days remaining', 'info')
        return redirect(url_for('Confirmaton'))
        
            
            
@app.route('/edit_staff/<string:staff_id>', methods=['GET', 'POST'])
@admin_required
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
@admin_required
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

# old endpoint for list of staff
# @app.route('/Listofstaff', methods=['GET', 'POST'])
# @login_required
# def table_list():
#     """List of Staff"""
#     permanent_staff_list = mongo.db.permanent_staff.find()
#     return render_template('list.html', title='List of Permanent and Pensionable', staff=permanent_staff_list)

# new list of staff endpoint
@app.route('/api/liststaffs', methods=['GET', 'POST'])
def list_staff():
    permanent_staff_list = list(mongo.db.permanent_staff.find())
    if not permanent_staff_list:
        return jsonify({'message': 'No staff found'}), 404
    else:
        # Convert MongoDB results to JSON-serializable format
        return json.loads(json_util.dumps({'staff': permanent_staff_list}))


# old confirmation endpoint
# @app.route('/confirmation', methods=['GET', 'POST'])
# # @login_required
# def confirmation():
#     currenttime = datetime.now()
#     two_years_ago = currenttime - timedelta(days=730)
    
#     eligible_staff = list(mongo.db.permanent_staff.find({
#         'staffdateoffirstapt': {'$lt': two_years_ago.strftime('%Y-%m-%d')},
#         'confirmation_status': 'unconfirmed'
#     }))
    
#     pending_staff = list(mongo.db.permanent_staff.find({
#         'confirmation_status': 'unconfirmed',
#         'staffdateoffirstapt': {'$gte': two_years_ago.strftime('%Y-%m-%d')}
#     }))
    
#     # Calculate remaining days for pending staff
#     for staff in pending_staff:
#         dofa = datetime.strptime(staff['staffdateoffirstapt'], '%Y-%m-%d')
#         staff['days_remaining'] = ((dofa + timedelta(days=730)) - currenttime).days
    
#     return render_template('confirmation.html', title='Confirmation', 
#                            eligible_staff=eligible_staff, pending_staff=pending_staff, 
#                            currenttime=currenttime)

from datetime import datetime, timedelta
# new confirmation endpoint
@app.route('/api/confirmation', methods=['GET', 'POST'])
def confirmation():
    """confirmation endpoint"""
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit
    staff_data = mongo.db.permanent_staff.find({}, {
        'staff_id': 1,
        'firstName': 1,
        'midName': 1,
        'lastName': 1,
        'fileNumber': 1,
        'stafftype': 1,
        'staffsalgrade': 1,
        'confirmation_status': 1,
        'staffdateoffirstapt': 1
    }).skip(skip).limit(limit)
    total_staffs = mongo.db.permanent_staff.count_documents({})
    totalPages = (total_staffs // limit) + (1 if total_staffs % limit > 0 else 0)
    current_date = datetime.utcnow().replace(tzinfo=None)
    two_years = timedelta(days=730)
    result = []

    for staff in staff_data:
        dateoffirstapt = datetime.strptime(staff['staffdateoffirstapt'], '%Y-%m-%d')
        days_until_confirmation = (dateoffirstapt + two_years - current_date).days
        isEligible = days_until_confirmation <= 0
        
        newstatus = 'confirmed' if isEligible else 'unconfirmed'
        if staff.get('confirmation_status') != newstatus:
            mongo.db.permanent_staff.update_one(
                {'staff_id': staff['staff_id']},
                {'$set': {'confirmation_status': newstatus}}
            )

        result.append({
            'staff_id': staff['staff_id'],
            'firstName': staff.get('firstName', ''),
            'midName': staff.get('midName', ''),
            'lastName': staff.get('lastName', ''),
            'fileNumber': staff.get('fileNumber', ''),
            'stafftype': staff.get('stafftype', ''),
            'salaryLevel': staff.get('staffsalgrade', ''),
            'dateoffirstapt': staff['staffdateoffirstapt'],
            'isEligible': isEligible,
            'daysUntilConfirmation': max(0, days_until_confirmation),
            'confirmation_status': newstatus
        })
    return jsonify({
        'data': result,
        'totalPages': totalPages,
        'currentPage': page,
        'totalStaffs': total_staffs
    })


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
            return redirect(url_for('list_Lcm'))
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
@admin_required
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
@admin_required
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
# @login_required
# @admin_required
def add_user():
    """Add user"""
    users = mongo.db.user.find()
    if request.method == 'POST':
        email = request.form.get('staffemail')
        role = request.form.get('role')
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
            'role': role, 
            'filenumber': filenumber,
            'staffphone': staffphone,
            'department': department,
            'password': hashed_password
        }
        for user in users:
            if user['email'] == email:
                flash('User already exists', 'danger')
                print('User already exists')
                return redirect(url_for('add_user'))
        else:
            flash('User added successfully', 'success')
            user = mongo.db.user.insert_one(new_user)
            print(f'User added: {user}')
            return redirect(url_for('dashboard'))

    return render_template('add_user.html', title='Add User')
@app.route('/userlist', methods=['GET', 'POST'])
@login_required
@admin_required
def user_list():
    """List of Users"""
    users = mongo.db.user.find()
    return render_template('user_list.html', title='List of Users', users=users)
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

# old endpoint for reports
# @app.route('/reports', methods=['GET', 'POST'])
# @login_required
# def reports():
#     """Reports"""
#     reports = mongo.db.reports.find().sort('date', DESCENDING)
#     return render_template('reports.html', title='Reports', reports=reports)

# new reports endpoint
@app.route('/api/reports', methods=['GET', 'POST'])
def reports():
    reports = list(mongo.db.reports.find().sort('date', DESCENDING))
    return json_util.dumps({'reports': reports})
@app.route('/logout', methods=['GET'])
def logout():
    """Logout"""
    session.pop('email', None)
    print('Session cleared:', session) 
    print('User is logged out')
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True, port=5003, host='0.0.0.0')

