<!DOCTYPE html>
<html>
	<head>
		<title>Create / Update Sensor Types</title>
		<link rel="stylesheet" type="text/css" href="{{{base}}}/css/style.css">
	</head>
	<body>
		<h1 class="tst-sensors-add-page">Create / Update Sensors</h1>
		<ul>
      		{{#errors}}
        	<li class="error">{{.}}</li>
      		{{/errors}}
    	</ul>
		<form method="POST" action="{{{base}}}/addSensors.html">
		{{#fields}}
	  	{{#sensor}}
		<label>
			<span class="tst-sensor-id">{{friendlyName}} *</span>
			<input name="{{name}}" {{#type}}type="{{type}}"{{/type}} value="{{value}}">
		</label>
		{{/sensor}}
		{{#isRange}}
		<label>
			<span class = "expected">{{friendlyName}} *</span>
			{{#minmax}}
			<label>
				<span class = "expected-min">{{min}}</span>
				<input name="{{name}}" {{#type}}type="{{type}}"{{/type}} value="{{value}}">
			</label>
			<br/>
			<label>
				<span class = "expected-max">{{max}}</span>
				<input name="{{name}}" {{#type}}type="{{type}}"{{/type}} value="{{value}}">
			</label>
			{{/minmax}}
		</label>
		{{/isRange}}
		
		<br/>
		{{#errorMessage}}
	      <span class="error">{{errorMessage}}</span>
	      <br/>
	    {{/errorMessage}}
	 	{{/fields}}
		<input name="submit" type="submit" value="add" class="control">
    </form> 
    {{>footer}}
	</body>
</html>