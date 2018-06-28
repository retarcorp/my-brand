module.exports = {

	init: function() {

		this.Client = require('mongodb').MongoClient;
		this.Assert = require('assert');

		this.URL = 'mongodb://localhost:27017/MyBrand';
		this.DB = 'MyBrand';

		this.trace();

		console.log('Successfully init');

		return this;
	}

	,trace: function() {
		this.Client.connect(this.URL, (error, client) => {
			this.Assert.equal(null, error);
			console.log('Successfully conected to MongoDB');

			db = client.db(this.DB);

			client.close();
		});
	}

	,connect: function(callback) {
		this.Client.connect(this.URL, (error, client) => {
			this.Assert.equal(null, error);
			db = client.db(this.DB);

			callback(db);			

			client.close();
		});
	}

	,insert: function(data, collection, callback) {
		this.connect( (db) => {
			let coll = db.collection(collection);

			//console.log(data, collection, coll);

			if (!data.length) data = [data];

			coll.insertMany(data, (err, data) => {
				this.Assert.equal(err, null);
				
				if (callback) callback({ status: true });

				console.log('Data inserted');
			});
		});
	}

	,select: function(key, collection, callback) {
		this.connect( (db) => {
			let coll = db.collection(collection);

			if (!(typeof key == 'object')) key = {};

			coll.find(key).toArray( (err, data) => {
				this.Assert.equal(err, null);

				if (callback) callback(data);
				console.log('Data ejected');
			});
		});
	}

	,update: function(key, change, collection, callback) {
		this.connect( (db) => {
			let coll = db.collection(collection);

			if (!(typeof key == 'object')) key = {};
			if (!(typeof change == 'object')) change = {};

			coll.updateMany(key, { $set: change }, { upsert: true }, (err, data) => {
				this.Assert.equal(err, null);
				
				if (callback) callback(data);
				console.log('Data updated');
			});
		});
	}

	,delete: function(key, collection, callback) {
		this.connect( (db) => {
			let coll = db.collection(collection);

			if (!(typeof key == 'object')) key = { nothingToDelete: Infinity };

			coll.removeMany(key, (err, data) => {
				this.Assert.equal(err, null);

				if (callback) callback(data);

				console.log('Data deleted');
			});
		});
	}

	,drop: function(collection, callback) {
		this.connect( (db) => {
			let coll = db.collection(collection);

			if (!collection.length) return;

			coll.drop( (err, data) => {
				if (err) throw err;

				if (callback) callback(data);

				console.log('Collection deleted');
			});
		});
	}
}