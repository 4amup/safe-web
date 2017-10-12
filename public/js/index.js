$(function () {
  // 载入提示
  console.log('main.js load start!');
  var upfileBox = $('#upfile');
  var fileInput = $('#demo-file');
  var fileLabel = $('#demo-preview');
  var dateInput = $('#dateInput'); // 拍摄时间自动读取
  var timeInput = $('#timeInput'); // 拍摄时间自动读取
  var locationInput = $('#troubleLocation');

  if (typeof window.FileReader === 'function' || typeof window.FileReader === 'object') { // 火狐谷歌浏览器支持window.FileReader对象，IE不支持
    upfileBox.addClass('upfile-advanced');

    var oFile = new FileReader();
    var passFileType = /^(?:image\/bmp|image\/gif|image\/jpeg|image\/png)$/i; // 规定上传文件的扩展名格式

    // 开始读取图片时，重新将日期清空
    oFile.onloadstart = function () {
      dateInput.val('');
      timeInput.val('');
      dateInput.removeAttr('disabled');
      timeInput.removeAttr('disabled');
    }
    oFile.onloadend = function(oFREvent){ // onloadend，读取完触发事件，无论成败，都通过
      fileLabel.attr('class', '');

      var state = oFREvent.currentTarget.readyState;
      if (state === 2) {
        fileLabel.addClass('set').css('backgroundImage', 'url(' + oFREvent.target.result + ')');
      } else {
        fileLabel.addClass('error');
      };
    };

    fileInput.on('change', function(e){ // 监听fileInput文件上传框的内容改变事件
      if (!e.target || !e.target.files.length || !e.target.files[0]) {return};

      var _file = e.target.files[0];

      if (!passFileType.test(_file.type)) {return}; // 如果不符合规定格式，立即返回

      oFile.readAsDataURL(_file); // 开始读取文件

      EXIF.getData(_file, function(){
        var _datetime = EXIF.getTag(this, 'DateTime');
        var _date;
        var _time;

        // 前端显示时间
        if (_datetime) {
          _datetime = _datetime.split(' ');
          _date = _datetime[0].split(':').join('-');
          _time = _datetime[1];
          dateInput.val(_date);
          timeInput.val(_time);
          dateInput.attr('disabled','disabled');
          timeInput.attr('disabled','disabled');
        } else {
          _datetime = new Date();
          _date = `${_datetime.getFullYear()}-${_datetime.getMonth()+1}-${_datetime.getDate()}`;
          _time = `${(_datetime.getHours()<10)?'0'+_datetime.getHours():_datetime.getHours()}:${(_datetime.getMinutes() < 10)? '0'+_datetime.getMinutes():_datetime.getMinutes()}:${(_datetime.getSeconds() < 10)? '0'+_datetime.getSeconds() : _datetime.getSeconds()}`;
          dateInput.val(_date);
          timeInput.val(_time);
        }

        // 调整图片旋转
        var _rotate = 0;
        var _orientation = EXIF.getTag(this, 'Orientation'); // 此参数显示拍摄方向

        if (_orientation == 3) {
          _rotate = 180;
        } else if (_orientation == 6) {
          _rotate = 90;
        } else if (_orientation == 8) {
          _rotate = 270;
        };

        fileLabel.addClass('rotate-' + _rotate);

        // 自动添加gps定位信息
        var _gpsLat = EXIF.getTag(this, 'GPSLatitude');
        var _gpsLng = EXIF.getTag(this, 'GPSLongitude');
        if (_gpsLat && _gpsLng) {
          var Lat = _gpsLat[0] + (_gpsLat[1]+_gpsLat[2]/60)/60;
          var Lng = _gpsLng[0] + (_gpsLng[1]+_gpsLng[2]/60)/60;
          locationInput.val(Lat + ',' + Lng);
          // 手动触发locationInput的focus事件
          locationInput.trigger('focus');
        } else {
          console.log('没有gps信息，启动自动定位。')
        }
      });
    });
  } else {
    alert('当前浏览器不支持实时预览，请更换现代浏览器，或切换至极速模式后刷新');
  }

  $.ajax({
    url: '/api',
    type: 'GET',
    dataType: 'json'
  })
  .done(function (troubles) {
    console.log('数据传送成功！')
    function initMap (troubles, data) {
      // 模拟服务器返回的数据，单位是json格式组织
      var departmentList = [
        {
          id:'dep1',
          name:'管二分厂',
          workshops: [{
            id: 'workshop1',
            name: '四厂房',
            pathData: [
              [45.71515066034897, 126.67782425880432],
              [45.71455885617526, 126.67754530906677],
              [45.7137722713072, 126.68060302734375],
              [45.714371575068014, 126.68086051940918]
            ]
          }, {
            id: 'workshop2',
            name: '十厂房',
            pathData: [
              [45.718214457692014, 126.67874693870544],
              [45.71792980878267, 126.67859673500061],
              [45.71777999298482, 126.67927265167236],
              [45.71754777770435, 126.67914390563965],
              [45.71688858068238, 126.68177247047424],
              [45.717248143658395, 126.68198704719543],
              [45.71747286934346, 126.68193340301514]
            ]
          }]
        },
        {
          id:'dep2',
          name:'轻容分厂',
          workshops: [{
            id: 'workshop1',
            name: '五厂房',
            pathData: [
              [45.714952144457584, 126.67534589767456],
              [45.7136037159665, 126.67474508285522],
              [45.7131542325726, 126.676504611969],
              [45.71459256670792, 126.6772985458374]
            ]
          }]
        }
      ];

      // 根据服务器返回的数据（开发阶段未模拟数据）
      for (var i=0; i<departmentList.length; i++) {
        // 根据服务端数据生成页面的单位option选项
        var departmentOption = $('<option></option>').attr('id', `${departmentList[i].id}`).html(departmentList[i]['name']);
        $('#department').append(departmentOption);
        // 根据path数据生成polygon，并加入对象的属性
        for (var j=0; j<departmentList[i].workshops.length; j++) {
          departmentList[i].workshops[j].polygonPath = departmentList[i].workshops[j].pathData.map((value, index) => {
            return new qq.maps.LatLng(value[0], value[1]);
          });
        }
      }

      // 表单联动，监听到selected时间后，自动生成对应的option
      $('#department').change(function(event) {
        // 清除后续的options
        $("#workshop").html('').append('<option>选择厂房</option');
        console.log($("#department option:selected")[0]);
        var departmentSelectId = $("#department option:selected")[0].id;
        departmentList.forEach(function (value, index) {
          if(value.id === departmentSelectId) {
            value.workshops.forEach(function (val, idx) {
              $("#workshop").append($("<option></option>").html(val.name));
            });
          };
        });
        departmentList[departmentSelectId]
      });

      //设置地图中心点，即工厂正中心位置
      var centerLatlng = new qq.maps.LatLng(45.716503,126.678114);
      // 以下用于限制地图范围，设置地图范围的西南角和东北角
      var sw = new qq.maps.LatLng(45.710824,126.666484); //西南角坐标
      var ne = new qq.maps.LatLng(45.721252,126.686912); //东北角坐标

      // 厂区范围数据，后端提供,设置厂区面积
      var companyData = [
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

      var companyPath = companyData.map((value, index) => {
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
      var factoryPolygon = new qq.maps.Polygon({
        path: companyPath,
        map: map,
        strokeWeight: 1,
        fillColor: new qq.maps.Color(229,104,17, 0.2),
      });

      // 生成区域多边形覆盖物，并加入departmentList对象的对应属性中
      departmentList.forEach(function (value, index) {
        value.workshops.forEach(function (val, idx) {
          val.polygon = new qq.maps.Polygon({
            path: val.polygonPath,
            map: map,
            strokeWeight: 1,
            fillColor: new qq.maps.Color(13,148,227, 0.2)
          });
        });
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

        qq.maps.event.addListener(markers[i], 'click', function() {
          info.open();
          info.setContent(`<div><h1 style="text-align:center">${ trouble.imageDescription }</h1><img style="width:400px; height:200px;" src=${ trouble.imagePath }></div>`);
          info.setPosition(new qq.maps.LatLng(trouble.Lng, trouble.Lat));
          map.panTo(new qq.maps.LatLng(trouble.Lng, trouble.Lat));
        });
      }

      var marker = new qq.maps.Marker({
        map:map,
        postion:new qq.maps.LatLng(45.713503,126.677114),
        animation: qq.maps.MarkerAnimation.BOUNCE // 跳动标记，表示新增的问题点
      });
      marker.setIcon(icon);
      // newMarker.setVisble(false);

      // 点击事件添加
      qq.maps.event.addListener(map, 'click', function(event) {
        if (!factoryPolygon.getBounds().contains(event.latLng)) { // 判断添加点是否在公司范围内
          marker.setPosition(centerLatlng);
          locationInput.val('45.716503,126.678114');
          map.panTo(centerLatlng);
          map.zoomTo(18);
        } else { // 判断逻辑，在公司范围内，确定是在具体哪个区域，随后改变响应的option选项
          for(var i=0; i<departmentList.length; i++) {
            // departmentList[i].workshops
            for(var j=0; j<departmentList[i].workshops.length; j++) {
              if(departmentList[i].workshops[j].polygon.getBounds().contains(event.latLng)) {
                $(`#department option:nth-child(${i+2})`).attr('selected', 'selected'); // department单位设定为选定状态
                // 手动触发change事件，将option改变
                $('#department').trigger('change');
                $(`#workshop option:nth-child(${j+2})`).attr('selected', 'selected'); // workshop厂房设定为选定状态
                continue;
              }
            }
          }
          marker.setPosition(event.latLng);
          locationInput.val(marker.getPosition());
          map.panTo(event.latLng);
          map.zoomTo(18);
        }
      });

      // 监听DOM事件
      var troubleLocation = document.getElementById('troubleLocation');
      qq.maps.event.addDomListener(troubleLocation,"focus",function(){
        var locaitonString = troubleLocation.value.split(',');
        console.log(locaitonString);
        qq.maps.convertor.translate(new qq.maps.LatLng(locaitonString[0].trim()-0, locaitonString[1].trim()-0), 1, function(res){
          marker.setPosition(res[0]);
          map.panTo(res[0]);
        });
      });
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
      script.src = "http://map.qq.com/api/js?v=2.exp&libraries=convertor&callback=init";
      //添加标签到dom
      document.body.appendChild(script);
    }

    // 载入地图
    loadScript(troubles);
  });

  $('#form').submit(function (ev) {
    ev.preventDefault();
    var form = this;
    $.ajax({
      url: form.attr('action'),
      type: 'POST',
      dataType: 'json'
    })
    .done(function() {
      //
    })
  })


  console.log('main.js loaded!');

})