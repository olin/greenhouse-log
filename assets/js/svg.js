// var path = new Path();
// // Give the stroke a color
// path.strokeColor = 'black';
// var start = new Point(100, 100);
// // Move to start and draw a line from there
// path.moveTo(start);
// // Note the plus operator on Point objects.
// // PaperScript does that for us, and much more!
// path.lineTo(start + [ 100, -50 ]);

var ghLogo = project.importSVG(document.getElementById('gh-logo'), {expandShapes: true, insert: true});
// project.importSVG('/assets/ghlogo.svg', {expandShapes: true, insert: true});
// ghLogo.place();
console.log(ghLogo.children);
var i;

var gPath;
var hPath;
for (i = 0; i < ghLogo.children.length; i++) {
    // const pathName = ghLogo.children[i].name;
    // if (pathName == 'g-path') {
    //     gPath = ghLogo.children[i];
    // } else if (pathName == 'h-path') {
    //     hPath = ghLogo.children[i];
    // }
    // const child = ghLogo.children[i];
    // console.log(child.id)
    console.log(ghLogo.children[i].name)
}
// console.log(project.activeLayer.children);

// hPath.onMouseDown = function(e) {
//     console.log('click');
// }

