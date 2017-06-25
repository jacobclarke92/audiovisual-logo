import $ from 'jquery'
import _debounce from 'lodash/debounce'

let debounce = 100; //ms

const resizeCallbacks = [];
let screenWidth = $(window).width();
let screenHeight = $(window).height();

export function setDebounce(db = 100) {
	debounce = db;
}

export function getPixelDensity() {
	return window.devicePixelRatio || 1;
}

export const getScreenWidth = () => screenWidth;
export const getScreenHeight = () => screenHeight;

export function hasPointerLock() {
	return (
		'pointerLockElement' in document ||
		'mozPointerLockElement' in document ||
		'webkitPointerLockElement' in document
	);
}

export function requestPointerLock(element) {
	if(!element) return;
	element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
	element.requestPointerLock();
}

export function exitPointerLock() {
	document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
	document.exitPointerLock();
}

export function addResizeCallback(func) {
	resizeCallbacks.push(func);
}

export function removeResizeCallback(func) {
	const index = resizeCallbacks.indexOf(func);
	if(index >= 0) resizeCallbacks.splice(index, 1);
}

export function triggerResize() {
	_resizeCallback();
}

function _resizeCallback() {
	screenWidth = $(window).width();
	screenHeight = $(window).height();
	for(let callback of resizeCallbacks) {
		callback(screenWidth, screenHeight);
	}
}

const resizeCallback = _debounce(_resizeCallback, 100);
$(window).on('resize', resizeCallback);