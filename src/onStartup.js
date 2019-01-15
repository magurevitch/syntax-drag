function makeButton(letter, name, action, type, message) {
  index = name.indexOf(letter);
  newText = index === -1 ? `<u>${letter}<u> ${name}` : `${name.slice(0,index)}<b>${letter}</b>${name.slice(index+1)}`;
  $('#options tr').last().append(`<td id="${letter}" class="boxed ${type}">${newText}</td>`);
  $(`#${letter}`).on('mouseenter',function(e) {
    $('#message').text(message);
  });
  $(`#${letter}`).on('mousedown', function(e){
    $(`.${type}`).removeClass('selected');
    $(this).addClass('selected');
    mode[type] = action;
  });
}

function makeToggle(letter, name, message) {
  index = name.indexOf(letter);
  newText = index === -1 ? `<u>${letter}<u> ${name}` : `${name.slice(0,index)}<b>${letter}</b>${name.slice(index+1)}`;
  $('#options tr').last().append(`<td id="${letter}" class="boxed">toggle ${newText}</td>`);
  $(`#${letter}`).on('mouseenter',function(e) {
    $('#message').text(message);
  });
  $(`#${letter}`).on('mousedown', function(e){
    $(this).toggleClass('selected');
    mode[name] = !mode[name];
  });
}

function makeInput(name){
  $('#inputs').append(`<b>${name}:</b>`);
  $('#inputs').append(`<input type="text" id="${name}" value="${name}"></input>`);
  $('#inputs').append(`<br>`);
  $(`#${name}`).on('mouseenter',function(event){
    $('#message').text(`set default text for new ${name}`);
  });
}

$('#options').append('<tr></tr>');
makeButton('S','Select', dropSelect,'move','select and move around (and switch) nodes');
makeButton('N','regular Node',(x,y,text) => new Node(x,y,text),'create','clicking the canvas creates a single node');
makeToggle('B','Binary trees','force trees to become binary');
$('#options').append('<tr></tr>');
makeButton('T','Tree', dropTree, 'move','merges nodes into a tree structure');
makeButton('L','Leaf and node',(x,y,text) => new LeafNode(x,y,text),'create', 'clicking the canvas makes a node and text underneath it');
makeToggle('F','animation Forces','animate trees with forces between them');
$('#options').append('<tr></tr>');
makeButton('M','Movement', dropMovement, 'move', 'merges nodes into a tree structure with movement');
makeButton('X','X-bar node',newXBar,'create', "clicking the canvas makes an X' style tree with a head, a bar layer, and a phrase layer");
$('#options').append('<tr></tr>');
makeButton('A','Arrows', dropDependency, 'move', 'draws arrows to nodes');
$('#options').append('<tr></tr>');
makeButton('C','Catenary', dropCatenary, 'move', 'attaches nodes in a catenary');

$('#S, #N').trigger('mousedown');
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
