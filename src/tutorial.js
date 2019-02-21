animationFrames = [];

function clickMouse(x,y) {
  for(var i=10; i>0; i--){
      animationFrames.push({'element':canvas,'draw':enteringCursor(x,y,i/10)});
  }
  animationFrames.push({'element':canvas,'event':{'type':'mousedown','offsetX':x,'offsetY':y}});
}

function unclickMouse(x,y) {
  for(var i=1; i<11; i++) {
      animationFrames.push({'element':canvas,'draw':exitingCursor(x,y,i/10)});
  }
  animationFrames.push({'element':canvas,'event':{'type':'mouseup','offsetX':x,'offsetY':y}});
}

keysToUnicode = {
  'ArrowLeft': '\u2190',
  'ArrowUp': '\u2191',
  'ArrowRight': '\u2192',
  'ArrowDown': '\u2193'
}

function pressKey(key) {
  keySymbol = keysToUnicode[key] ? keysToUnicode[key] : key;
  for(var i=1; i<15; i++) {
      animationFrames.push({'element':canvas,'draw':keyIcon(keySymbol,i)});
  }
  animationFrames.push({'element':$('body'),'draw':keyIcon(keySymbol,15),'event':{'type':'keydown','key':key}});
  for(var i=16; i<41; i++) {
      animationFrames.push({'element':canvas,'draw':keyIcon(keySymbol,i)});
  }
}

function keyIcon(key,i) {
  return function() {
    c.lineWidth = 2;
    c.color = 'black';
    c.fillStyle = 'gray';
    c.font = '40px sans-serif';
    c.setLineDash([]);
    c.fillText(key,500,300);
    c.beginPath();
    c.moveTo(470,280);
    c.lineTo(470,320);
    c.arcTo(470,330,480,330,10);
    c.lineTo(520,330);
    c.arcTo(530,330,530,320,10);
    c.lineTo(530,280);
    c.arcTo(530,270,520,270,10);
    c.lineTo(480,270);
    c.arcTo(470,270,470,280,10);
    c.stroke();

    c.beginPath();
    c.moveTo(470-20/i,280);
    c.lineTo(470-20/i,320);
    c.arcTo(470-20/i,330+20/i,480,330+20/i,10+20/i);
    c.lineTo(520,330+20/i);
    c.arcTo(530+20/i,330+20/i,530+20/i,320,10+20/i);
    c.lineTo(530+20/i,280);
    c.arcTo(530+20/i,270-20/i,520,270-20/i,10+20/i);
    c.lineTo(480,270-20/i);
    c.arcTo(470-20/i,270-20/i,470-20/i,280,10+20/i);
    c.stroke();
  }
}

function moveMouse(xStart, yStart, xEnd, yEnd) {
  numberFrames = Math.sqrt((xStart-xEnd)*(xStart-xEnd) + (yStart-yEnd)*(yStart-yEnd));
  for(var i=0; i<numberFrames+1; i++){
      var offsetX = (xStart*(numberFrames-i) + xEnd*i)/numberFrames;
      var offsetY = (yStart*(numberFrames-i) + yEnd*i)/numberFrames;
      animationFrames.push({'element':canvas,'draw':drawCursor(offsetX,offsetY),'event':{'type':'mousemove','offsetX': offsetX, 'offsetY':offsetY}});
  }
}

function mouseLeave() {
  animationFrames.push({'element':canvas,'event':{'type':'mouseleave'}});
}

function follow(x,y,node,leaf) {
  clickMouse(x,y);
  animationFrames.push({'element':canvas,'draw':drawCursor(x,y),'follow':node,'leaf':leaf,'event':{'type':'mousemove','offsetX': x, 'offsetY':y}});
}

function drawCursor(x,y) {
  return function() {
    c.lineWidth = 1;
    c.color = 'black';
    c.setLineDash([]);
    c.beginPath();
    c.setLineDash([]);
    c.moveTo(x, y);
    c.lineTo(x+20, y+15);
    c.lineTo(x+7, y+24);
    c.lineTo(x, y);
    c.stroke();
  }
}

function enteringCursor(x,y,percent) {
  return function() {
    c.color = 'black';
    c.beginPath();
    c.setLineDash([]);
    c.moveTo(x, y);
    c.lineTo(x+percent*20, y+percent*15);
    c.lineTo(x+percent*7, y+percent*24);
    c.lineTo(x, y);
    c.fill();
  }
}

function exitingCursor(x,y,percent) {
  return function() {
    c.color = 'gray';
    c.beginPath();
    c.setLineDash([]);
    c.moveTo(x+percent*20, y+percent*15);
    c.lineTo(x+20, y+15);
    c.lineTo(x+7, y+24);
    c.lineTo(x+percent*7, y+percent*24);
    c.lineTo(x+percent*20, y+percent*15);
    c.fill();
  }
}

function wait(frames) {
  for(var i = 0; i < frames; i++) {
    animationFrames.push(false);
  }
}

function toggleEnableInteraction() {
  animationFrames.push({'element':$('body'),'toggle':'disabled'});
}

function tutorial() {
  toggleEnableInteraction();
  reset();

  animationFrames.push({'message':'welcome to the syntax drag and drop tutorial. Clicking on empty space creates a node'});
  clickMouse(100,100);
  moveMouse(100,100,200,120);
  unclickMouse(200,120);

  animationFrames.push({'message':'Clicking on empty space creates a node, and in normal mode, you can drag selected nodes'});
  clickMouse(120,120);
  moveMouse(120,120,270,140);
  unclickMouse(270,140);

  animationFrames.push({'message':'Dragging a node outside of the canvas deletes it'});
  moveMouse(270,140,200,120);
  clickMouse(200,120);
  moveMouse(200,120,200,-10);
  mouseLeave();

  pressKey('P');
  animationFrames.push({'message':'Persist mode keeps you from dragging nodes, but makes nodes stay selected when you mouse out of them'});

  clickMouse(270,140);
  moveMouse(270,140,120,120);
  unclickMouse(120,120);

  animationFrames.push({'message':'If there is a selected node, just type to change the text'});
  pressKey(' ');
  pressKey('C');
  pressKey('h');
  pressKey('a');
  pressKey('n');
  pressKey('g');
  pressKey('e');

  wait(10);

  animationFrames.push({'message':'The enter key deletes all text in the selected node'});
  pressKey('Enter');
  pressKey('H');
  pressKey('e');
  pressKey('l');
  pressKey('l');
  pressKey('o');

  animationFrames.push({'message':'Clicking empty space in persist mode deselects the selected node'});
  moveMouse(120,120,80,110);
  clickMouse(80,110);

  pressKey('P');
  pressKey('S');

  clickMouse(80,110);
  moveMouse(80,110,260,140);
  unclickMouse(260,140);

  wait(10);

  pressKey('T');

  clickMouse(270,140);
  moveMouse(270,140,85,120);
  unclickMouse(85,120);

  pressKey('F');

  follow(420,240,1);
  moveMouse(180,120,40,40);

  pressKey('B');
  wait(60);
  pressKey('F');
  pressKey('B');

  wait(10);
  pressKey('P');

  pressKey('2');
  pressKey('ArrowDown');
  pressKey('ArrowRight');
  pressKey('ArrowDown');
  pressKey('1');
  pressKey('ArrowLeft');
  pressKey('ArrowUp');

  moveMouse(40,40,-10,40);
  mouseLeave();
  pressKey('3');
  moveMouse(40,40,-10,40);
  mouseLeave();

  pressKey('A');
  pressKey('P');
  pressKey('2');
  moveMouse(360,100,380,150);
  unclickMouse(270,140);
  pressKey('1');
  moveMouse(300,120,300,150);
  unclickMouse(300,150);
  pressKey('0');
  moveMouse(220,150,290,150);
  unclickMouse(290,150);

  pressKey('C');
  clickMouse(300,150);
  moveMouse(300,150,370,150);
  unclickMouse(370,150);
  pressKey('F');

  wait(100);

  pressKey('Reset');
  animationFrames.push({'draw':reset});
  pressKey('L');
  clickMouse(200,150);
  unclickMouse(200,150);
  clickMouse(250,150);
  unclickMouse(250,150);
  clickMouse(300,150);
  unclickMouse(300,150);
  pressKey('C');
  clickMouse(250,150);
  moveMouse(250,150,210,150);
  unclickMouse(210,150);
  clickMouse(300,190);
  pressKey(' ');
  pressKey('t');
  pressKey('w');
  pressKey('o');
  moveMouse(300,190,260,150);
  unclickMouse(260,150);
  pressKey('F');
  wait(40);
  follow(150,100,2,true);
  wait(100);

  pressKey('Reset');
  animationFrames.push({'draw':reset});

  pressKey('X');
  clickMouse(250,200);
  unclickMouse(250,200);
  pressKey('M');
  pressKey('N');
  clickMouse(180,280);
  moveMouse(180,280,240,260);
  unclickMouse(240,260);
  wait(10);
  clickMouse(240,260);
  moveMouse(240,260,240,230);
  unclickMouse(240,230);
  wait(10);
  pressKey('F');
  wait(100);

  pressKey('Reset');
  animationFrames.push({'draw':reset});

  toggleEnableInteraction();
}
