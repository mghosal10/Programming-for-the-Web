<!DOCTYPE html>
<html>
	<head>
		<title>Create / Update Sensor Types</title>
		<link rel="stylesheet" type="text/css" href="{{{base}}}/css/style.css">
	</head>
	<body>
		<h1 class="tst-sensor-types-add-page">Create / Update Sensor Types</h1>
		<form method="POST" action="{{{base}}}/addSensorType.html">
		<p>

		</p>
		{{#fields}}
	  	{{#isId}}
		<label>
			<span class="tst-sensor-type-id">{{friendlyName}} *</span>
			<input name="{{name}}" {{#type}}type="{{type}}"{{/type}} value="{{value}}">
			<ul>
      		{{#errors.id}}
        	<li class="error">{{errors.id}}</li>
      		{{/errors.id}}
    	</ul>
		</label>
		{{/isId}}
		{{#isModelNo}}
		<label>
			<span class="tst-sensor-type-id">{{friendlyName}} *</span>
			<input name="{{name}}" {{#type}}type="{{type}}"{{/type}} value="{{value}}">
			<ul>
      		{{#errors.modelNumber}}
        	<li class="error">{{errors.modelNumber}}</li>
      		{{/errors.modelNumber}}
    	</ul>
		</label>
		{{/isModelNo}}
		{{#isManu}}
		<label>
			<span class="tst-sensor-type-id">{{friendlyName}} *</span>
			<input name="{{name}}" {{#type}}type="{{type}}"{{/type}} value="{{value}}">
			<ul>
      		{{#errors.manufacturer}}
        	<li class="error">{{errors.manufacturer}}</li>
      		{{/errors.manufacturer}}
    	</ul>
		</label>
		{{/isManu}}
		{{#isMeasure}}
		<label>
			<span class="tst-quantity">{{friendlyName}} *</span>
			<select name="{{name}}" value="{{value}}">
			{{#isOptions}}
			<option name="{{val}}" > {{title}}</option>
			{{/isOptions}}
			</select>
			<ul>
      		{{#errors.measure}}
        	<li class="error">{{errors.measure}}</li>
      		{{/errors.measure}}
    	</ul>
		</label>
		{{/isMeasure}}
		{{#isLimit}}
			<label>
				<span class = "limits">{{friendlyName}} *</span>
			{{#minmax}}
			<label>
				<span class = "limits-min">{{min}}</span>
				<input name="{{name}}" {{#type}}type="{{type}}"{{/type}} value="{{value}}">
			</label>
			<br/>
			<label>
				<span class = "limits-max">{{max}}</span>
				<input name="{{name}}" {{#type}}type="{{type}}"{{/type}} value="{{value}}">
			</label>
			{{/minmax}}
			
			<ul>
      		{{#errors.limit}}
        	<li class="error">{{errors.limit}}</li>
      		{{/errors.limit}}
    		</ul>
    		</label>
		{{/isLimit}}
		<br/>
		{{#errorMessage}}
	      <span class="error">{{errorMessage}}</span>
	      <br/>
	    {{/errorMessage}}
	 	{{/fields}}
		<input name="submit" type="submit" value="add" class="control">
		<label>&nbsp;</label>
    </form> 
    {{>footer}}
	</body>
</html>