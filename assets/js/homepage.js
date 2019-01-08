var highlightMeshes = {};
            const FOV = 60;
            const tvMaterial = new THREE.MeshStandardMaterial( { color: 0x222222 } );
            const antennaMaterial = new THREE.MeshStandardMaterial( { color: 0x999999 } );
            var raycaster = new THREE.Raycaster();
            var mouse = new THREE.Vector2();
            var viewX = 0;
            var selectedObjects = [];
            var composer;
            var outlinePass;
            var hasMoved = false;

            // Setup scene and camera
			var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera( FOV, window.innerWidth/window.innerHeight, 0.1, 1000 );
            var clock = new THREE.Clock();
            var renderer = new THREE.WebGLRenderer();

            // Renderer setup
            renderer.setSize( window.innerWidth, window.innerHeight );
            renderer.shadowMap.enabled = true;
            document.body.appendChild( renderer.domElement );

            addLights(scene);

            composer = new THREE.EffectComposer( renderer );
            composer.setSize(window.innerWidth, window.innerHeight);

            var renderPass = new THREE.RenderPass( scene, camera );
            composer.addPass( renderPass );

            outlinePass = new THREE.OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
            composer.addPass( outlinePass );

            var copyPass = new THREE.ShaderPass( THREE.CopyShader );
            copyPass.renderToScreen = true;
            composer.addPass( copyPass );

            renderer.domElement.addEventListener( 'mousemove', onTouchMove );
            renderer.domElement.addEventListener( 'mousedown', onMouseDown );
            renderer.domElement.addEventListener( 'mouseup', onMouseUp );
            renderer.domElement.addEventListener( 'touchmove', onTouchMove );
            
            var controls = new THREE.DragControls( camera, renderer.domElement, FOV, viewX );
            camera.position.y = 2.4;
            // camera.position.z = 3;
            controls.lon = -90;
            controls.lat = -10;

            var woodTexture = new THREE.TextureLoader().load( "/assets/WoodTexture.png" );
            woodTexture.wrapS = THREE.RepeatWrapping;
            woodTexture.wrapT = THREE.RepeatWrapping;
            woodTexture.repeat.set( 20, 20 );

            var geometry = new THREE.PlaneGeometry( 100, 100, 1, 1 );
            var material = new THREE.MeshStandardMaterial( {map: woodTexture } );
            var floor = new THREE.Mesh( geometry, material );

            floor.material.roughness = .1;
            floor.material.metalness = .5;
            floor.material.side = THREE.DoubleSide;
            floor.rotation.x = 3.14 / 2;
            floor.receiveShadow = true;
            scene.add( floor ); 

            var wallTexture = new THREE.TextureLoader().load( "/assets/WallTexture.jpg" );
            wallTexture.wrapS = THREE.RepeatWrapping;
            wallTexture.wrapT = THREE.RepeatWrapping;
            wallTexture.repeat.set( 200, 200 );


            var geometry = new THREE.CylinderGeometry( 7, 7, 50, 32 );
            var cylMaterial = new THREE.MeshStandardMaterial( {map: wallTexture} );
            var cylinder = new THREE.Mesh( geometry, cylMaterial );
            cylinder.material.side = THREE.DoubleSide;
            cylinder.material.bumpMap = wallTexture;
            cylinder.material.bumpScale = 0.05;

            cylinder.material.roughness = 1;
            scene.add( cylinder );

            addTV(0, scene, 'video1');
            addTV(120, scene, 'video2');
            addTV(240, scene, 'video3');

            // Adds a TV object and pedestal
            function addTV (angle, scene, elemId) {

                // Create geometry
                var pedGeometry = new THREE.BoxGeometry( 1, 2, 1 );
                var screenGeometry = new THREE.BoxGeometry( .9, .9, 1, 1 );

                // Mesh is what shaders interact with
                

                // Making video texture
                video = document.getElementById( elemId );
                texture = new THREE.VideoTexture( video );
                const parameters = { color: 0xffffff, map: texture };

                // Create materials
                var screenMaterial = new THREE.MeshBasicMaterial(parameters);
                var material = new THREE.MeshStandardMaterial( { color: 0xffffff } );

                var tvScreen = new THREE.Mesh( screenGeometry, screenMaterial );
                var pedestal = new THREE.Mesh( pedGeometry, material );

                

                var loader = new THREE.OBJLoader( );
                loader.load( '/assets/tv.obj', function ( tv ) {
                    tv.traverse( function ( child ) {
                        if ( child instanceof THREE.Mesh ) {
                            // Mark the mesh that is the TV
                            objName = child.name;
                            child.name = 'TV';
                            child._id = elemId;

                            if (objName.startsWith('TV')) {
                                highlightMeshes[elemId] = {mesh: child};
                            } 

                            if (objName.startsWith('ant') || objName.startsWith('knob')) {
                                child.material = antennaMaterial;
                            } else {
                                child.material = tvMaterial;
                            }
                            child.receiveShadow = true;
                            child.castShadow = true;
                        }
                    } );

                    placeObject(tv, -.35, 1.87, -3, angle);
                    placeObject(tvScreen, -.14, 2.7, -3.15, angle, angle-5.7);
                    placeObject(pedestal, 0, 1, -3, angle);

                    tv.scale.set(0.5,0.5,0.5);
                    tv.castShadow = true;
                    tvScreen.castShadow = true;
                    pedestal.castShadow = true;
                    pedestal.receiveShadow = true;

                    
                    scene.add( pedestal );
                    scene.add( tvScreen );
                    scene.add( tv );
                } );
            };

            function placeObject(obj, x, y, z, angle, rotAngle=null) {
                const rotAxis = new THREE.Vector3( 0, 1, 0 );
                const angleRad = angle*(Math.PI/180);
                obj.position.set(x, y, z);
                obj.position.applyAxisAngle(rotAxis, angleRad);
                if (rotAngle != null) {
                    obj.rotation.y = rotAngle*(Math.PI/180);
                } else {
                    obj.rotation.y = angleRad;
                }
                
            }

            // Add ambient and point lighting to the scene
            function addLights (scene) {
                const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
                const pointLight = new THREE.PointLight(0xffffff,.3);
                pointLight.castShadow = true;

                pointLight.position.x = 2;
                pointLight.position.y = 20;
                pointLight.position.z = 2; 

                scene.add(pointLight);
                scene.add(ambientLight);
            }

            
            function onMouseDown(event ) {
                event.preventDefault();
                event.stopPropagation();
                hasMoved = false;
                controls.mouseDragOn = true;
            }

            function onMouseUp( event ) {
                event.preventDefault();
                event.stopPropagation();
                controls.mouseDragOn = false;
                if (checkIntersection() && !hasMoved) {
                    document.getElementById(selectedObjects[0]._id + '-link').click();
                }
            }

            function onTouchMove( event ) {
                event.preventDefault();
                event.stopPropagation();
                hasMoved = true;
                var x, y;
                if ( event.changedTouches ) {
                    x = event.changedTouches[ 0 ].pageX;
                    y = event.changedTouches[ 0 ].pageY;
                } else {
                    x = event.clientX;
                    y = event.clientY;
                }
                mouse.x = ( x / window.innerWidth ) * 2 - 1;
                mouse.y = - ( y / window.innerHeight ) * 2 + 1;

                controls.mouseX = event.pageX;
                checkIntersection();
            }

            function addSelectedObject( object ) {
                selectedObjects = [];
                selectedObjects.push( object );
            }


            function checkIntersection() {
                raycaster.setFromCamera( mouse, camera );
                var intersects = raycaster.intersectObjects( [ scene ], true );
                if ( intersects.length > 0 ) {
                    var selectedObject = intersects[ 0 ].object;
                    if (selectedObject.name == "TV") {
                        renderer.domElement.setAttribute('style', 'cursor: pointer' )
                        selectedObjects = [highlightMeshes[selectedObject._id].mesh]
                        outlinePass.selectedObjects = selectedObjects;
                        document.getElementById( selectedObject._id + '-info' ).style.visibility = 'visible';                            
                        return true;
                    }
                }
                if (controls.mouseDragOn) {
                    renderer.domElement.setAttribute('style', 'cursor: move;' );
                } else {
                    renderer.domElement.setAttribute('style', 'cursor: default;' );
                }
                if (selectedObjects.length > 0) {
                    document.getElementById( selectedObjects[0]._id + '-info' ).style.visibility = 'hidden';
                    selectedObjects = []  
                    outlinePass.selectedObjects = selectedObjects;
                }
                return false;
                
            }

			var animate = function () {
                requestAnimationFrame( animate );
                controls.update(clock.getDelta());
                composer.render();

				// renderer.render( scene, camera );
			};

			animate();