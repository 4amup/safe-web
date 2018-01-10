$(function() {
  var tree = $('.tree');
  var target = null;

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

    var text = button.prev();
    switch(button.attr('id')) {
      case 'btn-delete':
        target.remove();
        break;
      case 'btn-add':
        if(!text.val()) {
          alert('请先写入内容');
          return false;
        }
        var child =  $(`<div><h4>${text.val()}</h4></div>`).addClass(`layer-${layerNumber+1}`);
        target.append(child);
        text.val(null);
        text.focus();
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