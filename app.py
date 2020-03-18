import os
from app import create_app, socketio

config_name = os.getenv('FLASK_ENV')
app = create_app(config_name)

socketio.run(app, host="0.0.0.0")
