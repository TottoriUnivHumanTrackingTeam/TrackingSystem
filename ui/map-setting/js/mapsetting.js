let bg;
let radius = 8;
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
				map.color = '#ff8c00';
				map.active = false;
			}
		}
	});
	ellipseMode(RADIUS);
	$(".submit").click(mapSubmit);
	$(".delete").click(mapDelete);
}

function draw() {
    clear();
    if(bg) image(bg, 0, 0, width, height);
    if (maps.length > 0) {
		for(let map of maps) {
			for(i = 0; map.size.length > i; i++ ){
				fill(0, 50);
				quad(map.size[i].min.x, map.size[i].min.y, map.size[i].max.x, map.size[i].min.y, 
					map.size[i].max.x, map.size[i].max.y, map.size[i].min.x, map.size[i].max.y);
		
            	if(map.active) {
            		textSize(10);
					text(`mapName: ${map.mapName} `, map.size.min.x+radius+5, map.size.min.y);
            		fill('#000000');
            	}
        	}
    	}
	}
}

function mousePressed() {
	let y = mouseY;
	let map = maps.find(map => map.name === 'new');
	if(y < height){
		if(!map){
			maps.push({ name: 'new', size: [{min: {x: mouseX, y: mouseY}, max: {x: mouseX, y: mouseY}}], color:'#ff8c00', active: false });
			console.log("初回プレス");
			console.log(map);
		}else{
			maps.pop();
			maps.push({ name: 'new', size: [{min: {x: mouseX, y: mouseY}, max: {x: mouseX, y: mouseY}}], color:'#ff8c00', active: false });
			$('[name="name"]').val([map.name]);
			console.log("2回目プレス");
			console.log(map);
		}
		return false;
	}
}

function mouseReleased(){
	let y = mouseY;
	let map = maps.find(map => map.name === 'new');
	if(y < height){	
		
		if(maps_hozon.length == 0){
			maps_hozon.push({ name: 'new', size: [{min: {x: mouseX, y: mouseY}, max: {x: mouseX, y: mouseY}}], color:'#ff8c00', active: false });
			console.log("初回リリース");
			console.log(maps_hozon);
			console.log(maps_hozon[0].size);
		}else{
			maps_hozon[0].size.push(map.size[0]);
			console.log("２回目リリース");
			console.log(maps_hozon);
			console.log(maps_hozon[0].size);
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
			distance = dist(mouseX, mouseY, map.size.min.x, map.y);
			if (distance < radius) {
				map.active = true;
				map.color = '#f00';
				$('[name="name"]').val([map.name]);
				if(map.name === 'new'){
					$('[name="name"]').prop('disabled', false);
				}else{
					$('[name="name"]').prop('disabled', true);
				}
			} else {
				map.active = false;
				map.color = '#ff8c00';
			}
		}
	}
  	return false;
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
	}
	console.log(map);
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
}
