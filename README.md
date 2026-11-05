# 彼灯学员

家长从公众号报名、选课、支付，老师在后台管理学员。手机端按微信内打开来做。

## 家长怎么进来

1. 关注彼灯公众号
2. 点底部菜单 **成为彼灯学员**
3. 菜单链到本站首页（或 `/register`）

微信公众平台把自定义菜单的网页链接设为部署后的地址即可，例如 `https://your-domain/`。

## 本地运行

```bash
npm install
npm run dev
```

- 家长端：http://localhost:3000
- 管理后台：http://localhost:3000/admin  
  默认密码 `bideng-admin`（可用环境变量 `ADMIN_PASSWORD` 修改）

数据写在 `data/db.json`，刷新浏览器不会丢。本地已有一条演示报名（林晚晚 / AI创想营 / 已支付），打开后台即可看到。

## 报名信息

学生姓名、年龄、学校、年级、最喜欢的生物、最喜欢的话题、家长手机号。手机号会先按飞书账号核对，通过后才能提交。

当前是演示模式：11 位大陆手机号即视为已注册飞书。接入飞书通讯录后，把 `FEISHU_MODE=strict` 并配置查询接口即可。

## 课程

- **AI创想营** Imagine Camp
- **AI通识 Principle**
- **AI进阶 Professional**

注册完成后进入目录，选课即下单。

## 支付

家长从公众号打开页面，人已经在微信里，所以正式环境用 **微信支付 JSAPI**：点支付直接出收银台，不用扫码。

现在没有商户号，走的是沙箱：界面按微信支付来，确认后订单记为已付。后台也可以把待支付订单手动标为已付（适合对公转账）。

正式接入时需要：

- 公众号 AppID
- 微信商户号、APIv3 密钥和证书
- 把 `WECHAT_PAY_ENABLED=true`
- 支付结果走 `/api/pay/wechat/notify`

订单模型不用改。

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `ADMIN_PASSWORD` | 后台密码，默认 `bideng-admin` |
| `ADMIN_SECRET` | 后台 cookie 签名 |
| `FEISHU_MODE` | `demo` 或 `strict` |
| `FEISHU_ALLOWLIST` | strict 模式下允许的手机号，逗号分隔 |
| `WECHAT_PAY_ENABLED` | `true` 时关闭沙箱，改走真微信支付 |
