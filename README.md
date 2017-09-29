# safe-web
## 需求实现TODO list
* [x] 引入腾讯地图，使用腾讯地图api的markers将问题点标记
* [x] 问题点提示窗口用map的api解决
* ~~提交问题后实时刷新前端页面，采用ajax异步提交~~，目前已经用res.redirect解决
* [x] 模板渲染时，需要传参数进去
* [ ] 登录管理，权限管理
* [ ] 地图地理位置按照区域划分，加上电子围栏，[腾讯地图api](http://bbs.map.qq.com/thread-8859-1-1.html)，[百度地图电子围栏开发](http://www.cnblogs.com/dongh/p/6589503.html)
* [ ] 读取上传图片的exif信息，将gps数据提取，自动定位区域