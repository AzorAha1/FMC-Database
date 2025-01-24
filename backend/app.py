#!/usr/bin/python3
from datetime import date, timedelta, datetime, timezone
from flask_cors import CORS
from bson import json_util
import os
from functools import wraps
from unittest import result
import bcrypt
from bson import ObjectId
from flask import Flask, flash, json, render_template, request, redirect, url_for, session, jsonify, send_from_directory
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

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

mongo = PyMongo(app)

@app.route('/uploads/<filename>')
def serve_file(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except FileNotFoundError:
        return 'File not found', 404


#calculate exit by retirement at 60 and by 35 years of service from dateoffirstapt
def calculate_retirement_date(staff_data):
    """Calculate retirement date based on date of first apt or years of service"""
    try:
        date_of_first_apt = datetime.strptime(staff_data['staffdateoffirstapt'], "%Y-%m-%d")
        retirement_service = date_of_first_apt + timedelta(days=35*365)
        retirement_age = date_of_first_apt + timedelta(days=60*365)
        return min(retirement_service, retirement_age)
    except (ValueError, KeyError):
        return None

def calculate_promotion_start_date(present_apt):
    """Calculate the promotion start date based on appointment date"""
    present_apt_date = present_apt.date() if isinstance(present_apt, datetime) else present_apt
    year_of_appointment = present_apt_date.year
    january_first = date(year_of_appointment, 1, 1)
    
    if present_apt_date > january_first:
        return date(year_of_appointment + 1, 1, 1)
    return present_apt_date

def calculate_promotion_eligibility(present_apt, years_required):
    """Calculate promotion eligibility based on start date and required years"""
    start_date = calculate_promotion_start_date(present_apt)
    return date(start_date.year + years_required, start_date.month, start_date.day)

def get_conhess_level(conhess_str):
    """Extract numeric level from CONHESS string"""
    try:
        return int(conhess_str.split(' ')[-1])
    except (ValueError, IndexError):
        return 0

def calculate_promotion(staff_data):
    """Calculate promotion eligibility date based on staff type and level"""
    try:
        present_apt = datetime.strptime(staff_data['staffdateofpresentapt'], '%Y-%m-%d')
        staff_type = staff_data['stafftype']
        conhess_level = get_conhess_level(staff_data['conhessLevel'])
        
        if staff_type == 'JSA':
            return calculate_promotion_eligibility(present_apt, 2)  # 2 years for junior staff
        elif staff_type == 'SSA':
            if conhess_level <= 13:
                return calculate_promotion_eligibility(present_apt, 3)  # 3 years for senior staff
            else:
                return calculate_promotion_eligibility(present_apt, 4)  # 4 years for senior management
        return None
    except (ValueError, KeyError):
        return None


def login_required(func):
    """Checks if the user is logged in."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'email' not in session:
            # Return a JSON response for API calls
            return jsonify({'error': 'Unauthorized', 'redirect': '/api/login'}), 401
        return func(*args, **kwargs)
    return wrapper

def admin_required(func):
    """Checks if the user is an admin."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        if session.get('role') != 'admin-user':
            # Return a JSON response for API calls
            return jsonify({'error': 'Forbidden', 'redirect': '/api/dashboard'}), 403
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
@login_required
@admin_required
def test():
    return jsonify({"message": "Test successful"})
@app.route('/', methods=['GET'])
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    remember_me = data.get('rememberMe', False)  # Get "Remember Me" value

    user_collection = mongo.db.user
    user = user_collection.find_one({'email': email})
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        if user.get('role') == 'admin-user' or user.get('role') == 'user':
            session['email'] = email
            session['role'] = user['role']

            # Set session permanence based on "Remember Me"
            if remember_me:
                session.permanent = True
                app.permanent_session_lifetime = timedelta(days=30)  # 30 days
            else:
                session.permanent = False  # Session expires when browser closes

            response = jsonify({
                'success': True, 
                'redirectUrl': url_for('dashboard'),
                'user': {
                    'email': email,
                    'role': user.get('role'),
                    'isAdmin': user.get('role') == 'admin-user'
                }
            })
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
@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    if 'email' in session:
        return jsonify({'role': session.get('role')}), 200
    else:
        return jsonify({'error': 'Session expired', 'redirect': '/login'}), 401
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
@login_required
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



@app.route('/api/add_staff', methods=['GET', 'POST'])
@login_required
# @admin_required
def add_staff():
    try:
        print("add_staff route hit!")
        data = request.form.to_dict()
        print("Received data:", data)

        # File handling
        profile_picture_filename = None
        if 'profilePicture' in request.files:
            file = request.files['profilePicture']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                profile_picture_filename = filename
            else:
                return jsonify({
                    'success': False,
                    'message': 'Invalid file format. Only PNG, JPG, JPEG and GIF files are allowed'
                }), 400

        # Function to validate and parse date fields
        def parse_date(date_string):
            if not date_string:
                return None
            try:
                return datetime.strptime(date_string, '%Y-%m-%d')
            except ValueError as e:
                print(f"Date parsing error: {str(e)}")
                return None

        # Parse all date fields
        staff_date_of_first_appointment = parse_date(data.get('staffdofa'))
        staff_date_of_present_appointment = parse_date(data.get('staffdateofpresentapt'))
        staff_dob = parse_date(data.get('staffdob'))

        # Validate required date fields
        if staff_date_of_first_appointment is None:
            return jsonify({
                'success': False,
                'message': 'Invalid or missing Date of First Appointment (staffdofa). Expected format: YYYY-MM-DD.'
            }), 400
        
        if staff_date_of_present_appointment is None:
            return jsonify({
                'success': False,
                'message': 'Invalid or missing Date of Present Appointment (staffdateofpresentapt). Expected format: YYYY-MM-DD.'
            }), 400
        
        if staff_dob is None:
            return jsonify({
                'success': False,
                'message': 'Invalid or missing Date of Birth (staffdob). Expected format: YYYY-MM-DD.'
            }), 400

        # Calculate confirmation status
        two_years = timedelta(days=730)
        current_time = datetime.utcnow()
        confirmation_status = 'confirmed' if current_time - staff_date_of_first_appointment > two_years else 'unconfirmed'

        # Validate required fields
        required_fields = [
            'stafffirstName',
            'stafflastName',
            'stafftype',
            'fileNumber',
            'department',
            'staffpno',
            'staffippissNumber',
            'staffrank',
            'staffsalgrade',
            'staffgender',
            'stafforigin',
            'localgovorigin',
            'qualification',
            'conhessLevel'
        ]

        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        # calculate the retirement date
        retirement_date = calculate_retirement_date({
            'staffdateoffirstapt': staff_date_of_first_appointment.strftime('%Y-%m-%d'),
            'dob': staff_dob.strftime('%Y-%m-%d')
        })
        if retirement_date is not None:
            is_active = current_time < retirement_date
        else:
            is_active = True
        # Prepare staff document
        staff = {
            'staff_id': str(uuid.uuid4()),
            'firstName': data['stafffirstName'],
            'midName': data.get('staffmidName', ''),
            'lastName': data['stafflastName'],
            'stafftype': data['stafftype'],
            'dob': staff_dob.strftime('%Y-%m-%d'),
            'fileNumber': data['fileNumber'],
            'department': data['department'],
            'staffdateoffirstapt': staff_date_of_first_appointment.strftime('%Y-%m-%d'),
            'staffpno': data['staffpno'],
            'staffippissNumber': data['staffippissNumber'],
            'staffrank': data['staffrank'],
            'staffsalgrade': data['staffsalgrade'],
            'staffdateofpresentapt': staff_date_of_present_appointment.strftime('%Y-%m-%d'),
            'staffgender': data['staffgender'],
            'stafforigin': data['stafforigin'],
            'localgovorigin': data['localgovorigin'],
            'qualification': data['qualification'],
            'conhessLevel': data['conhessLevel'],
            'is_active': is_active,
            'confirmation_status': confirmation_status,
            'created_at': current_time,
            'updated_at': current_time
        }

        # Add profile picture filename if file was uploaded
        if profile_picture_filename:
            staff['profilePicture'] = profile_picture_filename

        # Validate phone number format
        phone_number = data.get('staffpno', '')
        if not phone_number.isdigit() or len(phone_number) != 11:
            return jsonify({
                'success': False,
                'message': 'Invalid phone number format. Must be 11 digits.'
            }), 400

        # Validate IPPISS number
        ippiss_number = data.get('staffippissNumber', '')
        if not ippiss_number.isdigit():
            return jsonify({
                'success': False,
                'message': 'Invalid IPPISS number format. Must contain only digits.'
            }), 400
        
        
        
        try:
            # Insert into database
            permanent_staff = mongo.db.permanent_staff.insert_one(staff)
            
            if permanent_staff:
                return jsonify({
                    'success': True,
                    'message': 'Permanent staff added successfully!',
                    'staff_id': str(permanent_staff.inserted_id)
                }), 201
            else:
                return jsonify({
                    'success': False,
                    'message': 'Failed to add Permanent staff. Database insertion failed.'
                }), 400

        except Exception as db_error:
            print(f"Database error: {str(db_error)}")
            # If database insertion fails, delete uploaded file if it exists
            if profile_picture_filename:
                try:
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], profile_picture_filename)
                    if os.path.exists(filepath):
                        os.remove(filepath)
                except Exception as file_error:
                    print(f"Failed to delete file after database error: {str(file_error)}")
            
            return jsonify({
                'success': False,
                'message': 'Database error occurred while adding staff.'
            }), 500

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        # Clean up file if it was uploaded but processing failed
        if profile_picture_filename:
            try:
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], profile_picture_filename)
                if os.path.exists(filepath):
                    os.remove(filepath)
            except Exception as cleanup_error:
                print(f"Failed to clean up file after error: {str(cleanup_error)}")
        
        return jsonify({
            'success': False,
            'message': f'An unexpected error occurred: {str(e)}'
        }), 500

#new endpoint to edit and delete staff
@app.route('/api/manage_staff/<string:staff_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
@admin_required
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
@login_required
@admin_required
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
@app.route('/api/liststaffs', methods=['GET', 'POST'])
@login_required
def list_staff():
    """list of staffs"""
    # page = int(request.args.get('page', 1))
    # limit = int(request.args.get('limit'), 1)
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
@app.route('/api/confirmation', methods=['GET'])
@login_required
def confirmation():
    """Confirmation endpoint"""
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit
    staff_data = mongo.db.permanent_staff.find({}, {
        'staff_id': 1,
        'firstName': 1,
        'midName': 1,
        'lastName': 1,
        'fileNumber': 1,
        'department': 1,
        'stafftype': 1,
        'staffsalgrade': 1,
        'staffrank': 1,
        'conhessLevel': 1,
        'staffdateoffirstapt': 1,
        'staffdateofpresentapt': 1,
        'profilePicture': 1,
        'confirmation_status': 1,
        'daysUntilConfirmation': 1
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

        profile_picture = staff.get('profilePicture')
        if profile_picture:
            profile_picture = profile_picture.split('/')[-1]
            profile_picture = f'/uploads/{profile_picture}'

        # Determine status
        if isEligible:
            if staff.get('confirmation_status') == 'confirmed':
                status = 'confirmed'
            else:
                status = 'awaiting_confirmation'
        else:
            status = 'pending'

        # Update the staff record in the database
        mongo.db.permanent_staff.update_one(
            {'staff_id': staff['staff_id']},
            {'$set': {
                'confirmation_status': status,
                'daysUntilConfirmation': max(0, days_until_confirmation)
            }}
        )

        result.append({
            'staff_id': staff['staff_id'],
            'firstName': staff.get('firstName', ''),
            'midName': staff.get('midName', ''),
            'lastName': staff.get('lastName', ''),
            'fileNumber': staff.get('fileNumber', ''),
            'department': staff.get('department', ''),
            'stafftype': staff.get('stafftype', ''),
            'staffsalgrade': staff.get('staffsalgrade', ''),
            'staffrank': staff.get('staffrank', ''),
            'conhessLevel': staff.get('conhessLevel', ''),
            'staffdateoffirstapt': staff['staffdateoffirstapt'],
            'staffdateofpresentapt': staff.get('staffdateofpresentapt', ''),
            'profilePicture': profile_picture,
            'isEligible': isEligible,
            'daysUntilConfirmation': max(0, days_until_confirmation),
            'confirmation_status': status
        })

    return jsonify({
        'data': result,
        'totalPages': totalPages,
        'currentPage': page,
        'totalStaffs': total_staffs
    })
from datetime import datetime, timedelta
# new confirmation endpoint
@app.route('/api/confirm_staff/<staff_id>', methods=['POST'])
@login_required
def confirm_staff(staff_id):
    if not staff_id:
        return jsonify({'error': 'Staff ID is required'}), 400

    # Find the staff member in the database
    staff = mongo.db.permanent_staff.find_one({'staff_id': staff_id})
    if not staff:
        return jsonify({'error': 'Staff not found'}), 404

    # Validate the current status
    if staff.get('confirmation_status') != 'awaiting_confirmation':
        return jsonify({'error': 'Staff is not eligible for confirmation'}), 400

    # Update the confirmation status
    mongo.db.permanent_staff.update_one(
        {'staff_id': staff_id},
        {'$set': {'confirmation_status': 'confirmed'}}
    )
    return jsonify({'message': 'Staff confirmed successfully'}), 200

@app.route('/api/promotion', methods=['GET', 'POST'])
@login_required
def promotion():
    print('Promotion endpoint hit!')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit  
    staff_data = mongo.db.permanent_staff.find().skip(skip).limit(limit)
    total_staffs = mongo.db.permanent_staff.count_documents({})
    total_pages = (total_staffs // limit) + (1 if total_staffs % limit > 0 else 0)
    processed_staff = []
    
      
    for staff in staff_data:
        staff['_id'] = str(staff['_id'])
        eligibility_date = calculate_promotion(staff)
        
        if eligibility_date:
            staff['promotion_eligibility_date'] = eligibility_date.strftime('%Y-%m-%d')
            processed_staff.append(staff)
    
    return jsonify({
        'data': processed_staff,
        'totalPages': total_pages,
        'currentPage': page,
        'totalStaffs': total_staffs,
        'success': True,
    })

@app.route('/api/eligible-promotions', methods=['GET'])
@login_required
def eligible_promotions():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        skip = (page - 1) * limit
        current_date = date.today()
        staff_data = mongo.db.permanent_staff.find().skip(skip).limit(limit)
        total_staffs = mongo.db.permanent_staff.count_documents({})
        total_pages = (total_staffs // limit) + (1 if total_staffs % limit > 0 else 0)
        eligible_staff = []
        
        for staff in staff_data:
            staff['_id'] = str(staff['_id'])
            eligibility_date = calculate_promotion(staff)
            
            if eligibility_date:
                staff['promotion_eligibility_date'] = eligibility_date.strftime('%Y-%m-%d')
                if current_date >= eligibility_date:
                    eligible_staff.append(staff)
        
        return jsonify({
            'data': eligible_staff,
            'totalPages': total_pages,
            'currentPage': page,
            'totalStaffs': total_staffs,
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
@login_required
# @admin_required
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
@login_required
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
        
# old add user endpoint 
# @app.route('/AddUser', methods=['GET', 'POST'])
# # @login_required
# # @admin_required
# def add_user():
#     """Add user"""
#     users = mongo.db.user.find()
#     if request.method == 'POST':
#         email = request.form.get('staffemail')
#         role = request.form.get('role')
#         username = request.form.get('username')
#         filenumber = request.form.get('filenumber')
#         staffphone = request.form.get('staffpno')
#         department = request.form.get('userDepartment')
#         password = request.form.get('password')

#         # Check if all fields are filled
#         if not all([email, username, filenumber, staffphone, department, password]):
#             flash("All fields are required", "danger")
#             return redirect(url_for('add_user'))

#         # Hash the password
#         hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

#         # Ensure the collection is properly assigned
#         new_user = {
#             'email': email,
#             'username': username,
#             'role': role, 
#             'filenumber': filenumber,
#             'staffphone': staffphone,
#             'department': department,
#             'password': hashed_password
#         }
#         for user in users:
#             if user['email'] == email:
#                 flash('User already exists', 'danger')
#                 print('User already exists')
#                 return redirect(url_for('add_user'))
#         else:
#             flash('User added successfully', 'success')
#             user = mongo.db.user.insert_one(new_user)
#             print(f'User added: {user}')
#             return redirect(url_for('dashboard'))

#     return render_template('add_user.html', title='Add User')

#exit management 
@app.route('/api/exit_management', methods=['GET', 'POST'])
@login_required
def exit_management():
    if request.method == 'GET':
        try:
            # Fetch inactive staff
            inactive_staffs = mongo.db.permanent_staff.find({'is_active': False})
            result = []
            for staff in inactive_staffs:
                result.append({
                    'employee_id': staff['staff_id'],
                    'employee_name': f"{staff['firstName']} {staff['midName']} {staff['lastName']}".strip(),
                    'employee_ippiss_number': staff['staffippissNumber'],
                    'employee_file_number': staff['fileNumber'],
                    'employee_department': staff['department'],
                    'employee_date_of_exit': staff.get('exit_date', ''),
                    'employee_exit_reason': staff.get('exit_reason', '')
                })
            return jsonify({'exit': result, 'success': True}), 200
        except Exception as e:
            return jsonify({'error': str(e), 'success': False}), 500
    elif request.method == 'POST':
        try:
            data = request.get_json()
            staff_id = data.get('staff_id')
            exit_reason = data.get('exit_reason')
            exit_date = data.get('exit_date')
            if not all([staff_id, exit_reason, exit_date]):
                return jsonify({'error': 'All fields are required', 'success': False}), 400

            # Validate exit reason
            if exit_reason not in ['death', 'dismissal', 'voluntarily']:
                return jsonify({'error': 'Invalid exit reason', 'success': False}), 400

            # Update the staff member's record
            mongo.db.permanent_staff.update_one(
                {'staff_id': staff_id},
                {
                    '$set': {
                        'is_active': False,
                        'exit_reason': exit_reason,
                        'exit_date': exit_date
                    }
                }
            )
            return jsonify({
                'message': 'Staff marked as inactive successfully',
                'success': True
            }), 200
        except Exception as e:
            print(f"An error occurred: {str(e)}")
            return jsonify({'error': str(e), 'success': False}), 500
        
@app.route('/api/active_staff', methods=['GET'])
@login_required
def active_staff():
    try:
        # Fetch active staff
        active_staffs = mongo.db.permanent_staff.find({'is_active': True})
        result = []
        for staff in active_staffs:
            result.append({
                'staff_id': staff['staff_id'],
                'staffNumber': f"{staff['stafftype']}-{staff['fileNumber']}",
                'firstName': staff['firstName'],
                'lastName': staff['lastName'],
                'department': staff['department']
            })
            print(result)
        return jsonify({'active': result, 'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500
    
# fetch inactivestaffs 
@app.route('/api/inactive_staff', methods=['GET'])
@login_required
def inactive_staff():
    try:
        inactive_staff = mongo.db.permanent_staff.find({'is_active': False})
        result = []
        for staff in inactive_staff:
            result.append({
                'staff_id': staff['staff_id'],
                'firstName': staff['firstName'],
                'lastName': staff['lastName'],
                'department': staff['department'],
                'exit_date': staff['exit_date'],
                'exit_reason': staff['exit_reason'],
                'staffNumber': f"{staff['stafftype']}-{staff['fileNumber']}"
            })
        print(result)
        return jsonify({'inactive': result,  'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500



    
# new add user endpoint 
@app.route('/api/add_user', methods=['POST'])
@login_required
@admin_required
def add_user():
    try:
        data = request.get_json()
        
        # Extract fields from request data
        email = data.get('email')
        role = data.get('role')
        username = data.get('username')
        filenumber = data.get('filenumber')
        staffphone = data.get('staffphone')
        department = data.get('department')
        password = data.get('password')
        
        # Check if all required fields are present
        required_fields = [email, username, filenumber, staffphone, department, password]
        if not all(required_fields):
            return jsonify({
                'success': False,
                'message': 'All fields are required'
            }), 400
            
        # Check if user already exists
        existing_user = mongo.db.user.find_one({'email': email})
        if existing_user:
            return jsonify({
                'success': False,
                'message': 'User with this email already exists'
            }), 400
            
        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Create new user document
        new_user = {
            'email': email,
            'username': username,
            'role': role,
            'filenumber': filenumber,
            'staffphone': staffphone,
            'department': department,
            'password': hashed_password
        }
        
        # Insert user into database
        result = mongo.db.user.insert_one(new_user)
        
        if result.inserted_id:
            return jsonify({
                'success': True,
                'message': 'User added successfully'
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to add user'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500
@app.route('/api/userlist', methods=['GET', 'POST'])
@login_required
@admin_required
def user_list():
    try:
        # Just exclude password, all other fields will be included by default
        users = list(mongo.db.user.find({}, {'password': 0}))
        
        return json.loads(json_util.dumps(users)), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500
# @login_required
# @admin_required
# def user_list():
#     """List of Users"""
#     users = mongo.db.user.find()
#     return render_template('user_list.html', title='List of Users', users=users)
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
@login_required
def reports():
    reports = list(mongo.db.reports.find().sort('date', DESCENDING))
    print("Sample report date:", reports[0]['date'] if reports else None)  # Debug print
    return json_util.dumps({'reports': reports})

@app.route('/api/logout', methods=['GET'])
def logout():
    """Logout the user by clearing the session."""
    session.pop('email', None)  # Clear the user's email from the session
    session.pop('role', None)   # Clear the user's role from the session
    session.clear()             # Clear the entire session
    print('Session cleared:', session)  # Debugging: Print the session after clearing
    print('User is logged out')         # Debugging: Confirm logout
    return jsonify({'success': True, 'redirectUrl': url_for('login')}) 


if __name__ == '__main__':
    app.run(debug=True, port=5003, host='0.0.0.0')

