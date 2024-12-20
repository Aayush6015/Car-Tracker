from pymongo import MongoClient

class Location:
    def __init__(self, car_id, latitude, longitude):
        self.car_id = car_id
        self.latitude = latitude
        self.longitude = longitude

    def save(self):
        client = MongoClient("mongodb+srv://bithional:s0LBYODtMW33omOK@cluster.oou5h.mongodb.net/")
        db = client['car_tracking']
        locations = db['locations']
        locations.update_one(
            {'car_id': self.car_id},
            {'$set': {'latitude': self.latitude, 'longitude': self.longitude}},
            upsert=True
        )
