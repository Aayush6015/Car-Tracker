from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from pymongo import MongoClient

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

# MongoDB setup
client = MongoClient("mongodb+srv://bithional:s0LBYODtMW33omOK@cluster.oou5h.mongodb.net/")
db = client['car_tracking']
locations_collection = db['locations']

@app.route('/')
def index():
    """User page to view all car locations."""
    return render_template('index.html')

@app.route('/driver')
def driver():
    """Driver page to share location."""
    return render_template('driver.html')

@app.route('/get_locations', methods=['GET'])
def get_locations():
    """API to fetch all car locations."""
    locations = list(locations_collection.find({}, {"_id": 0}))  # Exclude MongoDB ID
    return jsonify(locations)

@socketio.on('update_location')
def handle_location(data):
    """
    WebSocket event: Update car location from driver.
    - `data`: {'car_id': int, 'latitude': float, 'longitude': float}
    """
    car_id = data['car_id']
    latitude = data['latitude']
    longitude = data['longitude']

    # Save or update location in MongoDB
    locations_collection.update_one(
        {'car_id': car_id},
        {'$set': {'latitude': latitude, 'longitude': longitude}},
        upsert=True
    )

    # Broadcast the new location to all users
    emit('location_update', data, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
