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

function Node(x, y, text, parent) {
  this.x = x;
  this.y = y;
  this.text = text;
  this.parent = parent;

  this.draw = function() {
    c.fillStyle = this.ghosted ? 'gray' : 'black';
    c.textAlign = "center";
    c.fillText(this.text,this.x,this.y)
  }
}

function LeafNode(x, y, text, parent) {
  this.x = x;
  this.y = y;
  this.text = text;
  this.leaf = $('#leaf').val();
  this.parent = parent;

  this.draw = function() {
    c.fillStyle = this.ghosted ? 'gray' : 'black';
    c.textAlign = "center";
    c.fillText(this.text,this.x,this.y)
    c.beginPath();
    c.lineWidth = 1;
    c.setLineDash([3,2]);
    c.moveTo(this.x,this.y);
    c.lineTo(this.x,this.y+25);
    c.stroke();
    c.fillText(this.leaf,this.x,this.y+30)
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
      selectedNode = mode['create'](event.pageX, event.pageY,$('#node').val());
      nodes.push(selectedNode);
    }

    trace = new Node(selectedNode.x, selectedNode.y, "trace");
    trace.ghosted = true;
    selectedNode.ghosted = true;
    mode['branching']();
    draw();
}

function up(event) {
    if (selectedNode) {
      closest = findClosest(event.pageX, event.pageY);
      if (closest) {
        mode['move'](closest);
      }
      trace = null;
      selectedNode.ghosted = false;
      selectedNode = null;
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
    if(node.parent) {
      c.beginPath();
      c.setLineDash([]);
      c.lineWidth = 3;
      c.moveTo(node.x, node.y-5);
      c.lineTo(node.parent.x, node.parent.y);
      c.stroke();
    }

    if(node.links) {
      node.links.forEach(link => {
        factor = node.parent || link.parent ? 1 : -1;

        c.beginPath();
        c.setLineDash([]);
        c.lineWidth = 1;
        c.moveTo(node.x, node.y);
        c.bezierCurveTo(node.x, node.y+factor*30, link.x, link.y+factor*30, link.x, link.y+factor*5);
        c.lineTo(link.x-5,link.y+factor*10);
        c.lineTo(link.x+5,link.y+factor*10);
        c.lineTo(link.x,link.y+factor*5);
        c.stroke();
      });
    }
    node.draw();
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
    node = new Node(newX, newY, $('#parent').val());
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

function findChildren() {
  var children = {};
  nodes.forEach(node => {
    if(node.parent) {
      index=nodes.indexOf(node.parent);
      children[index] = children[index] || [];
      children[index].push(node);
    }
  });
  return children;
}

function makeBinary() {
  children = findChildren();

  for(index in children) {
    node = nodes[index];
    childNodes = children[index];
    while(childNodes.length > 2) {
      var nodeToMove = childNodes.pop();
      var newNode = new Node(node.x+10,node.y+10,node.text,node);
      nodes.push(newNode);
      childNodes.forEach(child => {
        child.parent = newNode;
      });
    }
  }
}

function newXBar(x,y,text){
  phrase = new Node(x, y, text+"P");
  bar = new Node(x, y+30, text+"'",phrase);
  nodes.push(bar);
  head = new LeafNode(x, y+60, text+"0",bar);
  nodes.push(head);
  return phrase;
};

function makeButton(letter, name, action, type, message) {
  index = name.indexOf(letter);
  newText = index === -1 ? `<u>${letter}<u> ${name}` : `${name.slice(0,index)}<b>${letter}</b>${name.slice(index+1)}`;
  $('#options tr').last().append(`<td id="${letter}" class="boxed ${type}">${newText}</td>`);
  $(`#${letter}`).on('mousedown', function(e){
    $(`.${type}`).removeClass('selected');
    $(this).addClass('selected');
    mode[type] = action;
    $('#message').text(message);
  });
}

$('#options').append('<tr></tr>');
makeButton('S','Select', dropSelect,'move','select and move around (and switch) nodes');
makeButton('N','regular Node',(x,y,text) => new Node(x,y,text),'create','clicking the canvas creates a single node');
makeButton('P','Permit multi-branched trees',()=>{},'branching','allow for multi-branched trees');
$('#options').append('<tr></tr>');
makeButton('T','Tree', dropTree, 'move','merges nodes into a tree structure');
makeButton('L','Leaf and node',(x,y,text) => new LeafNode(x,y,text),'create', 'clicking the canvas makes a node and text underneath it');
makeButton('B','Binary trees',makeBinary,'branching','force trees to become binary');
$('#options').append('<tr></tr>');
makeButton('M','Movement', dropMovement, 'move', 'merges nodes into a tree structure with movement');
makeButton('X','X-bar node',newXBar,'create', "clicking the canvas makes an X' style tree with a head, a bar layer, and a phrase layer");
$('#options').append('<tr></tr>');
makeButton('A','Arrows', dropDependency, 'move', 'draws arrows to nodes');
$('#options').append('<tr></tr>');
makeButton('C','Catenary', dropCatenary, 'move', 'attaches nodes in a catenary');

$('#S, #N, #P').trigger('mousedown');
$('body').on('keypress',function(event){
  $(`#${event.key.toUpperCase()}`).trigger('mousedown');
})
$('#inputs').on('keypress',function(event){
  event.stopPropagation();
})


function makeInput(name){
  $('#inputs').append(`<b>${name}:</b>`);
  $('#inputs').append(`<input type="text" id="${name}" value="${name}"></input>`);
  $('#inputs').append(`<br>`);
  $(`#${name}`).on('mouseenter',function(event){
    $('#message').text(`set default text for new ${name}`);
  });
}

makeInput('node');
makeInput('parent');
makeInput('leaf');

canvas.on('mouseenter', function(event){
  $('#message').text("Click anywhere to make a node, push down on a node to drag it, and drag nodes out of the canvas to delete them");
});
