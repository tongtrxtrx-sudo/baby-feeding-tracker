# 图标库使用文档

## 概述

本项目使用统一的 SVG 图标库，所有图标都来自 x-icon 组件，确保视觉风格统一。

## 快速开始

### 基本使用

```wxml
<!-- 引入组件 -->
<x-icon name="baby" size="{{48}}" color="#FF6B9D" />
```

### 属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| name | String | '' | 图标名称，必填 |
| size | Number | 48 | 图标大小，单位 rpx |
| color | String | '#666666' | 图标颜色 |

## 可用图标列表

### 基础图标

| 图标名称 | 说明 | 代码示例 |
|----------|------|----------|
| baby | 宝宝 | `<x-icon name="baby" />` |
| home | 首页 | `<x-icon name="home" />` |
| user | 用户 | `<x-icon name="user" />` |
| users | 多用户 | `<x-icon name="users" />` |
| boy | 男宝宝 | `<x-icon name="boy" />` |
| girl | 女宝宝 | `<x-icon name="girl" />` |

### 喂养相关

| 图标名称 | 说明 | 代码示例 |
|----------|------|----------|
| bottle | 奶瓶 | `<x-icon name="bottle" />` |
| milk | 牛奶 | `<x-icon name="milk" />` |
| breast | 母乳 | `<x-icon name="breast" />` |

### 生长记录

| 图标名称 | 说明 | 代码示例 |
|----------|------|----------|
| ruler | 尺子 | `<x-icon name="ruler" />` |
| scale | 秤 | `<x-icon name="scale" />` |
| barChart | 柱状图 | `<x-icon name="barChart" />` |
| trendingUp | 上升趋势 | `<x-icon name="trendingUp" />` |

### 操作图标

| 图标名称 | 说明 | 代码示例 |
|----------|------|----------|
| plus | 加号 | `<x-icon name="plus" />` |
| edit | 编辑 | `<x-icon name="edit" />` |
| trash | 删除 | `<x-icon name="trash" />` |
| x | 关闭 | `<x-icon name="x" />` |
| check | 确认 | `<x-icon name="check" />` |
| copy | 复制 | `<x-icon name="copy" />` |

### 导航图标

| 图标名称 | 说明 | 代码示例 |
|----------|------|----------|
| chevronRight | 右箭头 | `<x-icon name="chevronRight" />` |
| chevronLeft | 左箭头 | `<x-icon name="chevronLeft" />` |
| chevronUp | 上箭头 | `<x-icon name="chevronUp" />` |
| chevronDown | 下箭头 | `<x-icon name="chevronDown" />` |

### 信息图标

| 图标名称 | 说明 | 代码示例 |
|----------|------|----------|
| info | 信息 | `<x-icon name="info" />` |
| alertCircle | 警告 | `<x-icon name="alertCircle" />` |
| heart | 爱心 | `<x-icon name="heart" />` |
| calendar | 日历 | `<x-icon name="calendar" />` |
| clock | 时钟 | `<x-icon name="clock" />` |

### 云同步

| 图标名称 | 说明 | 代码示例 |
|----------|------|----------|
| cloud | 云 | `<x-icon name="cloud" />` |
| cloudUpload | 云上传 | `<x-icon name="cloudUpload" />` |
| cloudDownload | 云下载 | `<x-icon name="cloudDownload" />` |
| refresh | 刷新 | `<x-icon name="refresh" />` |

### 分享相关

| 图标名称 | 说明 | 代码示例 |
|----------|------|----------|
| share | 分享 | `<x-icon name="share" />` |
| link | 链接 | `<x-icon name="link" />` |
| download | 下载 | `<x-icon name="download" />` |
| upload | 上传 | `<x-icon name="upload" />` |

## 使用示例

### 示例 1：基础使用

```wxml
<view class="icon-demo">
  <x-icon name="baby" size="{{48}}" color="#FF6B9D" />
  <text>宝宝</text>
</view>
```

### 示例 2：按钮中的图标

```wxml
<button class="btn">
  <x-icon name="plus" size="{{32}}" color="#FFFFFF" />
  <text>添加记录</text>
</button>
```

### 示例 3：列表项图标

```wxml
<view class="list-item">
  <view class="item-left">
    <x-icon name="bottle" size="{{36}}" color="#FF6B9D" />
    <text class="item-text">喂养记录</text>
  </view>
  <x-icon name="chevronRight" size="{{24}}" color="#999999" />
</view>
```

## 样式自定义

### 尺寸示例

```wxml
<!-- 小图标 -->
<x-icon name="baby" size="{{24}}" />

<!-- 中等图标 -->
<x-icon name="baby" size="{{48}}" />

<!-- 大图标 -->
<x-icon name="baby" size="{{80}}" />
```

### 颜色示例

```wxml
<!-- 主色调 -->
<x-icon name="baby" color="#FF6B9D" />

<!-- 灰色 -->
<x-icon name="baby" color="#999999" />

<!-- 白色 -->
<x-icon name="baby" color="#FFFFFF" />
```

## 注意事项

1. **图标名称必须匹配**：确保 name 属性与可用图标列表中的名称完全一致（区分大小写）
2. **尺寸单位**：size 属性使用 rpx 作为单位，适配不同屏幕
3. **默认值**：如果未指定 size 和 color，将使用默认值 48rpx 和 #666666
4. **组件注册**：使用前请确保在页面或组件的 json 文件中注册了 x-icon 组件

## 组件注册

在页面 json 文件中：

```json
{
  "usingComponents": {
    "x-icon": "/components/x-icon/x-icon"
  }
}
```

或在 app.json 中全局注册：

```json
{
  "usingComponents": {
    "x-icon": "/components/x-icon/x-icon"
  }
}
```

## 图标风格

所有图标采用统一的 2px 描边风格，stroke-linecap 和 stroke-linejoin 均使用 round，确保视觉一致性。

---

如有问题或需要添加新图标，请联系开发团队。
