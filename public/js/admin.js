$(function() {
  // 定义地图
  var map = new AMap.Map('map', {
      center: [126.683507, 45.713941],
      zoom: 16,
      rotateEnable: true,
      resizeEnable: true,
      // showBuildingBlock: true,
      // layers: [new AMap.TileLayer.Satellite()],
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
  companyPolygon.departments = [];

  // 逻辑：初始化即让用户操作画company范围
  if (!$('.companyBox span:eq(0)').text()) { //如果没有渲染company文字对象
    map.setMapStyle('amap://styles/dark'); // 设置地图特殊样式，提示可以开始划范围了
    mouseTool.polygon();
    AMap.event.addListener( mouseTool,'draw',function(e){ // 监听鼠标画完事件
      var companyPath = e.obj.getPath();
      mouseTool.close(true); //画完后把画的图擦除
      companyPolygon.setPath(companyPath);
      editCompanyPolygon = new AMap.PolyEditor(map,companyPolygon); // 接着把绘制的多边形变成可编辑状态
      editCompanyPolygon.open();
      // 添加确认/结束按钮
      $('.buttonBox').append($('<input>').attr('type', 'button').attr('value', '重画').attr('id', 'restArea'));
      // 添加重画事件按钮事件
      AMap.event.addDomListener(document.getElementById('restArea'), 'click', function() {
        editCompanyPolygon.close();
        companyPolygon.setMap(null);
        $('#restArea').remove();
      }, false);
    });
    map.setMapStyle('amap://styles/normal'); // 恢复地图正常样式
  }
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
    companyPolygon.id = company.id; // 将id赋给多边形
    $('.companyBox').attr('id', company.id);
    companyPolygon.setPath(path); // 根据path将company的多边形显示在地图上。
  })
  .fail(function() {
    console.log('公司数据未上传')
  });

  $('.editCompany').click(function (ev) {
    ev.preventDefault();

    var form = ev.target.closest('form');
    form.attr('method', 'PUT')
    .attr('action', 'api/company/' + $('.companyShow').id)
    .attr('id', 'updateCompany');
  })
  // ajax异步提交
  $('#createCompany').submit(function(ev) {
    editCompanyPolygon.close(); // 如果没有关闭多边形编辑，则在提交前关闭
    ev.preventDefault(); // 取消默认的提交事件，使用ajax提交表单
    var form = $(this);
    $.ajax({
      url: form.attr('action'),
      type: form.attr('method'),
      data: form.serialize()+'&polygonPath='+ JSON.stringify(companyPolygon.getPath())
    })
    .done(function(company) {
      console.log(`公司信息${form.attr('method')}成功`);
      console.log(company);
      companyPolygon.id = company.id;
      // 前端显示刚上传的数据。
      var companyShow = $('<div></div>').attr('class', 'companyShow').attr('id', company.id);
      companyShow.html(
      `
      <h3>
        <span>${company.name}</span>
        <span>${company.info}</span>
        <a href="" class="editCompany">edit</a>
        <a href="api/company/${company.id}" class="deleteItem">del</a>
      </h3>
      <form action="api/company/${company.id}" method="PUT" id="updateCompany">
        <input type="text" name="name" id="CompanyName">
        <input type="text" name="info" id="companyInfo">
        <input type="submit" value="修改">
      </form>
      `
      );
      $('.companyBox').prepend(companyShow);
      $('#createCompany').remove();
    });
  });

  // 修改公司数据
  $('#updateCompany').submit(function(ev) {
    ev.preventDefault(); // 取消默认的提交事件，使用ajax提交表单
    var form = $(this);
    $.ajax({
      url: form.attr('action'),
      type: form.attr('method'),
      data: form.serialize()+'&polygonPath='+ JSON.stringify(companyPolygon.getPath())
    })
    .done(function(company) {
      console.log(`公司信息${form.attr('method')}成功`);
      console.log(company);
      companyPolygon.id = company.id;
      // 前端显示刚上传的数据。
      $('.companyBox span:eq(0)').text(company.name);
      $('.companyBox span:eq(1)').text(company.info);
    });
  });

  // 删除数据
  $('.companyBox').on('click', 'a.deleteItem', function(ev) {
    var item = $(ev.target);
    var company = $('.companyShow');
    ev.preventDefault();
    $.ajax({
      url: item.attr('href'),
      type: 'DELETE'
    })
    .done(function(data) {
      console.log(data);
      console.log('公司信息DELETE成功');
      companyPolygon.setPath(null);
      company.remove();
      $('.companyBox').prepend(
      `
      <form action="api/company" method="POST" id="createCompany">
        <input type="text" name="name" id="CompanyName">
        <input type="text" name="info" id="companyInfo">
        <input type="submit" value="提交">
      </form>
      `
      );
    })
    .fail(function() {
      console.log('公司信息DELETE失败');
    });
  })
  // ajax异步提交
  $('#createDepartment').submit(function(ev) {
    editDepartmentPolygon.close();
    // 取消默认的提交事件，使用ajax提交表单
    ev.preventDefault();
    var form = $(this);
    $.ajax({
      url: form.attr('action'),
      type: 'POST',
      data: form.serialize()+'&polygonPath='+ JSON.stringify(companyPolygon.departments[companyPolygon.departments.length-1].getPath())
    })
    .done(function(department) {
      console.log(`单位信息${form.attr('method')}成功`);
      console.log(department);
      companyPolygon.departments[companyPolygon.departments.length-1].id = department.id;
      // 前端显示刚上传的数据
      var department = $('<li>')
      .attr('id', department.id)
      .attr('class', 'departmentBox')
      .html(`
      ${department.name}-----${department.info}
      <button>编辑</button>`)
      $('#departments ul').append(department);
      // 实时显示更新的地图
    });
  });
})