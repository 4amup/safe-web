$(function () {
  $('input[name="renovationStatus"]').on('change', function(e) {
    var input = e.target;
    if(input.checked) {
      $(input).next().text('已整改');
      $('.renovationBox').show();
    } else {
      $(input).next().text('未整改');
      $('.renovationBox').hide();
    }
  });

  var center = [126.677706, 45.714858];
  // 定义公司范围，随后通过ajax绘制后异步显示地图
  var map = new AMap.Map('map', {
    center: center,
    zoom: 16,
    rotateEnable: true,
    resizeEnable: true,
    // showBuildingBlock: true,
    // layers: [new AMap.TileLayer.Satellite()],
  });

  // 定义临时marker
  var tempTroubleMarker = new AMap.Marker({
    // icon: new AMap.Icon({
    //     size: new AMap.Size(36, 36),  //图标大小
    //     image: "../images/new.png",
    //     imageOffset: new AMap.Pixel(0, 5),
    //     imageSize: new AMap.Size(20, 20)
    // }),
    // animation: 'AMAP_ANIMATION_BOUNCE',
    cursor: 'move',
    // draggable: true,
    // raiseOnDrag: true
  });

  // 定义公司
  var companyPolygon = new AMap.Polygon({
    map: map,
    strokeColor: "#0000ff",
    strokeOpacity: 1,
    strokeWeight: 1,
    fillColor: "#f5deb3",
    fillOpacity: 0.35,
    bubble: true,
  });
  companyPolygon.areas = [];

  // 异步请求公司数据，在地图上渲染路径
  $.ajax({
    url: '/api/company',
    type: 'GET',
    dataType: 'json'
  })
  .done(function(company) {
    companyPolygon.setPath(JSON.parse(company.polygonPath));
    companyPolygon.id = company.id;
  })
  .fail(function() {
    console.log('未查询到公司数据')
  });

  // 异步请求单位数据，并在地图中渲染
  $.ajax({
    url: '/api/company/areas',
    type: 'GET',
    dataType: 'json'
  })
  .done(function(areas) {
    areas.forEach(function(value, index) {
      var areaPolygon = new AMap.Polygon({
        map: map,
        path: JSON.parse(value.polygonPath),
        strokeColor: "#33eeff",
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: "#f5dbe3",
        fillOpacity: 0.35,
        // bubble: true,
      });
      areaPolygon.setExtData({
        id: value.id,
        name: value.name
      });
      $('select[name="troubleArea"]').append($('<option></option').text(value.name));
      // 绑定事件，自动识别单位信息
      areaPolygon.on('click', function(e) {
        var text = e.target.getExtData().name;
        $('select option').removeAttr('selected');
        $(`select option:contains(${text})`).attr('selected', 'selected');
        tempTroubleMarker.setPosition(e.lnglat);
        tempTroubleMarker.setMap(map);
        map.setCenter(e.lnglat);
        map.setZoom(17);
      });
      companyPolygon.areas.push(areaPolygon);
    });
  })
  .fail(function() {
    console.log('未查询到单位数据')
  });

  // 上传前得到上传文件信息，读取exif的时间和定位信息，然后改变相应的表单内容
  $('input[type="file"]').on('change', function(e){ // 监听fileInput文件上传框的内容改变事件
    var dateInput = $(e.target).parent().next().find('input[type="date"]');
    var timeInput = dateInput.next();
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
        console.log('照片无时间信息，添加当前时间');
      }

      // 自动添加gps定位信息
      var _gpsLat = EXIF.getTag(this, 'GPSLatitude');
      var _gpsLng = EXIF.getTag(this, 'GPSLongitude');
      // 前端直接显示gps经纬度
      if (_gpsLat && _gpsLng) { // 如果有经纬度，将经纬度信息换算成小数模式后，写入定位输入框内
        var Lat = _gpsLat[0] + (_gpsLat[1]+_gpsLat[2]/60)/60;
        var Lng = _gpsLng[0] + (_gpsLng[1]+_gpsLng[2]/60)/60;

        // 如果还没有由用户标记位置，则由gps信息定位位置，否则保留用户定义的位置
        if(!tempTroubleMarker.getPosition()) {
          // 使用坐标转行工具将gps坐标转换成高德坐标
          AMap.convertFrom(Lng+','+Lat, 'gps', function(status, result) {
            console.log(status);
            var location = [result.locations[0].lng, result.locations[0].lat];
            tempTroubleMarker.setPosition(resetLocation(location));
            tempTroubleMarker.setMap(map);
            map.setZoom(15);
            map.setCenter(resetLocation(location));
          });
        }
      } else {
        // to-do
        // 将来可以添加到页面提示信息栏目
        console.log('照片无gps信息，请手动在地图上点击，添加位置信息');
      }
    });
  });

  map.on('click', function(e) {
    tempTroubleMarker.setPosition(resetLocation(e.lnglat));
    tempTroubleMarker.setMap(map);
    map.setZoom(17);
    map.setCenter(resetLocation(e.lnglat));
    $('select option').removeAttr('selected');
    $(`select option:contains("未定义地点")`).attr('selected', 'selected');
  });

  // 工具函数，判断点是否在公司范围内
  function resetLocation(location) {
    // 先判断location是对象还是数组
    var l;
    if(Array.isArray(location)) { // 如果是数组
      l = location;
    } else {
      l = [location.lng, location.lat];
    }
    // 再判断点是否在公司范围内，如不在重置为中心
    if(companyPolygon.contains(l)) {
      return l;
    } else {
      return center;
    }
  }

  $('select[name="troubleArea"]').on('change', function(e) {
    var areaName = $(this).val();
    if(areaName === '未定义地点') {
      tempTroubleMarker.setPosition(center);
      tempTroubleMarker.setMap(map);
      map.setZoom(17);
      map.setCenter(center);
    }
    companyPolygon.areas.forEach(function(value, index) {
      if(value.getExtData().name === areaName) {
        //
        tempTroubleMarker.setPosition(polygonCenter(value));
        tempTroubleMarker.setMap(map);
        map.setCenter(polygonCenter(value));
        map.setZoom(17);
      }
    });
  });

  // 多边形中心公式
  function polygonCenter (polygon) {
    var array = polygon.getPath()
    var lng = 0
    var lat = 0;
    array.forEach(function(value, index) {
      lng+=value.lng;
      lat+=value.lat;
    });
    return [lng/array.length, lat/array.length];
  }

  // // 拖动临时点移动完后，重新判断select
  // tempTroubleMarker.on('dragend', function(e) {
  //   var location = e.lnglat;
  //   map.emit('click', e);
  // });

  // 异步提交待开发
  // $('#form').submit(function(e) {
  //   e.preventDefault();
  //   var form = $(this);
  //   var troubleMarkerPosition = tempTroubleMarker.getPosition().map(function(value, index) {
  //     return [value.lng, value.lat];
  //   });

  //   $.ajax({
  //     url:form.attr('action'),
  //     type: form.attr('method'),
  //     data: form.serialize() + 'Markerposition' + JSON.stringify(troubleMarkerPosition);
  //   })
  // })
});