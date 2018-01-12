$(function() {
  var tree = $('.tree');
  var target = null;

  $.get('/api/json',function(json) {
    console.log(json);
    var factorys = json.children;

    factorys.forEach(function(value, index) {
      var title = $('<h4></h4>').text(value.name);
      var fNode = $(`<div></div>`).addClass('layer-1').attr("id", value.id);
      fNode.append(title);
      $('.layer-0').append(fNode);
    });
  });

  tree.on('click', 'div', function (event) {
    event.stopPropagation();
    var div = $(this);
    $('.tree div').removeClass('select');
    div.addClass('select');
    target = div;
  });

  $('.tree').on('click', function(event) {
    event.stopPropagation();
    $('.tree div').removeClass('select');
    target = null;
  });

  $('.control-panel').on('click', 'input[type="button"]', function(event) {
    var button = $(this);
    if(target === null) {
      alert('请先选择当前节点');
      return;
    };
    // 判断当前所属层级
    var layerNumber = target.attr('class').replace(/[^0-9]/ig,"") - 0;
    var layerId = target.attr('id');

    var url = '/api'; // 初始化上传url

    switch(layerNumber) {
      case 0:
        url += '/factory';
        break;
      case 1:
        url += `/factory/${layerId}/workshop`;
        break;
      case 2:
        url += `/workshop/${layerId}/stride`;
        break;
      case 3:
        url += `/stride/${layerId}/area`;
    }

    var text = button.prev(); // 文字输入框内容
    switch(button.attr('id')) {
      case 'btn-delete':
        target.remove();
        break;
      case 'btn-add':
        if(!text.val()) {
          alert('请先写入内容');
          return false;
        }
        $.post(url, {name: text.val()})
        .done(function(data) {
          console.log(data);
          var child =  $(`<div><h4>${data.name}</h4></div>`);
          child.addClass(`layer-${layerNumber+1}`);
          child.attr('id', data.id);
          target.append(child);
          text.val(null);
          text.focus();

        })
        .fail(function() {
          console.log('上传失败')
        })
        break;
      case 'btn-update':
        if(!text.val()) {
          alert('请先写入内容');
          return false;
        }
        target.children('h4').text(text.val());
        text.val(null);
        text.focus();
      }
  });
})