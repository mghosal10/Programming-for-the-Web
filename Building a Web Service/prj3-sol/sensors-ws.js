const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const AppError = require('./app-error');

const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

var router = express.Router();

function serve(port, sensors) {
  //@TODO set up express app, routing and listen
  const app = express();
  app.locals.model=sensors;
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
  setupRoutes(app,sensors);
}

module.exports = { serve };

//@TODO routing function, handlers, utility functions
function setupRoutes(app,sensors)
{
	app.use(cors());
  app.use(bodyParser.json());

	app.get('/sensor-types', getSensorTypes(app));
	app.get('/sensors', getSensors(app));
	app.get('/sensor-data/:id', getSensorDataId(app));
	app.get('/sensors/:id', getSensorId(app));
	app.get('/sensor-types/:id', getSensorTypesId(app));
	app.post('/sensor-types', postSensorTypes(app));
	app.post('/sensors', postSensors(app));
	app.post('/sensor-data/:id', postSensorData(app));
  app.get('/sensor-data/:id/:timestamp', getSensorData(app))

 }


function requestUrl(req) {
 	const port = req.app.locals.port;
  	return `${req.protocol}://${req.headers.host}${req.originalUrl}`;
}


function mapError(err) {
  		//console.error(err);
  		return err.isDomain ? { status: (ERROR_MAP[err.errorCode] || BAD_REQUEST), code: err.errorCode, message: err.message} : { status: SERVER_ERROR, code: 'INTERNAL', message: err.toString()};
	} 


function errorWrap(handler) {
  return async (req, res, next) => {
    try
    {
      await handler(req, res, next);
    }
    catch (err) {
      next(err);
    }
  };
}


function postSensorData(app)
{
	return errorWrap(async function(req, res) {
    try 
 	{
      const obj = req.body;

      for(var k in req.params)
      {
          if(k === "id")
          {
            obj["sensorId"] = req.params[k];
          }
          else
          {
            obj[k] = req.params[k];
          }
      }
      const results = await app.locals.model.addSensorData(obj);
      res.append('Location', requestUrl(req) + '/' + obj.timestamp);
      res.sendStatus(CREATED);
    }
    catch(err) {
      const mapped = mapError(err);
      const data =  {
            "errors": err
          }
          res.json(data);
    }
  });
}




function postSensorTypes(app)
{
	return errorWrap(async function(req, res) {
    try 
 	{
      const obj = req.body;
      const results = await app.locals.model.addSensorType(obj);
      res.append('Location', requestUrl(req) + '/' + obj.id);
      res.sendStatus(CREATED);
    }
    catch(err) {
      const mapped = mapError(err);
      const data =  {
            "errors": err
          }
          res.json(data);
    }
  });
}


function postSensors(app)
{
	return errorWrap(async function(req, res) {
    try 
 	{
      const obj = req.body;
      const results = await app.locals.model.addSensor(obj);
      res.append('Location', requestUrl(req) + '/' + obj.id);
      res.sendStatus(CREATED);
    }
    catch(err) {
      const mapped = mapError(err);
      const data =  {
            "errors": err
          }
          res.json(data);
    }
  });
}



function getSensorTypes(app)
{
  return errorWrap(async function(req, res) {
    const q = req.query || {};
    	
 		try 
 		{
 			    const url = req.protocol+"://"+req.headers.host+req.path;
      		const results = await app.locals.model.findSensorTypes(q);
      		results["self"]=req.protocol+"://"+req.headers.host+req.originalUrl;
      		for(i=0; i<results.data.length; i++)
      		{
      			results.data[i]["self"] = url+"/"+results.data[i]["id"];
      		}
      		if(results.nextIndex !== -1){
      			if(q._count !== undefined){
      				results["next"] = url+"?_index="+results.nextIndex+"&_count="+q._count;
      			}
      			else
      			{
      				results["next"] = url+"?_index="+results.nextIndex;
      			}	
      		}
        
      		if(q._index !== undefined && q._count !== undefined)
      		{
      			const calc = q._index-q._count;
      			results["prev"] = url+"?_index="+calc+"&_count="+q._count;
      		}

      		res.json(results);
    	}
    	catch (err) {
      		const mapped = mapError(err);
          const data =  {
            "errors": err
          }
          res.json(data);
    	}
  });
}


function getSensors(app)
{
  return errorWrap(async function(req, res) {
 		try 
 		{
          const q = req.query || {};
          const url = req.protocol+"://"+req.headers.host+req.path;
      		const results = await app.locals.model.findSensors(q);
          results["self"]=req.protocol+"://"+req.headers.host+req.originalUrl;
          for(i=0; i<results.data.length; i++)
          {
            results.data[i]["self"]= url+"/"+results.data[i]["id"];
          }
          if(results.nextIndex !== -1){
            if(q._count !== undefined){
              results["next"]=req.protocol+"://"+req.headers.host+req.originalUrl+"&_index="+results.nextIndex;
            }
          }
      		res.json(results);
    	}
    	catch (err) {
      		const mapped = mapError(err);
          const data =  {
            "errors": err
          }
          res.json(data);
    	}
  });
}


function getSensorDataId(app)
{
	return errorWrap(async function(req, res) {
 		try 
 		{
          var q = req.query || {};
          const url = req.protocol+"://"+req.headers.host+req.path;
          const id = req.params.id;

          for(var k in req.params)
          {
              if(k === "id")
              {
                q["sensorId"] = req.params[k];
              }
              else
              {
                q[k] = req.params[k];
              }

          }

          const results = await app.locals.model.findSensorData(q);
          
          
          results["self"]=req.protocol+"://"+req.headers.host+req.originalUrl;
          for(i=0; i<results.data.length; i++)
          {
            results.data[i]["self"]= url+"/"+results.data[i]["timestamp"];
          }
      		res.json(results);
    	}
    	catch (err) {
      		const mapped = mapError(err);
          const data =  {
            "errors": err
          }
          res.json(data);
    	}
  });
}


function getSensorId(app)
{
	return errorWrap(async function(req, res) {
 		try 
 		{
          const url = req.protocol+"://"+req.headers.host+req.path;
          const id = req.params.id;
      		const results = await app.locals.model.findSensors({id:id});
          results["self"]=url;
          for(i=0; i<results.data.length; i++)
          {
            results.data[i]["self"]= url;
          }
      		res.json(results);
    	}
    	catch (err) {
      		const mapped = mapError(err);
          const data =  {
            "errors": err
          }
          res.json(data);
    	}
  });
}


function getSensorTypesId(app)
{
	return errorWrap(async function(req, res) {
		const url = req.protocol+"://"+req.headers.host+req.path;
 		const id = req.params.id;
    let index = -1;

 		try 
 		{
      		const results = await app.locals.model.findSensorTypes({id:id});
      		results["self"]=url;

      		for(i=0; i<results.data.length; i++)
      		{
      			results.data[i]["self"]= url;
            index = i;
      		}
          
          res.json(results);
          
    	}
    	catch (err) {
          
          
            const mapped = mapError(err);
            const data =  {
              "errors": err
            }
            res.status(404).send(data);
      		
    	}
  });
}


function getSensorData(app)
{
  return errorWrap(async function(req, res) {
    try 
    {
          const url = req.protocol+"://"+req.headers.host+req.path;
          const timestamp = Number(req.params.timestamp);
          const id = req.params.id;
          let index = -1;
          const results = await app.locals.model.findSensorData({sensorId:id, timestamp:timestamp});
          for(i=0; i<results.data.length; i++)
          {
            results.data[i]["self"] = req.protocol+"://"+req.headers.host+req.originalUrl;
            if(results.data[i]["timestamp"] === timestamp)
            {
              index = i;
            }
          }
          if(index === -1)
          {
            const mapped = mapError(new Error);
            const data =  {
            "errors": [{"code": "NOT_FOUND",
                      "message": `no data for timestamp ${timestamp}`}]

          }
          res.status(404).send(data)
          
          }
          else
          {
           const data = {
              "data" : [results.data[index]]
            }
            data["self"] = req.protocol+"://"+req.headers.host+req.originalUrl;
            data["nextIndex"] = -1;
            res.json(data);
          }
          
          
      }
      catch (err) {
          const mapped = mapError(err);
          const data =  {
            "errors": err
          }
          res.json(data);
      }
  });
}