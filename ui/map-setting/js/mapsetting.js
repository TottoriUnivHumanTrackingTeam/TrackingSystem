let bg;
let maps = [];
let originalMaps = [];
let maps_hozon = [];
let width = 1020;
let height = 645;

function setup() {
	let canvas = '';
	canvas = createCanvas(width, height);
	canvas.parent('settingmap');
	bg = loadImage("../../assets/lab3f.png");
    background(255);
    
	$.ajax({
		url:'http://localhost:3000/api/map',
		type:'GET'
	}).done( (data) => {
		if(data) { 
			originalMaps = data;
			maps = originalMaps.concat();
			for(let map of maps) {
				map.active = false;
			}
		}
	});
	ellipseMode(RADIUS);

	$(".text").bind("keydown keyup keypress change",function(){
		if ($('.text').val().length > 0) {
			$('.submit').prop('disabled', false);
		}else{
			$('.submit').prop('disabled', true);
		}

	});

	$(".submit").on('click', mapSubmit);
	$(".delete").on('click',mapDelete);
}

function draw() {
    clear();
    if(bg) image(bg, 0, 0, width, height);
    if (maps.length > 0) {
		for(let map of maps) {
			for(i = 0; map.size.length > i; i++ ){
				fill(0,50);
				quad(map.size[i].min.x, map.size[i].min.y, map.size[i].max.x, map.size[i].min.y, 
					map.size[i].max.x, map.size[i].max.y, map.size[i].min.x, map.size[i].max.y);
			}
			
			if(map.active) {
				for(i = 0; map.size.length > i; i++ ){
					fill('rgba(255,150,0,0.5)');
					quad(map.size[i].min.x, map.size[i].min.y, map.size[i].max.x, map.size[i].min.y, 
						map.size[i].max.x, map.size[i].max.y, map.size[i].min.x, map.size[i].max.y);
				}
			}
    	}
	}
	if (maps_hozon.length > 0) {
		for(i = 0; maps_hozon[0].size.length > i; i++ ){
			fill('rgba(255,0,0, 0.25)');
			quad(maps_hozon[0].size[i].min.x, maps_hozon[0].size[i].min.y, maps_hozon[0].size[i].max.x, maps_hozon[0].size[i].min.y, 
				maps_hozon[0].size[i].max.x, maps_hozon[0].size[i].max.y, maps_hozon[0].size[i].min.x, maps_hozon[0].size[i].max.y);
		}
	}
}

function mousePressed() {
	let y = mouseY;
	let map = maps.find(map => map.name === 'new');
	if(y < height){
		if(!map){
			maps.push({ name: 'new', size: [{min: {x: mouseX, y: mouseY}, max: {x: mouseX, y: mouseY}}], color:'#ff8c00', active: false });
		}else{
			maps.pop();
			maps.push({ name: 'new', size: [{min: {x: mouseX, y: mouseY}, max: {x: mouseX, y: mouseY}}], color:'#ff8c00', active: false });
		}
		return false;
	}
}

function mouseReleased(){
	let y = mouseY;
	let map = maps.find(map => map.name === 'new');
	
	if(y < height){	
		if(maps_hozon.length == 0){
			maps_hozon.push({ name: 'new', size: [{min: {x: map.size[0].min.x, y: map.size[0].min.y}, max: {x: mouseX, y: mouseY}}], color:'#ff8c00', active: false });
		}else{
			maps_hozon[0].size.push(map.size[0]);
			for(i = 0; maps_hozon[0].size.length > i; i++){
				map.size[i] = maps_hozon[0].size[i];
			}
		}
		if(map.name === 'new'){
			$('[name="name"]').prop('disabled', false);
		}else{
			$('[name="name"]').prop('disabled', true); 
		}
		return false;
	}	
}

function doubleClicked() {
	if (maps.length > 0) {
		for (let map of maps) {
			for(i = 0; map.size.length > i; i++){
				if(map.size[i].max.x - mouseX > 0 && mouseX - map.size[i].min.x > 0 &&
					map.size[i].max.y - mouseY > 0 && mouseY - map.size[i].min.y > 0){
					$('[name="name"]').val([map.name]);
					map.active = true;
					break;
				} else {
					map.active = false;
				}
			}
		}
	  return false;
	}
}

function mouseDragged() {
	let y = mouseY;
	if(y < height){
		let map = maps.find(map => map.name === 'new');
		map.size[0].max = { x: mouseX, y: mouseY };
	}
}

const mapSubmit = function mapSubmit() {
	let map1 = maps.find(map => map.name === 'new');
	const mapName = $('[name="name"]').val();
	const mapSize = []
	for(i = 0; map1.size.length > i; i++ ){
		mapSize[i] = map1.size[i] 
	}
	let map = maps.find(map => map.name === mapName);
	if(!map) { 
		map = maps.find(map => map.name === 'new');
		map.name = mapName;
		map.size = mapSize;
		$.ajax({
			url:'http://localhost:3000/api/map/',
			type:'POST',
			data: JSON.stringify(map),
			contentType: "application/json; charset=utf-8"
		});
		window.location.reload();
	}
}

const mapDelete = function mapDelete() {
	const mapName = $('[name="name"]').val();
	if(mapName) {
		const num = maps.findIndex(map => map.name === mapName);
		maps.splice( num, 1 );
		$.ajax({
			url:'http://localhost:3000/api/map',
			type:'DELETE',
			data: JSON.stringify({mapName}),
			contentType: "application/json; charset=utf-8"
		});
	}
	window.location.reload();
}
