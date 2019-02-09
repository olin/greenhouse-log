
var ghLogo = project.importSVG(document.getElementById('gh-logo'), {expandShapes: true, insert: true});
var gPath, hPath;
var xPos = 0;
var yPos = 0;
var shapes = [];


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
    isMouseDown = true;
    prevPoint = e.point;
}

project.view.onMouseUp = function(e) {
    isMouseDown = false;
    prevPoint = e.point;
    console.log(xPos);
    hPath.tween({
        'position.x': hPath.position.x - xPos,
        'position.y': hPath.position.y - yPos
    }, 200)
    var i;
    for (i=0; i < shapes.length; i++) {
        var curShape = shapes[i];
        var j;
        for (j=0; j < movablePoints[curShape].length; j++) {
            var curIndex = movablePoints[curShape][j];
            var xString = 'segments[' + String(curIndex) + '].point.x';
            console.log(xString)
            var yString = 'segments[' + String(curIndex) + '].point.y';
            var to = {};
            to[xString] = ['-=', xPos];
            to[yString] = ['-=', yPos];
            // console.log(curshape.segments)
            curShape.tween(to, 200)
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
                    }
                    
                }
            }
        }
    }
    return movablePoints;
}

var movablePoints = getTangentPoints(hPath, shapes);

project.view.onMouseMove = function(e) {
    if (isMouseDown) {
        var pointDiff = Object.assign({}, e.point-prevPoint)
        xPos += pointDiff.x;
        // Calculate 30deg height (driven by x-direction)
        var yDiff = (e.point-prevPoint).x/Math.sqrt(3);
        yPos += yDiff;
        var diff = new Point(pointDiff.x, yDiff);
        var i;
        for (i=0; i < shapes.length; i++) {
            var curShape = shapes[i];
            var j;
            for (j=0; j < movablePoints[curShape].length; j++) {
                var curIndex = movablePoints[curShape][j];
                curShape.segments[curIndex].point = curShape.segments[curIndex].point + diff;
            }
        }
        // movablePoints[0].point = movablePoints[0].point + diff;
        // movablePoints[1].point = movablePoints[1].point + diff;
        hPath.translate(diff);
    }
    prevPoint = e.point;
}

