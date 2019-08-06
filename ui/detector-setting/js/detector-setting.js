let bg;
let radius = 8;
let detectors = [];
let originalDetectors = [];
let maps = [];
let originalMaps = [];
let width = 1020;
let height = 645;

function setup() {
	let canvas = '';
	canvas = createCanvas(width, height);
	canvas.parent('configmap');
	bg = loadImage("../../assets/lab3f.png");
	background(255);

	$.ajax({
		url:'http://localhost:3000/api/detector',
		type:'GET'
	}).done( (data) => {
		if(data) { 
			originalDetectors = data;
			detectors = originalDetectors.concat();
			for(let detector of detectors) {
				detector.color = '#ff8c00';
				detector.active = false;
			}
		}
	});

	$.ajax({
		url:'http://localhost:3000/api/map',
		type:'GET'
	}).done( (data1) => {
		if(data1) { 
			originalMaps = data1;
			maps = originalMaps.concat();
			for(let map of maps) {
				map.active = false;
			}
		}
	});
	
	ellipseMode(RADIUS);
	$(".submit").click(detectorSubmit);
	$(".delete").click(detectorDelete);
}

function draw() {
    clear();
    if(bg) image(bg, 0, 0, width, height);
    if (detectors.length > 0) {
        for (let detector of detectors) {
            fill(detector.color);
            ellipse(detector.detectorGrid.x, detector.detectorGrid.y, radius, radius);
            if(detector.active) {
			textSize(10);
			let dMap = maps.find(map => map.mapID === detector.detectorMap);
			if(dMap){
				text(`detectorNumber: ${detector.detectorNumber} \n x: ${detector.detectorGrid.x} y: ${detector.detectorGrid.y} \n detectorMap: ${dMap.name}`, detector.detectorGrid.x+radius+5, detector.detectorGrid.y);
				fill('#000000');
			}else{
				text(`detectorNumber: ${detector.detectorNumber} \n x: ${detector.detectorGrid.x} y: ${detector.detectorGrid.y} \n detectorMap: ${detector.detectorMap}`, detector.detectorGrid.x+radius+5, detector.detectorGrid.y);
				fill('#000000');
			}
            }
        }
    }
}

function mousePressed() {
	if (detectors.length > 0) {
		for (let detector of detectors) {
			distance = dist(mouseX, mouseY, detector.detectorGrid.x, detector.detectorGrid.y);
			if (distance < radius) {
				if(detector.detectorNumber === 'new'){
					detector.active = true;
					detector.color = '#f00';
					$('[name="detectorNumber"]').val([detector.detectorNumber]);
					$('[name="detectorGrid.x"]').val([detector.detectorGrid.x]);
					$('[name="detectorGrid.y"]').val([detector.detectorGrid.y]);
					$('[name="detectorMap"]').val([detector.detectorMap]);
					$('[name="detectorMap"]').prop('disabled', true);
					$('[name="detectorNumber"]').prop('disabled', false);
				}else{
					let dMap = maps.find(map => map.mapID === detector.detectorMap);
					detector.active = true;
					detector.color = '#f00';
					$('[name="detectorNumber"]').val([detector.detectorNumber]);
					$('[name="detectorGrid.x"]').val([detector.detectorGrid.x]);
					$('[name="detectorGrid.y"]').val([detector.detectorGrid.y]);
					$('[name="detectorMap"]').val([dMap.name]);
					$('[name="detectorMap"]').prop('disabled', true);
					$('[name="detectorNumber"]').prop('disabled', true);
				}
				if(detector.detectorNumber === 'new'){
					$('[name="detectorNumber"]').prop('disabled', false);
				}else{
					$('[name="detectorNumber"]').prop('disabled', true);
				}
			} else {
				detector.active = false;
				detector.color = '#ff8c00';
			}
		}
	}
  return false;
}

function doubleClicked() {
	let c = false;
	if (maps.length > 0) {
		for (let map of maps) {
			for(i = 0; map.size.length > i; i++){
				if(map.size[i].max.x - mouseX > 0 && mouseX - map.size[i].min.x > 0 &&
					map.size[i].max.y - mouseY > 0 && mouseY - map.size[i].min.y > 0){
					detectors.push({ detectorNumber: 'new', detectorGrid: {x: mouseX, y: mouseY}, 
									detectorMap: map.name, color:'#ff8c00', active: false });
					c = true;
					break;
				} 
			}
		}
		if(!c){
			alert("先にマップを登録してください");
		}
	  return false;
	}
}

const returnMapID = (mapName) =>{
	let Id = maps.find(map => map.mapID === mapName);
	if(Id){
		return mapName;
	}else{
		let MapID = maps.find(map => map.name === mapName);
		return MapID.mapID;
	}
}

function mouseDragged() {
	let mapName;
    if (detectors.length > 0) {
        for (let detector of detectors) {
            if (detector.active) {
				let dMap = maps.find(map => map.mapID === detector.detectorMap);
				if(dMap){
                	detector.detectorGrid.x = mouseX;
                	detector.detectorGrid.y = mouseY;
                	$('[name="detectorGrid.x"]').val([detector.detectorGrid.x]);
					$('[name="detectorGrid.y"]').val([detector.detectorGrid.y]);
				
					for (let map of maps) {
						for(i = 0; map.size.length > i; i++){
							if(map.size[i].max.x - mouseX > 0 && mouseX - map.size[i].min.x > 0 &&
						   	   map.size[i].max.y - mouseY > 0 && mouseY - map.size[i].min.y > 0){
								mapName = map.name;
							}
						}
					}
					if (mapName != dMap.name){
						alert("登録したときのマップからディテクターがはみ出さないようにしてください");
						detector.active = false;
					}
					break;
				}else{
					detector.detectorGrid.x = mouseX;
                	detector.detectorGrid.y = mouseY;
                	$('[name="detectorGrid.x"]').val([detector.detectorGrid.x]);
					$('[name="detectorGrid.y"]').val([detector.detectorGrid.y]);
				
					for (let map of maps) {
						for(i = 0; map.size.length > i; i++){
							if(map.size[i].max.x - mouseX > 0 && mouseX - map.size[i].min.x > 0 &&
						   	   map.size[i].max.y - mouseY > 0 && mouseY - map.size[i].min.y > 0){
								mapName = map.name;
							}
						}
					}
					if (mapName != detector.detectorMap){
						alert("登録したときのマップからディテクターがはみ出さないようにしてください");
						detector.active = false;
					}
					break;
				}
            }
        } 
    }
    return false;
}

const detectorSubmit = function detectorSubmit() {
	const detectorNumber = Number($('[name="detectorNumber"]').val());
	const detectorGrid_x = $('[name="detectorGrid.x"]').val();
	const detectorGrid_y = $('[name="detectorGrid.y"]').val();

	let dMap = maps.find(map => map.name === $('[name="detectorMap"]').val());
	const detectorMap = dMap.mapID;

	let detector = detectors.find(detector => detector.detectorNumber === detectorNumber);
	if(!detector) {
		detector = detectors.find(detector => detector.detectorNumber === 'new');
		detector.detectorNumber = detectorNumber;
		detector.detectorGrid.x = Number(detectorGrid_x);
		detector.detectorGrid.y = Number(detectorGrid_y);
		detector.detectorMap = detectorMap;
		$.ajax({
			url:'http://localhost:3000/api/detector/',
			type:'POST',
			data: JSON.stringify(detector),
			contentType: "application/json; charset=utf-8"
		});
		window.location.reload();
	}else {
		detector.detectorGrid.x = Number(detectorGrid_x);
		detector.detectorGrid.y = Number(detectorGrid_y);
		detector.detectorMap = detectorMap;
		$.ajax({
			url:'http://localhost:3000/api/detector/axis',
			type:'PUT',
			data: JSON.stringify(detector),
			contentType: "application/json; charset=utf-8"
		});
		window.location.reload();
	}
}

const detectorDelete = function detectorDelete() {
	const detectorNumber = Number($('[name="detectorNumber"]').val());
	if(detectorNumber) {
		const num = detectors.findIndex(detector => detector.detectorNumber === detectorNumber);
		detectors.splice( num, 1 );
		$.ajax({
			url:'http://localhost:3000/api/detector',
			type:'DELETE',
			data: JSON.stringify({detectorNumber}),
			contentType: "application/json; charset=utf-8"
		});
		window.location.reload();
	}
}
