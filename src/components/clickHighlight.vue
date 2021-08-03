<template>
    <div class="highlight-container">
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

    //高亮
    import {FXAAShader} from 'three/examples/jsm/shaders/FXAAShader'
    import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
    import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
    import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
    import {OutlinePass} from 'three/examples/jsm/postprocessing/OutlinePass'
    export default {
        name: "clickHighlight",
        data() {
            return {
                scene: null,
                loader: null,
                pointer: null,
                point: null,
                ambient: null,
                camera: null,
                renderer: null,
                raycaster: null,
                controls: null,
                width: 1920,
                height: 947,
                k: null,
                composer: null,
                outlinePass: null,
                renderPass: null,
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
                if(this.composer) {
                    this.composer.render()
                }
            },
            outlineObj(selectedObjects) {
                this.composer = new EffectComposer(this.renderer);

                this.renderPass = new RenderPass(this.scene, this.camera);
                this.composer.addPass(this.renderPass);

                this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight),
                    this.scene, this.camera, selectedObjects);
                this.outlinePass.selectedObjects = selectedObjects;
                this.outlinePass.edgeStrength = 10.0; // 边框的亮度
                this.outlinePass.edgeGlow = 1; // 光晕[0,1]
                this.outlinePass.usePatternTexture = false; // 是否使用父级的材质
                this.outlinePass.edgeThickness = 1.0; // 边框宽度
                this.outlinePass.downSampleRatio = 1; // 边框弯曲度
                this.outlinePass.pulsePeriod = 5; // 呼吸闪烁的速度
                this.outlinePass.visibleEdgeColor.set(parseInt(0x00ff00)); // 呼吸显示的颜色
                this.outlinePass.hiddenEdgeColor = new THREE.Color(0, 0, 0); // 呼吸消失的颜色
                this.outlinePass.clear = true;
                this.composer.addPass(this.outlinePass);
                // 自定义的着色器通道作为参数
                let effectFXAA = new ShaderPass(FXAAShader);
                effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight);
                effectFXAA.renderToScreen = true;
                this.composer.addPass(effectFXAA);
            },
            bindRendererClick() {
                this.renderer.domElement.addEventListener('click', event => {
                    const {offsetX, offsetY } = event;
                    const x = (offsetX / window.innerWidth) * 2 - 1;
                    const y = -(offsetY / window.innerHeight) * 2 + 1;
                    const mousePoint = new THREE.Vector2(x, y);
                    this.raycaster = new THREE.Raycaster();
                    this.raycaster.setFromCamera(mousePoint, this.camera);
                    const intersects = this.raycaster.intersectObjects(this.scene.children, true)
                    console.log(intersects);
                    this.outlineObj([intersects[0].object]);
                })
            }
        }
    }
</script>

<style scoped>

</style>
