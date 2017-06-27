import $ from 'jquery'
import { 
	autoDetectRenderer,
	Container, 
	Graphics,
	Point,
	Sprite,
	BLEND_MODES,
	loader,
} from 'pixi.js'
import { 
	addResizeCallback, 
	getPixelDensity, 
	getScreenWidth, 
	getScreenHeight 
} from './utils/screenUtils'
import {
	radToDeg,
	degToRad,
	randomInt,
	randomFloat,
	getRandomValueFromArray,
} from './utils/mathUtils'


const backgroundColor = 0x010006;

let showingUI = true;

// Set screen size
let screenWidth = getScreenWidth()/getPixelDensity();
let screenHeight = getScreenHeight()/getPixelDensity();

// Init PIXI renderer
const $app = $('#stage');
const renderer = autoDetectRenderer({
	width: screenWidth, 
	height: screenHeight, 
	resolution: getPixelDensity(),
	transparent: false,
	backgroundColor,
	antialias: true,
	// forceCanvas: true, // my laptop gpu is fucked
});	
const canvas = renderer.view;
$app.append(canvas);

$('.toggle-ui').on('click', function () {
	showingUI = !showingUI;
	if(showingUI) {
		// $(this).css('opacity', 1);
		$('#audio-box').show();
		barsContainer.renderable = true;
	}else{
		// $(this).css('opacity', 0);
		$('#audio-box').hide();
		barsContainer.renderable = false;
	}
});

const songs = [];
const $songButtons = $('.audio-buttons .button');
$songButtons.each(function() {
	const song = $(this).data('file');
	songs.push(song);
	$(this).on('click', () => {
		changeSong(song);
	});
});

const $text = $('#text');

// Initi audio vars
const ctx = new AudioContext();
const audio = document.getElementById('audio');
audio.crossOrigin = 'anonymous';
let currentSong = getRandomValueFromArray(songs);
changeSong(currentSong);
const audioSrc = ctx.createMediaElementSource(audio);

function changeSong(song) {
	currentSong = song;
	audio.src = 'assets/' /*(window.location.host.indexOf('localhost') >= 0 ? 'assets/' : 'https://bigsound.org.au/uploads/')*/ + currentSong;
	$('.audio-buttons .button').removeClass('active');
	$('.button[data-file="'+currentSong+'"]').addClass('active');
}

// const lowPass = ctx.createBiquadFilter();
// audioSrc.connect(lowPass);
// lowPass.type = 'lowpass';
// lowPass.frequency.value = 40;

// const highPass = ctx.createBiquadFilter();
// audioSrc.connect(highPass);
// highPass.type = 'highpass';
// highPass.frequency.value = 10000;

// Connect audio analyser node
const analyser = ctx.createAnalyser();
audioSrc.connect(analyser);
analyser.connect(ctx.destination);

const frequencyData = new Uint8Array(analyser.frequencyBinCount);

audio.addEventListener('canplaythrough', function() {
	audio.volume = 1;//0.6;
	audio.play();
});

const bassRange = [0,6];
const midsRange = [16, 75];
const highsRange = [550, 650];

const bassColor = 0xFF0000;
const midsColor = 0x00FF00;
const highsColor = 0x0000FF;

// Create stage containers
const stage = new Container();
const logo = new Container();

let bass = null;
let mids = null;
let highs = null;
let hole = null;
let qLine = null;

const barsContainer = new Container();
const bars = [];

for(let i=0; i < frequencyData.length; i++) {
	const bar = new Graphics();
	bar.lineStyle(0,0,1);
	let color = 0xFFFFFF;
	if(i >= bassRange[0] && i <= bassRange[1]) color = bassColor;
	else if(i >= midsRange[0] && i <= midsRange[1]) color = midsColor;
	else if(i >= highsRange[0] && i <= highsRange[1]) color = highsColor;
	bar.beginFill(color);
	bar.drawRect(i*2, 0, 2, 100);
	bar.endFill();
	bar.cacheAsBitmap = true;
	bars.push(bar);
	barsContainer.addChild(bar);
}

function createBar(i) {
	
}


function init() {
	loader.once('complete', (loader, resources) => initScene());
	loader.add('circle', 'assets/circle.png');
	loader.load();
}

function initScene() {
	bass = new Sprite(loader.resources['circle'].texture);
	bass.tint = 0xFF0000;
	mids = new Sprite(loader.resources['circle'].texture);
	mids.tint = 0x00FF00;
	highs = new Sprite(loader.resources['circle'].texture);
	highs.tint = 0x0000FF;

	hole = new Sprite(loader.resources['circle'].texture);
	hole.tint = backgroundColor;

	bass.anchor = mids.anchor = highs.anchor = hole.anchor = {x: 0.5, y: 0.5};
	bass.blendMode = mids.blendMode = highs.blendMode = BLEND_MODES.SCREEN;

	qLine = new Graphics();
	qLine.beginFill(backgroundColor, 1);
	qLine.drawRect(0, -20, 300, 40);
	qLine.endFill();
	qLine.rotation = Math.PI/4;
	qLine.position = {x: 75, y: 75};

	logo.addChild(bass);
	logo.addChild(mids);
	logo.addChild(highs);
	logo.addChild(hole);
	logo.addChild(qLine);

	//if($(window).width() < 620) 
		logo.scale.set(0.75);

	// bass.position.x = -100;
	// highs.position.x = 100;
	logo.position = {x: screenWidth/2, y: screenHeight/2};
	stage.addChild(logo);
	barsContainer.position = {x: 0, y: 0};
	stage.addChild(barsContainer);

	animate();
}

function animate() {

	// update data in frequencyData
    analyser.getByteFrequencyData(frequencyData);

    // use averages
    const bassAverage = frequencyData.slice(bassRange[0], bassRange[1]).reduce((current, prev) => current+prev, 0) / (bassRange[1] - bassRange[0]) / 170 / 2;
    const midsAverage = frequencyData.slice(midsRange[0], midsRange[1]).reduce((current, prev) => current+prev, 0) / (midsRange[1] - midsRange[0]) / 140 / 2;
    const highsAverage = frequencyData.slice(highsRange[0], highsRange[1]).reduce((current, prev) => current+prev, 0) / (highsRange[1] - highsRange[0]) / 80 / 2;
    
    // use max values
    // const bassAverage = frequencyData.slice(bassRange[0], bassRange[1]).reduce((max, val) => val > max ? val : max, 0) / 200;
    // const midsAverage = frequencyData.slice(midsRange[0], midsRange[1]).reduce((max, val) => val > max ? val : max, 0) / 200;
    // const highsAverage = frequencyData.slice(highsRange[0], highsRange[1]).reduce((max, val) => val > max ? val : max, 0) / 200;
    
    // console.log(Math.round(bassAverage*100), Math.round(midsAverage*100), Math.round(highsAverage*100));
    bass.scale.set(bassAverage);
    mids.scale.set(midsAverage);
    highs.scale.set(highsAverage);
    hole.scale.set(Math.max(0, Math.min(bassAverage, midsAverage, highsAverage) - 0.15));

    // const qLinePos = [bass.width, mids.width, highs.width, hole.width].filter(val => !!val).sort()[1] / 2;
    // qLine.position = {x: qLinePos, y: qLinePos};

    if(showingUI) frequencyData.forEach((val, i) => {
    	bars[i].scale.y = val / 200;
    });

	// Render and repeat animation
	renderer.render(stage);
	window.requestAnimationFrame(animate);
}




// Called upon window resize, updates vars and renderer size
function handleResize(width, height) {
	screenWidth = width/getPixelDensity();
	screenHeight = height/getPixelDensity();
	logo.position = {x: screenWidth/2, y: screenHeight/2};
	renderer.resize(screenWidth, screenHeight);
}

// Add resize and onload callbacks
addResizeCallback(handleResize);
$(window).ready(init);