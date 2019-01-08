var canvas = $('canvas');
var c = canvas.get(0).getContext('2d');

var nodes = [new Node(20,20,"apple"), new Node(30,30,"banana"),new Node(50,50,"cherry")];
var trace = null;
var selectedNode = null;

draw();
canvas.on('mousedown', e => down(e));
canvas.on('mouseup', e => up(e));
canvas.on('mousemove', e => move(e))

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

function down(event) {
    selectedNode = findClosest(event.pageX, event.pageY);

    if (selectedNode){
      trace = new Node(selectedNode.x, selectedNode.y, "trace");
      trace.ghosted = true;
      selectedNode.ghosted = true;
      draw();
    }
}

function up(event) {
    if (selectedNode) {
      dropMovement(event.pageX, event.pageY);
      dropMove();
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

function dropMove() {
  trace = null;
  selectedNode.ghosted = false;
  selectedNode = null;
}

function dropTree(x,y) {
  closest = findClosest(x,y);

  if (closest) {
    if (!closest.parent || closest.parent === selectedNode) {
      newX = 1/2 * (selectedNode.x + closest.x);
      newY = 1/2 * (selectedNode.y + closest.y) - 20;
      node = new Node(newX, newY, "durian");
      nodes.push(node);
      closest.parent = node;
    }
    selectedNode.parent = closest.parent;
  }
}

function dropCatenary(x,y) {
  closest = findClosest(x,y);

  if (closest) {
    selectedNode.parent = closest;
    selectedNode.x = trace.x;
    selectedNode.y = trace.y;
  }
}

function dropDependency(x,y) {
  closest = findClosest(x,y);

  if (closest) {
    selectedNode.links = selectedNode.links || [];
    selectedNode.links.push(closest);
    selectedNode.x = trace.x;
    selectedNode.y = trace.y;
  }
}

function dropMovement(x,y) {
  closest = findClosest(x,y);

  if (closest) {
    if (selectedNode.parent && selectedNode.parent !== closest.parent) {
      nodes.forEach(node => {
        if(node.links) {
          var index = node.links.indexOf(selectedNode);
          if(index >= 0) {
            node.links[index] = trace;
          }
        }
      });

      trace.ghosted = false;
      trace.parent = selectedNode.parent;
      trace.links = trace.links || [];
      trace.links.push(selectedNode);
      nodes.push(trace);
    }

    if (!closest.parent || closest.parent === selectedNode) {
      newX = 1/2 * (selectedNode.x + closest.x);
      newY = 1/2 * (selectedNode.y + closest.y) - 20;
      node = new Node(newX, newY, "durian");
      nodes.push(node);
      closest.parent = node;
    }
    selectedNode.parent = closest.parent;
  }
}
