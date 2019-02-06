
var ghLogo = project.importSVG(document.getElementById('gh-logo'), {expandShapes: true, insert: true});
var gPath;
var hPath;
var prevMouse = new Point(0,0);
var isMouseDown = false;



var i;
for (i = 0; i < ghLogo.children.length; i++) {
    if (ghLogo.children[i].name == 'g-path') {
        gPath = ghLogo.children[i];
    } else if (ghLogo.children[i].name == 'h-path') {
        hPath = ghLogo.children[i];
    }
    // const child = ghLogo.children[i];
    // console.log(child.id)
    console.log(ghLogo.children[i].name)
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

project.view.onMouseMove = function(e) {
    if (isMouseDown) {
        var pointDiff = Object.assign({}, e.point-prevPoint)
        var yDiff = (e.point-prevPoint).x/Math.sqrt(3)
        hPath.translate(new Point(pointDiff.x, yDiff));
        console.log(e.point-prevPoint);
    }
    prevPoint = e.point;
}

