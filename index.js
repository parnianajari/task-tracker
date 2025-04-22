const fs = require("fs");
const readline = require("readline");

//Json file setup
const tasksFile = "./tasks.json";

const read = () => JSON.parse(fs.readFileSync(tasksFile, "utf-8"));
const write = (data) =>
  fs.writeFileSync(tasksFile, JSON.stringify(data, null, 2));

if (!fs.existsSync(tasksFile)) {
  write([]);
}

let tasks = read();
const saveTasks = () => write(tasks);

// CLI interface setup
const r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = function (prompt) {
  return new Promise((resolve) => {
    r1.question(prompt, resolve);
  });
};

// Status constants and color formatting
const STATUS = {
  DONE: "done",
  IN_PROGRESS: "in-progress",
  TO_DO: "to-do",
};

const colors = {
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  purple: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  pink: (text) => `\x1b[95m${text}\x1b[0m`,
};

//==============================
// Core task management functions
const addTask = async () => {
  const task = await question(colors.cyan("\nPlease Add Your Task: "));
  tasks.push({
    item: task,
    status: STATUS.IN_PROGRESS,
  });
  saveTasks();
  console.log(colors.green("✅ Task Successfully Added.\n"));
  showMenu();
};

const listTasks = () => {
  console.log(colors.purple("\nList All Tasks: "));
  let msgStatus;
  tasks.forEach((task, i) => {
    switch (task.status) {
      case STATUS.DONE:
        msgStatus = "✅ ";
        break;
      case STATUS.TO_DO:
        msgStatus = "⏳ ";
        break;
      default:
        msgStatus = "⏸️ ";
        break;
    }
    console.log(`${i + 1}. ${msgStatus} ${task.item}`);
  });
};

const updateTask = async () => {
  listTasks();
  const task = await question(
    colors.cyan("Which Task Do You Want To Update? ")
  );
  const taskIndex = parseInt(task) - 1;
  if (taskIndex >= 0 && taskIndex < tasks.length) {
    const newTask = await question(colors.cyan("Insert Your New Task: "));
    tasks[taskIndex].item = newTask;
    saveTasks();
    console.log(colors.green("🔁 Task successfully Updated.\n"));
  } else {
    console.log(colors.red("Invalid Number ...\n"));
  }
  showMenu();
};

const deleteTask = async () => {
  listTasks();
  const task = await question(
    colors.cyan("Which Task Do You Want To Delete? ")
  );
  const taskIndex = parseInt(task) - 1;
  if (!isNaN(taskIndex) && taskIndex >= 0 && taskIndex < tasks.length) {
    tasks.splice(taskIndex, 1);
    saveTasks();
    console.log(colors.green("❌ Task successfully Deleted.\n"));
  } else {
    console.log(colors.red("Invalid option ...\n"));
  }
  showMenu();
};

const changeTaskStatus = async () => {
  listTasks();
  const taskIndex =
    parseInt(
      await question(colors.cyan("Which task do you want to change status? "))
    ) - 1;

  if (isNaN(taskIndex) || taskIndex < 0 || taskIndex >= tasks.length) {
    console.log(colors.red("Invalid Number ...\n"));
    await showMenu();
  } else {
    console.log(colors.purple("\nChange status to: "));
    console.log("1. ✅ Done\n2. ⏳ To Do\n3. ⏸️ In Progress");
    const taskStatus = await question(colors.cyan("Enter Number: "));

    switch (taskStatus) {
      case "1":
        tasks[taskIndex].status = STATUS.DONE;
        break;
      case "2":
        tasks[taskIndex].status = STATUS.TO_DO;
        break;
      case "3":
        tasks[taskIndex].status = STATUS.IN_PROGRESS;
        break;
      default:
        console.log(colors.red("\nInvalid choice!"));
        await showMenu();
    }
    saveTasks();
    console.log(colors.green("✅ Status Successfully Changed.\n"));
  }

  showMenu();
};

//=====================
// Main menu interface
//=====================
const showMenu = async () => {
  console.log(
    colors.cyan("What Do You Want To Do?") +
      colors.gray("(Enter Number)\n") +
      "1. Add Task\n2. Update Task\n3. Delete Task\n4. List Tasks\n5. Change Status\n0. Exit"
  );
  const option = await question(colors.cyan("Enter an option: "));
  switch (option) {
    case "1":
      await addTask();
      break;
    case "2":
      await updateTask();
      break;
    case "3":
      await deleteTask();
      break;
    case "4":
      listTasks();
      await showMenu();
      break;
    case "5":
      await changeTaskStatus();
      break;
    case "0":
      r1.close();
      process.exit();
      break;
    default:
      console.log(colors.red("Invalid Number!\n"));
      await showMenu();
  }
};
showMenu();
