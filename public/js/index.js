$(function () {
  // 载入提示
  console.log('main.js loaded!');
  $.ajax({
    url: '/api',
    type: 'GET',
    dataType: 'json'
  })
  .done(function (troubles) {
    console.log('数据传送成功！')
    function initMap (troubles, data) {
      //设置地图中心点，即工厂正中心位置
      var centerLatlng = new qq.maps.LatLng(45.716503,126.678114);
      // 以下用于限制地图范围
      var sw = new qq.maps.LatLng(45.710824,126.666484); //西南角坐标
      var ne = new qq.maps.LatLng(45.721252,126.686912); //东北角坐标
      //设置地图范围的西南角和东北角
      // 厂区范围数据，后端提供,设置厂区面积
      var data = [
        [45.71248374645855, 126.67219161987305],
        [45.715255536384234, 126.67401552200317],
        [45.71650092425703, 126.67458951473236],
        [45.716651211668655, 126.67415365576744],
        [45.717258443605346, 126.67451173067093],
        [45.71767137628016, 126.6734254360199],
        [45.72099907152751, 126.6754800081253],
        [45.71917326440228, 126.68216943740845],
        [45.71493341650691, 126.68201923370361],
        [45.71241632282879, 126.68121993541718],
        [45.7121082332633, 126.6817831993103],
        [45.710444145672874, 126.68116092681885],
        [45.71064455051665, 126.68005585670471],
        [45.71140495862153, 126.67605400085449]
      ];

      var companyPath = data.map((value, index) => {
        return new qq.maps.LatLng(value[0], value[1]);
      });

      //定义工厂模式函数
      var myOptions = {
        center: centerLatlng, //设置中心点
        mapTypeId: qq.maps.MapTypeId.ROADMAP, //设置地图样式详情参见MapType
        //初始化地图缩放级别
        zoom: 16,
        minZoom: 15,
        maxZoom: 18,
        //如果为 true，在初始化地图时不会清除地图容器内的内容
        noClear: true,
        //用作地图 div 的背景颜色。当用户进行平移时，如果尚未载入图块，则显示此颜色。
        //仅在地图初始化时，才能设置此选项
        backgroundColor: "#ffffff",
        //boundary规定了地图的边界，当拖拽超出限定的边界范围后，会自动移动回来
        // boundary:new qq.maps.LatLngBounds (sw, ne),
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

      // 厂区范围用多边形覆盖物
      var polygon = new qq.maps.Polygon({
        path: companyPath,
        map: map
      });

      var info = new qq.maps.InfoWindow({ // 信息窗口，公用
        map: map
      });

      // 使用传入的数据troubles
      var markers = new Array(troubles.length);
      for (var i=0; i<troubles.length; i++) {
        let trouble = troubles[i];
        markers[i] = new qq.maps.Marker({
        position: new qq.maps.LatLng(trouble.Lng, trouble.Lat),
        map: map,
        });
        markers[i].setIcon(icon); // 添加icon

        ;

        qq.maps.event.addListener(markers[i], 'click', function() {
          info.open();
          info.setContent(`<div><h1 style="text-align:center">${ trouble.imageDescription }</h1><img style="width:400px; height:200px;" src=${ trouble.imagePath }></div>`);
          info.setPosition(new qq.maps.LatLng(trouble.Lng, trouble.Lat));
        });
      }
    }

    window.init = function () {
      return initMap(troubles);
    }
    // 载入地图
    function loadScript(troubles) {
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
    loadScript(troubles);
  })
})