let recTitle;
let recPlayer;
let recTranscript;
let recSelection;
let transcriptionDiv;
let buttonDiv;
let buttons = [];
let search;
const divTrans = 2000;
let filterDiv;
const categories = ["Accidents","Practical/Social","Fear Itself","Old Age","Emotions/Relationships","Illness/Disability","Being Attacked","Detailed/Specific","This Project","Drowning/Suffocation","People","Animals","Homelessness","Loneliness","Forgotten","Family","Spiritual","Death","Places","Magical Fictional","Body","Psychological","Dark","Sleep","Missing Out","The Unknown","Failure","Gravity","Heights","Self","Nature","Indecision","Sex","Objects","SensoryDeprivation","Belonging","Existential"];
let catBoxes = [];

const idx = lunr(lunr => {
	lunr.ref('id');
	lunr.field('title');
	lunr.field('text');
	let rLen = recordings.length;
	for(let i = 0; i < rLen; i++){
		lunr.add({
			title: recordings[i].title,
			text: recordings[i].text,
			id: i
		})
	}
});

window.onload = () => {
	recSelection = document.getElementById('recSelection');
	transcriptionDiv = document.getElementById('transcription');
	buttonDiv = document.getElementById('buttonDiv');
	recTitle = document.getElementById('recTitle');
	recPlayer = document.getElementById('recPlayer');
	recTranscript = document.getElementById('recTranscript');
	search = document.getElementById('search');
	filterDiv = document.getElementById('filterDiv');
	search.addEventListener('keyup', function(event){
		if(event.key === 'Enter'){
			search.blur();
		}
	})
	recordings.map(rec => {
		let button = document.createElement('BUTTON');
		button.innerHTML = rec.title;
		button.onclick = () => {
			selectSound(rec);
		};
		buttonDiv.appendChild(button);
		buttons.push(button);
	});
	console.log(filterDiv.childNodes);
	categories.map(cat => {
		let box = document.createElement('INPUT');
		box.type = 'button';
		box.value = cat;
		box.onclick = filterCategories;
		filterDiv.insertBefore(box, filterDiv.lastElementChild);
		catBoxes.push(box);
	});
}

function selectSound(rec) {
	recPlayer.style.display = 'block';
	let wait = 0;
	if(recSelection.style.opacity != 0){
		recSelection.style.opacity = 0;
		recSelection.style.maxHeight = recSelection.clientHeight + 'px';
		recSelection.style.minHeight = recSelection.clientHeight + 'px';
		wait = 670;
	} 
	setTimeout(()=> {
		recSelection.style.maxHeight = '100%';
		recSelection.style.minHeight = 0;
		recSelection.style.opacity = 1;
		window.scrollTo(0, 0);
		recTitle.innerHTML = rec.title;
		recPlayer.src = 'audio/' + rec.file;
		recPlayer.play();
		recTranscript.innerHTML = rec.text;
		recTranscript.scrollTop = 0;
	}, wait);
}
function clearCategories(){
	catBoxes.map(box =>{
		box.checked = false;
		box.className = 'unchecked';
	});
	searchFiles();
}
function filterCategories(){
	this.checked = !this.checked;
	this.className = this.checked ? 'checked' : 'unchecked'; 
	searchFiles();
	return false;
}

function searchFiles() {
	let checkedCats = catBoxes.filter(cat => cat.checked).map(cat => cat.value);
	let catIndexes = [];
	if(checkedCats.length > 0)
		recordings.forEach((rec, index) => {
			if(checkedCats.every(cat => {
				return rec.categories.includes(cat);
			})){
				catIndexes.push(index)
			}

		});
	console.log(checkedCats, catIndexes);
	let results = idx.search(search.value).map(result => {
		return parseInt(result.ref)
	});
	buttons.forEach(button => {
		button.style.display = 'none';
	});
	results.forEach(res => {
		let button = buttons[res];
		buttonDiv.appendChild(button);
		if(checkedCats.length == 0 || catIndexes.includes(res))
			button.style.display = 'block';
		else
			button.style.display = 'none';
	});

}