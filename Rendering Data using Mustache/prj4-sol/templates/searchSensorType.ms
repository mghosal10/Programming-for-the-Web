<!DOCTYPE html>
<html>
	<head>
		<title>Search Sensor Types</title>
		<link rel="stylesheet" type="text/css" href="{{{base}}}/css/style.css">
	</head>
	<body>
		<h1 class="tst-sensor-types-add-page">Search Sensor Types</h1>
		<ul>
      		{{#errors}}
        	<li class="error">{{.}}</li>
      		{{/errors}}
    	</ul>
		<form method="POST" action="{{{base}}}/searchSensorType.html">
		<p>

		</p>
		{{#fields}}
	  	{{#isSearch}}
		<label>
			<span class="tst-sensor-type-id">{{friendlyName}}:</span>
			<input name="{{name}}" {{#type}}type="{{type}}"{{/type}} value="{{value}}">
		</label>
		{{/isSearch}}
		{{#isMeasure}}
		<label>
			<span class="tst-quantity">{{friendlyName}}:</span>
			<select name="{{name}}" value="{{value}}">
			{{#isOptions}}
			<option name="{{val}}" value="{{val}}"> {{title}}</option>
			{{/isOptions}}
			</select>
		</label>
		{{/isMeasure}}
		<br/>
		{{#errorMessage}}
	      <span class="error">{{errorMessage}}</span>
	      <br/>
	    {{/errorMessage}}
	 	{{/fields}}
	  	<input name="submit" type="submit" value="Submit" class="control">
	</form>
	{{#result}}
	<h2>Results Summary</h2>
	<table  class="summary">
		<thead>
		<tr>
			<th>Manufacturer</th>
			<th>Sensor Type ID</th>
			<th>Model Number</th>
			<th>Measure</th>
			<th colspan="2">Limits</th>
		</tr>
		<tr>
			<th></th>
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
			 <td class="tst-manufacturer">{{{manufacturer}}}</td>
    		 <td class="tst-sensor-type-id">{{{id}}}</td>
			 <td class="tst-model-number">{{{modelNumber}}}</td>
			 <td class="tst-quantity">{{{quantity}}}</td>
			 <td class="tst-limits-min">{{{limits.min}}}</td>
			 <td class="tst-limits-max">{{{limits.max}}}</td>
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
