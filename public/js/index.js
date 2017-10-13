$(function () {
  // 载入提示
  console.log('main.js load start!');

  var fileInput = $('#upImage');
  var troubleDescription = $('#troubleDescription');
  var dateInput = $('#dateInput'); // 拍摄时间自动读取
  var timeInput = $('#timeInput'); // 拍摄时间自动读取
  var locationInput = $('#troubleLocation'); // 定位点获取
  var statusInput = $('#status');
  var reformBox = $('#reformBox');

  // 添加整改图片联动逻辑
  statusInput.change(function() {
    var status = $(this).val();
    if(status == "true") {
      reformBox.show();
    } else {
      reformBox.hide();
    }
  });

  // 上传前得到上传文件信息，读取exif的时间和定位信息，然后改变相应的表单内容
  fileInput.on('change', function(e){ // 监听fileInput文件上传框的内容改变事件
    // input文件改变后，首先要清除原先的旧信息
    locationInput.val('');
    troubleDescription.val('');

    var _file = e.target.files[0]; // 原始文件信息

    EXIF.getData(_file, function(){
      var _datetime = EXIF.getTag(this, 'DateTime'); // exif时间信息
      var _date, _time;
      // 前端显示时间
      if (_datetime) { // 将有时间信息的照片的时间输入框设为不可编辑
        _datetime = _datetime.split(' ');
        _date = _datetime[0].split(':').join('-');
        _time = _datetime[1];
        dateInput.val(_date);
        timeInput.val(_time);
        dateInput.attr('disabled','disabled');
        timeInput.attr('disabled','disabled');
      } else { // 如果没有时间信息，则使用当前时间，时间输入框可编辑
        _datetime = new Date();
        _date = `${_datetime.getFullYear()}-${_datetime.getMonth()+1}-${_datetime.getDate()}`;
        var hours = (_datetime.getHours()<10)?'0'+_datetime.getHours():_datetime.getHours();
        var minutes = (_datetime.getMinutes()<10)?'0'+_datetime.getMinutes():_datetime.getMinutes();
        _time = `${hours}:${minutes}`;
        dateInput.val(_date);
        timeInput.val(_time);
      }

      // 自动添加gps定位信息
      var _gpsLat = EXIF.getTag(this, 'GPSLatitude');
      var _gpsLng = EXIF.getTag(this, 'GPSLongitude');
      // 前端直接显示gps经纬度
      if (_gpsLat && _gpsLng) { // 如果有经纬度，将经纬度信息换算成小数模式后，写入定位输入框内
        var Lat = _gpsLat[0] + (_gpsLat[1]+_gpsLat[2]/60)/60;
        var Lng = _gpsLng[0] + (_gpsLng[1]+_gpsLng[2]/60)/60;
        locationInput.val(Lat + ',' + Lng);
        // 手动触发locationInput的change事件，使地图出现跳动marker
        locationInput.trigger("focus");
      } else {
        // to-do
        // 将来可以添加到页面提示信息栏目
        console.log('照片无gps信息，请手动在地图上点击，添加位置信息');
      }
    });
  });

  // 通过ajax异步从服务器获取数据，返回数据，生成页面地图
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
        $("#workshop").html('').append('<option>选择厂房</option>');
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

      // 点击事件添加
      qq.maps.event.addListener(map, 'click', function(event) {
        // 全部清除selected状态
        $('#department option').removeAttr('selected');
        $('#department').trigger('change');
        if (!factoryPolygon.getBounds().contains(event.latLng)) { // 判断添加点是否在公司范围内
          marker.setPosition(centerLatlng);
          locationInput.val('45.716503,126.678114');
          map.panTo(centerLatlng);
          map.zoomTo(17);
        } else { // 判断逻辑，在公司范围内，确定是在具体哪个区域，随后改变响应的option选项
          for(var i=0; i<departmentList.length; i++) {
            for(var j=0; j<departmentList[i].workshops.length; j++) {
              if (departmentList[i].workshops[j].polygon.getBounds().contains(event.latLng)) {
                $(`#department option:nth-child(${i+2})`).attr('selected', 'selected'); // department单位设定为选定状态
                // 手动触发change事件，将option改变
                $('#department').trigger('change');
                $(`#workshop option:nth-child(${j+2})`).attr('selected', 'selected'); // workshop厂房设定为选定状态
                break;
              };
            }
          }

          marker.setPosition(event.latLng);
          locationInput.val(marker.getPosition().lat+','+marker.getPosition().lng);
          map.panTo(event.latLng);
          map.zoomTo(17);
        }
      });

      // 监听DOM事件
      var troubleLocation = document.getElementById('troubleLocation');
      qq.maps.event.addDomListener(troubleLocation,"focus",function(){
        var locaitonString = troubleLocation.value.split(',');
        console.log(locaitonString);
        qq.maps.convertor.translate(new qq.maps.LatLng(locaitonString[0].trim()-0, locaitonString[1].trim()-0), 1, function(res){
          if(!factoryPolygon.getBounds().contains(res[0])) { // 逻辑：如果不在公司范围内，强制定位到公司中心
            marker.setPosition(centerLatlng);
            map.panTo(centerLatlng);
            map.zoomTo(18);
          } else { // 如果在厂区范围内，则正常定位
            marker.setPosition(res[0]);
            map.panTo(res[0]);
          };
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

  console.log('main.js loaded!');
});