let bg;
let radius = 8;
let maps = [];
let originalMaps = [];
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
        for (let map of maps) {
			fill(0, 50);
			ellipse(map.size.min.x, map.size.min.y, radius, radius);
			ellipse(map.size.max.x, map.size.max.y, radius, radius);
			quad(map.size.min.x, map.size.min.y, map.size.max.x, map.size.min.y, 
				map.size.max.x, map.size.max.y, map.size.min.x, map.size.max.y);
            if(map.active) {
            textSize(10);
			text(`mapName: ${map.mapName} `, map.size.min.x+radius+5, map.size.min.y);
            fill('#000000');
            }
        }
    }
}

function mousePressed() {
	maps.push({ name: 'new', size: {min: {x: mouseX, y: mouseY}, max: {x: mouseX, y: mouseY}}, color:'#ff8c00', active: false });
    return false;
}

function mouseReleased(){
	let map = maps.find(map => map.name === 'new');
	
	if(map.name === 'new'){
		$('[name="name"]').prop('disabled', false);
	}else{
		$('[name="name"]').prop('disabled', true);
	}
    return false;
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
	let map = maps.find(map => map.name === 'new');
	map.size.max = { x: mouseX, y: mouseY };
}

const mapSubmit = function mapSubmit() {
	let map1 = maps.find(map => map.name === 'new');
	const mapName = $('[name="name"]').val();
	const mapSize_min_x = map1.size.min.x;
	const mapSize_min_y = map1.size.min.y;
	const mapSize_max_x = map1.size.max.x;
	const mapSize_max_y = map1.size.max.y;
	let map = maps.find(map => map.name === mapName);
	if(!map) {
		map = maps.find(map => map.name === 'new');
		map.name = mapName;
		map.size.min.x = Number(mapSize_min_x);
		map.size.min.y = Number(mapSize_min_y);
		map.size.max.x = Number(mapSize_max_x);
		map.size.max.y = Number(mapSize_max_y);

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
