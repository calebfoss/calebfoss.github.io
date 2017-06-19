var Data;
var lat = 41.880882;
var lng = -87.62087;

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition);
	} else {
		document.getElementById("text").innerHTML = "Geolocation is not supported by this browser.";
	}
}

function showPosition(position) {
	var changedPosition = false;
	if(lat != position.coords.latitude){
		lat = position.coords.latitude;
		changedPosition = true;
	}
	if(lng != position.coords.longitude){
		lng = position.coords.longitude;
		changedPosition = true;
	}
	if(changedPosition) findClosest(lat, lng); 
}

function findClosest(lat, lng){
	var closestIndex = 0;
	var closestDistance = Infinity;
	for(var i = 0; i < Data.length; i++){
		var newDistance = distance(lat,lng,Data[i].lat,Data[i].lng);
		if(newDistance<closestDistance){
			closestIndex = i;
			closestDistance = newDistance;
		}
	}
	generateText(Data[closestIndex], closestDistance);
}

window.onload = function(){
	d3.csv("Data.csv", function(data) {
		Data = data;
	});
	getLocation();
}

function distance(lat1,lng1,lat2,lng2){
	var from = new google.maps.LatLng(lat1, lng1);
	var to   = new google.maps.LatLng(lat2, lng2);
	var dist = google.maps.geometry.spherical.computeDistanceBetween(from, to);
	return dist;
}

function cardinal(lat1,lng1,lat2,lng2){
	var from = new google.maps.LatLng(lat1, lng1);
	var to   = new google.maps.LatLng(lat2, lng2);
	var bearings = ['north','northeast','east','southeast','south','southwest','west','northwest'];
	var heading = google.maps.geometry.spherical.computeHeading(from,to);
	var card = bearings[Math.round(heading/360)];
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
	+cardinal(lat,lng,data.lat,data.lng)
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
				text+='female;'
			if(checkPresent(data.age)){
				if(checkPresent(data.race_edit_comp)){
					text+=', ';
				}
				else{
					text+=' and '
				}
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
	text+=Humanize.capitalize(data.officer_last)+' has had '+data.allegations_count+' allegations filed on them. They have been disciplined '
	+data.discipline_count+' times. ';
	if(data.Active_June_1_2015=='yes')
		text+=Humanize.capitalize(data.officer_last)+' was still active in the CPD as of June 1st, 2015. ';
	if(data.Active_June_1_2015=='no')
		text+=Humanize.capitalize(data.officer_last)+' is no longer active in the CPD as of June 1st, 2015. ';
}
if(missing.length > 0){
	text+='The complaint was missing ';
	for(var i = 0; i < missing.length; i++){
		text+=missing[i];
		if(i<missing.length-2)
			text+=', ';
		else if(i<missing.length-1)
			text+=', and ';
	}
	text+='.'
}
console.log(data);
document.getElementById("text").innerHTML = text;
}
