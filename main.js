var canvas = $('canvas');
var c = canvas.get(0).getContext('2d');

var nodes = [];
var trace = null;
var selectedNode = null;

var mode = {};

draw();
canvas.on('mousedown', e => down(e));
canvas.on('mouseup', e => up(e));
canvas.on('mousemove', e => move(e))
canvas.on('mouseleave', e => leave(e))

function Node(x, y, text, parent, pointers) {
  this.x = x;
  this.y = y;
  this.text = text;

  this.draw = function() {
    c.fillStyle = this.ghosted ? 'gray' : 'black';
    c.textAlign = "center";
    c.fillText(this.text,this.x,this.y)
  }
}

function leave(event) {
  nodes = nodes.filter(e => e !== selectedNode);
  nodes.forEach(node => {
    if(node.parent === selectedNode) {
      node.parent = null;
    }
    if(node.links) {
      node.links = node.links.filter(e => e !== selectedNode);
    }
  });

  selectedNode = null;
  trace = null;
  draw();
}

function down(event) {
    selectedNode = findClosest(event.pageX, event.pageY);

    if (!selectedNode) {
      selectedNode = new Node(event.pageX, event.pageY,"eggplant");
      nodes.push(selectedNode);
    }

    trace = new Node(selectedNode.x, selectedNode.y, "trace");
    trace.ghosted = true;
    selectedNode.ghosted = true;
    draw();
}

function up(event) {
    if (selectedNode) {
      closest = findClosest(event.pageX, event.pageY);
      if (closest) {
        mode['move'](closest);
      }
      deselect();
      draw();
    }
}

function move(event) {
  if(selectedNode) {
    selectedNode.x = event.pageX;
    selectedNode.y = event.pageY;
    draw();
  }
}

function draw() {
  c.clearRect(0, 0, canvas.get(0).width, canvas.get(0).height);
  if (trace) {
    trace.draw();
  }
  nodes.forEach(node => {
    node.draw();
    if(node.parent) {
      c.beginPath();
      c.moveTo(node.x, node.y);
      c.lineTo(node.parent.x, node.parent.y);
      c.stroke();
    }

    if(node.links) {
      node.links.forEach(link => {
        factor = node.parent || link.parent ? 1 : -1;

        averageX = 1/2 * (node.x + link.x);
        averageY = 1/2 * (node.y + link.y);

        c.beginPath();
        c.moveTo(node.x, node.y);
        c.bezierCurveTo(averageX-10, averageY+factor*15, averageX+10, averageY+factor*15, link.x, link.y);
        c.stroke();
      });
    }
  });

}

function findClosest(x, y) {
  var distance = null;
  var closest = null;

  nodes.forEach(node => {
    var sqDistance = (x - node.x) * (x - node.x) + 2 * (y - node.y) * (y - node.y);
    var comparator = distance || 900;
    if (node !== selectedNode && sqDistance < comparator) {
      distance = sqDistance;
      closest = node;
    }
  });
  return closest;
}

function deselect() {
  trace = null;
  selectedNode.ghosted = false;
  selectedNode = null;
}

function dropSelect(closest) {
  selectedNode.x = closest.x;
  selectedNode.y = closest.y;
  closest.x = trace.x;
  closest.y = trace.y;
}

function dropCatenary(closest) {
  selectedNode.parent = closest;
  selectedNode.x = trace.x;
  selectedNode.y = trace.y;
}

function dropDependency(closest) {
  selectedNode.links = selectedNode.links || [];
  selectedNode.links.push(closest);
  selectedNode.x = trace.x;
  selectedNode.y = trace.y;
}

function dropTree(closest) {
  if (!closest.parent || closest.parent === selectedNode) {
    newX = 1/2 * (selectedNode.x + closest.x);
    newY = 1/2 * (selectedNode.y + closest.y) - 20;
    node = new Node(newX, newY, "durian");
    nodes.push(node);
    closest.parent = node;
  }
  selectedNode.parent = closest.parent;
}

function dropMovement(closest) {
  if (selectedNode.parent && selectedNode.parent !== closest.parent) {
    nodes.forEach(node => {
      var index = node.links ? node.links.indexOf(selectedNode) : -1;
      if(index >= 0) {
        node.links[index] = trace;
      }
    });

    trace.ghosted = false;
    trace.parent = selectedNode.parent;
    trace.links = trace.links || [];
    trace.links.push(selectedNode);
    nodes.push(trace);
  }

  dropTree(closest);
}

function makeButton(letter, name, action, type) {
  index = name.indexOf(letter);
  newText = index === -1 ? `<u>${letter}<u> ${name}` : `${name.slice(0,index)}<b>${letter}</b>${name.slice(index+1)}`;
  $('#options tr').last().append(`<td id="${letter}" class="boxed ${type}">${newText}</td>`);
  $(`#${letter}`).on('mousedown', function(e){
    $(`.${type}`).removeClass('selected');
    $(this).addClass('selected');
    mode[type] = action;
    $('#message').text(name);
  });
}

$('#options').append('<tr></tr>');
makeButton('S','Select', dropSelect,'move');makeButton('N','regular Node',null,'create');
$('#options').append('<tr></tr>');
makeButton('T','Tree', dropTree, 'move');makeButton('L','Leaf and node',null,'create');
$('#options').append('<tr></tr>');
makeButton('M','Movement', dropMovement, 'move');makeButton('X','X-bar node',null,'create');
$('#options').append('<tr></tr>');
makeButton('A','Arrows', dropDependency, 'move');
$('#options').append('<tr></tr>');
makeButton('C','Catenary', dropCatenary, 'move');

$('#S, #N').trigger('mousedown');
