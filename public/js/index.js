$(function () {
  // 载入提示
  console.log('main.js loaded!');

  window.init = function () {
    //设置地图中心点，即工厂正中心位置
    var centerLatlng = new qq.maps.LatLng(45.7137085949, 126.6769766808);
    // 以下用于限制地图范围
    var sw = new qq.maps.LatLng(45.710540, 126.672342); //西南角坐标
    var ne = new qq.maps.LatLng(45.718960, 126.682878); //东北角坐标
    //设置地图范围的西南角和东北角

    //定义工厂模式函数
    var myOptions = {
      center: centerLatlng, //设置中心点
      mapTypeId: qq.maps.MapTypeId.ROADMAP, //设置地图样式详情参见MapType
      //初始化地图缩放级别
      zoom: 17,
      minZoom: 16,
      maxZoom: 18,
      //如果为 true，在初始化地图时不会清除地图容器内的内容
      noClear: true,
      //用作地图 div 的背景颜色。当用户进行平移时，如果尚未载入图块，则显示此颜色。
      //仅在地图初始化时，才能设置此选项
      backgroundColor: "#ffffff",
      //boundary规定了地图的边界，当拖拽超出限定的边界范围后，会自动移动回来
      boundary:new qq.maps.LatLngBounds (sw, ne),
      //地图的默认鼠标指针样式
      draggableCursor: "crosshair",
      //拖动地图时的鼠标指针样式
      draggingCursor: "pointer",
      //地图类型ID
      mapTypeId: qq.maps.MapTypeId.HYBRID,
      //若为false则禁止拖拽
      draggable: true,
      //若为false则禁止滑轮滚动缩放
      scrollwheel: true,
      //若为true则禁止双击放大
      disableDoubleClickZoom: false,
      //若为false则禁止键盘控制地图
      keyboardShortcuts: true,
      //地图类型控件，若为false则停用状态地图类型控件
      mapTypeControl: true,
      //地图类型控件参数
      mapTypeControlOptions: {
        mapTypeIds: [
          qq.maps.MapTypeId.ROADMAP,
          qq.maps.MapTypeId.HYBRID,
          qq.maps.MapTypeId.SATELLITE
        ],
        position: qq.maps.ControlPosition.TOP_RIGHT
      },
      //地图平移控件，若为false则不显示平移控件
      panControl: true,
      //地图平移控件参数
      panControlOptions: {
        position: qq.maps.ControlPosition.TOP_LEFT
      },
      //地图缩放控件，若为false则不显示缩放控件
      zoomControl: true,
      //地图缩放控件参数
      zoomControlOptions: {
        position: qq.maps.ControlPosition.TOP_LEFT
      },
      //地图比例尺控件，若为false则不显示比例尺控件
      scaleControl: true,
      //地图比例尺控件参数
      scaleControlOptions: {
        position: qq.maps.ControlPosition.BOTTOM_RIGHT
      }
    }
    //获取dom元素添加地图信息
    var map = new qq.maps.Map(document.getElementById("map"), myOptions);
    //icon是可以公用的，info是可以公用的
    var anchor = new qq.maps.Point(10, 0),
    size = new qq.maps.Size(20, 20),
    origin = new qq.maps.Point(0, 0),
    scaleSize = new qq.maps.Size(20, 20),
    icon = new qq.maps.MarkerImage( // marker图标，公用
      "images/todo.png",
      size,
      origin,
      anchor,
      scaleSize
    );

    var info = new qq.maps.InfoWindow({ // 信息窗口，公用
      map: map
    });
  }
  // 载入地图
  function loadScript() {
    //创建script标签
    var script = document.createElement("script");
    //设置标签的type属性
    script.type = "text/javascript";
    //设置标签的链接地址
    script.src = "http://map.qq.com/api/js?v=2.exp&callback=init";
    //添加标签到dom
    document.body.appendChild(script);
  }

  // 载入地图
  loadScript();

  // 异步提交表单
  $('form').submit(function (ev) {
    // 取消默认事件，然后使用ajax方式提交表单
    ev.preventDefault()
    let form = $(this)
    $.ajax({
      url: form.attr('action'),
      type: 'POST',
      data: form.serialize(), // 表单序列化为查询字符串
      // success: function(obj) { // 请求成功时运行的函数
      //   let el = $('<li></li>')
      //   if($('#projects-list').length) {
      //     el
      //     .append($('<a></a>').attr('href', `/project/${obj.id}/tasks`).text(`${obj.title}`))
      //     .append($('<a></a>').attr('href', `/project/${obj.id}`).attr('class', 'delete').text('x'))
      //   } else {
      //     el
      //     .append($('<span></span>').text(`${obj.title}`))
      //     .append($('<a></a>').attr('href', `/task/${obj.id}`).attr('class', 'delete').text('x'))
      //   }
      //   $('ul').append(el)
      // }
    })
    // form.find('input').val('') // 清除input中的值
  })
})