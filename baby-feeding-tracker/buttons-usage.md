# 按钮组件使用文档

## 概述

本项目使用统一的按钮样式系统，确保所有按钮在视觉上保持一致性，并提供完整的尺寸和样式变体。

## 快速开始

### 基础使用

```wxml
<button class="btn btn-primary">主要按钮</button>
```

### 带图标的按钮

```wxml
<button class="btn btn-primary btn-icon">
  <x-icon name="plus" size="{{32}}" color="#FFFFFF" />
  <text>添加记录</text>
</button>
```

## 按钮变体

### 样式类型

| 类名 | 说明 | 使用场景 |
|------|------|----------|
| `.btn-primary` | 主要按钮 | 主要操作、提交表单、确认等 |
| `.btn-secondary` | 次要按钮 | 次要操作、取消等 |
| `.btn-outline` | 边框按钮 | 需要突出显示但不是主要操作 |

### 尺寸类型

| 类名 | 尺寸 | 使用场景 |
|------|------|----------|
| `.btn-sm` | 小按钮 (72rpx) | 列表项内、表格操作等小空间 |
| (默认) | 中等按钮 (96rpx) | 大多数场景的默认选择 |
| `.btn-lg` | 大按钮 (112rpx) | 页面级主要操作、引导按钮 |

### 特殊样式

| 类名 | 说明 | 使用场景 |
|------|------|----------|
| `.btn-round` | 圆形按钮 | 悬浮操作按钮、图标按钮 |
| `.btn-block` | 全宽按钮 | 表单提交、底部操作栏 |
| `.btn-icon` | 图标按钮 | 包含图标的按钮 |

## 使用示例

### 示例 1：基础按钮组

```wxml
<view class="button-group">
  <button class="btn btn-primary">主要按钮</button>
  <button class="btn btn-secondary">次要按钮</button>
  <button class="btn btn-outline">边框按钮</button>
</view>
```

### 示例 2：尺寸变体

```wxml
<view class="button-group">
  <button class="btn btn-primary btn-sm">小按钮</button>
  <button class="btn btn-primary">默认按钮</button>
  <button class="btn btn-primary btn-lg">大按钮</button>
</view>
```

### 示例 3：带图标的按钮

```wxml
<view class="button-group">
  <button class="btn btn-primary btn-icon">
    <x-icon name="plus" size="{{28}}" color="#FFFFFF" />
    <text>添加</text>
  </button>
  
  <button class="btn btn-secondary btn-icon">
    <x-icon name="edit" size="{{28}}" color="#666666" />
    <text>编辑</text>
  </button>
</view>
```

### 示例 4：全宽按钮

```wxml
<button class="btn btn-primary btn-block">
  提交表单
</button>
```

### 示例 5：圆形按钮

```wxml
<view class="floating-action">
  <button class="btn btn-primary btn-round">
    <x-icon name="plus" size="{{36}}" color="#FFFFFF" />
  </button>
</view>
```

## 按钮对齐

所有按钮默认使用以下对齐方式：
- 水平居中：`justify-content: center`
- 垂直居中：`align-items: center`
- 文字居中：`text-align: center`
- 行高匹配：`line-height` 等于 `height`

这确保了按钮内的文字和图标在水平和垂直方向都完全居中。

## 交互状态

### 默认状态

按钮具有默认的渐变色和阴影效果。

### 点击状态

```css
.btn:active {
  opacity: 0.85;
  transform: scale(0.98);
}
```

按钮在点击时会：
- 透明度降低到 85%
- 轻微缩小到 98%
- 提供视觉反馈

### 主按钮点击

```css
.btn-primary:active {
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 157, 0.2);
}
```

主按钮点击时阴影会变小。

### 次要按钮点击

```css
.btn-secondary:active {
  background: #FFF5F8;
}
```

次要按钮点击时背景色会变化。

## 样式说明

### 基础样式 (.btn)

```css
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  padding: 0;
  margin: 0;
  gap: 12rpx;
  box-sizing: border-box;
  text-align: center;
  vertical-align: middle;
}

.btn::after {
  border: none;
}
```

### 主要按钮 (.btn-primary)

```css
.btn-primary {
  background: linear-gradient(135deg, #FFB6C1 0%, #FF6B9D 100%);
  color: #FFFFFF;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 157, 0.3);
}
```

### 次要按钮 (.btn-secondary)

```css
.btn-secondary {
  background: #FFFFFF;
  color: #666666;
  border: 2rpx solid #FFE4E8;
  box-shadow: none;
}
```

### 边框按钮 (.btn-outline)

```css
.btn-outline {
  background: transparent;
  color: #FF6B9D;
  border: 2rpx solid #FF6B9D;
}
```

## 注意事项

1. **样式继承**：所有按钮必须同时使用 `.btn` 基类和变体类
2. **微信小程序特性**：使用 `::after` 伪元素清除默认边框
3. **图标间距**：图标和文字之间默认有 12rpx 的间距
4. **圆角**：默认使用高度的一半作为圆角，确保完全圆角
5. **字体粗细**：按钮文字使用 600 字重，增强可读性

## 常见问题

### Q: 如何让按钮内的文字完美居中？

A: 所有按钮样式已经内置了完美的居中对齐，使用以下属性确保：
- `display: flex`
- `align-items: center`
- `justify-content: center`
- `line-height` 等于 `height`
- `text-align: center`

### Q: 如何修改按钮的高度？

A: 使用预定义的尺寸类：
- 小按钮：`.btn-sm` (72rpx)
- 默认：96rpx
- 大按钮：`.btn-lg` (112rpx)

### Q: 如何自定义按钮颜色？

A: 建议使用现有的三个变体，如果需要特殊颜色，可以在页面样式中覆盖：

```css
.btn-custom {
  background: #你的颜色;
  color: #文字颜色;
}
```

### Q: 按钮在 iOS 和 Android 上显示不一致怎么办？

A: 我们的按钮样式已经考虑了跨平台兼容性，使用了：
- 统一的 `box-sizing: border-box`
- 清除默认边框的 `::after` 伪元素
- 统一的字体和间距

---

如有问题或需要添加新的按钮样式，请联系开发团队。
