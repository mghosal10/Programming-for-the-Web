<!DOCTYPE html>
<html>
	<head>
		<title>Search Sensors</title>
		<link rel="stylesheet" type="text/css" href="{{{base}}}/css/style.css">
	</head>
	<body>
		<h1>Search Sensors</h1>
		<ul>
      		{{#errors}}
        	<li class="error">{{.}}</li>
      		{{/errors}}
    	</ul>
		<form method="POST" action="{{{base}}}/searchSensors.html">
		{{#fields}}
	  	{{#sensor}}
		<label>
			<span class="label">{{friendlyName}}</span>
			<input name="{{name}}" {{#type}}type="{{type}}"{{/type}} value="{{value}}">
		</label>
		{{/sensor}}
		<br/>
	 	{{/fields}}
	 	{{#errorPeriod}}
	      <span class="error">{{.}}</span>
	      <br/>
	    {{/errorPeriod}}
	  	<input name="submit" type="submit" value="Submit" class="control">
	</form>
	{{#result}}
	<h2>Results Summary</h2>
	<table  class="summary">
		<thead>
		<tr>
			<th>Sensor ID</th>
			<th>Model</th>
			<th>Period</th>
			<th colspan="2">Expected Range</th>
		</tr>
		<tr>
			<th></th>
			<th></th>
			<th></th>
			<th>Min</th>
			<th>Max</th>
		</tr>
		</thead>
		<tbody>
		{{#result.data}}
		<tr>
    		 <td class="tst-sensor-id">{{{id}}}</td>
			 <td class="tst-model">{{{model}}}</td>
			 <td class="tst-period numeric">{{{period}}}</td>
			 <td class="numeric interval tst-expected-min">{{{expected.min}}}</td>
			 <td class="numeric interval tst-expected-max">{{{expected.max}}}</td>
		</tr>
		{{/result.data}}
		</tbody>
	</table>
	{{/result}}
	<div class="scroll">
		{{#result.next}}
    	<a class="tst-next" href={{{result.next}}} rel="next">&gt;&gt;</a>
    	{{/result.next}}
    	{{#result.prev}}
    	<a class="tst-prev" href={{{result.prev}}} rel="prev">&lt;&lt;</a>
    	{{/result.prev}}
    </div>
	{{>footer}}
	</body>
</html>
