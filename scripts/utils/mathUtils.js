export const radToDeg = rad => rad*180/Math.PI;
export const degToRad = deg => deg/180*Math.PI;
export const randomFloat = (min, max) => min + Math.random()*(max-min);
export const randomInt = (min, max) => min + Math.round(Math.random()*(max-min));
export const getRandomValueFromArray = array => array[Math.floor(Math.random()*array.length)];
export const getDist = (pt1, pt2) => Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));