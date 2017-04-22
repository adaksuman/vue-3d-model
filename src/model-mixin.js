import {
    Vector3,
    Scene,
    WebGLRenderer,
    PerspectiveCamera,
    AmbientLight,
    HemisphereLight,
    DirectionalLight 
} from 'three'

import { getSize, getCenter } from './util'

export default {
    props: {
        src: {
            type: String
        },
        width: {
            type: Number,
            default: 400
        },
        height: {
            type: Number,
            default: 400
        },
        position: {
            type: Object,
            default () {
                return { x: 0, y: 0, z: 0 }
            }
        },
        rotation: {
            type: Object,
            default () {
                return { x: 0, y: 0, z: 0 }
            }
        },
        scale: {
            type: Object,
            default () {
                return { x: 1, y: 1, z: 1 }
            }
        },
        lights: {
            type: Array,
            default () {
                return [];
            }
        },
        cameraPosition: {
            type: Object
        },
        cameraRotation: {
            type: Object
        },
        cameraUp: {
            type: Object
        },
        cameraLookAt: {
            type: Object
        }
    },
    data () {
        return {
            object: null,
            camera: new PerspectiveCamera( 45, 1, 0.001, 100000 ),
            scene: new Scene(),
            renderer: new WebGLRenderer( { antialias: true } ),
            control: null
        }
    },
    created () {

        this.renderer.shadowMap.enabled = true;
        this.renderer.setSize( this.width, this.height );
        this.load();
        this.update();
    },
    mounted () {
        this.$el.appendChild( this.renderer.domElement );
    },
    watch: {
        src () {
            this.load();
        },
        object () {
            this.render();
        },
        lights: {
            deep: true,
            handler ( val, oldVal ) {
                this.updateLights();
            }
        },
        width () {
            this.updateSize();
        },
        height () {
            this.updateSize();
        }
    },
    methods: {
        update () {
            this.updateModel();
            this.updateCamera();
            this.updateLights();
            this.render();
        },
        updateModel() {
            if ( !this.object ) return;
            this.object.position.copy( this.position );
            this.object.rotation.copy( this.rotation );
            this.object.scale.copy( this.scale );
        },
        updateSize() {
            this.renderer.setSize( this.width, this.height );
            this.camera.aspect = this.width / this.height;
        },
        updateCamera() {

            this.camera.aspect = this.width / this.height;

            if ( !this.cameraLookAt && !this.cameraPosition && !this.cameraRotation && !this.cameraUp ) {

                if ( !this.object ) return;

                let distance = getSize( this.object ).length();
                let center = getCenter( this.object );

                this.camera.position.set( 0, 0, 0 );
                this.camera.position.z = distance;
                this.camera.position.add( center );
                this.camera.lookAt( center );

            } else {

            }
        },
        updateLights() {

            this.lights.forEach( item => {

                if ( !item.type ) return;

                const type = item.type.toLowerCase();

                if ( type === 'ambient' || type === 'ambientlight' ) {

                    const color = item.color || 0x404040;
                    const intensity = item.intensity || 1;

                    let light = new AmbientLight( color, intensity );

                    this.scene.add( light );

                } else if ( type === 'point' || type === 'pointlight' ) {

                    const color = item.color || 0xffffff;
                    const intensity = item.intensity || 1;
                    const distance = item.distance || 0;
                    const decay = item.decay || 1;

                    let light = new PointLight( color, intensity, distance, decay );

                    if ( item.position ) {
                        light.position.copy( item.position );
                    }

                    this.scene.add( light );

                } else if ( type === 'directional' || type === 'directionallight' ) {

                    const color = item.color || 0xffffff;
                    const intensity = item.intensity || 1;

                    let light = new DirectionalLight( color, intensity );

                    if ( item.position ) {
                        light.position.copy( item.position );
                    }

                    if ( item.target ) {
                        light.target.copy( item.target );
                    }

                    this.scene.add( light );

                } else if ( type === 'hemisphere' || type === 'hemispherelight' ) {

                    const skyColor = item.skyColor || 0xffffff;
                    const groundColor = item.groundColor || 0xffffff;
                    const intensity = item.intensity || 1;

                    let light = new HemisphereLight( skyColor, groundColor, intensity );

                    if ( item.position ) {
                        light.position.copy( item.position );
                    }

                    this.scene.add( light );
                }

            } )

        },
        load() {

            if ( !this.src ) return;

            if ( this.object ) {
                this.scene.remove( this.object );
            }

            this.loader.load( this.src, object => {

                this.object = object;

                this.scene.add( this.object );

                this.updateCamera();

            } );

        },
        render() {
            this.renderer.render( this.scene, this.camera );
        }
    }
}
