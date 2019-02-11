
var ghLogo = project.importSVG(document.getElementById('gh-logo'), {expandShapes: true, insert: true});
var gPath, hPath;
var xPos = 0;
var yPos = 0;
var shapes = [];

// Keep track of handles to control
var handlesIn = [];
var handlesOut = [];


var prevMouse = new Point(0,0);
var isMouseDown = false;




var i;
for (i = 0; i < ghLogo.children.length; i++) {
    var childName = ghLogo.children[i].name;
    if (childName == 'g-path') {
        gPath = ghLogo.children[i];
    } else if (childName == 'h-path') {
        hPath = ghLogo.children[i];
    } else if (childName == 'top-left' || childName == 'top-right' || childName == 'front-left' || childName == 'front-right') {
        shapes.push(ghLogo.children[i]);
    } 
}
// console.log(project.activeLayer.children);

hPath.onMouseDown = function(e) {
    counter = 0;
    isMouseDown = true;
    prevPoint = e.point;
}

project.view.onMouseUp = function(e) {
    isMouseDown = false;
    prevPoint = e.point;
    hPath.tween({
        'position.x': ['-=', xPos],
        'position.y': ['-=', yPos]
    }, {
        easing: 'easeInOutCubic',
        duration: 250
    })
    var i;
    for (i=0; i < shapes.length; i++) {
        var curShape = shapes[i];
        var j;
        for (j=0; j < movablePoints[curShape].length; j++) {
            var curIndex = movablePoints[curShape][j];
            var xString = 'segments[' + String(curIndex) + '].point.x';
            var yString = 'segments[' + String(curIndex) + '].point.y';
            var to = {};
            to[xString] = ['-=', xPos];
            to[yString] = ['-=', yPos];
            // console.log(curshape.segments)
            curShape.tween(to, {
                easing: 'easeInOutCubic',
                duration: 250
            })
        }

        var k;
        for (k=0; k < handlesIn[curShape].length; k++) {
            var indexIn = handlesIn[curShape][k];
            var indexOut = handlesOut[curShape][k];
            var handleInX = 'segments[' + String(indexIn) + '].handleIn.x';
            var handleInY = 'segments[' + String(indexIn) + '].handleIn.y';
            var handleOutX = 'segments[' + String(indexOut) + '].handleOut.x';
            var handleOutY = 'segments[' + String(indexOut) + '].handleOut.y';
            var to = {};
            to[handleInX] = 0;
            to[handleInY] = 0;
            to[handleOutX] = 0;
            to[handleOutY] = 0;
            curShape.tween(to, {
                easing: 'easeInOutCubic',
                duration: 250
            })
        }
    }
    xPos = 0;
    yPos = 0;
}


function getTangentPoints(shape, adjShapes) {
    var movablePoints = {};
    var i;
    for (i=0; i < adjShapes.length; i++) {
        var j;
        var curShape = adjShapes[i];
        for (j=0; j < curShape.segments.length; j++) {
            var curPoint = curShape.segments[j];
            var k;
            for (k=0; k < shape.segments.length; k++) {
                var comparePoint = shape.segments[k].point;
                var pointDist = curPoint.point.getDistance(comparePoint, true);
                if (pointDist < 25) {
                    // Add the current index to the list of movable points
                    
                    if (curShape in movablePoints) {
                        movablePoints[curShape].push(j);
                    } else {
                        movablePoints[curShape] = [j];
                        handlesIn[curShape] = [];
                        handlesOut[curShape] = []; 
                    }
                    
                }
            }
        }
        var points = movablePoints[curShape];
        // Insert new points
        var handleOffset = new Point(50, 50/Math.sqrt(3))
        var newFirstPoint = new Point(curShape.segments[points[0]].point.x, curShape.segments[points[0]].point.y);
        var newFirstHandle = newFirstPoint + handleOffset;
        var newFirstSeg = new Segment(newFirstPoint, null, new Point(0,0));

        var newSecondPoint = new Point(curShape.segments[points[1]].point.x, curShape.segments[points[1]].point.y);
        var newSecondHandle = newSecondPoint + handleOffset;
        var newSecondSeg = new Segment(newSecondPoint, null, new Point(0,0));

        if (points[1]-points[0] == 1) { // Moving points are adjacent
            handlesOut.push(new Point(0,0));
            curShape.insertSegments(points[0], [new Segment(newFirstPoint, null, handlesOut[handlesOut.length-1])]);
            console.log(points[0])
            curShape.insertSegments(points[1]+2, [newSecondSeg]);
            points[0]++;
            points[1]++;
            handlesOut[curShape].push(points[0]-1);
            handlesIn[curShape].push(points[1]+1);
        } else { // Moving points aren't adjacent
            curShape.insertSegments(points[0]+1, [newFirstSeg]);
            curShape.insertSegments(points[1]+1, [newSecondSeg]);
            points[1]+= 2;
            handlesIn[curShape].push(points[0]+1);
            handlesOut[curShape].push(points[1]-1);
        }
        // console.log(curShape.segments);
        curShape.fullySelected = true;
        console.log(curShape.segments[5]);
        // curShape.segments[5].handleOut = new Point(50,50);
    }
    handlesOut[0].x = 50;
    

    return movablePoints;
}

var movablePoints = getTangentPoints(hPath, shapes);
var counter = 0;
project.view.onMouseMove = function(e) {
    if (isMouseDown) {
        var pointDiff = Object.assign({}, e.point-prevPoint)
        xPos += pointDiff.x;
        // Calculate 30deg height (driven by x-direction)
        var yDiff = (e.point-prevPoint).x/Math.sqrt(3);
        // yPos += yDiff;
        yPos += pointDiff.y;
        var diff = new Point(pointDiff.x, pointDiff.y);
        var i;
        for (i=0; i < shapes.length; i++) {
            var curShape = shapes[i];
            var j;
            for (j=0; j < movablePoints[curShape].length; j++) {
                var curIndex = movablePoints[curShape][j];
                curShape.segments[curIndex].point = curShape.segments[curIndex].point + diff;
                // console.log(curShape.segments[curIndex].handleIn)
            }

            var k;
            for (k=0; k < handlesIn[curShape].length; k++) {
                var indexIn = handlesIn[curShape][k];
                var indexOut = handlesOut[curShape][k];
                // curShape.segments[indexIn].handleIn = curShape.segments[indexIn].handleIn + new Point(pointDiff.x, Math.sin(counter/10)*30);
                // curShape.segments[indexOut].handleOut = curShape.segments[indexOut].handleOut + new Point(pointDiff.x, Math.sin(counter/10)*30);
                curShape.segments[indexIn].handleIn.x += pointDiff.x*.5;
                curShape.segments[indexIn].handleIn.y += yDiff*.5;//curShape.segments[indexIn].handleIn + new Point(pointDiff.x, yDiff);
                curShape.segments[indexOut].handleOut.x += pointDiff.x*.5;
                curShape.segments[indexOut].handleOut.y += yDiff*.5;
            }
        }
        // counter++;
        // movablePoints[0].point = movablePoints[0].point + diff;
        // movablePoints[1].point = movablePoints[1].point + diff;
        hPath.translate(diff);
    }
    prevPoint = e.point;
}

var origin = new Point(0,0);
function onFrame(event) {
    if (isMouseDown) {
        var offset = Math.sin(counter/5);
        var i;
        for (i=0; i < shapes.length; i++) {
            var curShape = shapes[i];
            var k;
            for (k=0; k < handlesIn[curShape].length; k++) {
                var indexIn = handlesIn[curShape][k];
                var indexOut = handlesOut[curShape][k];
                // console.log(curShape.segments[indexIn].handleIn)
                var distIn = curShape.segments[indexIn].handleIn.getDistance(origin);
                curShape.segments[indexIn].handleIn.y -= (curShape.segments[indexIn].handleIn.x*.05)*offset;
                curShape.segments[indexIn].handleIn.x += (curShape.segments[indexIn].handleIn.y*.05)*offset;

                var distOut = curShape.segments[indexOut].handleOut.getDistance(origin);
                curShape.segments[indexOut].handleOut.y -= (curShape.segments[indexOut].handleOut.x*.05)*offset;
                curShape.segments[indexOut].handleOut.x += (curShape.segments[indexOut].handleOut.y*.05)*offset;

                // curShape.segments[indexOut].handleOut.y += Math.sin(counter/5)*(curShape.segments[indexIn].handleIn.x/10);
            }
        }
        counter++;
    }
}

