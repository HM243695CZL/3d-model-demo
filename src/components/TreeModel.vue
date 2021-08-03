<template>
    <div class="tree-container">
        <div id="tree"></div>
        <div ref="models" id="models" style="height: 700px;width: 1800px;">
            <div style="background-color:#B8D4FC ;"></div>
        </div>
    </div>
</template>

<script>
    import * as THREE from 'three'
    import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'
    import 'three/examples/jsm/libs/fflate.module'
    import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
    import 'three/examples/js/libs/fflate.min'
    export default {
        name: "TreeModel",
        data() {
            return {
                scene: null,
                loader: null,
                pointer: null,
                point: null,
                ambient: null,
                camera: null,
                renderer: null,
                controls: null,
                width: 1600,
                height: 700,
                k: null
            }
        },
        mounted() {
            this.init();
            this.bindRendererClick()
        },
        methods: {
            init() {
                this.loader =  new FBXLoader();
                this.scene = new THREE.Scene();
                this.pointer = new THREE.Vector2();
                this.loader.load(`${process.env.BASE_URL}threeModelFile/room108.fbx`, obj => {
                    this.scene.add(obj)
                    obj.translateY(-80);
                });

                this.point = new THREE.PointLight(0xffffff, 1, 0, 2);
                this.point.position.set(400, 200, 300);
                this.scene.add(this.point);

                this.ambient = new THREE.AmbientLight(0xffffff, 0.4);
                this.scene.add(this.ambient);

                this.k = this.width / this.height;

                this.camera = new THREE.PerspectiveCamera(45, this.k, 1, 10000);
                this.camera.position.set(200, 200, 200);
                this.camera.lookAt(this.scene.position);

                this.renderer = new THREE.WebGL1Renderer();
                this.renderer.setSize(this.width, this.height);
                this.renderer.setClearColor(0x040b1a, 1);

                this.$refs.models.appendChild(this.renderer.domElement);
                this.controls = new OrbitControls(this.camera, this.renderer.domElement);
                this.render()
            },
            render() {
                this.renderer.render(this.scene, this.camera);
                this.controls.update();
                requestAnimationFrame(this.render);
            },
            bindRendererClick() {
                this.renderer.domElement.addEventListener('click', event => {
                    const {offsetX, offsetY } = event;
                    const x = (offsetX / window.innerWidth) * 2 - 1;
                    const y = -(offsetY / window.innerHeight) * 2 + 1;
                    const mousePoint = new THREE.Vector2(x, y);
                    const raycaster = new THREE.Raycaster();
                    raycaster.setFromCamera(mousePoint, this.camera);
                    const intersects = raycaster.intersectObjects(this.scene.children, true)
                    console.log(intersects);
                })
            }
        }
    }
</script>

<style scoped>

</style>
