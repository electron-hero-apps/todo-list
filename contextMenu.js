var currentEditableItem;
var oldText;
var currentListItem;

var currentItemEsc;
var currentItemSave;

const {
	remote
} = require('electron')
const {
	Menu,
	MenuItem
} = remote

const menu = new Menu()

menu.append(new MenuItem({
	label: 'Details...',
	click() {

		var child = new BrowserWindow({
			parent: remote.getCurrentWindow(),
			width: 400,
			height: 200,
			modal: true,
			show: false,
			webPreferences: {
				nodeIntegration: true
			},
			listInfo: {
				title: $(currentListItem).find('.list-title').html(),
				subTitle: $(currentListItem).find('.list-sub-title').html()
			},
			sendInfo: function(info) {
				$(currentListItem).find('.list-title').html(info.title);
				$(currentListItem).find('.list-sub-title').html(info.subTitle);
				updateTitles(info.title, info.subTitle);
			}
		});
		child.loadFile(path.join(__dirname, 'listinfo.html'))
		child.once('ready-to-show', (e) => {

			child.on('closed', function(e) {
				child = null;
			})
			child.show()
		})

	}
}))

menu.append(new MenuItem({
	type: 'separator'
}))

menu.append(new MenuItem({
	label: 'Edit',
	click() {
		console.log('item 2 clicked')
	}
}))


const menuEditTask = new Menu()
menuEditTask.append(new MenuItem({
	label: 'Edit Description',
	click() {
		oldText = $(currentListItem).val();
		$(currentListItem).attr('contenteditable', true).focus();
	}
}));
menuEditTask.append(new MenuItem({
	label: 'Details',
	click() {
		$('#details-pane').fadeIn()
	}
}));

window.addEventListener('contextmenu', (e) => {
	e.preventDefault();
	var x = e.clientX;
	var y = e.clientY;
	var el = document.elementFromPoint(x, y);
	if ($(el).hasClass('list-group-item')) {
		currentListItem = el;
		menu.popup({
			window: remote.getCurrentWindow()
		})
	}
	if ($(el).hasClass('current-task')) {
		currentListItem = $(el).find('.task-text');
		menuEditTask.popup({
			window: remote.getCurrentWindow()
		})
	}

}, false)




function handleFileItemKeyDown(event) {
	if (event.keyCode === 13 || event.keyCode === 27) {

		if (event.keyCode === 27) {
			console.log('here in esc');
			console.log(oldText);
			$(currentListItem).val(oldText);
		}

		if (event.keyCode === 13) {
			// hit enter, go ahead and rename file
			// var oldPath = $(this).data('path');
			// newPath = oldPath.split(path.sep);
			// newPath.pop();
			// newPath = newPath.join(path.sep);
			// newPath = path.join(newPath, $(currentListItem).html())
			// fs.rename(oldPath, newPath, function(err, data) {
			// 	console.log(err);
			// 	console.log('here in rename callback')
			// })
		}

		$(currentListItem).removeAttr('contenteditable');
		$(currentListItem).blur();

	}
}

$(document).ready(function() {
	$(document).on('keydown', '.task-text', handleFileItemKeyDown);
});