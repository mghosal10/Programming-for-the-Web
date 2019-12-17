'use strict';

const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const querystring = require('querystring');

const Mustache = require('./mustache');
const widgetView = require('./widget-view');

const STATIC_DIR = 'statics';
const TEMPLATES_DIR = 'templates';

let path = require('path');



function serve(port, model, base='') {
  //@TODO
  const app = express();
  app.locals.port = port;
  app.locals.base = base;
  app.locals.model = model;
  process.chdir(__dirname);
  app.use('/', express.static(STATIC_DIR));
  setupRoutes(app);
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}

module.exports = serve;

//@TODO

function setupRoutes(app) {
  app.get('/searchSensorType.html', createSensorTypePage(app,'searchSensorType'));
  app.get('/addSensorType.html', createpage(app,'addSensorType'));
  app.get('/addSensors.html', createpage(app,'addSensors'));
  app.get('/searchSensors.html', createSensorPage(app,'searchSensors'));
  app.post('/addSensorType.html', bodyParser.urlencoded({extended: true}), addSensorTypes(app,'addSensorType'));
  app.post('/searchSensorType.html', bodyParser.urlencoded({extended: true}),searchSensorTypes(app,'searchSensorType'));
  app.post('/addSensors.html', bodyParser.urlencoded({extended: true}), addSensors(app,'addSensors'));
  app.post('/searchSensors.html', bodyParser.urlencoded({extended: true}), searchSensors(app, 'searchSensors'))
}


const FIELDS_INFO = {
  id: {
    friendlyName: 'Sensor Type ID',
    isId: true,
    isSearch: true,
    regex: /^[0-9a-zA-Z\d\-_\s]+$/,
    error: 'Sensor Type ID field can only contain alphanumerics or -',
    emptyError: "A value for 'Sensor Type ID' must be provided"
  },
  modelNumber: {
    friendlyName: 'Model Number',
    isModelNo: true,
    isSearch: true,
    regex: /^[0-9a-zA-Z\d\-_\s]+$/,
    error: "Model Number field can only contain alphanumerics or -",
    emptyError: "A value for 'Model Number' must be provided."
  },
  manufacturer: {
    friendlyName: 'Manufacturer',
    isManu: true,
    isSearch: true,
    regex: /^[a-zA-Z\-_\s]+$/,
    error: "Manufacturer field can only contain alphabetics, -, ' or space",
    emptyError: "A value for 'Manufacturer' must be provided."
  },
  measure: {
    friendlyName: 'Measure',
    isMeasure: true,
    regex: /^[0-9a-zA-Z\d\-_\s]+$/,
    isOptions : [
    {val: "select", title:"Select"},
    {val: "temperature", title:"Temperature"},
    {val: "pressure", title: "Pressure"},
    {val: "flow", title: "Flow Rate"},
    {val: "humidity", title:"Relative Humidity"}
    ],
    emptyError: "A value for 'Measure' must be provided."
  },
  limit: {
    friendlyName: 'Limit',
    isLimit: true,
    regex:/^\d+$/,
    minmax: {min: 'Min', max: 'Max'},
    error: 'Both Min and Max values must be numeric for Limits'
  },
  sensorId: {
    friendlyName: 'Sensor ID',
    isSensor: true,
    sensor: true,
    regex: /^[0-9a-zA-Z\d\-_\s]+$/,
    error: 'Sensor ID field can only contain alphanumerics or -',
  },
  model: {
    friendlyName: 'Model',
    isModel: true,
    sensor: true,
    regex: /^[0-9a-zA-Z\d\-_\s]+$/,
    error: 'Sensor ID field can only contain alphanumerics or -',
  },
  period: {
    friendlyName: 'Period',
    isPeriod: true,
    sensor: true,
    regex: /^\d+$/,
    error: 'Period field can only contain alphanumerics or -',
  },
  expected: {
    friendlyName: 'Expected Range',
    isRange: true,
    regex: /^\d+$/,
    minmax: {min:"Min", max:"Max"},
    error: 'Sensor ID field can only contain alphanumerics or -',
  }
};

const FIELDS =
Object.keys(FIELDS_INFO).map((n) => Object.assign({name: n}, FIELDS_INFO[n]));



function createpage(app,formId) {
 return async function(req,res){
  const mustache= new Mustache();
  const model = { base: app.locals.base, fields: FIELDS };
  const html = mustache.render(formId, model);
  res.send(html);
}
}

function createSensorTypePage(app, formId)
{
  return async function(req,res){
    let sensors;
    try
    {
      let params = req.query;
      sensors = await app.locals.model.list('sensor-types',params);  
      //  console.log(sensors);
      if(undefined !== sensors.next){
        let next = sensors.next;
        next = next.replace("zdu.binghamton.edu", "localhost");
        next = next.replace("sensor-types", "searchSensorType.html");
        sensors.next = next;
      }
      if(undefined !== sensors.prev){
        let prev= sensors.prev;
        prev = prev.replace("zdu.binghamton.edu", "localhost");
        prev = prev.replace("sensor-types", "searchSensorType.html");
        sensors.prev = prev;
           // console.log(prev);
         }
       }
       catch(err)
       {
        console.log(err);
      }
      console.log(sensors);

      const mustache= new Mustache();
      const model = { base: app.locals.base, fields: FIELDS, result:sensors };
      const html = mustache.render(formId, model);
      res.send(html);
    }
  }


  function createSensorPage(app, formId)
  {
    return async function(req,res){
      let sensors;
      let params = req.query;
      console.log(params);
      try
      {
        sensors = await app.locals.model.list('sensors',params);
        console.log(sensors);

        if(undefined !== sensors.next){
          let next = sensors.next;
          next = next.replace("zdu.binghamton.edu", "localhost");
          next = next.replace("sensors", "searchSensors.html");
          sensors.next = next;
        }
        if(undefined !== sensors.prev){
          let prev= sensors.prev;
          prev = prev.replace("zdu.binghamton.edu", "localhost");
          prev = prev.replace("sensors", "searchSensors.html");
          sensors.prev = prev;
        }
      }
      catch(err)
      {
        console("err1");
        console.log(err);
      }
      const mustache= new Mustache();
      const model = { base: app.locals.base, fields: FIELDS, result:sensors };
      const html = mustache.render(formId, model);
      res.send(html);
    }
  }



  function addSensors(app, formId)
  {
    return async function(req,res){
      console.log('madhumita')
      const sensor = getNonEmptyValues(req.body);
     // console.log(sensor);
     //  let errors = validate(sensor, ['sensorId']);
     let id = sensor.sensorId;
     let min = sensor.expected[0];
     let max = sensor.expected[1];
     let range = {"min": min, "max":max};
     sensor.expected = range;
     sensor["id"] = id;
     delete sensor["sensorId"];
     delete sensor["range"];
         try {    
        
          await app.locals.model.update('sensors',sensor);
          console.log(sensor.id);
          res.redirect(`${app.locals.base}/searchSensors.html?id=`+sensor.id);
        }
        catch (err) {
          console.log("err3");
          console.log(err);
         // errors = wsErrors(err);
       }
   // }
    //if (errors) {
      //const model = errorModel(app, sensor, errors);
    //} 
  }
}

function searchSensors(app, formId)
{
  return async function(req,res){
    let sensors = [];
    let errors = undefined;
    const search = getNonEmptyValues(req.body);
    const isSubmit = req.body.submit !== undefined;
    if (search.sensorId !== undefined){
      search["id"] = search.sensorId;
      delete search["sensorId"];
    }
     // errors = validate(search);
     console.log(sensors);
     if(isSubmit)
     {
       if (Object.keys(search).length == 0) {
        const msg = 'at least one search parameter must be specified';
        errors = Object.assign(errors || {}, { _: msg });
      }
      
      let params = {};
      const q = querystring.stringify(search);
      let tokens = q.split("&");
      console.log(tokens)
      if (tokens.length >= 1){
        for(var t of tokens)
        {
          var token = t.split("=");
          params[token[0]] = token[1];
        }
      }
      try {  
        sensors = await app.locals.model.list('sensors',params);


        if(undefined !== sensors.next){
          let next = sensors.next;
          next = next.replace("zdu.binghamton.edu", "localhost");
          next = next.replace("sensor-types", "searchSensorType.html");
          sensors.next = next;
        }

        if(undefined !== sensors.prev){
          let prev= sensors.prev;
          prev = prev.replace("zdu.binghamton.edu", "localhost");
          prev = prev.replace("sensor-types", "searchSensorType.html");
          sensors.prev = prev;
        }
      }
      catch(err)
      {
        console.log(err);
        const mustache= new Mustache();
        if(err.status === 404){
          const model = { base: app.locals.base, fields: FIELDS, errors:"No results found"};
          const html = mustache.render(formId, model);
          res.send(html);
        }
        else if(err.status === 400)
        {
          const model = { base: app.locals.base, fields: FIELDS, errorPeriod:"The Period field must be an integer"};
          const html = mustache.render(formId, model);
          res.send(html);
        }
      }

    }

    const mustache= new Mustache();
    let model = {};
    if(sensors.data.length === 0 || sensors.data.length === undefined)
    {
      model = { base: app.locals.base, fields: FIELDS, errors:"No results found"};
    }
    else
    {
      model = { base: app.locals.base, fields: FIELDS, result:sensors };
    }
    const html = mustache.render(formId, model);
    res.send(html);
  }
}

function searchSensorTypes(app, formId)
{
  return async function(req,res){
    let sensors = [];
    let errors = undefined;
    const search = getNonEmptyValues(req.body);
    const isSubmit = req.body.submit !== undefined;

    search["quantity"] = search.measure;
    delete search["measure"];
    if(search.measure === "select")
    {
      delete search["measure"];
    }

    if(search.quantity === "select")
    {
      delete search["quantity"];
    }
    
    if(isSubmit)
    {
      if (Object.keys(search).length == 0) {
        const msg = 'at least one search parameter must be specified';
        errors = Object.assign(errors || {}, { _: msg });
      }

      let params = {};
      const q = querystring.stringify(search);
      let tokens = q.split("&");
      if (tokens.length >= 1){
        for(var t of tokens)
        {
          var token = t.split("=");
          params[token[0]] = token[1];
        }
      }
      try{
        sensors = await app.locals.model.list('sensor-types',params);

        if(undefined !== sensors.next){
          let next = sensors.next;
          next = next.replace("zdu.binghamton.edu", "localhost");
          next = next.replace("sensor-types", "searchSensorType.html");
          sensors.next = next;
        }

        if(undefined !== sensors.prev){
          let prev= sensors.prev;
          prev = prev.replace("zdu.binghamton.edu", "localhost");
          prev = prev.replace("sensor-types", "searchSensorType.html");
          sensors.prev = prev;
        }
      }
      catch(err)
      {
        console.log(err);
        if(err.status === 404){
          const mustache= new Mustache();
          const model = { base: app.locals.base, fields: FIELDS, errors:"No results found"};
          const html = mustache.render(formId, model);
          res.send(html);
        }
      }
    }     

    const mustache= new Mustache();
    let model = {};
    if(sensors.data.length === 0)
    {
      model = { base: app.locals.base, fields: FIELDS, errors:"No results found"};
    }
    else
    {
      model = { base: app.locals.base, fields: FIELDS, result:sensors };
    }
    const html = mustache.render(formId, model);
    res.send(html);

  }
}

function addSensorTypes(app, formId)
{
  return async function(req,res){
    const sensorType = getNonEmptyValues(req.body);
    let errors = validate(sensorType);
    let min = sensorType.limit[0];
    let max = sensorType.limit[1];
    let limits = {"min": min, "max":max};
    sensorType.limits = limits;
    sensorType["unit"] = "nil";
    sensorType["quantity"] = sensorType.measure;
    delete sensorType["measure"];
    delete sensorType["limit"];

    try {  
          if(Object.entries(errors).length === 0){
            await app.locals.model.update('sensor-types',sensorType);
            res.redirect(`${app.locals.base}/searchSensorType.html?id=`+sensorType.id);
          }
          else
          {
            console.error(errors);
            let mustache = new Mustache();
            const model= { base:app.locals.base,fields:FIELDS, errors:errors};
            const html = mustache.render(formId,model);
            res.send(html);
          }
        
      }
      catch (err) {
        console.log(err);
        errors = wsErrors(err);
      }
 
   // if (errors) {
     // const model = errorModel(app, sensorType, errors);
    //}
  }
}

function getNonEmptyValues(values) {
  const out = {};
  Object.keys(values).forEach(function(k) {
    if (FIELDS_INFO[k] !== undefined) {
      const v = values[k];
      if(Array.isArray(v)){
        v[0]=v[0].trim();
        v[1]=v[1].trim();
        out[k] = v;
      }else{
        if (v && v.trim().length > 0) out[k] = v.trim();
      }
    }
  });
  return out;
}

function errorModel(app, values={}, errors={}) {
  return {
    base: app.locals.base,
    errors: errors._,
    fields: fieldsWithValues(values, errors)
  };
}

function fieldsWithValues(values, errors={}) {
  return FIELDS.map(function (info) {
    const name = info.name;
    const extraInfo = { value: values[name] };
    if (errors[name]) extraInfo.errorMessage = errors[name];
    return Object.assign(extraInfo, info);
  });
}

function validate(values) {
  const errors = {};
    if (values.id === undefined) {
      errors.id = FIELDS_INFO.id.emptyError;
    }
    else if (!values.id.match(FIELDS_INFO.id.regex)) {
      errors.id = FIELDS_INFO.id.error;
    }
    if (values.modelNumber === undefined) {
      errors.modelNumber = FIELDS_INFO.modelNumber.emptyError;
    }
    else if (!values.modelNumber.match(FIELDS_INFO.modelNumber.regex)) {
      errors.modelNumber = FIELDS_INFO.modelNumber.error;
    }
    if (values.manufacturer === undefined) {
      errors.manufacturer = FIELDS_INFO.manufacturer.emptyError;
    }
    else if (!values.manufacturer.match(FIELDS_INFO.manufacturer.regex)) {
      errors.manufacturer = FIELDS_INFO.manufacturer.error;
    }
    if(values.measure==='Select'){
      errors.measure = FIELDS_INFO.measure.emptyError;
    } 
    if(values.limit[0] === '' || values.limit[1] === ''){
      errors.limit = FIELDS_INFO.limit.error;
    }
    else if (!values.limit[0].match(FIELDS_INFO.limit.regex) || !values.limit[1].match(FIELDS_INFO.limit.regex) ) {
        errors.limit = FIELDS_INFO.limit.error;
      }
     
  return errors;
}

function wsErrors(err) {
  const msg = (err.message) ? err.message : 'web service error';
  console.error(msg);
  return { _: [ msg ] };
}



