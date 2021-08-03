<template>
    <div class="show-tip-container" ref="boxRef" :style="isMobile ? MobileStyleObj : PCStyleObj">
        <div class="tip" ref="tipRef">
            模型名称：{{objectInfo.name}}
        </div>
        <div class="models" ref="models" id="models" :style="{height: height + 'px', width: width + 'px', cursor: 'pointer'}">
            <div style="background-color:#B8D4FC ;"></div>
        </div>
    </div>
</template>

<script>
    const isMobile = navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i);
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
        name: "showTip",
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
                width: isMobile ? window.innerWidth : 800,
                height: isMobile ? window.innerWidth * .75 : 400,
                k: null,
                composer: null,
                outlinePass: null,
                renderPass: null,
                objectInfo: {},
                isMobile,
                PCStyleObj: {
                    width: '800px',
                    height: '400px',
                    margin: '20px auto'
                },
                MobileStyleObj: {
                    width: '320px',
                    height: '240px'
                }
            }
        },
        mounted() {
            this.init();
            this.bindRendererClick();
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
                this.controls = new OrbitControls(this.camera, this.renderer.domElement);
                this.$refs.models.appendChild(this.renderer.domElement);
                // 上下翻转的最大角度
                this.controls.maxPolarAngle = 1.5;
                // 上下翻转的最小角度
                this.controls.minPolarAngle = 0.3;
                this.render();
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
                    this.highlightEle(event, false);
                });
                this.renderer.domElement.addEventListener('touchstart', event => {
                    this.highlightEle(event, true);
                });
            },
            highlightEle(event, flag) {
                const {clientX, clientY } = flag ? event.touches[0] : event;
                const {left, top} = this.$refs.boxRef.getBoundingClientRect();
                const x = ((clientX - left) / this.width) * 2 - 1;
                const y = -((clientY - top) / this.height) * 2 + 1;
                this.pointer.x = x;
                this.pointer.y = y;
                const mousePoint = new THREE.Vector2(x, y);
                this.raycaster = new THREE.Raycaster();
                this.raycaster.setFromCamera(mousePoint, this.camera);
                const intersects = this.raycaster.intersectObjects(this.scene.children, true)
                // console.log(intersects);
                if(intersects.length === 0) return false;
                this.outlineObj([intersects[0].object]);
                this.showTxtTip(intersects[0], event, flag);
            },
            showTxtTip(info, e, flag) {
                this.objectInfo = info.object;
                if(flag) return false;
                const width = parseInt(window.getComputedStyle(this.$refs.tipRef).width);
                const height = parseInt(window.getComputedStyle(this.$refs.tipRef).height);
                // 20是元素的左右padding
                this.$refs.tipRef.style.left = '';
                this.$refs.tipRef.style.right = '';
                this.$refs.tipRef.style.top = '';
                this.$refs.tipRef.style.bottom = '';
                if(width + e.pageX + 20 > window.innerWidth) {
                    this.$refs.tipRef.style.right = window.innerWidth - e.pageX + 'px';
                } else {
                    this.$refs.tipRef.style.left = e.pageX + 10 + 'px';
                }
                if(height + e.pageY + 20 > window.innerHeight) {
                    this.$refs.tipRef.style.bottom = window.innerHeight - e.pageY + 'px';
                } else {
                    this.$refs.tipRef.style.top = e.pageY + 10 + 'px';
                }
            }
        }
    }
</script>

<style scoped>
    .show-tip-container{

    }
    .show-tip-container .tip{
        position: absolute;
        padding: 5px 10px;
        background: rgba(0, 0, 0, .5);
        box-shadow: #fff 0 0 10px;
        color: #fff;
        border-radius: 5px;
    }
</style>
