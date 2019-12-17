'use strict';

const AppError = require('./app-error');
const validate = require('./validate');

const assert = require('assert');
const mongo = require('mongodb').MongoClient;


class Sensors {



	constructor(db, client, databaseName){
		this.db = db;
		this.databaseName = databaseName;
		this.client = client;
	}


  /** Return a new instance of this class with database as
   *  per mongoDbUrl.  Note that mongoDbUrl is expected to
   *  be of the form mongodb://HOST:PORT/DB.
   */
  static async newSensors(mongoDbUrl) {

	const urlReg = mongoDbUrl.match(/(\w+):\/\/([^/]+)(.*)/);
	const [_,s,baseUrl,dbname] = urlReg;
	const client = await mongo.connect(mongoDbUrl, {useNewUrlParser: true, useUnifiedTopology: true });
	const databaseName = dbname.slice(1);
	const db = client.db(databaseName);

  	try{

	  	if(client.isConnected())
	  	{
	  			console.log("Connected");

	  			db.createCollection('sensorCollection', function(err, res){
	  				if (err) throw err;
	  			});

	  			db.createCollection('sensorDataCollection', function(err, res){
	  				if (err) throw err;
	  			});

	  			db.createCollection('sensorTypeCollection', function(err, res){
	  				if (err) throw err;
	  			});
	  	}
  	}
  	catch(ex)
  	{
  		throw ex;
  	}

    return new Sensors(db, client, databaseName);    
  }

  /** Release all resources held by this Sensors instance.
   *  Specifically, close any database connections.
   */
  async close() {
  	await this.client.close();
    //@TODO
  }

  /** Clear database */
  async clear() {

  	this.db.collection("sensorTypeCollection").deleteMany(function(err, res) {
    if (err) throw err;
    if (res) console.log("Sensor Type Collection deleted");
	});

    this.db.collection("sensorDataCollection").deleteMany(function(err, res) {
    if (err) throw err;
    if (res) console.log("Sensor Data Collection deleted");
    });

    this.db.collection("sensorCollection").deleteMany(function(err, res) {
    if (err) throw err;
    if (res) console.log("Sensor Collection deleted");
	});
    

    //@TODO
  }

  /** Subject to field validation as per validate('addSensorType',
   *  info), add sensor-type specified by info to this.  Replace any
   *  earlier information for a sensor-type with the same id.
   *
   *  All user errors must be thrown as an array of AppError's.
   */
  async addSensorType(info) {
    const sensorType = validate('addSensorType', info);
    const sensorTypeId = sensorType.id;
    try{
    	var sensorTypeCollection = this.db.collection("sensorTypeCollection");
    	const sensorTypeCollCount =  await sensorTypeCollection.find({"_id": sensorTypeId }).count();
    	
    	if (sensorTypeCollCount > 0)
    	{
    		sensorTypeCollection.updateOne({_id:sensorTypeId}, {$set:{sensorType}}, {upsert:true});
    	}
    	else
    	{
    		sensorTypeCollection.insertOne({_id:sensorTypeId, sensorType});
    	}	
    }
    catch(ex)
    {
    	throw ex;
    }	
    	
    //@TODO
  }
  
  /** Subject to field validation as per validate('addSensor', info)
   *  add sensor specified by info to this.  Note that info.model must
   *  specify the id of an existing sensor-type.  Replace any earlier
   *  information for a sensor with the same id.
   *
   *  All user errors must be thrown as an array of AppError's.
   */
  async addSensor(info) {
    const sensor = validate('addSensor', info);
    const id = sensor.id;

    try{
    	var sensorCollection = this.db.collection("sensorCollection");
    	const sensorCollCount =  await sensorCollection.find({"_id": id }).count();
    	
    	if (sensorCollCount > 0)
    	{
    		sensorCollection.updateOne({_id:id}, {$set:{sensor}}, {upsert:true});
    	}
    	else
    	{
    		sensorCollection.insertOne({_id:id, sensor});
    	}	
    }
    catch(ex)
    {
    	throw ex;
    }	

    //@TODO
  }

  /** Subject to field validation as per validate('addSensorData',
   *  info), add reading given by info for sensor specified by
   *  info.sensorId to this. Note that info.sensorId must specify the
   *  id of an existing sensor.  Replace any earlier reading having
   *  the same timestamp for the same sensor.
   *
   *  All user errors must be thrown as an array of AppError's.
   */
  async addSensorData(info) {
    const sensorData = validate('addSensorData', info);
    const sensorDataId = sensorData.sensorId;
    

     try{
    	var sensorDataCollection = this.db.collection("sensorDataCollection");
    	const sensorDataCollCount =  await sensorDataCollection.find({"_id": sensorDataId }).count();
    	
    	if (sensorDataCollCount > 0)
    	{
    		var a = await sensorDataCollection.findOne({"_id": sensorDataId });
    		var data = [];
    		data= a['data'];
    		data.push(sensorData);
    		sensorDataCollection.updateOne({_id:sensorDataId}, {$set:{data}}, {upsert:true});
    	}
    	else
    	{
    		var data = [];
    		data.push(sensorData);
    		sensorDataCollection.insertOne({_id:sensorDataId, data});
    	}	
    }
    catch(ex)
    {
    	throw ex;
    }		
    //@TODO
  }

  /** Subject to validation of search-parameters in info as per
   *  validate('findSensorTypes', info), return all sensor-types which
   *  satisfy search specifications in info.  Note that the
   *  search-specs can filter the results by any of the primitive
   *  properties of sensor types (except for meta-properties starting
   *  with '_').
   *
   *  The returned value should be an object containing a data
   *  property which is a list of sensor-types previously added using
   *  addSensorType().  The list should be sorted in ascending order
   *  by id.
   *
   *  The returned object will contain a lastIndex property.  If its
   *  value is non-negative, then that value can be specified as the
   *  _index meta-property for the next search.  Note that the _index
   *  (when set to the lastIndex) and _count search-spec
   *  meta-parameters can be used in successive calls to allow
   *  scrolling through the collection of all sensor-types which meet
   *  some filter criteria.
   *
   *  All user errors must be thrown as an array of AppError's.
   */
  async findSensorTypes(info) {
    //@TODO

    try{

      const searchSpecs = validate('findSensorTypes', info);
    //console.log(searchSpecs);
    const id = searchSpecs.id;
  var filters = {};
  let count=0;
    for (var key in searchSpecs) {
                if (key!=="_index" && key!=="_count" && key!=="_doDetail") {
                    var val = "sensorType."+key;
                    if(key==="id"){
                      if(searchSpecs["id"]!==null)
                        filters[val] = searchSpecs[key];   
                    }
                    else if(key==='limits'){
                      if(searchSpecs[key]['min']!==undefined)
                        filters['sensorType.limits.min'] = parseInt(searchSpecs[key]['min'], 10);
                      if(searchSpecs[key]['max']!==undefined)
                        filters['sensorType.limits.max'] = parseInt(searchSpecs[key]['max'], 10);
                    }
                    else
                          filters[val] = searchSpecs[key];     
                        count++;
                }
    }

    var next=-1;

    if(searchSpecs.id !== null && count===1)
    {
      var sensorData = await this.db.collection("sensorTypeCollection").find({_id: searchSpecs.id}).toArray();
    }
    else
    {
      var totalRec = await this.db.collection("sensorTypeCollection").find(filters).count();
      if(totalRec> searchSpecs._index+searchSpecs._count)
        next = searchSpecs._index+searchSpecs._count;
      var sensorData = await this.db.collection("sensorTypeCollection").find(filters).sort({'_id': 1}).skip(searchSpecs._index).limit(searchSpecs._count).toArray();
    }

    return { data: [sensorData], nextIndex: next };

    }
    catch(ex)
    {
      throw ex;
    }
  }
  
  /** Subject to validation of search-parameters in info as per
   *  validate('findSensors', info), return all sensors which satisfy
   *  search specifications in info.  Note that the search-specs can
   *  filter the results by any of the primitive properties of a
   *  sensor (except for meta-properties starting with '_').
   *
   *  The returned value should be an object containing a data
   *  property which is a list of all sensors satisfying the
   *  search-spec which were previously added using addSensor().  The
   *  list should be sorted in ascending order by id.
   *
   *  If info specifies a truthy value for a _doDetail meta-property,
   *  then each sensor S returned within the data array will have an
   *  additional S.sensorType property giving the complete sensor-type
   *  for that sensor S.
   *
   *  The returned object will contain a lastIndex property.  If its
   *  value is non-negative, then that value can be specified as the
   *  _index meta-property for the next search.  Note that the _index (when 
   *  set to the lastIndex) and _count search-spec meta-parameters can be used
   *  in successive calls to allow scrolling through the collection of
   *  all sensors which meet some filter criteria.
   *
   *  All user errors must be thrown as an array of AppError's.
   */
  async findSensors(info) {


    try{

       //@TODO
    const searchSpecs = validate('findSensors', info);
    //console.log(searchSpecs);
    var filters = {};
    let count=0;

    for (var key in searchSpecs) {
                if (key!=="_index" && key!=="_count" && key!=="_doDetail") {
                    var val = "sensor."+key;
                    if(key==="id"){
                      if(searchSpecs["id"]!=null)
                        filters[val] = searchSpecs[key];   
                    }
                    else if(key==='period')
                    {
                      filters[val] = parseInt(searchSpecs[key], 10);   
                    }else if(key==='expected'){
                      if(searchSpecs[key]['min']!==undefined)
                        filters['sensor.expected.min'] = parseInt(searchSpecs[key]['min'], 10);
                      if(searchSpecs[key]['max']!==undefined)
                        filters['sensor.expected.max'] = parseInt(searchSpecs[key]['max'], 10);
                    }
                    else
                          filters[val] = searchSpecs[key];     
                        count++;
                }
    }
   // console.log(filters);
    let sensorType = null; 
    var next=-1;
    if(searchSpecs.id !== null && count===1)
    {
      var sensorData = await this.db.collection("sensorCollection").findOne({_id: searchSpecs.id});
      if(searchSpecs._doDetail!==null && searchSpecs._doDetail==="true")
      {
        sensorType = await this.db.collection("sensorTypeCollection").findOne({_id: sensorData.sensor.model});
      }
    }
    else
    {
      //filters['sensor.expected.min'] = 29;
      console.log(filters);
      var totalRec = await this.db.collection("sensorCollection").find(filters).count();
      if(totalRec> searchSpecs._index+searchSpecs._count)
        next = searchSpecs._index+searchSpecs._count;
      var sensorData = await this.db.collection("sensorCollection").find(filters).sort({'_id': 1}).skip(searchSpecs._index).limit(searchSpecs._count).toArray();
    }
    if(sensorType!=null)
      return { data: [sensorData], sensorType, nextIndex: next };
    else
      return { data: [sensorData], nextIndex: next };

    }
    catch(ex)
    {
      throw ex;
    } 
  }
  
  /** Subject to validation of search-parameters in info as per
   *  validate('findSensorData', info), return all sensor readings
   *  which satisfy search specifications in info.  Note that info
   *  must specify a sensorId property giving the id of a previously
   *  added sensor whose readings are desired.  The search-specs can
   *  filter the results by specifying one or more statuses (separated
   *  by |).
   *
   *  The returned value should be an object containing a data
   *  property which is a list of objects giving readings for the
   *  sensor satisfying the search-specs.  Each object within data
   *  should contain the following properties:
   * 
   *     timestamp: an integer giving the timestamp of the reading.
   *     value: a number giving the value of the reading.
   *     status: one of "ok", "error" or "outOfRange".
   *
   *  The data objects should be sorted in reverse chronological
   *  order by timestamp (latest reading first).
   *
   *  If the search-specs specify a timestamp property with value T,
   *  then the first returned reading should be the latest one having
   *  timestamp <= T.
   * 
   *  If info specifies a truthy value for a doDetail property, 
   *  then the returned object will have additional 
   *  an additional sensorType giving the sensor-type information
   *  for the sensor and a sensor property giving the sensor
   *  information for the sensor.
   *
   *  Note that the timestamp search-spec parameter and _count
   *  search-spec meta-parameters can be used in successive calls to
   *  allow scrolling through the collection of all readings for the
   *  specified sensor.
   *
   *  All user errors must be thrown as an array of AppError's.
   */
  async findSensorData(info) {


    try{
      const searchSpecs = validate('findSensorData', info);
    console.log(searchSpecs);
     var timestamp = searchSpecs.timestamp;
      var statuses = searchSpecs.statuses;
      var count = searchSpecs._count;
      var findOutput = await this.db.collection('sensorDataCollection').findOne({_id:searchSpecs.sensorId});
      var dataList = findOutput.data;
     
     
      dataList.sort(function(a,b){
        return b["timestamp"] - a["timestamp"];
      });

      var filtered = dataList.filter(d=> timestamp>=d.timestamp);
      var sjson = await this.db.collection('sensorCollection').findOne({_id:searchSpecs.sensorId});
      var min = sjson.sensor.expected.min;
      var max = sjson.sensor.expected.max;
 var sensor1 = sjson.sensor;
 var sensorType1 = await this.db.collection('sensorTypeCollection').findOne({_id:sensor1.model});
      var min1 = sensorType1.sensorType.limits.min;
      var max1 = sensorType1.sensorType.limits.max;
      var data1 = new Array();
      filtered.forEach(data => {
          if(count===0){
           return;
          }
          var status;
       
          if(data.value > max1 || data.value < min1 )
            status="error";
          else if(data.value > max || data.value < min )
            status="outOfRange";
          else
            status="ok";
          if(statuses.has(status)){
            var r = {};
            r.timestamp = data.timestamp;
            r.value = data.value;
            r.status = status;
            data1.push(r);
            count--;
          }
      });
      var result = {};
      result.data = data1;
      if(searchSpecs._doDetail==="true")
      {
          result.sensorType = sensorType1;
          result.sensor = sensor1;
      }

    return result;

    }
    catch(ex)
    {
      throw ex;
    }
    //@TODO
   
  }

  
  
} //class Sensors

module.exports = Sensors.newSensors;

//Options for creating a mongo client
const MONGO_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};


function inRange(value, range) {
  return Number(range.min) <= value && value <= Number(range.max);
}
