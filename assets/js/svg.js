
var ghLogo = project.importSVG(document.getElementById('gh-logo'), {expandShapes: true, insert: true});
var gPath, hPath, topLeft, topRight, frontLeft, frontRight;

var adjShapes = [];

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
        adjShapes.push(ghLogo.children[i]);
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
}

var i;
var movablePoints = [];

for (i=0; i < adjShapes.length; i++) {
    var j;
    var curShape = adjShapes[i];
    for (j=0; j < curShape.segments.length; j++) {
        var curPoint = curShape.segments[j];
        var k;
        for (k=0; k < hPath.segments.length; k++) {
            var comparePoint = hPath.segments[k].point;
            var pointDist = curPoint.point.getDistance(comparePoint, true);
            if (pointDist < 25) {
                movablePoints.push(curPoint);
            }
        }
    }
}

// for (i=0; i< frontLeft.segments.length; i++) {
//     if (frontLeft.segments[i].point.x > 95 && frontLeft.segments[i].point.x < 96) {
//         movablePoints.push(frontLeft.segments[i]);
//     }
// }

// for (i=0; i< topLeft.segments.length; i++) {
//     if (topLeft.segments[i].point.y > 75 && topLeft.segments[i].point.y < 89) {
//         movablePoints.push(topLeft.segments[i]);
//     }
// }

// for (i=0; i< topRight.segments.length; i++) {
//     if (topRight.segments[i].point.y > 49 && topRight.segments[i].point.y < 63) {
//         movablePoints.push(topRight.segments[i]);
//     }
// }

// for (i=0; i< frontRight.segments.length; i++) {
//     if (frontRight.segments[i].point.x > 139 && frontRight.segments[i].point.x < 140) {
//         movablePoints.push(frontRight.segments[i]);
//     }
// }

console.log(movablePoints);
// movablePoints[0].point = new Point(0,0);

project.view.onMouseMove = function(e) {
    if (isMouseDown) {
        var pointDiff = Object.assign({}, e.point-prevPoint)
        // Calculate 30deg height (driven by x-direction)
        var yDiff = (e.point-prevPoint).x/Math.sqrt(3);
        var diff = new Point(pointDiff.x, yDiff);
        var i;
        for (i=0; i < movablePoints.length; i++) {
            movablePoints[i].point = movablePoints[i].point + diff;
        }
        // movablePoints[0].point = movablePoints[0].point + diff;
        // movablePoints[1].point = movablePoints[1].point + diff;
        hPath.translate(diff);
    }
    prevPoint = e.point;
}

