document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // タスクを保存する関数
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateTaskCount();
    };
    
    // タスクのカウントを更新する関数
    const updateTaskCount = () => {
        const activeTasks = tasks.filter(task => !task.completed).length;
        const totalTasks = tasks.length;
        taskCount.textContent = `${activeTasks} / ${totalTasks} 件のタスク`;
    };
    
    // タスクを追加する関数
    const addTask = (text) => {
        if (text.trim() === '') return;
        
        const newTask = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = '';
        taskInput.focus();
    };
    
    // タスクを削除する関数
    const deleteTask = (id) => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    };
    
    // タスクの完了状態を切り替える関数
    const toggleTaskStatus = (id) => {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks();
    };
    
    // 完了したタスクをすべて削除する関数
    const clearCompletedTasks = () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    };
    
    // タスクをフィルタリングする関数
    const filterTasks = (filter) => {
        currentFilter = filter;
        renderTasks();
    };
    
    // タスクを描画する関数
    const renderTasks = () => {
        let filteredTasks = [...tasks];
        
        // フィルターに基づいてタスクをフィルタリング
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // タスクリストをソート（未完了→完了、新しい順）
        filteredTasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // タスクリストをクリア
        taskList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = currentFilter === 'all' 
                ? 'タスクがありません' 
                : currentFilter === 'active' 
                    ? '未完了のタスクはありません' 
                    : '完了したタスクはありません';
            taskList.appendChild(emptyMessage);
            return;
        }
        
        // タスクを描画
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.dataset.id = task.id;
            
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <button class="delete-btn" title="削除">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            // チェックボックスのイベントリスナー
            const checkbox = taskItem.querySelector('.task-checkbox');
            checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
            
            // 削除ボタンのイベントリスナー
            const deleteBtn = taskItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('このタスクを削除しますか？')) {
                    deleteTask(task.id);
                }
            });
            
            // タスクをクリックで編集可能に
            const taskText = taskItem.querySelector('.task-text');
            taskText.addEventListener('dblclick', () => {
                const currentText = taskText.textContent;
                const input = document.createElement('input');
                input.type = 'text';
                input.value = currentText;
                input.className = 'edit-input';
                
                taskText.replaceWith(input);
                input.focus();
                
                const saveEdit = () => {
                    const newText = input.value.trim();
                    if (newText) {
                        tasks = tasks.map(t => 
                            t.id === task.id ? { ...t, text: newText } : t
                        );
                        saveTasks();
                    }
                    renderTasks();
                };
                
                input.addEventListener('blur', saveEdit);
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        saveEdit();
                    }
                });
            });
            
            taskList.appendChild(taskItem);
        });
    };
    
    // イベントリスナーの設定
    addTaskBtn.addEventListener('click', () => addTask(taskInput.value));
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(taskInput.value);
        }
    });
    
    clearCompletedBtn.addEventListener('click', () => {
        if (tasks.some(task => task.completed)) {
            if (confirm('完了したタスクをすべて削除しますか？')) {
                clearCompletedTasks();
            }
        } else {
            alert('完了したタスクはありません');
        }
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterTasks(btn.dataset.filter);
        });
    });
    
    // 初期表示
    renderTasks();
    
    // デバッグ用: サンプルタスクを追加
    if (tasks.length === 0) {
        const sampleTasks = [
            'タスク管理アプリを使ってみる',
            '買い物リストを作成する',
            'プロジェクトの進捗を確認する'
        ];
        
        sampleTasks.forEach((task, index) => {
            tasks.push({
                id: Date.now() + index,
                text: task,
                completed: index === 2, // 3つ目のタスクは完了済みに
                createdAt: new Date(Date.now() - (index * 60 * 60 * 1000)).toISOString() // 時間差をつける
            });
        });
        
        saveTasks();
        renderTasks();
    }
});
