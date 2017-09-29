$(function() {

  var pathArray = [];
  //初始化地图函数  自定义函数名init
  function init() {
    //定义map变量 调用 qq.maps.Map() 构造函数   获取地图显示容器
    var map = new qq.maps.Map(document.getElementById("map"), {
        center: new qq.maps.LatLng(45.7137085949, 126.6769766808),
        zoom:17,
        mapTypeId: qq.maps.MapTypeId.HYBRID
    });
    // 增加一个空地图，将控件隐藏
    var nullmap = new qq.maps.Map(document.getElementById("nullmap"), {
      center: new qq.maps.LatLng(45.7137085949, 126.6769766808),
      zoom:17,
      mapTypeId: qq.maps.MapTypeId.HYBRID
    });

    // 添加绘制多边形的库
    var drawingManager = new qq.maps.drawing.DrawingManager({
      drawingMode: qq.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: qq.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          qq.maps.drawing.OverlayType.MARKER,
          qq.maps.drawing.OverlayType.CIRCLE,
          qq.maps.drawing.OverlayType.POLYGON,
          qq.maps.drawing.OverlayType.RECTANGLE
        ]
      },
      markerOptions:{
      visible:false
      },
      circleOptions: {
          fillColor: new qq.maps.Color(255, 208, 70, 0.3),
          strokeColor: new qq.maps.Color(88, 88, 88, 1),
          strokeWeight: 3,
          clickable: false
      }
    });
    drawingManager.setMap(map);

    // 多边形覆盖绘制
    var polygon = new qq.maps.Polygon({
      map: map, // 显示多边形的地图实例
      editable: true, // 多边形是否可编辑
      cursor: 'crosshair', //鼠标在折线上时的样式
    });

    // 监听画完事件
    qq.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
      console.log(event.overlay.path.elems);
      pathArray = event.overlay.path.elems;
      // 根据绘制的多边形渲染生成一个多边形覆盖物
      polygon.setPath(pathArray);
      renderShow(pathArray);
      drawingManager.setMap(nullmap);
    });

    polygon.setPath(pathArray);
    // 手动触发多边形更改事件
    $("#changePolygon").click(function() {
      pathArray = polygon.getPath().elems;
      renderShow(pathArray);
    })
  }
  // 根据数组渲染页面内容
  function renderShow(arr) {
    $("#show").empty();
    var path = [];
    if (arr.length>0) {
      var ul = $("<ul></ul>");
      for (var i=0; i<arr.length; i++) {
        ul.append($("<li></li>").text(`第${i+1}个标记点坐标：[${arr[i].lat}, ${arr[i].lng}]`));
      }
      $("#show").append(ul);
    } else {
      $("#show").text("未点击");
    }
  }
  //调用初始化函数地图
  init();
})