var currentListData = '';
var currentFile = '';

$(document).ready(function() {
	console.log('here in doc ready')
	showLists();
});

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
	console.log(taskJSON);
	_.each(taskJSON, function(item, index) {
		console.log(item);
		if (item && item.desc === taskDesc) {
			task = taskJSON[index];
			task.status = 'complete'
			taskJSON.splice(index, 1);
			var resp = fs.writeFileSync(__dirname + '/tasks.json', JSON.stringify(taskJSON));
			$('.todo-group').empty();
			$('.completed-group').empty();
			loadTasks();
			return;
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
					loadTasks();
					return;
				})
		}
	})
}

function completeTaskInJSON(index) {
	task = taskJSON[index];
	task.status = 'complete'
	taskJSON[index] = task;
	var resp = fs.writeFileSync(__dirname + '/tasks.json', JSON.stringify(taskJSON));
	return Promise.resolve();
}


function addTaskToJSON(newTask) {
	taskJSON.push(newTask);
	try {
		var resp = fs.writeFileSync(__dirname + '/tasks.json', JSON.stringify(taskJSON));
	} catch (err) {
		console.log(err);
	}
}


var newTaskListSidebarItem = '<li class="list-group-item" data-listname="shopping-list.json">' +
	'<div class="media-body"><span class="list-name">Shopping List</span><p></p></div>' +
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
			$(sidebarItem).find('div > span').html(listData.listName);
			$(sidebarItem).data('filename', file);
			$('.list-group').append(sidebarItem);
		})
	})

}

function loadTasks(filename) {
	
	$('.todo-group').empty();
	$('.completed-group').empty();
		
	taskJSON = JSON.parse(fs.readFileSync(path.join(__dirname,'lists',filename), 'utf8')).tasks;
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