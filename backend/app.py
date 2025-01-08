#!/usr/bin/python3
from datetime import date, timedelta, datetime, timezone
from flask_cors import CORS
from bson import json_util
import os
from functools import wraps
from unittest import result
import bcrypt
from bson import ObjectId
from flask import Flask, flash, json, render_template, request, redirect, url_for, session, jsonify
from werkzeug.utils import secure_filename
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

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

mongo = PyMongo(app)

#calculate junior promotion
def calculate_junior_promotion(present_apt):
    """Calculate promotion"""
    present_apt_date = present_apt.date()

    #determine the start date for promotion
    yearofappointment = present_apt_date.year
    january_first = date(yearofappointment, 1, 1)

    if present_apt_date > january_first:
        promotion_start_date = date(yearofappointment + 1, 1, 1)
    else:
        promotion_start_date = present_apt
    promotion_eligibility_date = date(promotion_start_date.year + 2, promotion_start_date.month, promotion_start_date.day)
    return promotion_eligibility_date

# caculate senior promotion
def calculate_senior_promotion(present_apt):
    """Calculate promotion"""
    present_apt_date = present_apt.date()

    #determine the start date for promotion
    yearofappointment = present_apt_date.year
    january_first = date(yearofappointment, 1, 1)

    if present_apt_date > january_first:
        promotion_start_date = date(yearofappointment + 1, 1, 1)
    else:
        promotion_start_date = present_apt
    promotion_eligibility_date = date(promotion_start_date.year + 3, promotion_start_date.month, promotion_start_date.day)
    return promotion_eligibility_date

# calculate senior management promotion
def calculate_senior_management_promotion(present_apt):
    """Calculate promotion"""
    present_apt_date = present_apt.date()

    #determine the start date for promotion
    yearofappointment = present_apt_date.year
    january_first = date(yearofappointment, 1, 1)

    if present_apt_date > january_first:
        promotion_start_date = date(yearofappointment + 1, 1, 1)
    else:
        promotion_start_date = present_apt
    promotion_eligibility_date = date(promotion_start_date.year + 4, promotion_start_date.month, promotion_start_date.day)
    return promotion_eligibility_date

# calculate promotion
def calculate_promotion(staff_data):
    """Calculate promotion"""
    try:
        staff_date_of_present_appointment = datetime.strptime(staff_data['staffdateofpresentapt'], '%Y-%m-%d')
    except (ValueError, KeyError):
        return None
    staff_type = staff_data['stafftype']
    conhess_level = staff_data['conhessLevel']
    try:
        level = conhess_level.split(' ')[-1]
    except (ValueError, IndexError):
        return None
    if staff_type == 'JSA':
        if level <= 5:
            return calculate_junior_promotion(staff_date_of_present_appointment)
    elif staff_type == 'SSA':
        if level <= 13:
            return calculate_senior_promotion(staff_date_of_present_appointment)
    elif staff_type == 'SSA':
        if level > 13:
            return calculate_senior_management_promotion(staff_date_of_present_appointment)
    else:
        return None
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
# @app.route('/confirm_staff/<string:staff_id>', methods=['GET', 'POST'])
# @admin_required
# @login_required
# def confirm_staff(staff_id):
#     userbysession = session.get('email')
#     current_user = mongo.db.user.find_one({'email': userbysession})
#     staff = mongo.db.permanent_staff.find_one({'staff_id': staff_id})
#     if not staff:
#         flash('Staff not found', 'error')
#         return redirect(url_for('table_list'))
#     staff_date_of_first_appointment = datetime.strptime(staff['staffdateoffirstapt'], '%Y-%m-%d')
#     two_years = timedelta(days=730)
#     current_time = datetime.utcnow()
#     if current_time - staff_date_of_first_appointment > two_years:
#         if staff['confirmation_status'] == 'unconfirmed':
#             if request.method == 'POST':
#                 mongo.db.permanent_staff.update_one(
#                     {'staff_id': staff_id},
#                     {'$set': {'confirmation_status': 'confirmed'}}
#                     )
#                 flash('Staff confirmed successfully!', 'success')
#                 return redirect(url_for('Confirmation'))
#         else:
#             flash('Staff is already confirmed', 'info')
#             return redirect(url_for('Confirmation'))
#         return render_template('confirm_staff.html', title='Confirm Staff', staff=staff)
#     else:
#         remaining_days = (staff_date_of_first_appointment + two_years - current_time).days
#         flash(f'Staff is not due for confirmation. {remaining_days} days remaining', 'info')
#         return redirect(url_for('Confirmaton'))
        


#new endpoint to edit and delete staff
@app.route('/api/manage_staff/<string:staff_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_staff(staff_id):
    """Manage staff by editing or deleting"""
    userbysession = session.get('email')
    if not userbysession:
        return jsonify({'message': 'User session not found'}), 401

    current_user = mongo.db.user.find_one({'email': userbysession})
    if not current_user:
        return jsonify({'message': 'User not found'}), 404

    staff = mongo.db.permanent_staff.find_one({'staff_id': staff_id})
    if not staff:
        return jsonify({'message': 'Staff not found'}), 404

    if request.method == 'PUT':
        data = request.get_json()
        updated_staff = {
            'firstName': data.get('stafffirstName'),
            'midName': data.get('staffmidName'),
            'lastName': data.get('stafflastName'),
            'dob': data.get('staffdob'),
            'fileNumber': data.get('fileNumber'),
            'department': data.get('department'),
            'phone': data.get('staffpno'),
            'staffippissNumber': data.get('staffippissNumber'),
            'staffrank': data.get('staffrank'),
            'staffsalgrade': data.get('staffsalgrade'),
            'staffdateofpresentapt': data.get('staffdopa'),
            'staffgender': data.get('staffgender'),
            'stafforigin': data.get('stafforigin'),
            'localgovorigin': data.get('localgovorigin'),
            'qualification': data.get('qualification')
        }

        result = mongo.db.permanent_staff.update_one(
            {'staff_id': staff_id},
            {'$set': updated_staff}
        )
        if result.modified_count > 0:
            log_reports(
                action='edit',
                staff_id=staff_id,
                details=f'Permanent staff updated by {current_user.get("username", "Unknown")}({current_user.get("email", "Unknown")}) from {current_user.get("department", "Unknown")} department with File Number of {current_user.get("filenumber", "Unknown")}'
            )
            return jsonify({'message': 'Staff updated successfully'}), 200
        else:
            return jsonify({'message': 'No changes made to the staff'}), 200

    elif request.method == 'DELETE':
        result = mongo.db.permanent_staff.delete_one({'staff_id': staff_id})
        if result.deleted_count > 0:
            log_reports(
                action='delete',
                staff_id=staff_id,
                details=f'Permanent staff deleted by {current_user.get("username", "Unknown")}({current_user.get("email", "Unknown")}) from {current_user.get("department", "Unknown")} department with File Number of {current_user.get("filenumber", "Unknown")}'
            )
            return jsonify({'message': 'Staff deleted successfully'}), 200
        else:
            return jsonify({'message': 'Staff not found'}), 404

# manage lcm staff by edit and delete
@app.route('/api/manage_lcm_staff/<string:lcmstaff_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_lcm_staff(lcmstaff_id):
    """Manage LCM staff by editing or deleting"""
    userbysession = session.get('email')
    if not userbysession:
        return jsonify({'message': 'User session not found'}), 401

    current_user = mongo.db.user.find_one({'email': userbysession})
    if not current_user:
        return jsonify({'message': 'User not found'}), 404

    lcm_staff = mongo.db.lcm_staff.find_one({'lcmstaff_id': lcmstaff_id})
    if not lcm_staff:
        return jsonify({'message': 'LCM staff not found'}), 404

    if request.method == 'PUT':
        data = request.get_json()
        updated_lcm_staff = {
            'firstName': data.get('firstName'),
            'midName': data.get('midName'),
            'lastName': data.get('lastName'),
            'phone': data.get('phone')
        }

        # firstName: staff?.firstName || '',
        # midName: staff?.midName || '',
        # lastName: staff?.lastName || '',
        # dob: staff?.dob || '',
        # fileNumber: staff?.fileNumber || '',
        # department: staff?.department || '',
        # phone: staff?.phone || '',
        # staffippissNumber: staff?.staffippissNumber || '',
        # staffrank: staff?.staffrank || '',
        # staffsalgrade: staff?.staffsalgrade || '',
        # staffgender: staff?.staffgender || '',
        # stafforigin: staff?.stafforigin || '',
        # qualification: staff?.qualification || ''
        result = mongo.db.lcm_staff.update_one(
            {'lcmstaff_id': lcmstaff_id},
            {'$set': updated_lcm_staff}
        )
        if result.modified_count > 0:
            log_reports(
                action='edit',
                staff_id=lcmstaff_id,
                details=f'LCM staff updated by {current_user.get("username", "Unknown")}({current_user.get("email", "Unknown")}) from {current_user.get("department", "Unknown")} department with File Number of {current_user.get("filenumber", "Unknown")}'
            )
            return jsonify({'message': 'LCM staff updated successfully'}), 200
        else:
            return jsonify({'message': 'No changes made to the LCM staff'}), 200

    elif request.method == 'DELETE':
        result = mongo.db.lcm_staff.delete_one({'lcmstaff_id': lcmstaff_id})
        if result.deleted_count > 0:
            log_reports( 
                action='delete',
                staff_id=lcmstaff_id,
                details=f'LCM staff deleted by {current_user.get("username", "Unknown")}({current_user.get("email", "Unknown")}) from {current_user.get("department", "Unknown")} department with File\
                Number of {current_user.get("filenumber", "Unknown")}'
            )
            
# old endpoint for edit staff            
# @app.route('/edit_staff/<string:staff_id>', methods=['GET', 'POST'])
# @admin_required
# @login_required
# def edit_staff(staff_id):
#     userbysession = session.get('email')
#     current_user = mongo.db.user.find_one({'email': userbysession})
#     staff = mongo.db.permanent_staff.find_one({'staff_id': staff_id})
#     if not staff:
#         flash('Staff not found', 'error')
#         return redirect(url_for('table_list'))
#     if request.method == 'POST':
#        updated_staff = {
#             'firstName': request.form.get('stafffirstName'),
#             'midName': request.form.get('staffmidName'),
#             'lastName': request.form.get('stafflastName'),
#             'dob': request.form.get('staffdob'),
#             'fileNumber': request.form.get('fileNumber'),
#             'department': request.form.get('department'),
#             'phone': request.form.get('staffpno'),
#             'staffippissNumber': request.form.get('staffippissNumber'),
#             'staffrank': request.form.get('staffrank'),
#             'staffsalgrade': request.form.get('staffsalgrade'),
#             'staffdateofpresentapt': request.form.get('staffdopa'),
#             'staffgender': request.form.get('gender'),
#             'stafforigin': request.form.get('stafforigin'),
#             'localgovorigin': request.form.get('localgovorigin'),
#             'qualification': request.form.get('qualification')
#         }
#        result = mongo.db.permanent_staff.update_one(
#             {'staff_id': staff_id},
#             {'$set': updated_staff}
#         )
#        if result.modified_count > 0:
#             flash('Staff updated successfully!', 'success')
#             log_reports(action='edit', staff_id=staff_id, details=f'Permanent staff updated by {current_user["username"]}({current_user["email"]}) from {current_user["department"]} department with File Number of {current_user["filenumber"]}')
#             return redirect(url_for('table_list'))
#     return render_template('edit_staff.html', title='Edit Staff', staff=staff)
# old endpoint for delete staff
# @app.route('/delete_staff/<string:staff_id>', methods=['GET', 'POST'])
# @admin_required
# @login_required
# def delete_staff(staff_id):
#     userbysession = session.get('email')
#     current_user = mongo.db.user.find_one({'email': userbysession})
#     staff = mongo.db.permanent_staff.find_one({'staff_id': staff_id})
#     if not staff:
#         flash('Staff not found', 'error')
#         return redirect(url_for('table_list'))
#     if request.method == 'POST':
#         mongo.db.permanent_staff.delete_one({'staff_id': staff_id})
#         flash('Staff deleted successfully!', 'success')
#         log_reports(action='delete', staff_id=staff_id, details=f'Permanent staff deleted by {current_user["username"]}({current_user["email"]}) from {current_user["department"]} department with File Number of {current_user["filenumber"]}')
#         print(f"{staff['firstName']} successfully deleted")
#         redirect(url_for('table_list'))
#     return render_template('delete_staff.html', title='Delete Staff', staff=staff)

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

# old promotion endpoint 
# @app.route('/Promotion', methods=['GET', 'POST'])
# @login_required
# def promotion():
#     """Promotion"""
#     return render_template('promotion.html', title='Promotion')

# new promotion endpoint
@app.route('/api/promotion', methods=['GET', 'POST'])
def promotion():
    print('Promotion endpoint hit!')
    staff_data = mongo.db.permanent_staff.find()
    processed_staff = []
    
    for staff in staff_data:
        staff['_id'] = str(staff['_id'])
        present_apt = datetime.strptime(staff['staffdateofpresentapt'], '%Y-%m-%d')
        
        if staff['stafftype'] == 'SSA':  # Junior Staff
            eligibility_date = calculate_junior_promotion(present_apt)
        elif staff['stafftype'] == 'JSA':  # Senior Staff
            eligibility_date = calculate_senior_promotion(present_apt)
        else:  # Senior Management
            eligibility_date = calculate_senior_management_promotion(present_apt)
        
        staff['promotion_eligibility_date'] = eligibility_date.strftime('%Y-%m-%d')
        processed_staff.append(staff)
    
    return jsonify({
        'data': processed_staff,
        'success': True,
    })

@app.route('/api/eligible-promotions', methods=['GET'])
def eligible_promotions():
    try:
        current_date = date.today()
        staff_data = mongo.db.permanent_staff.find()
        eligible_staff = []
        
        for staff in staff_data:
            staff['_id'] = str(staff['_id'])  # Convert ObjectId to string
            present_apt = datetime.strptime(staff['staffdateofpresentapt'], '%Y-%m-%d')
            
            if staff['stafftype'] == 'SSA':
                eligibility_date = calculate_junior_promotion(present_apt)
            elif staff['stafftype'] == 'JSA':
                eligibility_date = calculate_senior_promotion(present_apt)
            else:
                eligibility_date = calculate_senior_management_promotion(present_apt)
            
            staff['promotion_eligibility_date'] = eligibility_date.strftime('%Y-%m-%d')
            
            # Check if staff is eligible (current date >= eligibility date)
            if current_date >= eligibility_date:
                eligible_staff.append(staff)
        
        return jsonify({
            'data': eligible_staff,
            'success': True,
        })
    except Exception as e:
        print("Error occurred:", str(e))
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
# old lcm staff endpoint
# @app.route('/addlcmstaff', methods=['GET', 'POST'])
# @login_required
# def add_lcm():
#     """Add LCM Staff"""
#     print(session)
#     unique_id = str(uuid.uuid4())
#     print(unique_id)
#     if request.method == 'POST':
#         staff = {
#             'lcmstaff_id': unique_id,
#             'firstName': request.form.get('stafffirstName'),
#             'midName': request.form.get('staffmidName'),
#             'lastName': request.form.get('stafflastName'),
#             'dob': request.form.get('staffdob'),
#             'fileNumber': request.form.get('filenumber'),
#             'department': request.form.get('staffDepartment'),
#             'dateOfApt': request.form.get('staffdoa'),
#             'phone': request.form.get('staffpno')
#         }
#         # Add the staff to the LCM staff list
#         lcm_staff = mongo.db.lcm_staff.insert_one(staff)

#         if lcm_staff:
#             print('LCM staff added successfully!')
#             flash('LCM staff added successfully!', 'success')
#             return redirect(url_for('list_Lcm'))
#         else:
#             print('Failed to add LCM staff. Please try again.', 'danger')
#             flash('Failed to add LCM staff. Please try again.', 'danger')
#     return render_template('add_lcm.html', title='Add Locum Staffs')

# new lcm staff endpoint
@app.route('/api/add_lcm_staff', methods=['POST'])
def add_lcm_staff():
    print("add_lcm_staff route hit!")
    
    # Handle the incoming form data and file
    if 'profilePicture' not in request.files:
        return jsonify({'error': 'No profile picture uploaded'}), 400

    file = request.files['profilePicture']
    
    # Validate the file type
    if file and allowed_file(file.filename):
        # Secure the filename and save the file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

        # Ensure the upload folder exists
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])

        file.save(filepath)
        print(f"File saved to {filepath}")
    else:
        return jsonify({'error': 'Invalid file type'}), 400

    # Now that the file is uploaded, we can handle the rest of the form data
    data = request.form.to_dict()  # Use request.form to handle form data
    
    unique_id = str(uuid.uuid4())
    LcmStaff = {
        'lcmstaff_id': unique_id,
        'firstName': data.get('stafffirstName'),
        'midName': data.get('staffmidName'),
        'lastName': data.get('stafflastName'),
        'dob': data.get('staffdob'),
        'fileNumber': data.get('filenumber'),
        'department': data.get('staffDepartment'),
        'dateOfApt': data.get('staffdoa'),
        'phone': data.get('staffpno'),
        'staffType': data.get('staffType'),
        'conhessLevel': data.get('conhessLevel'),
        'salaryGrade': data.get('salary'),
        'qualification': data.get('qualification'),
        'gender': data.get('gender'),
        'rank': data.get('rank'),
        'staffphone': data.get('staffphone'),
        'stateOfOrigin': data.get('stateOfOrigin'),
        'localGovernment': data.get('localGovernment'),
        'profilePicture': filepath  # Add the file path here
    }
   
    # Insert staff data into the database
    lcm_staff = mongo.db.lcm_staff.insert_one(LcmStaff)

    if lcm_staff:
        return jsonify({
            'success': True,
            'message': 'LCM staff added successfully!'
        }), 201
    else:
        return jsonify({
            'success': False,
            'message': 'Failed to add LCM staff. Please try again.'
        }), 400

# old list of lcm staff endpoint
# @app.route('/listlcmstaff', methods=['GET', 'POST'])
# @login_required
# def list_Lcm():
#     """List_Lcm"""
#     lcm_staff_list = mongo.db.lcm_staff.find()
#     return render_template('list_lcm.html', title='List of Locum Staffs', staff=lcm_staff_list)

# new list of lcm staff endpoint
@app.route('/api/list_lcm_staff', methods=['GET'])
def list_lcm_staff():
    lcm_staff_list = list(mongo.db.lcm_staff.find())
    if not lcm_staff_list:
        return jsonify({'message': 'No LCM staff found'}), 404
    else:
        # Convert MongoDB results to JSON-serializable format
        return json.loads(json_util.dumps({'staff': lcm_staff_list}))

# old edit lcm staff endpoint
# @app.route('/edit_lcmstaff/<string:staff_id>', methods=['GET', 'POST'])
# @admin_required
# @login_required
# def edit_lcmstaff(staff_id):
#     """This helps edit staff"""
#     userbysession = session.get('email')
#     current_user = mongo.db.user.find_one({'email': userbysession})
#     staff = mongo.db.lcm_staff.find_one({'lcmstaff_id': staff_id})
#     if not staff:
#         flash('Staff not found', 'error')
#         return redirect(url_for('list_Lcm'))
#     if request.method == 'POST':
#         updated_lcmstaff = {
#             'firstName': request.form.get('stafffirstName'),
#             'midName': request.form.get('staffmidName'),
#             'lastName': request.form.get('stafflastName'),
#             'dob': request.form.get('staffdob'),
#             'fileNumber': request.form.get('stafffileNumber'),
#             'department': request.form.get('staffdepartment'),
#             'dateOfApt': request.form.get('staffdateOfApt'),
#             'phone': request.form.get('staffphone')
#         }
#         result = mongo.db.lcm_staff.update_one(
#             {'lcmstaff_id': staff_id},
#             {'$set': updated_lcmstaff}
#         )
#         if result.modified_count > 0:
#             flash('LCM staff updated successfully!', 'success')
#             log_reports(action='edit', staff_id=staff_id, details=f'LCM staff updated by {current_user["username"]}({current_user["email"]}) from {current_user["department"]} department with File Number of {current_user["filenumber"]}')
#         else:
#             flash('No changes made to the LCM staff.', 'info')
        
#         return redirect(url_for('list_Lcm'))
#     return render_template('edit_lcmstaff.html', title="Edit LCM Staff", staff=staff)

# old delete lcm staff endpoint
# @app.route('/delete_lcmstaff/<string:staff_id>', methods=['GET', 'POST'])
# @admin_required
# @login_required
# def delete_lcmstaff(staff_id):
#     """This helps delete staff"""
#     staff = mongo.db.lcm_staff.find_one({'lcmstaff_id': staff_id})
#     userbysession = session.get('email')
#     current_user = mongo.db.user.find_one({'email': userbysession})
#     if not staff:
#         flash('Staff not found', 'error')
#         return redirect(url_for('list_Lcm'))
#     if request.method == 'POST':
#         mongo.db.lcm_staff.delete_one({'lcmstaff_id': staff_id})
#         flash('Staff deleted successfully!', 'success')
#         log_reports(action='delete', staff_id=staff_id, details=f'LCM staff deleted by {current_user["username"]}({current_user["email"]}) from {current_user["department"]} department with File Number of {current_user["filenumber"]}')
#         print(f"{staff['firstName']} successfully deleted")
#         redirect(url_for('list_Lcm'))
#     return render_template('delete_lcmstaff.html', title='Delete LCM Staff', staff=staff)
        
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
    print("Sample report date:", reports[0]['date'] if reports else None)  # Debug print
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

