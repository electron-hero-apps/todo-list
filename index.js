var currentListData = '';
var currentFile = '';

var currentListItem;


$(document).ready(function() {
	console.log('here in doc ready')
	showLists();
});
const {
	BrowserWindow
} = require('electron').remote;


$(document).on('click', ".addTask", addTask);
$(document).on('click', ".markComplete", completeTask);
$(document).on('click', ".trash", deleteCompletedTask);
$(document).on('click', '.list-group-item', handleListPaneClick);




$(document).on('mouseenter', "div.todo-group span.checkParent", function() {
	$(this).find('span>span').addClass("icon icon-check");
});
$(document).on('mouseleave', "div.todo-group span.checkParent", function() {
	$(this).find('span>span').removeClass("icon icon-check");
});

$(document).on('mouseenter', ".form-group.completed-task", function() {
	$(this).find('span.trash').addClass("redBorder");
});
$(document).on('mouseleave', ".form-group.completed-task", function() {
	$(this).find('span.trash').removeClass("redBorder");
});

function deleteCompletedTask() {
	var task = $(this).closest('div.completed-task');
	var taskDesc = $(task).find('input').val();
	_.each(taskJSON, function(item, index) {
		if (item && item.desc === taskDesc) {
			taskJSON.splice(index, 1);
			currentListData.tasks = taskJSON;
			var resp = fs.writeFile(path.join(__dirname, 'lists', currentFile), JSON.stringify(currentListData), function(err, info) {
				$('.todo-group').empty();
				$('.completed-group').empty();
				loadTasks(currentFile);
				return;
			});
		}
	})
}


function handleListPaneClick() {
	$('.list-group .list-group-item').removeClass('active');
	$(this).addClass('active');
	currentFile = $(this).data('filename');
	loadTasks(currentFile);
}


function addTask() {
	var newTaskDesc = $('#addTaskInput').val();

	var newTask = {
		desc: newTaskDesc,
		status: 'todo'
	}

	if (_.isEmpty(newTaskDesc)) {
		alert('Please enter a description');
		return;
	}

	if (_.find(taskJSON, newTask)) {
		alert('That task already exists');
		return;
	}
	addTaskToJSON(newTask);
	addTodoTask(newTask);
	$('#addTaskInput').val('');
}

function completeTask() {
	var taskDesc = $(this).closest('div.current-task').find('input').val();
	var task;
	_.each(taskJSON, function(item, index) {
		if (item.desc === taskDesc) {
			completeTaskInJSON(index)
				.then(() => {
					console.log('here in then...');
					$('.todo-group').empty();
					$('.completed-group').empty();
					loadTasks(currentFile);
					return;
				})
		}
	})
}

function saveAllTasksToJSON() {
	
}

function updateTitles(title, subTitle) {
	currentListData.title = title;
	currentListData.subTitle = subTitle;
	var resp = fs.writeFileSync(path.join(__dirname, 'lists', currentFile), JSON.stringify(currentListData));

}

function completeTaskInJSON(index) {
	task = taskJSON[index];
	task.status = 'complete'
	taskJSON[index] = task;
	currentListData.tasks = taskJSON;
	var resp = fs.writeFileSync(path.join(__dirname, 'lists', currentFile), JSON.stringify(currentListData));
	return Promise.resolve();
}


function addTaskToJSON(newTask) {
	taskJSON.push(newTask);
	try {
		currentListData.tasks = taskJSON;
		var resp = fs.writeFileSync(path.join(__dirname, 'lists', currentFile), JSON.stringify(currentListData));
	} catch (err) {
		console.log(err);
	}
}


var newTaskListSidebarItem = '<li class="list-group-item" data-listname="shopping-list.json">' +
	'<div class="media-body no-click"><span class="list-title no-click">Shopping List</span><p class="list-sub-title no-click"></p></div>' +
	'</li>'


function addTodoTask(newTask) {
	console.log('here in addTodo');
	console.log(newTask);
	var todoTemplate = $('#todoTaskTemplate').html();
	var newRow = $.parseHTML(todoTemplate);
	$(newRow).find('input').val(newTask.desc);
	$('.todo-group').append(newRow);
}

function showLists() {
	// get all the lists from the lists directory
	fs.readdir(path.join(__dirname, 'lists'), function(err, files) {
		_.each(files, function(file) {
			var listData = fs.readFileSync(path.join(__dirname, 'lists', file), 'utf-8');
			if (listData) {
				listData = JSON.parse(listData);
			}
			var sidebarItem = $.parseHTML(newTaskListSidebarItem);
			$(sidebarItem).find('.list-title').html(listData.title);
			$(sidebarItem).find('.list-sub-title').html(listData.subTitle);

			$(sidebarItem).data('filename', file);
			$('.list-group').append(sidebarItem);
		})
	})

}

function loadTasks(filename) {

	$('.todo-group').empty();
	$('.completed-group').empty();

	currentListData = JSON.parse(fs.readFileSync(path.join(__dirname, 'lists', filename), 'utf8'));
	taskJSON = currentListData.tasks;
	var todoTemplate = $('#todoTaskTemplate').html();
	var completedTempalte = $('#completedTaskTemplate').html();
	_.each(taskJSON, function(item) {
		if (item.status === 'todo') {
			addTodoTask(item);
		} else {
			var temp = $('#completedTaskTemplate').html();
			var newRow = $.parseHTML(temp);
			$(newRow).find('input').val(item.desc);
			$('.completed-group').append(newRow);
		}
	})
}