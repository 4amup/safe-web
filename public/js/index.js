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

  var datetime = new Date();
  var date = `${datetime.getFullYear()}-${datetime.getMonth()+1}-${datetime.getDate()}`;
  var hours = (datetime.getHours()<10)?'0'+datetime.getHours():datetime.getHours();
  var minutes = (datetime.getMinutes()<10)?'0'+datetime.getMinutes():datetime.getMinutes();
  var time = `${hours}:${minutes}`;
  $('input[type="date"]').val(date);
  $('input[type="time"]').val(time);
  console.log('问题发生事件初始化为当前时间');

  var center = [126.677706, 45.714858];
  // 定义公司范围，随后通过ajax绘制后异步显示地图
  var map = new AMap.Map('map', {
    center: center,
    zoom: 16,
    rotateEnable: true,
    resizeEnable: true,
    zooms: [15, 18]
    // showBuildingBlock: true,
    // layers: [new AMap.TileLayer.Satellite()],
  });

  var markers = [];

  // 定义临时marker
  var tempTroubleMarker = new AMap.Marker({
    cursor: 'move',
    icon: new AMap.Icon({
      size: new AMap.Size(36, 36),  //图标大小
      image: "images/todo.gif",
      imageOffset: new AMap.Pixel(-8, 2),
      imageSize: new AMap.Size(36, 36)
    })
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

  // 异步请求问题数据，并在地图渲染
  $.ajax({
    url: 'api/',
    type: 'GET',
    dataType: 'json'
  })
  .done(function(troubles) {
    troubles.forEach(function(value, index) {
      var marker = new AMap.Marker({
        position: JSON.parse(value.Markerposition),
        icon: new AMap.Icon({
          size: new AMap.Size(36, 36),  //图标大小
          image: "images/red_brand.png",
          // imageOffset: new AMap.Pixel(-8, 2)
          imageOffset: new AMap.Pixel(-8, 2),
          imageSize: new AMap.Size(36, 36)
        }),
        extData: {
          id: value.id,
        }
      });
      if (value.renovationStatus === 'on') {
        marker.setIcon(new AMap.Icon({
          size: new AMap.Size(36, 36),  //图标大小
          image: "images/green_brand.png",
          imageOffset: new AMap.Pixel(-8, 2),
          imageSize: new AMap.Size(36, 36)
        }))
      }
      marker.setMap(map);

      var info = [];
      info.push(value.troubleArea);
      info.push(`<img style="width:250px; height:150px" src="${JSON.parse(value.troubleImagesPath)[0]}">`);
      info.push(`<a href="trouble/${value.id}">查看详情</a>`);
      var infoWindow = new AMap.InfoWindow({
        content: info.join("<br/>"),  //使用默认信息窗体框样式，显示信息内容
        size: new AMap.Size(300, 220)
      });

      marker.on('click', function() {
        infoWindow.open(map, JSON.parse(value.Markerposition));
      });
      markers.push(marker);
    })
  })
  .fail(function() {
    console.log('服务器暂无保存的问题')
  })

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
      // 绑定事件，自动识别单位位置信息
      areaPolygon.on('click', function(e) {
        var text = e.target.getExtData().name;
        $('select option').removeAttr('selected');
        $(`select option:contains(${text})`).attr('selected', 'selected');
        tempTroubleMarker.setPosition(e.lnglat);
        tempTroubleMarker.setAnimation('AMAP_ANIMATION_NONE');
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
    var inputFile = $(this);
    var files = e.target.files;
    var firstFile = files[0]; // 根据第一个文件信息来定时间和位置

    // 先将照片信息取出来，显示到前端页面
    EXIF.getData(firstFile, function(){
      // input选择
      var dateInput = inputFile.parents('.images').parent().find("input[type='date']");
      var timeInput = dateInput.next();

      var _datetime = EXIF.getTag(this, 'DateTime'); // exif时间信息
      var _date, _time;
      // 前端显示时间
      if (_datetime) { // 将有时间信息的照片的时间输入框设为不可编辑
        _datetime = _datetime.split(' ');
        _date = _datetime[0].split(':').join('-');
        _time = _datetime[1].substring(0,5);
        dateInput.val(_date);
        timeInput.val(_time);
      }

      // 如果是问题提交，则取gps信息，如果是整改，不提取gps信息
      if(inputFile.attr('name') === 'troubleImg') {
        var _gpsLat = EXIF.getTag(this, 'GPSLatitude');
        var _gpsLng = EXIF.getTag(this, 'GPSLongitude');
        // 前端直接显示gps经纬度
        if (_gpsLat && _gpsLng) { // 如果有经纬度，将经纬度信息换算成小数模式后，写入定位输入框内
          var Lat = _gpsLat[0] + (_gpsLat[1]+_gpsLat[2]/60)/60;
          var Lng = _gpsLng[0] + (_gpsLng[1]+_gpsLng[2]/60)/60;

          // 每次重新上传图片，都重新刷新位置标记
          AMap.convertFrom(Lng+','+Lat, 'gps', function(status, result) {// 使用坐标转行工具将gps坐标转换成高德坐标
            var location = [result.locations[0].lng, result.locations[0].lat];
            tempTroubleMarker.setPosition(resetLocation(location));
            tempTroubleMarker.setMap(map);
            map.setZoom(17);
            map.setCenter(resetLocation(location));
            $('select option').removeAttr('selected');
            $(`select option:contains("地点未定义")`).attr('selected', 'selected');
            // 自动识别是哪个单位的区域，如果不在各定义单位，自动显示未定义地点
            companyPolygon.areas.every(function(value, index) { // 这里使用every是因为可以自由跳出循环，forEach不行
              if(value.contains(location)) {
                var text = value.getExtData().name;
                $('select option').removeAttr('selected');
                $(`select option:contains(${text})`).attr('selected', 'selected');
                tempTroubleMarker.setAnimation('AMAP_ANIMATION_NONE');
                return false;
              }
              return true;
              console.log('定位图标各家单位都不是');
            })
          });
        } else {
          // to-do
          // 自动聚焦到区域选择
          tempTroubleMarker.setMap(map);
          tempTroubleMarker.setPosition(center);
          $('select option').removeAttr('selected');
          $(`select option:contains("地点未定义")`).attr('selected', 'selected');
          $('select[name="troubleArea"]').focus();
          console.log('照片无gps信息，请手动在地图上点击，添加位置信息');
        }
      }
    });

    var formData = new FormData();
    for(var i=0; i<files.length; i++) {
      formData.append(`images`, files[i]);
    }
    // 自动ajax上传
    $.ajax({
      url:'api/images',
      type: 'POST',
      data: formData,
      async: false,
      cache: false,
      contentType: false,
      processData: false
    })
    .done(function(files) {
      files = files.map(function(value, index) {
        value.path = value.path.replace('public', '');
        return value;
      });
      files.forEach(function(value, index) {
        var image = $(`<image src='${value.path}'/>`);
        inputFile.parent().before(image);
      });
    })
    .fail(function() {
      alert('上传图片失败');
    });
  });

  // 全地图监听点击操作，添加标记marker
  map.on('click', function(e) {
    tempTroubleMarker.setPosition(resetLocation(e.lnglat));
    tempTroubleMarker.setMap(map);
    tempTroubleMarker.setAnimation('AMAP_ANIMATION_NONE');
    map.setZoom(15);
    map.setCenter(resetLocation(e.lnglat));
    $('select option').removeAttr('selected');
    $(`select option:contains("地点未定义")`).attr('selected', 'selected');
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
      console.log('超出公司范围，将定位点重置为center')
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

  // 多边形中心公式，主动点选单位后，自动将marker放到单位的中心点
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

  // 异步提交待开发
  $('#form').submit(function(e) {
    e.preventDefault();
    var form = $(this);
    var addObject = '&Markerposition=';
    var troubleMarkerPosition = tempTroubleMarker.getPosition();
    troubleMarkerPosition = JSON.stringify([troubleMarkerPosition.lng, troubleMarkerPosition.lat]);
    addObject += troubleMarkerPosition;

    // 路径集合
    var troubleImagesPath = [];
    var renovationImagesPath = [];

    $('.troubleBox .images img').each(function(index, elem) {
      troubleImagesPath.push(elem.src);
    });

    $('.renovationBox .images img').each(function(index, elem) {
      renovationImagesPath.push(elem.src);
    });

    troubleImagesPath = '&troubleImagesPath=' + JSON.stringify(troubleImagesPath);
    renovationImagesPath = '&renovationImagesPath=' + JSON.stringify(renovationImagesPath);

    addObject += troubleImagesPath;
    addObject += renovationImagesPath;

    $.ajax({
      url:form.attr('action'),
      type: form.attr('method'),
      data: form.serialize() + addObject
    })
    .done(function(trouble) {
      var marker = new AMap.Marker({
        position: JSON.parse(trouble.Markerposition),
        icon: new AMap.Icon({
          size: new AMap.Size(36, 36),  //图标大小
          image: (trouble.renovationStatus == 'on') ? "images/green_brand.png" : "images/red_brand.png",
          imageOffset: new AMap.Pixel(-8, 2),
          imageSize: new AMap.Size(36, 36)
        })    
      });
      marker.setMap(map);
      $('#troubleList').prepend($(`<li><a href="/trouble/${trouble.id}">${trouble.troubleDescription}</a></li>`));
      alert('提交问题成功！');
      tempTroubleMarker.setMap(null); // 提交问题成功后，将原先的tempTroubleMarker删掉
    })
    .fail(function() {
      alert('提交问题失败！');
    })
  })
});