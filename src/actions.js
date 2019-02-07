var trace = null;

function findClosest(x, y) {
  var distance = null;
  var closest = null;

  nodes.concat(leaves).forEach(node => {
    nodeX = node.getLocation().x;
    nodeY = node.getLocation().y;
    var sqDistance = (x - nodeX) * (x - nodeX) + 4 * (y - nodeY) * (y - nodeY);
    var comparator = distance || 1600;
    if (node !== selectedNode && sqDistance < comparator) {
      distance = sqDistance;
      closest = node;
    }
  });
  return closest;
}

function chooseNode(event) {
  node = findClosest(event.offsetX, event.offsetY);
  if(mode['Persist selection']) {
    if(selectedNode && node) {
      if(mode['move']) {
        mode['move'](node);
        return;
      }
    }
  } else {
    if (!node) {
      node = mode['create'](event.offsetX, event.offsetY,$('#nodeText').val());
      nodes.push(node);
    }

    trace = new Node(node.interaction().x, node.interaction().y, "trace");
    trace.ghosted = true;
  }
  selectNode(node);
}

function moveSelected(event) {
  closestNode = findClosest(event.offsetX, event.offsetY);

  if(selectedNode && trace) {
    selectedNode.setLocation(event.offsetX,event.offsetY);
  }
}

function dropSelected(event) {
    if (selectedNode && !mode['Persist selection']) {
      closest = findClosest(event.offsetX, event.offsetY);
      if (closest && mode['move']) {
        mode['move'](closest);
      }

      leaves.sort(function(a,b){return a.parent.x - b.parent.x});

      trace = null;
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
  selectedLeaf = leaves.filter(leaf => leaf.parent === selectedNode)[0];
  leaves = leaves.filter(leaf => leaf !== selectedNode && leaf.parent !== selectedNode);

  nodes = nodes.filter(e => e !== selectedNode);
  nodes.concat(leaves).forEach(node => {
    if(node.parent === selectedNode) {
      node.parent = null;
    }
    if(node.links) {
      node.links = node.links.filter(e => e !== selectedNode && e !== selectedLeaf);
    }
  });

  trace = null;
  selectNode(null);
}

function makeButton(letter, name, action, type, message) {
  index = name.indexOf(letter);
  newText = index === -1 ? `<b>${letter}</b> ${name}` : `${name.slice(0,index)}<b>${letter}</b>${name.slice(index+1)}`;
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
  newText = index === -1 ? `<b>${letter}</b> ${name}` : `${name.slice(0,index)}<b>${letter}</b>${name.slice(index+1)}`;
  $('#options').append(`<td id="${letter}" class="boxed">toggle ${newText}</td>`);
  $(`#${letter}`).on('mouseenter',function(e) {
    $('#message').text(message);
  });
  $(`#${letter}`).on('mousedown', function(e){
    $(this).toggleClass('selected');
    mode[name] = !mode[name];

    if(action){
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

makeButton('D','Drag', false, 'move','drag around selected nodes');
makeButton('S','Switch', dropSwitch,'move','drag around nodes and switch them with other nodes');
makeButton('T','Tree siblings', dropTree, 'move','merges nodes to be sisters in a tree structure, and makes a parent when needed');
makeButton('M','Movement', dropMovement, 'move', 'merges nodes to be sisters in a tree structure with movement');
makeButton('A','Arrows', dropArrows, 'move', 'draws arrows to nodes');
makeButton('C','make Child', dropChild, 'move', 'makes the slected node a child of the node you drag it to. This mode is great for catenaries');

makeButton('N','regular Node',(x,y,text) => new Node(x,y,text),'create','clicking the canvas creates a single node');
makeButton('L','Leaf and node',newLeafNode,'create', 'clicking the canvas makes a node and text underneath it');
makeButton('X','X-bar node',newXBar,'create', "clicking the canvas makes an X' style tree with a head, a bar layer, and a phrase layer");

makeToggle('B','Binary trees','force trees to become binary', makeBinary);
makeToggle('F','animation Forces','animate trees with forces between them');
makeToggle('R','leaves in a Row','drop all the leaves to be in a row below the lowest node', updateLowNode);
makeToggle('P','Persist selection','replaces generating new nodes with Persistant selections', ()=>{$('#create').parent().toggle()});

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
  } else if (selectedNode) {
    updateText(selectedNode, event.key);
  } else {
    $(`#${event.key.toUpperCase()}`).trigger('mousedown');
  }
});
$('#inputs').on('keydown',function(event){
  event.stopPropagation();
});

function updateText(node, key) {
  if (key === 'Backspace') {
    node.text = text.substring(0, text.length-1);
  } else if (key === 'Enter') {
    node.text = '';
  } else if (key.length === 1) {
    node.text += key;
  }
  fillSection($('#selectedNode'), node);
}
