let bg;
let maps = [];
let originalMaps = [];
let metas = [];
let originalMetas = [];
let metas_hozon = [];
let width = 1020;
let height = 645;

function setup() {
	let canvas = '';
	canvas = createCanvas(width, height);
	canvas.parent('settingmeta');
	bg = loadImage("../../assets/lab3f.png");
    background(255);
    
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
    
    $.ajax({
		url:'http://localhost:3000/api/meta',
		type:'GET'
	}).done( (data2) => {
		if(data2) { 
			originalMetas = data2;
			metas = originalMetas.concat();
			for(let meta of metas) {
				meta.active = false;
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

	$(".submit").on('click', metaSubmit);
	$(".delete").on('click',metaDelete);
}

function draw() {
    clear();
    if(bg) image(bg, 0, 0, width, height);
    if (maps.length > 0) {
		for(let map of maps) {
			for(i = 0; map.size.length > i; i++ ){
				fill('rgba(255,150,0,0.5)');
				quad(map.size[i].min.x, map.size[i].min.y, map.size[i].max.x, map.size[i].min.y, 
					map.size[i].max.x, map.size[i].max.y, map.size[i].min.x, map.size[i].max.y);
            }
        }
    }
    
    if (metas.length > 0) {
		for(let meta of metas) {
			for(i = 0; meta.size.length > i; i++ ){
				fill(0,30);
				quad(meta.size[i].min.x, meta.size[i].min.y, meta.size[i].max.x, meta.size[i].min.y, 
					meta.size[i].max.x, meta.size[i].max.y, meta.size[i].min.x, meta.size[i].max.y);
			}
			
			if(meta.active) {
				for(i = 0; meta.size.length > i; i++ ){
					fill(0,80);
					quad(meta.size[i].min.x, meta.size[i].min.y, meta.size[i].max.x, meta.size[i].min.y, 
						meta.size[i].max.x, meta.size[i].max.y, meta.size[i].min.x, meta.size[i].max.y);
				}
			}
    	}
	}
	if (metas_hozon.length > 0) {
		for(i = 0; metas_hozon[0].size.length > i; i++ ){
			fill(0,50);
			quad(metas_hozon[0].size[i].min.x, metas_hozon[0].size[i].min.y, metas_hozon[0].size[i].max.x, metas_hozon[0].size[i].min.y, 
				metas_hozon[0].size[i].max.x, metas_hozon[0].size[i].max.y, metas_hozon[0].size[i].min.x, metas_hozon[0].size[i].max.y);
		}
	}
}

function mousePressed() {
	let y = mouseY;
	let meta = metas.find(meta => meta.name === 'new');
	if(y < height){
		if(!meta){
			metas.push({ name: 'new', size: [{min: {x: mouseX, y: mouseY}, max: {x: mouseX, y: mouseY}}], active: false });
		}else{
			metas.pop();
			metas.push({ name: 'new', size: [{min: {x: mouseX, y: mouseY}, max: {x: mouseX, y: mouseY}}], active: false });
		}
		return false;
	}
}

function mouseReleased(){
	let y = mouseY;
	let meta = metas.find(meta => meta.name === 'new');
	
	if(y < height){	
		if(metas_hozon.length == 0){
			metas_hozon.push({ name: 'new', size: [{min: {x: meta.size[0].min.x, y: meta.size[0].min.y}, max: {x: mouseX, y: mouseY}}], active: false });
		}else{
			metas_hozon[0].size.push(meta.size[0]);
			for(i = 0; metas_hozon[0].size.length > i; i++){
				meta.size[i] = metas_hozon[0].size[i];
			}
		}
		if(meta.name === 'new'){
			$('[name="name"]').prop('disabled', false);
		}else{
			$('[name="name"]').prop('disabled', true); 
		}
		return false;
	}	
}

function doubleClicked() {
	if (metas.length > 0) {
		for (let meta of metas) {
			for(i = 0; meta.size.length > i; i++){
				if(meta.size[i].max.x - mouseX > 0 && mouseX - meta.size[i].min.x > 0 &&
					meta.size[i].max.y - mouseY > 0 && mouseY - meta.size[i].min.y > 0){
					$('[name="name"]').val([meta.name]);
					meta.active = true;
					break;
				} else {
					meta.active = false;
				}
			}
		}
	  return false;
	}
}

function mouseDragged() {
	let y = mouseY;
	if(y < height){
		let meta = metas.find(meta => meta.name === 'new');
		meta.size[0].max = { x: mouseX, y: mouseY };
	}
}

const metaSubmit = function metaSubmit() {
	let meta1 = metas.find(meta => meta.name === 'new');
	const metaName = $('[name="name"]').val();
	const metaSize = []
	for(i = 0; meta1.size.length > i; i++ ){
		metaSize[i] = meta1.size[i] 
	}
	let meta = metas.find(meta => meta.name === metaName);
	if(!meta) { 
		meta = metas.find(meta => meta.name === 'new');
		meta.name = metaName;
		meta.size = metaSize;
		$.ajax({
			url:'http://localhost:3000/api/meta/',
			type:'POST',
			data: JSON.stringify(meta),
			contentType: "application/json; charset=utf-8"
		});
		window.location.reload();
	}
}

const metaDelete = function metaDelete() {
	const metaName = $('[name="name"]').val();
	if(metaName) {
		const num = metas.findIndex(meta => meta.name === metaName);
		metas.splice( num, 1 );
		$.ajax({
			url:'http://localhost:3000/api/meta',
			type:'DELETE',
			data: JSON.stringify({metaName}),
			contentType: "application/json; charset=utf-8"
		});
	}
	window.location.reload();
}
