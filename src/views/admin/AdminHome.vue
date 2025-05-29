<template>
  <div ref="sceneContainer" class="scene-container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as THREE from 'three';

const sceneContainer = ref(null);

onMounted(() => {
  // 创建场景
  const scene = new THREE.Scene();

  // 创建相机
  const camera = new THREE.PerspectiveCamera(
    75, // 视野角度
    sceneContainer.value.clientWidth / sceneContainer.value.clientHeight, // 宽高比
    0.1, // 近裁剪面
    1000 // 远裁剪面
  );
  camera.position.set(0, 30, 100); // 设置相机位置
  camera.lookAt(0, 30, 0); // 让相机看向场景中心

  // 创建渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(sceneContainer.value.clientWidth, sceneContainer.value.clientHeight);
  sceneContainer.value.appendChild(renderer.domElement);

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // 添加网格地面
  const gridSize = 200;
  const gridDivisions = 50;
  const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x444444);
  gridHelper.position.y = 0; // 将网格地面放在 y=0 的位置
  scene.add(gridHelper);

  // 烟花系统
  const fireworks = []; // 存储所有烟花

  // 创建烟花
  function createFirework() {
    const particles = 500; // 烟花爆炸后的粒子数量
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff]; // 烟花颜色

    // 随机选择一个颜色
    const color = colors[Math.floor(Math.random() * colors.length)];

    // 创建发射阶段的光束
    const beamGeometry = new THREE.BufferGeometry();
    const beamPositions = new Float32Array([0, 0, 0, 0, 1, 0]); // 光束的起点和终点
    beamGeometry.setAttribute('position', new THREE.BufferAttribute(beamPositions, 3));

    const beamMaterial = new THREE.LineBasicMaterial({ color: color });
    const beam = new THREE.Line(beamGeometry, beamMaterial);
    beam.position.set(
      (Math.random() - 0.5) * 50, // 随机 X 位置
      0, // 从地面发射
      (Math.random() - 0.5) * 50 // 随机 Z 位置
    );

    // 添加到场景
    scene.add(beam);

    // 烟花对象
    const firework = {
      beam: beam,
      exploded: false, // 是否已经爆炸
      position: beam.position.clone(), // 烟花的位置
      color: color,
      particles: [], // 爆炸后的粒子
      life: 100, // 烟花生命周期
    };

    fireworks.push(firework);
  }

  // 更新烟花
  function updateFireworks() {
    for (let i = fireworks.length - 1; i >= 0; i--) {
      const firework = fireworks[i];

      if (!firework.exploded) {
        // 发射阶段：光束向上移动
        firework.position.y += 2; // 发射速度

        // 更新光束的位置
        firework.beam.position.y = firework.position.y;

        // 到达顶部后爆炸
        if (firework.position.y >= 50) { // 爆炸高度设置为 50
          firework.exploded = true;

          // 移除光束
          scene.remove(firework.beam);

          // 创建爆炸粒子
          const particles = 500; // 爆炸后的粒子数量
          const geometry = new THREE.BufferGeometry();
          const positions = [];
          const velocities = [];
          const opacities = [];

          for (let j = 0; j < particles; j++) {
            const theta = Math.random() * Math.PI * 2; // 随机角度
            const phi = Math.random() * Math.PI; // 随机角度
            const speed = Math.random() * 10 + 5; // 随机速度（增大扩散范围）

            // 计算粒子的初始位置和速度
            const x = Math.sin(phi) * Math.cos(theta) * speed;
            const y = Math.sin(phi) * Math.sin(theta) * speed;
            const z = Math.cos(phi) * speed;

            positions.push(x, y, z);
            velocities.push(x, y, z);
            opacities.push(1); // 初始透明度
          }

          geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
          geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
          geometry.setAttribute('opacity', new THREE.Float32BufferAttribute(opacities, 1));

          // 创建粒子材质
          const material = new THREE.PointsMaterial({
            color: firework.color,
            size: 0.2, // 粒子大小
            transparent: true,
          });

          // 创建粒子系统
          const particleSystem = new THREE.Points(geometry, material);
          particleSystem.position.copy(firework.position); // 设置爆炸位置

          // 添加到场景
          scene.add(particleSystem);

          // 保存粒子系统
          firework.particles = particleSystem;
        }
      } else {
        // 爆炸阶段：粒子扩散
        const particles = firework.particles;
        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.geometry.attributes.velocity.array;
        const opacities = particles.geometry.attributes.opacity.array;

        for (let j = 0; j < positions.length; j += 3) {
          positions[j] += velocities[j] * 0.1; // 粒子扩散速度
          positions[j + 1] += velocities[j + 1] * 0.1; // 粒子扩散速度
          positions[j + 2] += velocities[j + 2] * 0.1; // 粒子扩散速度

          // 重力效果
          velocities[j + 1] -= 0.02; // 粒子下落

          // 空气阻力
          velocities[j] *= 0.98;
          velocities[j + 1] *= 0.98;
          velocities[j + 2] *= 0.98;
        }

        // 更新透明度
        for (let j = 0; j < opacities.length; j++) {
          opacities[j] -= 0.01; // 逐渐消失
        }

        // 标记几何体需要更新
        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.opacity.needsUpdate = true;
        particles.material.opacity = Math.max(...opacities); // 更新材质透明度

        // 生命周期减少
        firework.life -= 1;
      }

      // 如果烟花生命周期结束，从场景中移除
      if (firework.life <= 0) {
        if (firework.exploded) {
          scene.remove(firework.particles);
        } else {
          scene.remove(firework.beam);
        }
        fireworks.splice(i, 1);
      }
    }
  }

  // 相机动画
  let cameraAngle = 0;
  const cameraRadius = 100; // 相机绕场景旋转的半径

  // 动画循环
  const animate = () => {
    requestAnimationFrame(animate);

    // 更新烟花
    updateFireworks();

    // 随机创建新的烟花
    if (Math.random() < 0.03) { // 降低烟花生成频率
      createFirework();
    }

    // 相机绕场景旋转
    cameraAngle += 0.002; // 旋转速度（减慢）
    camera.position.x = Math.sin(cameraAngle) * cameraRadius;
    camera.position.z = Math.cos(cameraAngle) * cameraRadius;
    camera.lookAt(0, 30, 0); // 让相机始终看向场景中心

    // 渲染场景
    renderer.render(scene, camera);
  };

  animate();

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    const width = sceneContainer.value.clientWidth;
    const height = sceneContainer.value.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
});
</script>

<style scoped>
.scene-container {
  width: 100%;
  height: 100vh;
  background-color: #000;
}
</style>