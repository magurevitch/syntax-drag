var trace = null;

function chooseNode(event) {
    node = findClosest(event.offsetX, event.offsetY);

    if (!node) {
      node = mode['create'](event.offsetX, event.offsetY,$('#nodeText').val());
      nodes.push(node);
    }

    selectNode(node);

    trace = new Node(selectedNode.x, selectedNode.y, "trace");
    trace.ghosted = true;
}

function moveSelected(event) {
  closestNode = findClosest(event.offsetX, event.offsetY);

  if(selectedNode) {
    selectedNode.x = event.offsetX;
    selectedNode.y = event.offsetY;
  }
}

function dropSelected(event) {
    if (selectedNode) {
      closest = findClosest(event.offsetX, event.offsetY);
      if (closest) {
        mode['move'](closest);
      }

      leaves.sort(function(a,b){return a.parent.x - b.parent.x});

      selectNode(null);
    }

    if(mode['Binary trees']){
      makeBinary();
    }

    if(mode['leaves in a Row']) {
      updateLowNode();
    }
}

function deleteSelected(event) {
  nodes = nodes.filter(e => e !== selectedNode);
  nodes.forEach(node => {
    if(node.parent === selectedNode) {
      node.parent = null;
    }
    if(node.links) {
      node.links = node.links.filter(e => e !== selectedNode);
    }
  });

  leaves = leaves.filter(leaf => leaf.parent !== selectedNode);

  selectNode(null);
}

function makeButton(letter, name, action, type, message) {
  index = name.indexOf(letter);
  newText = index === -1 ? `<u>${letter}<u> ${name}` : `${name.slice(0,index)}<b>${letter}</b>${name.slice(index+1)}`;
  $(`#${type}`).append(`<td id="${letter}" class="boxed ${type}">${newText}</td>`);
  $(`#${letter}`).on('mouseenter',function(e) {
    $('#message').text(message);
  });
  $(`#${letter}`).on('mousedown', function(e){
    $(`.${type}`).removeClass('selected');
    $(this).addClass('selected');
    mode[type] = action;
    $('#parentText').parent().hide();
    if(mode.move === dropTree || mode.move === dropMovement) {
      $('#parentText').parent().show();
    }
    $('#leafText').parent().hide();
    if(mode.create == newLeafNode || mode.create == newXBar) {
      $('#leafText').parent().show();
    }
  });
}

function makeToggle(letter, name, message, action) {
  index = name.indexOf(letter);
  newText = index === -1 ? `<u>${letter}<u> ${name}` : `${name.slice(0,index)}<b>${letter}</b>${name.slice(index+1)}`;
  $('#options').append(`<td id="${letter}" class="boxed">toggle ${newText}</td>`);
  $(`#${letter}`).on('mouseenter',function(e) {
    $('#message').text(message);
  });
  $(`#${letter}`).on('mousedown', function(e){
    $(this).toggleClass('selected');
    mode[name] = !mode[name];

    if(mode[name] && action){
      action();
    }
  });
}

function makeInput(name){
  $('#inputs').append(`<span><b>${name}:</b><input type="text" id="${name}Text" value="${name}">&nbsp;</input></span>`);
  $(`#${name}Text`).on('mouseenter',function(event){
    $('#message').text(`set default text for new ${name}`);
  });
}

function dragMode() {
  makeButton('D','Drag', ()=>{},'move','drag around selected nodes');
  makeButton('S','Switch', dropSwitch,'move','drag around nodes and switch them with other nodes');
  makeButton('T','Tree siblings', dropTree, 'move','merges nodes to be sisters in a tree structure, and makes a parent when needed');
  makeButton('M','Movement', dropMovement, 'move', 'merges nodes to be sisters in a tree structure with movement');
  makeButton('A','Arrows', dropDependency, 'move', 'draws arrows to nodes');
  makeButton('C','make Child', dropChild, 'move', 'makes the slected node a child of the node you drag it to. This mode is great for catenaries');

  makeButton('N','regular Node',(x,y,text) => new Node(x,y,text),'create','clicking the canvas creates a single node');
  makeButton('L','Leaf and node',newLeafNode,'create', 'clicking the canvas makes a node and text underneath it');
  makeButton('X','X-bar node',newXBar,'create', "clicking the canvas makes an X' style tree with a head, a bar layer, and a phrase layer");

  makeToggle('B','Binary trees','force trees to become binary', makeBinary);
  makeToggle('F','animation Forces','animate trees with forces between them');
  makeToggle('R','leaves in a Row','drop all the leaves to be in a row below the lowest node', updateLowNode);

  $('#D, #N').trigger('mousedown');

  makeInput('node');
  makeInput('parent');
  makeInput('leaf');

  canvas.on('mousedown', e => chooseNode(e));
  canvas.on('mousemove', e => moveSelected(e));
  canvas.on('mouseup', e => dropSelected(e));
  canvas.on('mouseleave', e => deleteSelected(e));
  canvas.on('mouseenter', function(event){
    $('#message').text("Click anywhere to make a node, push down on a node to drag it, and drag nodes out of the canvas to delete them");
  });
  $('body').on('keydown',function(event){
    event.preventDefault();
    if (event.key.includes('Arrow')) {
      arrowSelect(event.key);
    } else {
      $(`#${event.key.toUpperCase()}`).trigger('mousedown');
    }
  });
  $('#inputs').on('keydown',function(event){
    event.stopPropagation();
  });
}
