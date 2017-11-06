$(function() {
  var map = new AMap.Map('map', {
      center: [126.683507, 45.713941],
      zoom: 16
  });

  // 如果有公司的数据，则新建一个公司范围的polygon
  if($('.companyBox span:eq(0)').text() !== "") {
    var companyPolygon = new AMap.Polygon({
      map: map,
      strokeColor: "#0000ff",
      strokeOpacity: 1,
      strokeWeight: 3,
      fillColor: "#f5deb3",
      fillOpacity: 0.35
    });
    companyPolygon.id = $('.companyBox').attr('id');

    // 异步请求公司数据，在地图上绘制
    $.ajax({
      url: '/api/company',
      type: 'GET',
      dataType: 'json'
    })
    .done(function(company) {
      var path = JSON.parse(company.polygonPath).map(function(value, index) {
        return [value.lng, value.lat]; // polygonPath的高级数据，转换成简单的数组形式
      });
      companyPolygon.setPath(path); // 根据path将company的多边形显示在地图上。
    });

    // 获取前端信息后，循环写部门的polygon
    if($('.departmentBox').length) {
      companyPolygon.departments = new Array($('.departmentBox').length);
      for(var i=0; i<$('.departmentBox').length; i++) {
        companyPolygon.departments[i] = new AMap.Polygon({
          map: map,
          strokeColor: "#0000ff",
          strokeOpacity: 1,
          strokeWeight: 2,
          fillColor: "#f5deb3",
          fillOpacity: 0.35
        });
        companyPolygon.departments[i].id = $(`.departmentBox:eq(${i})`).attr('id');
      }

      // 异步请求部门数据，在地图上绘制
      $.ajax({
        url: `/api/company/${companyPolygon.id}/departments`,
        type: 'GET',
        dataType: 'json'
      })
      .done(function(departments) {
        for (var j=0; j<departments.length; j++) {
          var departmentPath = JSON.parse(departments[j].polygonPath).map(function(value, index) {
            return [value.lng, value.lat]; // polygonPath的高级数据，转换成简单的数组形式
          });
          companyPolygon.departments[j].setPath(departmentPath);
        }
      });
    }
  };

  // 加载页面的一些基础工具
  AMap.plugin(['AMap.ToolBar','AMap.Scale','AMap.MapType', 'AMap.Geolocation'],
  function(){
    map.addControl(new AMap.ToolBar());

    map.addControl(new AMap.Scale());
    // map.addControl(new AMap.MapType());
    map.addControl(new AMap.Geolocation());
  });

  // 加载鼠标绘制多边形插件
  var mouseTool = new AMap.MouseTool(map); //在地图中添加MouseTool插件
  map.plugin(mouseTool);
  // 定义绘制的多边形及路径
  var drawPolygon, editpath;
  // 添加事件监听按钮点击
  AMap.event.addDomListener(document.getElementById('addArea'), 'click', function() {
    drawPolygon = mouseTool.polygon(); //用鼠标工具画多边形
    // map.setMapStyle('amap://styles/dark');
  }, false);
  // 定义多边形的路径，待后面赋值
  // 监听鼠标画完事件
  AMap.event.addListener( mouseTool,'draw',function(e){ //添加事件
    editpath = e.obj.getPath();
    mouseTool.close(true); //画完后把画的图擦除，然后根据editpath绘制多边形
    drawPolygon = new AMap.Polygon({
      map: map,
      path: editpath,
      strokeColor: "#0000ff",
      strokeOpacity: 1,
      strokeWeight: 1,
      fillColor: "#f5deb3",
      fillOpacity: 0.35
    });
    drawPolygonEdit = new AMap.PolyEditor(map,drawPolygon); // 接着把绘制的多边形变成可编辑状态
    drawPolygonEdit.open();
    // 添加确认/结束按钮
    $('#buttonBox').append($('<input>').attr('type', 'button').attr('value', '重画范围').attr('id', 'restArea'));
    $('#buttonBox').append($('<input>').attr('type', 'button').attr('value', '编辑范围').attr('id', 'editArea'));
    $('#buttonBox').append($('<input>').attr('type', 'button').attr('value', '确认范围').attr('id', 'confirmArea'));
    // 确认多边形范围dom事件
    AMap.event.addDomListener(document.getElementById('confirmArea'), 'click', function() {
      drawPolygonEdit.close();
      editpath = drawPolygon.getPath(); //获取路径/范围
    }, false);
    // 确认多边形范围dom事件
    AMap.event.addDomListener(document.getElementById('editArea'), 'click', function() {
      drawPolygonEdit.open();
    }, false);
    // 添加重画事件按钮事件
    AMap.event.addDomListener(document.getElementById('restArea'), 'click', function() {
      drawPolygonEdit.close();
      drawPolygon.setMap(null);
      $('#restArea').remove();
      $('#editArea').remove();
      $('#confirmArea').remove();
    }, false);
  });
  // ajax异步提交
  $('form:eq(0)').submit(function(ev) {
    // 提交前将编辑中的多边形去掉
    drawPolygon.setMap(null);
    // 取消默认的提交事件，使用ajax提交表单
    ev.preventDefault();
    var form = $(this);
    $.ajax({
      url: form.attr('action'),
      type: 'POST',
      data: form.serialize()+'&polygonPath='+ JSON.stringify(editpath)
    })
    .done(function(company) {
      console.log('公司信息上传成功');
      console.log(company);
      // 前端显示刚上传的数据。
      $('.companyBox span:eq(0)').text(company.id);
      $('.companyBox span:eq(1)').text(company.name);
      $('.companyBox span:eq(2)').text(company.info);
      // 实时显示更新的地图
      var companyPolygon = new AMap.Polygon({
        map: map,
        path: editpath,
        strokeColor: "#0000ff",
        strokeOpacity: 1,
        strokeWeight: 3,
        fillColor: "#f5deb3",
        fillOpacity: 0.35
      });
    });
  });


  // ajax异步提交
  $('form:eq(1)').submit(function(ev) {
    // 提交前将编辑中的多边形去掉
    drawPolygon.setMap(null);
    // 取消默认的提交事件，使用ajax提交表单
    ev.preventDefault();
    var form = $(this);
    $.ajax({
      url: form.attr('action'),
      type: 'POST',
      data: form.serialize()+'&polygonPath='+ JSON.stringify(editpath)
    })
    .done(function(department) {
      console.log('单位信息上传成功');
      console.log(department);
      // // 前端显示刚上传的数据。
      // $('.companyBox span:eq(0)').text(company.id);
      // $('#companyBox span:eq(1)').text(company.name);
      // $('#companyBox span:eq(2)').text(company.info);
      // // 实时显示更新的地图
      // var companyPolygon = new AMap.Polygon({
      //   map: map,
      //   path: editpath,
      //   strokeColor: "#0000ff",
      //   strokeOpacity: 1,
      //   strokeWeight: 3,
      //   fillColor: "#f5deb3",
      //   fillOpacity: 0.35
      // });
    });
  });
})