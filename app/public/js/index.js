window.onload = function(){
  //直接加载地图

  //初始化地图函数  自定义函数名init
  function init() {
    // 作为地图弹出窗口的内容
    var trouble = `<div><h1 style="text-align:center">需参数化标题</h1><img style="width:400px; height:200px;" src="example/example.jpg"/></div>`
    var sw = new qq.maps.LatLng(45.710540, 126.672342); //西南角坐标
    var ne = new qq.maps.LatLng(45.718960, 126.682878); //东北角坐标

    // 中心点
    var center = new qq.maps.LatLng(45.7137085949, 126.6769766808);

    //定义map变量 调用 qq.maps.Map() 构造函数   获取地图显示容器
    var map = new qq.maps.Map(document.getElementById("map"), {
      // 地图的中心地理坐标。
      center: new qq.maps.LatLng(45.7137085949, 126.6769766808),
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
    });


    //设置Marker自定义图标的属性
    //size是图标尺寸，该尺寸为显示图标的实际尺寸
    //origin是切图坐标，该坐标是相对于图片左上角默认为（0,0）的相对像素坐标
    //anchor是锚点坐标，描述经纬度点对应图标中的位置
    //缩放尺寸，用于拉伸或缩小原图片时使用，该尺寸是用来改变整个图片的尺寸
    var anchor = new qq.maps.Point(10, 0),
    size = new qq.maps.Size(20, 20),
    origin = new qq.maps.Point(0, 0),
    scaleSize = new qq.maps.Size(20, 20)
    icon = new qq.maps.MarkerImage(
      "images/todo.png",
      size,
      origin,
      anchor,
      scaleSize
    );
    // 自定义标注
    var marker = new qq.maps.Marker({
      position: center,
      map: map,
    });
    marker.setIcon(icon);

    // 标注事件自定义
    //添加到提示窗
    var info = new qq.maps.InfoWindow({
      map: map
    });
    //获取标记的点击事件
    qq.maps.event.addListener(marker, 'click', function() {
      info.open();
      // 以下显示的内容将来要通过数据库的实例改变
      info.setContent(trouble);
      info.setPosition(center);
    });
  }

  //调用初始化函数地图
  init();

}