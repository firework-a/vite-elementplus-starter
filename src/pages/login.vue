<route lang="json">
{
    "name": "login",
    "meta": {
        "title":"登录页",
        "requiresAuth": false,
        "guestOnly":true
    }
}
</route>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 表单数据
const loginForm = reactive({
  adminname: '',
  password: '',
})

// 表单校验规则
const rules = {
  adminname: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
}

// 表单引用
const loginFormRef = ref()

// 应当从 store 获取加载状态
const loading = ref(false)

// 记住密码
const rememberMe = ref(false)

// 处理登录
async function handleLogin() {
  if (!loginFormRef.value)
    return

  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // 设置用户信息（示例）
      localStorage.setItem('token', 'xxx')
      localStorage.setItem('username', 'admin')

      // 登录成功
      ElMessage({
        type: 'success',
        message: '登录成功',
      })

      // 跳转到首页
      router.push('/')
    }
  })
}
</script>

<template>
  <div class="login-container">
    <div class="login-background">
      <div class="shape shape-1" />
      <div class="shape shape-2" />
      <div class="shape shape-3" />
    </div>

    <div class="login-box">
      <div class="login-title">
        <h2>后台管理系统</h2>
        <p class="subtitle">
          欢迎回来，请登录您的账号
        </p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        label-width="0"
        class="login-form"
      >
        <el-form-item prop="adminname">
          <el-input
            v-model="loginForm.adminname"
            placeholder="请输入管理员账号"
            prefix-icon="User"
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <div class="form-options">
          <el-checkbox v-model="rememberMe" class="remember-checkbox">
            记住账号
          </el-checkbox>
          <el-link type="primary" href="#/forgot-password" class="forgot-link">
            忘记密码?
          </el-link>
        </div>

        <el-form-item>
          <el-button
            type="success"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>© {{ new Date().getFullYear() }} 后台管理系统</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use 'sass:color';

// Vue 绿色主题色
$vue-green: #42b883;
$vue-dark: #35495e;

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  position: relative;
  overflow: hidden;

  .login-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;

    .shape {
      position: absolute;
      border-radius: 50%;

      &.shape-1 {
        width: 300px;
        height: 300px;
        background: rgba($vue-green, 0.1);
        top: -100px;
        right: -100px;
      }

      &.shape-2 {
        width: 200px;
        height: 200px;
        background: rgba($vue-green, 0.15);
        bottom: -50px;
        left: -50px;
      }

      &.shape-3 {
        width: 150px;
        height: 150px;
        background: rgba($vue-dark, 0.1);
        top: 50%;
        left: 60%;
      }
    }
  }

  .login-box {
    width: 420px;
    padding: 40px;
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 1;
    animation: fadeIn 0.8s ease-in-out;

    .login-title {
      text-align: center;
      margin-bottom: 30px;

      h2 {
        font-size: 28px;
        color: $vue-dark;
        margin: 10px 0;
        font-weight: 600;
      }

      .subtitle {
        color: #606266;
        font-size: 14px;
        margin-top: 8px;
      }
    }

    .login-form {
      :deep(.el-input__wrapper) {
        border-radius: 8px;
        padding: 0 15px;
        height: 50px;
        box-shadow: 0 0 0 1px #dcdfe6;
        transition: all 0.3s;

        &:hover,
        &:focus,
        &.is-focus {
          box-shadow: 0 0 0 1px $vue-green;
        }
      }

      :deep(.el-input__prefix-inner) {
        color: #909399;
      }

      :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
        background-color: $vue-green;
        border-color: $vue-green;
      }

      :deep(.el-checkbox__label) {
        color: #606266;
      }

      .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 10px 0 20px;
        padding: 0 5px;

        .remember-checkbox {
          margin-right: auto;
        }

        .forgot-link {
          color: $vue-green;
          margin-left: 20px;

          &:hover {
            color: color.adjust($vue-green, $lightness: -10%);
          }
        }
      }

      .login-button {
        width: 100%;
        height: 50px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        background-color: $vue-green;
        border-color: $vue-green;
        transition: all 0.3s;

        &:hover,
        &:focus {
          background-color: color.adjust($vue-green, $lightness: -5%);
          border-color: color.adjust($vue-green, $lightness: -5%);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba($vue-green, 0.3);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }

    .login-footer {
      text-align: center;
      margin-top: 30px;
      color: #909399;
      font-size: 12px;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
