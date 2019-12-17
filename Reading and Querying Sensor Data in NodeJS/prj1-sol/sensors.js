'use strict';

const assert = require('assert');

class Sensors {

    constructor() {
    this.sensorMap = new Map();
  	this.sensorTypeMap = new Map();
  	this.sensorDataMap = new Map();
    }

    /** Clear out all data from this object. */
    async clear() {
    this.sensorMap.clear();
  	this.sensorTypeMap.clear();
  	this.sensorDataMap.clear();
    }

  /** Subject to field validation as per FN_INFOS.addSensorType,
   *  add sensor-type specified by info to this.  Replace any
   *  earlier information for a sensor-type with the same id.
   *
   *  All user errors must be thrown as an array of objects.
   */
	
    async addSensorType(info) {
      try{
        const sensorType = validate('addSensorType', info);
        this.sensorTypeMap.set(sensorType.id, sensorType);
      }
      catch(e)
      {
        console.error(e);
      }
        
    }
    
    /** Subject to field validation as per FN_INFOS.addSensor, add
     *  sensor specified by info to this.  Replace any earlier
     *  information for a sensor with the same id.
     *
     *  All user errors must be thrown as an array of objects.
     */
    async addSensor(info) {
    try{
        const sensor = validate('addSensor', info);
      if(this.sensorTypeMap.has(sensor.model)){
        this.sensorMap.set(sensor.id, sensor);
         
      }
      else
      {
        console.log("Sensor Model does not match Sensor Type id");
      }
    }
    catch(e)
    {
      console.error(e);
      
    }
  }

  /** Subject to field validation as per FN_INFOS.addSensorData, add
   *  reading given by info for sensor specified by info.sensorId to
   *  this. Replace any earlier reading having the same timestamp for
   *  the same sensor.
   *
   *  All user errors must be thrown as an array of objects.
   */
    async addSensorData(info) {
      try{
      const sensorData = validate('addSensorData', info); 
      var id = sensorData.sensorId;
      sensorData.value =  Number(sensorData.value);
      if(this.sensorMap.has(id)){
        
        if(this.sensorDataMap.has(id))
        {
          var arr = this.sensorDataMap.get(id);
          arr.push(sensorData);
        }
        else
        {
          var arr = new Array();
          arr.push(sensorData);
          this.sensorDataMap.set(id, arr);
        }

      }
      else
      {
         console.log("The sensor id is invalid!");
      }

    }
    catch(e)
    {
      console.error(e);
      
    }
}

  /** Subject to validation of search-parameters in info as per
   *  FN_INFOS.findSensorTypes, return all sensor-types which
   *  satisfy search specifications in info.  Note that the
   *  search-specs can filter the results by any of the primitive
   *  properties of sensor types.  
   *
   *  The returned value should be an object containing a data
   *  property which is a list of sensor-types previously added using
   *  addSensorType().  The list should be sorted in ascending order
   *  by id.
   *
   *  The returned object will contain a lastIndex property.  If its
   *  value is non-negative, then that value can be specified as the
   *  index property for the next search.  Note that the index (when 
   *  set to the lastIndex) and count search-spec parameters can be used
   *  in successive calls to allow scrolling through the collection of
   *  all sensor-types which meet some filter criteria.
   *
   *
   *  All user errors must be thrown as an array of objects.
   */
    async findSensorTypes(info) {  
        const searchSpecs = validate('findSensorTypes', info);

        var id = searchSpecs.id;
        var index = searchSpecs.index;
        var count = searchSpecs.count;
        var filters = new Map();
        var out = new Array();

        for (var key in searchSpecs) {
                if (key!="id" && key!="index" && key!="count") {
                        filters.set(key, searchSpecs[key]);
                }
        }

        var sortedMap = new Map([...this.sensorTypeMap.entries()].sort());
        var keys = sortedMap.keys();

        if(id!=null)
        {
            count = 1;
        }

        var i=0;

        for(var z = 0; z < index; z++)
        {
            keys.next();
        }
       
        for(i=index; i<sortedMap.size && count>0; i++){
              var obj;
              if(id!=null){
                  obj = sortedMap.get(id);
                  //count--;
              }
              else
              {
                  obj = sortedMap.get(keys.next().value);
              }

                  var flag = 1;
                  var filEn = filters.keys();
                  for(var j=0; j<filters.size; j++)
                  {
                        var temp = filEn.next().value;
                        if(obj[temp]!==filters.get(temp))
                        {
                            flag=0;
                        }          
                  }
                  if(flag===1){
                        out.push(obj);
                        count--;
                  }
              
        }

        if(i>=sortedMap.size)
        {
          i=-1;
        }

        var json = {};

        json = {
                "nextIndex" : i,
                "data" : out
        };

        if(out[0] === 'undefined' || out[1] === 'undefined')
        {
          var json = "cannot find sensor-type for id " +id;
        }

    return json;

  }
  	
  	
   
    /** Subject to validation of search-parameters in info as per
     *  FN_INFOS.findSensors, return all sensors which
   *  satisfy search specifications in info.  Note that the
   *  search-specs can filter the results by any of the primitive
   *  properties of a sensor.  
   *
   *  The returned value should be an object containing a data
   *  property which is a list of all sensors satisfying the
   *  search-spec which were previously added using addSensor().  The
   *  list should be sorted in ascending order by id.
   *
   *  If info specifies a truthy value for a doDetail property, 
   *  then each sensor S returned within the data array will have
   *  an additional S.sensorType property giving the complete 
   *  sensor-type for that sensor S.
   *
   *  The returned object will contain a lastIndex property.  If its
   *  value is non-negative, then that value can be specified as the
   *  index property for the next search.  Note that the index (when 
   *  set to the lastIndex) and count search-spec parameters can be used
   *  in successive calls to allow scrolling through the collection of
   *  all sensors which meet some filter criteria.
   *
   *  All user errors must be thrown as an array of objects.
   */
  async findSensors(info) {
      const searchSpecs = validate('findSensors', info);
        var id = searchSpecs.id;
        
        var index = searchSpecs.index;
        var count = searchSpecs.count;
        var filters = new Map();
        var out = new Array();

        for (var key in searchSpecs) {
                if (key!="id" && key!="index" && key!="count" && key!="doDetail") {
                        filters.set(key, searchSpecs[key]);
                }
        }

        var sortedMap = new Map([...this.sensorMap.entries()].sort());
        var keys = sortedMap.keys();

        if(id!==null)
        {
            count = 1;
        }

        for(var z = 0; z < index; z++)
        {
            keys.next();
        }
        //console.log(count);
        var i=0;
        for(i=index; i<sortedMap.size && count>0; i++){
              var obj;
              if(id!=null){
                  obj = sortedMap.get(id);
              }
              else
              {
                  obj = sortedMap.get(keys.next().value);
                 //console.log(obj);
              }

              var flag = 1;
              var filEn = filters.keys();
              for(var j=0; j<filters.size; j++)
              {
                var temp = filEn.next().value;
                if(obj[temp]!==filters.get(temp))
                {
                      flag=0;
                }  
                                
              }
                 
                  if(flag===1){
                        out.push(obj);
                   // console.log(out);
                        count--;
                  }
              }

        if(i>=sortedMap.size)
        {
          i=-1;
        }


        var json = {};
        json = {
                "nextIndex" : i,
                "data" : out
        };

        //console.log(searchSpecs);
        if(searchSpecs.doDetail==="true")
        {
      
          var sensor1 = this.sensorMap.get(id);
          var sensorType1 = this.sensorTypeMap.get(sensor1.model);
          json.sensorType = sensorType1;
        }
        return json;
  }
  
  /** Subject to validation of search-parameters in info as per
   *  FN_INFOS.findSensorData, return all sensor reading which satisfy
   *  search specifications in info.  Note that info must specify a
   *  sensorId property giving the id of a previously added sensor
   *  whose readings are desired.  The search-specs can filter the
   *  results by specifying one or more statuses (separated by |).
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
   *  Note that the timestamp and count search-spec parameters can be
   *  used in successive calls to allow scrolling through the
   *  collection of all readings for the specified sensor.
   *
   *  All user errors must be thrown as an array of objects.
   */
  async findSensorData(info) {


      const searchSpecs = validate('findSensorData', info);
      console.log(searchSpecs);
      var timestamp = searchSpecs.timestamp;
      var statuses = searchSpecs.statuses;
      var count = searchSpecs.count;
      var dataList = this.sensorDataMap.get(searchSpecs.sensorId);
      dataList.sort(function(a,b){
        return b["timestamp"] - a["timestamp"];
      });
      var filtered = dataList.filter(d=> timestamp>=d.timestamp);
      var min = this.sensorMap.get(searchSpecs.sensorId).expected.min;
      var max = this.sensorMap.get(searchSpecs.sensorId).expected.max;
      var data1 = new Array();
      filtered.forEach(data => { 
          if(count===0){
           // break;
           return;
          }
          var status;
         // console.log(min);
        //  console.log(max);
         // console.log(data.value);
          if(data.value > max)
            status="outOfRange";
          else if(data.value<min)
            status="error";
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
      if(searchSpecs.doDetail==="true")
      {
          var sensor1 = this.sensorMap.get(searchSpecs.sensorId);
          var sensorType1 = this.sensorTypeMap.get(sensor1.model);
          result.sensorType = sensorType1;
          result.sensor = sensor1;
      }
      return result;
  }  
}

module.exports = Sensors;

//@TODO add auxiliary functions as necessary

const DEFAULT_COUNT = 5;    

/** Validate info parameters for function fn.  If errors are
 *  encountered, then throw array of error messages.  Otherwise return
 *  an object built from info, with type conversions performed and
 *  default values plugged in.  Note that any unknown properties in
 *  info are passed unchanged into the returned object.
 */
function validate(fn, info) {
  const errors = [];
  const values = validateLow(fn, info, errors);
  if (errors.length > 0) throw errors; 
  return values;
}

function validateLow(fn, info, errors, name='') {
  const values = Object.assign({}, info);
  for (const [k, v] of Object.entries(FN_INFOS[fn])) {
    const validator = TYPE_VALIDATORS[v.type] || validateString;
    const xname = name ? `${name}.${k}` : k;
    const value = info[k];
    const isUndef = (
      value === undefined ||
      value === null ||
      String(value).trim() === ''
    );
    values[k] =
      (isUndef)
      ? getDefaultValue(xname, v, errors)
      : validator(xname, value, v, errors);
  }
  return values;
}

function getDefaultValue(name, spec, errors) {
  if (spec.default !== undefined) {
    return spec.default;
  }
  else {
    errors.push(`missing value for ${name}`);
    return;
  }
}

function validateString(name, value, spec, errors) {
  assert(value !== undefined && value !== null && value !== '');
  if (typeof value !== 'string') {
    errors.push(`require type String for ${name} value ${value} ` +
		`instead of type ${typeof value}`);
    return;
  }
  else {
    return value;
  }
}

function validateNumber(name, value, spec, errors) {
  assert(value !== undefined && value !== null && value !== '');
  switch (typeof value) {
  case 'number':
    return value;
  case 'string':
    if (value.match(/^[-+]?\d+(\.\d+)?([eE][-+]?\d+)?$/)) {
      return Number(value);
    }
    else {
      errors.push(`value ${value} for ${name} is not a number`);
      return;
    }
  default:
    errors.push(`require type Number or String for ${name} value ${value} ` +
		`instead of type ${typeof value}`);
  }
}

function validateInteger(name, value, spec, errors) {
  assert(value !== undefined && value !== null && value !== '');
  switch (typeof value) {
  case 'number':
    if (Number.isInteger(value)) {
      return value;
    }
    else {
      errors.push(`value ${value} for ${name} is not an integer`);
      return;
    }
  case 'string':
    if (value.match(/^[-+]?\d+$/)) {
      return Number(value);
    }
    else {
      errors.push(`value ${value} for ${name} is not an integer`);
      return;
    }
  default:
    errors.push(`require type Number or String for ${name} value ${value} ` +
		`instead of type ${typeof value}`);
  }
}

function validateRange(name, value, spec, errors) {
  assert(value !== undefined && value !== null && value !== '');
  if (typeof value !== 'object') {
    errors.push(`require type Object for ${name} value ${value} ` +
		`instead of type ${typeof value}`);
  }
  return validateLow('_range', value, errors, name);
}

const STATUSES = new Set(['ok', 'error', 'outOfRange']);

function validateStatuses(name, value, spec, errors) {
  assert(value !== undefined && value !== null && value !== '');
  if (typeof value !== 'string') {
    errors.push(`require type String for ${name} value ${value} ` +
		`instead of type ${typeof value}`);
  }
  if (value === 'all') return STATUSES;
  const statuses = value.split('|');
  const badStatuses = statuses.filter(s => !STATUSES.has(s));
  if (badStatuses.length > 0) {
    errors.push(`invalid status ${badStatuses} in status ${value}`);
  }
  return new Set(statuses);
}

const TYPE_VALIDATORS = {
  'integer': validateInteger,
  'number': validateNumber,
  'range': validateRange,
  'statuses': validateStatuses,
};


/** Documents the info properties for different commands.
 *  Each property is documented by an object with the
 *  following properties:
 *     type: the type of the property.  Defaults to string.
 *     default: default value for the property.  If not
 *              specified, then the property is required.
 */
const FN_INFOS = {
  addSensorType: {
    id: { }, 
    manufacturer: { }, 
    modelNumber: { }, 
    quantity: { }, 
    unit: { },
    limits: { type: 'range', },
  },
  addSensor:   {
    id: { },
    model: { },
    period: { type: 'integer' },
    expected: { type: 'range' },
  },
  addSensorData: {
    sensorId: { },
    timestamp: { type: 'integer' },
    value: { type: 'number' },
  },
  findSensorTypes: {
    id: { default: null },  //if specified, only matching sensorType returned.
    index: {  //starting index of first result in underlying collection
      type: 'integer',
      default: 0,
    },
    count: {  //max # of results
      type: 'integer',
      default: DEFAULT_COUNT,
    },
  },
  findSensors: {
    id: { default: null }, //if specified, only matching sensor returned.
    index: {  //starting index of first result in underlying collection
      type: 'integer',
      default: 0,
    },
    count: {  //max # of results
      type: 'integer',
      default: DEFAULT_COUNT,
    },
    doDetail: { //if truthy string, then sensorType property also returned
      default: null, 
    },
  },
  findSensorData: {
    sensorId: { },
    timestamp: {
      type: 'integer',
      default: Date.now() + 999999999, //some future date
    },
    count: {  //max # of results
      type: 'integer',
      default: DEFAULT_COUNT,
    },
    statuses: { //ok, error or outOfRange, combined using '|'; returned as Set
      type: 'statuses',
      default: new Set(['ok']),
    },
    doDetail: {     //if truthy string, then sensor and sensorType properties
      default: null,//also returned
    },
  },
  _range: { //pseudo-command; used internally for validating ranges
    min: { type: 'number' },
    max: { type: 'number' },
  },
};  

