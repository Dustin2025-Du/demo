<template>
  <div class="banner-container">
    <div class="logo">
      <div class="logo-icon"></div>
    </div>

    <div class="text-section">
      <span class="chinese-text">墨西哥超级联赛杯</span>
    </div>

    <div class="star-section">
      <div class="icon-box orange"></div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="css">
.banner-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px 24px;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-icon {
  width: 40px;
  height: 30px;
  background-color: #666;
  border-radius: 4px;
}

.icon-box.orange {
  width: 20px;
  height: 20px;
  background-color: #ff8800;
  border-radius: 4px;
}

.text-section {
  flex: 1;
  text-align: center;
}

.chinese-text {
  font-size: 18px;
  color: #666;
  font-weight: 500;
}
</style>
