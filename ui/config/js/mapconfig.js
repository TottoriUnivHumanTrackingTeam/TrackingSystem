let bg;
let radius = 8;
let detectors = [];
let originalDetectors = [];
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
			text(`detectorNumber: ${detector.detectorNumber} \n x: ${detector.detectorGrid.x} y: ${detector.detectorGrid.y} \n detectorMap: ${detector.detectorMap}`, detector.detectorGrid.x+radius+5, detector.detectorGrid.y);
            fill('#000000');
            }
        }
    }
}

function mousePressed() {
	if (detectors.length > 0) {
		for (let detector of detectors) {
			distance = dist(mouseX, mouseY, detector.detectorGrid.x, detector.detectorGrid.y);
			if (distance < radius) {
				detector.active = true;
				detector.color = '#f00';
				$('[name="detectorNumber"]').val([detector.detectorNumber]);
				$('[name="detectorGrid.x"]').val([detector.detectorGrid.x]);
				$('[name="detectorGrid.y"]').val([detector.detectorGrid.y]);
				$('[name="detectorMap"]').val([detector.detectorMap]);
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
	detectors.push({ detectorNumber: 'new', detectorGrid: {x: mouseX, y: mouseY}, 
					detectorMap: 'new', color:'#ff8c00', active: false });
    return false;
  }
  // Run when the mouse/touch is dragging.
function mouseDragged() {
    if (detectors.length > 0) {
        for (let detector of detectors) {
            if (detector.active) {
                detector.detectorGrid.x = mouseX;
                detector.detectorGrid.y = mouseY;
                $('[name="detectorGrid.x"]').val([detector.detectorGrid.x]);
                $('[name="detectorGrid.y"]').val([detector.detectorGrid.y]);
                break;
            }
        } 
    }
    // Prevent default functionality.
    return false;
}

const detectorSubmit = function detectorSubmit() {
	const detectorNumber = $('[name="detectorNumber"]').val();
	const detectorGrid_x = $('[name="detectorGrid.x"]').val();
	const detectorGrid_y = $('[name="detectorGrid.y"]').val();
	const detectorMap = $('[name="detectorMap"]').val();
	let detector = detectors.find(detector => detector.detectorNumber === detectorNumber);
	if(!detector) {
		detector = detectors.find(detector => detector.detectorNumber === 'new');
		detector.detectorNumber = detectorNumber;
		detector.detectorGrid.x = Number(detectorGrid_x);
		detector.detectorGrid.y = Number(detectorGrid_y);
		detector.detectorMap = detectorMap;
		console.log(detector);
		$.ajax({
			url:'http://localhost:3000/api/detector/',
			type:'POST',
			data: JSON.stringify(detector),
			contentType: "application/json; charset=utf-8"
		});
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
	}
}

const detectorDelete = function detectorDelete() {
	const detectorNumber = Number($('[name="detectorNumber"]').val());
	if(detectorNumber) {
		const num = detectors.findIndex(detector => detector.detectorNumber === detectorNumber);
		detectors.splice( num, 1 );
		console.log(detectors)
		$.ajax({
			url:'http://localhost:3000/api/detector',
			type:'DELETE',
			data: JSON.stringify({detectorNumber}),
			contentType: "application/json; charset=utf-8"
		});
	}
}
