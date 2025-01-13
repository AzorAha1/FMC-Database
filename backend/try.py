#!/usr/bin/python3
# from datetime import datetime

# current_time = datetime.utcnow()
# formatted_time = current_time.strftime('%Y-%m-%d %H:%M %p')
# print(formatted_time)

# print('Menu: ')
# print('1. Pizza - 6500')
# print('2. Burger - 3000')
# print('3. Noodles - 1300')
# print('4. Exit')

# def get_user_choice():
#     try:
#         choice = int(input('Enter Choice: '))
#         if choice > 4 or choice < 1:
#             return 'Invalid input. Please enter a valid number'
#     except ValueError:
#         return 'Invalid input. Please enter a valid number'
#     return choice

# def get_quantity():
#     try: 
#         quantity = int(input('Enter Quantity: '))
#         if quantity < 0 or quantity == 0:
#             return 'Quantity must be greater than 0'
#     except ValueError:
#         return ValueError('Invalid input. Please enter a valid number')
#     return quantity
# def get_item_name(choice):
#     if choice == 1:
#         return "Pizza"
#     elif choice == 2:
#         return "Burger"
#     elif choice == 3:
#         return "Noodles"
#     else:
#         exit()
# def get_item_price(choice):
#     if choice == 1:
#         return 6500
#     elif choice == 2:
#         return 3000
#     elif choice == 3:
#         return 1300
#     if choice == 4:
#         exit()
#     else:
#         print('invalid number')
# def cal_total_price(item_price, quantity):
#     totalitemprice = item_price * quantity
#     return totalitemprice

# def place_order():
#     order_dict = {}
#     while True:
#         user_choice = get_user_choice()
#         if user_choice == 4:
#             break  # Exit the loop if the user chooses option 4 (Exit)
        
#         quantity = get_quantity()
#         item_name = get_item_name(user_choice)
#         item_price = get_item_price(user_choice)
#         total_price = cal_total_price(quantity=quantity, item_price=item_price)

#         print(f'The user choice is {user_choice}, which is {item_name}, and the quantity is {quantity} with a total price of {total_price}')

#         if item_name in order_dict:
#             order_dict[item_name]['quantity'] += quantity
#             order_dict[item_name]['total_price'] += total_price
#         else:
#             order_dict[item_name] = {
#                 'quantity': quantity,
#                 'total_price': total_price
#             }
#     return order_dict  # Return the dictionary after the loop ends

# def check_out(cart):
#     if not cart:
#         return 'cart empty'
#     else:
#         for key, value in cart.items():
#             print(f'{key} - {value.quantity}')
#     return cart

# {
#     _id: ObjectId('6780d9bfe469b043b1e20d02'),
#     staff_id: 'fe244388-cc11-4aa6-bd36-452805fbce26',
#     firstName: 'Bashir',
#     midName: '',
#     lastName: 'Adamu',
#     stafftype: 'SSA',
#     dob: '2000-01-10',
#     fileNumber: '338',
#     department: 'IT',
#     staffdateoffirstapt: '2001-01-01',
#     staffpno: '08036304601',
#     staffippissNumber: '177510',
#     staffrank: 'Chief Program Analyst',
#     staffsalgrade: 'CONHESS 12/10',
#     staffdateofpresentapt: '2023-01-01',
#     staffgender: 'Male',
#     stafforigin: 'Kano',
#     localgovorigin: 'Kano Municipal',
#     qualification: 'Software Engineer',
#     conhessLevel: 'CONHESS 12',
#     confirmation_status: 'confirmed',
#     created_at: ISODate('2025-01-10T08:26:39.344Z'),
#     updated_at: ISODate('2025-01-10T08:26:39.344Z'),
#     profilePicture: 'unnamed.jpg'
#   }
# ]
# fmc-database> db.permanent_staff.find()