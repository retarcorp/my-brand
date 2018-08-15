module.exports = {

	init: function() {

		this.Client = require('mongodb').MongoClient;
		this.ObjectId = require('mongodb').ObjectID;
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

			this.cli = client;
			this.db = this.cli.db(this.DB);
			db = client.db(this.DB);

            //client.close();
		});
	}

	,connect: function(callback) {
		this.Client.connect(this.URL, (error, client) => {
			this.Assert.equal(null, error);
			db = client.db(this.DB);

			callback(db, client);

			// client.close();
		});
	}

	,insert: function(data, collection, callback) {
		// this.connect( (db, client) => {
			let coll = this.db.collection(collection);

			//console.log(data, collection, coll);

			if (!data.length) data = [data];

			coll.insertMany(data, (err, data) => {
				this.Assert.equal(err, null);
				
				if (callback) callback({ status: true });

				console.log('Data inserted');

                //client.close();
			});
		// });
	}

	,select: function(key, collection, callback) {
		// this.connect( (db, client) => {
			let coll = this.db.collection(collection);

			if (!(typeof key == 'object')) key = {};

			coll.find(key).toArray( (err, data) => {
				this.Assert.equal(err, null);

				if (callback) callback(data);
				console.log('Data ejected');

                //client.close();
			});
		// });
	}

	,update: function(key, change, collection, callback) {
		// this.connect( (db, client) => {
			let coll = this.db.collection(collection);

			if (!(typeof key == 'object')) key = {};
			if (!(typeof change == 'object')) change = {};

			coll.update(key, { $set: change }, { upsert: true }, (err, data) => {
				this.Assert.equal(err, null);
				
				if (callback) callback(data);
				console.log('Data updated');

                //client.close();
			});
		// });
	}

	,count: function(key, collection, callback) {
		// this.connect( (db, client) => {
			let coll = this.db.collection(collection);

			if (typeof key !== 'object') key = {};

			coll.countDocuments(key)
				.then( (count) => {
					(callback) ? callback(count) : 0

                    //client.close();
                })
				.catch(err => console.log(err));
		// })
	}

	,delete: function(key, collection, callback) {
		// this.connect( (db, client) => {
			let coll = this.db.collection(collection);

			if (!(typeof key == 'object')) key = { nothingToDelete: Infinity };

			coll.removeMany(key, (err, data) => {
				this.Assert.equal(err, null);

				if (callback) callback(data);

				console.log('Data deleted');

                //client.close();
			});
		// });
	}

	,drop: function(collection, callback) {
		// this.connect( (db) => {
			let coll = this.db.collection(collection);

			if (!collection.length) return;

			coll.drop( (err, data) => {
				if (err) throw err;

				if (callback) callback(data);

				console.log('Collection deleted');
			});
		// });
	}

	,toObjectId: function(str) {
		console.log(this.ObjectId(str));
		return new this.ObjectId(str);
	}
}