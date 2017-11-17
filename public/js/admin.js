$(function() {
  $('form').attr('autocomplete', 'off');
  var areaIndex, areaItem;
  var editAreaPolygon;
  editCompanyPolygon = new AMap.PolyEditor(map,companyPolygon); // 接着把绘制的多边形变成可编辑状态
  // 定义地图
  var map = new AMap.Map('map', {
      center: [126.683507, 45.713941],
      zoom: 16,
      rotateEnable: true,
      resizeEnable: true,
      // showBuildingBlock: true,
      // layers: [new AMap.TileLayer.Satellite()],
  });
  var tempPolygon = new AMap.Polygon({
    map: map,
    strokeColor: "#33eeff",
    strokeOpacity: 1,
    strokeWeight: 2,
    fillColor: "#f5dbe3",
    fillOpacity: 0.35,
    strokeStyle: 'dashed'
  });
  // 加载鼠标绘制多边形插件
  var mouseTool = new AMap.MouseTool(map); //在地图中添加MouseTool插件
  map.plugin(mouseTool);

  // 定义公司
  var companyPolygon = new AMap.Polygon({
    map: map,
    strokeColor: "#0000ff",
    strokeOpacity: 1,
    strokeWeight: 1,
    fillColor: "#f5deb3",
    fillOpacity: 0.35,
  });
  companyPolygon.areas = [];

  // 增加公司范围按钮
  $('.companyBox').on('click', '.createPolygon', function() {
    map.setMapStyle('amap://styles/grey'); // 设置地图特殊样式，提示可以开始划范围了
    mouseTool.polygon();
    // 添加按钮组
    $('.buttonBox').show();
    AMap.event.addListener( mouseTool,'draw',function(e){ // 监听鼠标画完事件
      var companyPath = e.obj.getPath();
      companyPath = companyPath.map(function(value, index) {
        return [value.lng, value.lat]; // polygonPath的高级数据，转换成简单的数组形式
      });
      mouseTool.close(true); //画完后把画的图擦除
      tempPolygon.setPath(companyPath);
      editTempPolygon = new AMap.PolyEditor(map,tempPolygon); // 接着把绘制的多边形变成可编辑状态
      editTempPolygon.open();

      // 添加编辑事件按钮事件
      AMap.event.addDomListener(document.getElementById('editPolygon'), 'click', function() {
        editTempPolygon.open();
      }, false);
      // 添加结束编辑事件按钮事件
      AMap.event.addDomListener(document.getElementById('overPolygon'), 'click', function() {
        editTempPolygon.close();
      }, false);
    });
  });

  // 编辑公司信息按钮
  $('.companyBox').on('click', '.editCompany', function(ev) {
    ev.preventDefault();
    $('#updateCompany').toggle();
    $('#updateCompany input:eq(0)').val($('.companyShow').find('span:eq(0)').text());
    $('#updateCompany input:eq(1)').val($('.companyShow').find('span:eq(1)').text());
    // 编辑公司范围按钮
    $('.companyBox').on('click', '.updatePolygon', function(ev) {
      map.setMapStyle('amap://styles/grey'); // 设置地图特殊样式，提示可以开始划范围了
      editCompanyPolygon = new AMap.PolyEditor(map,companyPolygon); // 接着把绘制的多边形变成可编辑状态
      editCompanyPolygon.open();
      $('.buttonBox').show();
      // 添加编辑事件按钮事件
      AMap.event.addDomListener(document.getElementById('editPolygon'), 'click', function() {
        editCompanyPolygon.open();
      }, false);
      // 添加结束编辑事件按钮事件
      AMap.event.addDomListener(document.getElementById('overPolygon'), 'click', function() {
        editCompanyPolygon.close();
      }, false);
    });
  });

  // 查-异步请求公司数据，在地图上绘制
  $.ajax({
    url: '/api/company',
    type: 'GET',
    dataType: 'json'
  })
  .done(function(company) {
    $('.companyShow h3').show();
    $('.areaBox').show();
    var path = JSON.parse(company.polygonPath);
    companyPolygon.id = company.id; // 将id赋给多边形
    $('.companyBox').attr('id', company.id);
    companyPolygon.setPath(path); // 根据path将company的多边形显示在地图上。
  })
  .fail(function() {
    console.log('公司数据未上传');
    $('#createCompany').show();
  });

  // 增-ajax异步提交
  $('#createCompany').submit(function(ev) {
    editTempPolygon.close();
    ev.preventDefault(); // 取消默认的提交事件，使用ajax提交表单
    var form = $(this);
    var companyPath = tempPolygon.getPath().map(function(value, index) {
      return [value.lng, value.lat]; // polygonPath的高级数据，转换成简单的数组形式
    });
    $.ajax({
      url: form.attr('action'),
      type: form.attr('method'),
      data: form.serialize()+'&polygonPath='+ JSON.stringify(companyPath)
    })
    .done(function(company) {
      console.log(`公司信息${form.attr('method')}成功`);
      console.log(company);
      tempPolygon.setPath(null);
      companyPolygon.id = company.id;
      // 前端显示刚上传的数据。
      $('.companyShow h3').show();
      $('.areaBox').show();
      $('#createCompany').hide();
      $('.companyBox span:eq(0)').text(company.name);
      $('.companyBox span:eq(1)').text(company.info);
      $('.companyBox a:eq(1)').attr('href', `api/company/${company.id}`);
      $('#updateCompany').attr('action', `api/company/${company.id}`);
      $('#createArea').attr('action', `api/company/${company.id}/areas`);
      var path = JSON.parse(company.polygonPath);
      companyPolygon.setPath(path);
      map.setMapStyle('amap://styles/normal'); // 恢复地图正常样式
      $('.buttonBox').hide();
    });
  });

  // 修改公司数据
  $('#updateCompany').submit(function(ev) {
    ev.preventDefault(); // 取消默认的提交事件，使用ajax提交表单
    var form = $(this);
    var companyPath = companyPolygon.getPath().map(function(value, index) {
      return [value.lng, value.lat];
    })
    $.ajax({
      url: form.attr('action'),
      type: form.attr('method'),
      data: form.serialize()+'&polygonPath='+ JSON.stringify(companyPath)
    })
    .done(function(company) {
      console.log(`公司信息${form.attr('method')}成功`);
      console.log(company);
      companyPolygon.id = company.id;
      editCompanyPolygon.close();
      var path = JSON.parse(company.polygonPath);
      companyPolygon.setPath(path);
      // 前端显示刚上传的数据。
      $('.companyBox span:eq(0)').text(company.name);
      $('.companyBox span:eq(1)').text(company.info);
      map.setMapStyle('amap://styles/normal'); // 恢复地图正常样式
      $('.buttonBox').hide();
      $('#updateCompany').hide();
    });
  });

  // 删除数据
  $('.companyBox').on('click', 'a.deleteItem', function(ev) {
    var item = $(ev.target);
    ev.preventDefault();
    $.ajax({
      url: item.attr('href'),
      type: 'DELETE'
    })
    .done(function(data) {
      console.log(data);
      console.log('公司信息DELETE成功');
      companyPolygon.setPath(null);
      companyPolygon.areas.forEach(function(value, index) {
        value.setPath(null);
      });
      companyPolygon.areas = [];
      $('.companyShow h3').hide();
      $('.areaBox').hide();
      $('.areaShow').remove();
      $('.companyBox span:eq(0)').text(null);
      $('.companyBox span:eq(1)').text(null);
      $('.buttonBox').hide();
      $('#createCompany').show();
      $('#updateCompany').hide();
    })
    .fail(function() {
      console.log('公司信息DELETE失败');
    });
  });


  // 编辑部门消息按钮
  $('.companyBox').on('click', '.editArea', function(ev) {
    ev.preventDefault(); // 阻止默认链接跳转事件
    areaItem = ev.target.closest('h5')
    $('#updateArea').toggle(); //打开更新表单
    $('#updateArea').attr('action', `api/company/areas/${areaItem.id}`); // action赋值
    $('#updateArea input:eq(0)').val($(areaItem).find('span:eq(0)').text());
    $('#updateArea input:eq(1)').val($(areaItem).find('span:eq(1)').text());
  });

  // 编辑公司范围按钮
  $('.areaBox').on('click', '.updatePolygon', function(areaId) {
    areaIndex = $('.areaBox h5').index(areaItem); // area当前索引
    map.setMapStyle('amap://styles/grey'); // 设置地图特殊样式，提示可以开始划范围了
    editAreaPolygon = new AMap.PolyEditor(map,companyPolygon.areas[areaIndex]); // 接着把绘制的多边形变成可编辑状态
    editAreaPolygon.open();
    $('.buttonBox').show();
    // 添加编辑事件按钮事件
    AMap.event.addDomListener(document.getElementById('editPolygon'), 'click', function() {
      editAreaPolygon.open();
    }, false);
    // 添加结束编辑事件按钮事件
    AMap.event.addDomListener(document.getElementById('overPolygon'), 'click', function() {
      editAreaPolygon.close();
    }, false);
  });

  // 查-异步请求公司数据，在地图上绘制
  $.ajax({
    url: '/api/company/areas',
    type: 'GET',
    dataType: 'json'
  })
  .done(function(areas) {
    $('.areaBox').show();
    areas.forEach(function(value, index) {
      var path = JSON.parse(value.polygonPath);
      var areaPolygon = new AMap.Polygon({
        map: map,
        path: path,
        strokeColor: "#33eeff",
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: "#f5dbe3",
        fillOpacity: 0.35,
        id: value.id
      });
      companyPolygon.areas.push(areaPolygon);
    });
  })
  .fail(function() {
    console.log('部门数据未上传');
  });

  // 增-ajax异步提交区域
  $('#createArea').submit(function(ev) {
    ev.preventDefault(); // 取消默认的提交事件，使用ajax提交表单
    var form = $(this);
    var areaPath = tempPolygon.getPath().map(function(value, index) {
      return [value.lng, value.lat]; // polygonPath的高级数据，转换成简单的数组形式
    });
    $.ajax({
      url: form.attr('action'),
      type: form.attr('method'),
      data: form.serialize()+'&polygonPath='+ JSON.stringify(areaPath)
    })
    .done(function(area) {
      console.log(`部门信息${form.attr('method')}成功`);
      console.log(area);
      tempPolygon.setPath(null);
      var path = JSON.parse(area.polygonPath);
      var areaPolygon = new AMap.Polygon({
        map: map,
        path: path,
        strokeColor: "#33eeff",
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: "#f5dbe3",
        fillOpacity: 0.35,
        id: area.id
      });
      companyPolygon.areas.push(areaPolygon);
      // 前端显示刚上传的数据。
      var h5 = $('<h5></h5>');
      h5.attr('class', 'areaShow').attr('id', area.id);
      h5.html(`
      <span>${ area.name }</span>
      <span>${ area.info }</span>
      <a href="" class="editArea">edit</a>
      <a href="api/company/areas/${area.id}" class="delete">del</a>
      `);
      $('.areaBox').append(h5);
      $('#createArea input[type="text"]').val(null);
      map.setMapStyle('amap://styles/normal'); // 恢复地图正常样式
      $('.buttonBox').hide();
    })
    .fail(function() {
      console.log('创建部门失败')
    })
  });

  // 改-ajax异步提交区域
  $('#updateArea').submit(function(ev) {
    ev.preventDefault(); // 取消默认的提交事件，使用ajax提交表单
    editAreaPolygon.close();
    var form = $(this);
    var areaPatn = companyPolygon.areas[areaIndex].getPath().map(function(value, index) {
      return [value.lng, value.lat];
    })
    $.ajax({
      url: form.attr('action'),
      type: form.attr('method'),
      data: form.serialize()+'&polygonPath='+ JSON.stringify(areaPatn)
    })
    .done(function(area) {
      console.log(`部门信息${form.attr('method')}成功`);
      console.log(area);
      var path = JSON.parse(area.polygonPath);
      companyPolygon.areas[areaIndex].setPath(path);
      // 前端显示刚上传的数据。
      $(`.areaShow:eq(${areaIndex}) span:eq(0)`).text(area.name);
      $(`.areaShow:eq(${areaIndex}) span:eq(1)`).text(area.info);
      map.setMapStyle('amap://styles/normal'); // 恢复地图正常样式
      $('.buttonBox').hide();
      $('#updateArea').hide();
    });
  });
  // 删除数据
  $('.areaBox').on('click', '.areaShow a.delete', function(ev) {
    var item = $(ev.target).parent('h5');
    areaIndex = $('.areaBox h5').index(item);
    ev.preventDefault();
    $.ajax({
      url: $(ev.target).attr('href'),
      type: 'DELETE'
    })
    .done(function(data) {
      console.log(data);
      console.log('部门信息DELETE成功');
      companyPolygon.areas[areaIndex].setPath(null);
      companyPolygon.areas.splice(areaIndex, 1); // 删除指定索引位置的元素

      $(`.areaShow:eq(${areaIndex})`).remove();
      $('.buttonBox').hide();
      $('#updateArea').hide();
    })
    .fail(function() {
      console.log('部门信息DELETE失败');
    });
  });
})