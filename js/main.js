/**
 * 3D卡牌展示系统 v0.1
 * 
 * 功能：
 * 1. 显示3D卡牌
 * 2. 支持正反面纹理
 * 3. 点击翻转动画
 * 4. 受限的相机控制
 * 
 * 作者：[你的名字]
 * 日期：2024-03-xx
 */

/*
启动：
/usr/local/bin/python3  -m http.server 8080

http://localhost:8080/index.html    
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class CardScene {
    /**
     * 场景初始化
     */
    constructor() {
        // 基础场景设置
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x666666);

        // 相机设置
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 5);

        // 渲染器设置
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('container').appendChild(this.renderer.domElement);

        // 相机控制器设置
        this.setupControls();
        
        // 添加光源
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);

        // 添加辅助工具
        this.setupHelpers();

        // 创建卡牌
        this.createCard();

        // 添加事件监听
        this.setupEventListeners();

        // 开始动画循环
        this.animate();
    }

    /**
     * 设置相机控制器
     */
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        // 限制垂直旋转角度
        this.controls.minPolarAngle = Math.PI / 4;     // 45度
        this.controls.maxPolarAngle = Math.PI * 3 / 4; // 135度
        
        // 限制水平旋转角度
        this.controls.minAzimuthAngle = -Math.PI / 4;  // -45度
        this.controls.maxAzimuthAngle = Math.PI / 4;   // 45度
        
        // 限制缩放
        this.controls.minDistance = 4;
        this.controls.maxDistance = 6;
        
        // 启用阻尼效果
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // 禁用平移
        this.controls.enablePan = false;
    }

    /**
     * 设置辅助工具
     */
    setupHelpers() {
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);

        const gridHelper = new THREE.GridHelper(10, 10);
        this.scene.add(gridHelper);
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        this.renderer.domElement.addEventListener('click', () => this.flipCard());
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * 创建卡牌
     */
    createCard() {
        const geometry = new THREE.PlaneGeometry(2, 3);
        
        // 初始材质
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide
        });

        this.card = new THREE.Mesh(geometry, material);
        this.scene.add(this.card);

        // 加载纹理
        this.loadTextures();
    }

    /**
     * 加载纹理
     */
    loadTextures() {
        const textureLoader = new THREE.TextureLoader();
        
        Promise.all([
            new Promise(resolve => textureLoader.load('textures/card-front.png', resolve)),
            new Promise(resolve => textureLoader.load('textures/card-back.png', resolve))
        ]).then(([frontTexture, backTexture]) => {
            const material = new THREE.MeshBasicMaterial({
                map: frontTexture,
                side: THREE.DoubleSide
            });

            this.card.material = material;
            this.frontTexture = frontTexture;
            this.backTexture = backTexture;
            
            console.log('纹理加载完成');
        });
    }

    /**
     * 卡牌翻转动画
     */
    flipCard() {
        if (!this.card || this.isFlipping || !this.frontTexture || !this.backTexture) return;
        
        this.isFlipping = true;
        const duration = 1000;
        const startRotation = this.card.rotation.y;
        const endRotation = startRotation + Math.PI;
        const startTime = Date.now();
        
        const currentTexture = this.card.material.map;
        const nextTexture = currentTexture === this.frontTexture ? this.backTexture : this.frontTexture;

        const animate = () => {
            const now = Date.now();
            const progress = (now - startTime) / duration;

            if (progress < 1) {
                this.card.rotation.y = startRotation + (endRotation - startRotation) * progress;
                
                if (progress > 0.5 && this.card.material.map !== nextTexture) {
                    this.card.material.map = nextTexture;
                    this.card.material.needsUpdate = true;
                }
                
                requestAnimationFrame(animate);
            } else {
                this.card.rotation.y = endRotation;
                this.isFlipping = false;
            }
        };

        animate();
    }

    /**
     * 窗口大小调整处理
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * 动画循环
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// 初始化场景
window.addEventListener('DOMContentLoaded', () => {
    console.log('3D卡牌展示系统 v0.1 初始化');
    new CardScene();
}); 