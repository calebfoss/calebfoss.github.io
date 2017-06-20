var Data;
var LatLng;
var mileCount;
var earliestYear;
var latestYear;
var isChrome = !!window.chrome && !!window.chrome.webstore;

function getGPSLocation() {
	var wait = 0;
	if(document.getElementById('text').innerHTML != ''){
		fadeOut('text');
		wait = 500;
	}
	if (navigator.geolocation) {
		setTimeout(function(){navigator.geolocation.getCurrentPosition(showPosition)},wait);
	} else {
		alert("Geolocation is not supported by this browser.");
	}
}
function getTypeLocation() {
	document.getElementById("text").innerHTML = '';
	var address = document.getElementById('TypeAddress').value;
	console.log(address);
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == 'OK') {
			LatLng = results[0].geometry.location;
			document.getElementById('TypeAddress').value = '';
			document.getElementById('AddressFound').innerHTML = 'Showing result for '+results[0].formatted_address+':';
			findClosest(LatLng);
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});
}

function showPosition(position) {
	document.getElementById('AddressFound').innerHTML = '';
	LatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	findClosest(LatLng);
}

function findClosest(LatLng){
	mileCount = 0;
	earliestYear = Infinity;
	latestYear = 0;
	var closestIndex = 0;
	var closestDistance = Infinity;
	for(var i = 0; i < Data.length; i++){
		var newDistance = distance(LatLng,Data[i].lat,Data[i].lng);
		if(newDistance<closestDistance){
			closestIndex = i;
			closestDistance = newDistance;
		}
		if(newDistance<1609.34){
			mileCount++;
			var year = parseInt(moment(Data[i].incident_date,'M/D/YYYY H:mm').format('YYYY'));
			if(year < earliestYear)
				earliestYear = year;
			if(year > latestYear)
				latestYear = year;
		}
	}
	generateText(Data[closestIndex], closestDistance);
}

window.onload = function(){
	d3.csv("Data.csv", function(data) {
		Data = data;
	});
	console.log(isChrome);
	if(!isChrome){
		document.getElementById('GPS').style.visibility = "visible"; 
	}
	else{
		document.getElementById('GPS').style.visibility = "hidden";
		document.getElementById('TypePrompt').innerHTML = 'GPS location not available on Chrome. Please use another browser or<br>Type in address: ';
	}
	document.getElementById("text").innerHTML = '';
}

function distance(LatLng,lat2,lng2){
	var from = LatLng;
	var to   = new google.maps.LatLng(lat2, lng2);
	var dist = google.maps.geometry.spherical.computeDistanceBetween(from, to);
	return dist;
}

function cardinal(LatLng,lat2,lng2){
	var from = LatLng;
	var to   = new google.maps.LatLng(lat2, lng2);
	var bearings = ['north','northeast','east','southeast','south','southwest','west','northwest'];
	var heading = google.maps.geometry.spherical.computeHeading(from,to);
	var index = Math.round(heading/45);
	if(index < 0)
		index += 7;
	if(index > 7)
		index = 0;
	var card = bearings[index];
	return card;
}
function checkPresent(value){
	var check = false;
	if(value != '' && value != 'unknown' && value != undefined)
		check = true;
	return check;
}

function generateText(data,dist){
	var fullDate = data.incident_date;
	var dateSplit = fullDate.split(' ');
	var date = moment(dateSplit[0],'MM/DD/YYYY').format('MMM Do, YYYY');
	var time = moment(dateSplit[1],'HH:mm').format('h:mm A');
	var missing = new Array();
	for(var key in data){
		data[key] = data[key].toLowerCase();
	}
	var text = Math.round(dist*3.28084)
	+" feet "
	+cardinal(LatLng,data.lat,data.lng)
	+" of you at "
	+data.add1+" "+Humanize.capitalizeAll(data.add2)
	+", an incident took place on "
	+date+" at "+time
	+" that was documented in a CPD misconduct complaint. ";
	if(checkPresent(data.allegation_name)){
		text += 'An officer was accused of behavior documented as "'
		+data.allegation_name
		+'" under the category of "'
		+data.category+'." ';
	}
	else{
		missing.push('the allegation name and category');
	}
	if(checkPresent(data.gender_comp)||checkPresent(data.age)||checkPresent(data.race_edit_comp)){
		text+='The complaintant was identified as ';
		if(checkPresent(data.gender_comp)){
			if(data.gender_comp == 'm')
				text+='male';
			if(data.gender_comp == 'f')
				text+='female'
			if(checkPresent(data.age)){
				if(checkPresent(data.race_edit_comp)){
					text+=', ';
				}
				else{
					text+=' and '
				}
			}
			else if(checkPresent(data.race_edit_comp)){
				text+=' and '
			}
		}
		else
			missing.push("the complaintant's gender");
		if(checkPresent(data.age)){
			text+=Math.floor(data.age)+' years old';
			if(checkPresent(data.race_edit_comp)){
				if(checkPresent(data.gender_comp))
					text+=', and ';
				else
					text+=' and ';
			}
		}
		else
			missing.push("the complaintant's age");
		if(checkPresent(data.race_edit_comp))
			text+=data.race_edit_comp;
		else{
			missing.push("the complaintant's race");
		}
		text+='. '
	}
	if(checkPresent(data.officer_id)){
		text+='The accused officer was '+Humanize.capitalizeAll(data.officer_first+' '+data.officer_last)
		+', who was ';
		if(data.gender_off == 'm')
			text+='male, ';
		if(data.gender_off =='f')
			text+='female, ';
		text+=data.race_edit_off+', and ';
		text+=(moment(dateSplit[0],'MM/DD/YYYY').format('YYYY')-data.birth_year)+' years old. ';

	}
	else{
		missing.push('information about the accused officer');
	}
	if(checkPresent(data.final_outcome_highest)){
		if(data.final_outcome_highest!='open-investigation')
			text+='The allegation was found '+data.final_outcome_highest+'. ';
		else
			text+='As of December 7th, 2015, the allegation was still under investigation. ';
	}
	else
		missing.push('the result of the allegation');
	if(checkPresent(data.officer_id)){
		text+=Humanize.capitalize(data.officer_last)+' has had '+data.allegations_count+' allegations filed on them. ';
		var discipline = data.discipline_count;
		if(discipline == 0)
			text+='They have never been disciplined. ';
		else if(discipline == 1)
			text+='They have been disciplined once. ';
		else
			text+='They have been disciplined '
		+data.discipline_count+' times. ';
		if(data.Active_June_1_2015=='yes')
			text+=Humanize.capitalize(data.officer_last)+' was still active in the CPD as of June 1st, 2015. ';
		if(data.Active_June_1_2015=='no')
			text+=Humanize.capitalize(data.officer_last)+' is no longer active in the CPD as of June 1st, 2015. ';
	}
	if(missing.length > 0){
		text+='<br><br>The complaint was missing ';
		for(var i = 0; i < missing.length; i++){
			text+=missing[i];
			if(i<missing.length-2)
				text+=', ';
			else if(i<missing.length-1)
				text+=', and ';
		}
		text+='.'
	}
	text+='<br><br>'+(mileCount-1)+' other allegations have been filed less than one mile from your location between '
	+earliestYear+' and '+latestYear+'. ';
	console.log(data);
	document.getElementById("text").style.opacity = 0;
	fadeIn('text');
	document.getElementById("text").innerHTML = text;
	document.getElementById('GPS').innerHTML = 'Refresh GPS location';
}

function fadeIn(id){
	if(document.getElementById(id).style.opacity < 1){
		document.getElementById(id).style.opacity = parseFloat(document.getElementById(id).style.opacity) + 0.0025;
		setTimeout(function(){fadeIn(id)},1);
	}
}

function fadeOut(id){
	if(document.getElementById(id).style.opacity > 0){
		document.getElementById(id).style.opacity = parseFloat(document.getElementById(id).style.opacity) - 0.005;
		setTimeout(function(){fadeOut(id)},1);
	}
}