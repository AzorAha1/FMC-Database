#!/usr/bin/python3
import bcrypt
from flask import Flask, render_template, request, redirect, url_for, session
from flask_pymongo import PyMongo

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/statics')
app.secret_key = 'secretkeyforfmcdatabase'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/fmc-database'
mongo = PyMongo(app)

@app.route('/', methods=['GET'])
@app.route('/login', methods=['GET', 'POST'])
def login():
    """index file"""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        # Ensure the collection is properly assigned
        user_collection = mongo.db.user

        # Check if the user exists
        user = user_collection.find_one({'email': email})
        if user:
            # Check if the password is correct
            if bcrypt.checkpw(password.encode('utf-8'), user['password']):
                session['email'] = email
                return redirect(url_for('dashboard'))
            else:
                return 'Invalid email or password', 400
        else:
            return 'Invalid email or password', 400
    return render_template('login.html', title='Login ')

@app.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    """dashboard file"""
    return render_template('dashboard.html', title='Dashboard')

@app.route('/addstaff', methods=['GET', 'POST'])
def staff():
    """Add Staff"""
    return render_template('add_staff.html', title='Add Permanent and Pensionable')
@app.route('/Listofstaff', methods=['GET', 'POST'])
def table_list():
    """List of Staff"""
    return render_template('list.html', title='List of Permanent and Pensionable')
@app.route('/Confirmation', methods=['GET', 'POST'])
def confirmation():
    """Confirmation"""
    return render_template('confirmation.html', title='Confirmation')

@app.route('/Promotion', methods=['GET', 'POST'])
def promotion():
    """Promotion"""
    return render_template('promotion.html', title='Promotion')

@app.route('/AddLCM Staff', methods=['GET', 'POST'])
def add_lcm():
    """Add_lcm"""
    return render_template('add_lcm.html', title='Add Locum Staffs')

@app.route('/ListofLCM Staff', methods=['GET', 'POST'])
def list_Lcm():
    """List_Lcm"""
    return render_template('list_lcm.html', title='List of Locum Staffs')

@app.route('/AddUser', methods=['GET', 'POST'])
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
        # if not all([email, username, filenumber, staffphone, department, password]):
        #     return "All fields are required", 400

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
if __name__ == '__main__':
    app.run(debug=True)

