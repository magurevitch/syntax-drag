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
  $('#inputs').append(`<b>${name}:</b>`);
  $('#inputs').append(`<input type="text" id="${name}" value="${name}">&nbsp;</input>`);
  $(`#${name}`).on('mouseenter',function(event){
    $('#message').text(`set default text for new ${name}`);
  });
}

makeButton('D','Drag', ()=>{},'move','drag around selected nodes');
makeButton('S','Switch', dropSwitch,'move','drag around nodes and switch them with other nodes');
makeButton('T','Tree siblings', dropTree, 'move','merges nodes to be sisters in a tree structure, and makes a parent when needed');
makeButton('M','Movement', dropMovement, 'move', 'merges nodes to be sisters in a tree structure with movement');
makeButton('A','Arrows', dropDependency, 'move', 'draws arrows to nodes');
makeButton('C','make Child', dropChild, 'move', 'makes the slected node a child of the node you drag it to. This mode is great for catenaries');

makeButton('N','regular Node',(x,y,text) => new Node(x,y,text),'create','clicking the canvas creates a single node');
makeButton('L','Leaf and node',(x,y,text) => new LeafNode(x,y,text),'create', 'clicking the canvas makes a node and text underneath it');
makeButton('X','X-bar node',newXBar,'create', "clicking the canvas makes an X' style tree with a head, a bar layer, and a phrase layer");

makeToggle('B','Binary trees','force trees to become binary', makeBinary);
makeToggle('F','animation Forces','animate trees with forces between them');

$('#D, #N').trigger('mousedown');
$('body').on('keypress',function(event){
  $(`#${event.key.toUpperCase()}`).trigger('mousedown');
})
$('#inputs').on('keypress',function(event){
  event.stopPropagation();
})

makeInput('node');
makeInput('parent');
makeInput('leaf');

canvas.on('mouseenter', function(event){
  $('#message').text("Click anywhere to make a node, push down on a node to drag it, and drag nodes out of the canvas to delete them");
});
