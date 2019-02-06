var canvas = $('#canvas');
canvas.get(0).height = window.innerHeight - 300;
canvas.get(0).width = window.innerWidth - 20;
var c = canvas.get(0).getContext('2d');

var nodes = [];
var leaves = [];
var leafOffset = 40;
var lowNode = 0;

function Node(x, y, text, parent) {
  this.x = x;
  this.y = y;
  this.velocityX = 0;
  this.velocityY = 0;;

  this.text = text;
  this.parent = parent;

  this.interaction = function() {
    return this;
  }

  this.setLocation = function(x,y) {
    this.x = x;
    this.y = y;
  }

  this.draw = function() {
    c.fillStyle = this.ghosted ? 'gray' : 'black';
    c.textAlign = "center";
    c.fillText(this.text,this.x,this.y)
  }

  this.highlight = function(color) {
    c.beginPath();
    c.ellipse(this.x, this.y, 40, 10, 0, 0, 2 * Math.PI);
    c.fillStyle = color;
    c.fill();
  }

  this.isAncestor = function(node) {
    if(this === node) {
      return true;
    } else if (!this.parent) {
      return false;
    }
    return this.parent.isAncestor(node);
  }
}

function newLeafNode(x, y, text, parent) {
  node = new Node(x,y,text,parent);
  leafText = $('#leafText').val();
  leaf = new Leaf(leafText, node);
  leaves.push(leaf);
  return node;
}

function Leaf(text, parent){
  this.text = text;
  this.parent = parent;

  this.interaction = function() {
    return this.parent;
  }

  this.setLocation = function(x,y) {
    this.parent.x = x;
    this.parent.y = y-leafOffset;
  }

  this.y = function () {
    parentY = mode['leaves in a Row'] && this !== selectedNode ? lowNode : this.parent.y;
    return parentY + leafOffset;
  }

  this.draw = function() {
    var yPosition = mode['leaves in a Row'] ? lowNode : this.parent.y;

    c.beginPath();
    c.lineWidth = 1;
    c.moveTo(this.parent.x,this.parent.y);
    if (this.text.indexOf(' ') > -1) {
      c.setLineDash([]);
      c.lineTo(this.parent.x-20,this.y()-10);
      c.lineTo(this.parent.x+20,this.y()-10);
      c.lineTo(this.parent.x,this.parent.y);
    } else {
      c.setLineDash([3,2]);
      c.lineTo(this.parent.x,this.y()-5);
    }
    c.stroke();

    c.fillStyle = 'gray';
    c.textAlign = 'center';
    c.fillText(this.text,this.parent.x,this.y());
  }

  this.highlight = function(color) {
    c.beginPath();
    c.ellipse(this.parent.x, this.y(), 40, 10, 0, 0, 2 * Math.PI);
    c.fillStyle = color;
    c.fill();

    c.globalAlpha = 0.3;
    this.parent.highlight(color);
    c.globalAlpha = 1;
  }
}

function newXBar(x,y,text){
  phrase = new Node(x, y, text+"P");
  bar = new Node(x, y+30, text+"'",phrase);
  nodes.push(bar);
  head = newLeafNode(x, y+60, text+"0",bar);
  nodes.push(head);
  return phrase;
};

function sameTree(node, nodeTwo) {
  while(node.parent) {
    node = node.parent;
  }
  while(nodeTwo.parent) {
    nodeTwo = nodeTwo.parent;
  }
  return node === nodeTwo;
}

function updateLowNode() {
  lowNode = Math.max(...nodes.map(node => node.y));
}

function sortedInsert(sortedList, item, hash) {
  var index = sortedList.length;
  while(index > 0 && hash(sortedList[index-1]) > hash(item)) {
    sortedList[index] = sortedList[index-1];
    index--;
  }
  sortedList[index] = item;
}
