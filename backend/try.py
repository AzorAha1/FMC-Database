#!/usr/bin/python3
from datetime import datetime

current_time = datetime.utcnow()
formatted_time = current_time.strftime('%Y-%m-%d %H:%M %p')
print(formatted_time)