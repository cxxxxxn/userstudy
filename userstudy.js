const path = 'https://cxxxxxn.github.io/userstudy/img/';
///img/
window.onload = function(){
    document.getElementById("next").onclick = next;
    initTasks();
    addRow("id", "answer", "time", "confidence", "engagement", "helpful");
} 
let taskArr = [];
let report = [];
let startTime, endTime;
let currentTask;
let questionState = 2;
let taskType = 'task1';
//task1:1显示图片和fact问题，2显示感觉问题
//task2:0显示图片, 1显示fact问题，2显示感觉问题, -1:还在显示文字信息
let _answer, _time;

function saveCsv(){
    let blob = new Blob(report, {type: "text/plain;charset=utf-8"});
    saveAs(blob, "result.csv");
}

function addRow(taskid, result, time, confidence, engagement, helpful){
    report.push(taskid + "," + result + "," + time + "," + confidence + "," + engagement + "," + helpful+"\n");
}

function initTasks(){
    for(let i = 1; i <= 3; i++){
        taskArr.push(taskType + "-" + i);
    }
}

function hasCharacter(){
    let id = parseInt(currentTask.split("-")[1]);
    if(id % 3 === 1) return false;
    return true;
}

function next(){
    if(!startTime){//first
        document.getElementById("next").innerHTML = "Next"; 
        document.getElementById("message").innerHTML = "";
        startTime = new Date();
        showNextTask();
    }else{
        if(questionState === -1){
            document.getElementById("message").innerHTML = "";
            questionState = 2;
            showNextTask();
        }
        else if(questionState === 1){
            let answer = getRadioValue("answer");
            if(!answer) return;
            endTime = new Date();
            _time = endTime - startTime;
            _answer = answer;
            showNextTask();
        }else if(questionState === 2){
            let confidence = getRadioValue("confidence"),
                engagement = getRadioValue("engagement");
            if(!confidence || !engagement) return;
            let helpful = 0;
            if(hasCharacter()){
                helpful = getRadioValue("helpful");
                if(!helpful) return;
            } 
            addRow(currentTask, _answer, _time, confidence, engagement, helpful);
            
            if(taskArr.length) {
                showNextTask();
            }else if(taskType === "task1"){
                taskType = "task2";
                initTasks();
                document.getElementById("choice").innerHTML = '';
                document.getElementById("message").innerHTML = `
                    <h2>Task2</h2>
                    <p>接下来你将看到一张图表,图表展示3秒钟，之后请回答相关的问题。回答第一题的时间，将会被记录下来。</p>
                `;
                questionState = -1;
            }else {
                document.getElementById("choice").innerHTML = '';
                document.getElementById("message").innerHTML = `
                    <h2>感谢参与！</h2>
                    <p>请将下载的result.csv发送给我们。</p>
                `;
                document.getElementById("next").style.display = "none"; 
                saveCsv();
            }
        }
    }
}

function showFeelingQuestion(){
    document.getElementById('mainview').style.display = 'none';
    //confidence//engagement
    let questionsHtml = `<span> <em>02</em> 你对回答自信么？</span>
        <br>
        <input type="radio" name="confidence" value="1"/>1
        <input type="radio" name="confidence" value="2" />2
        <input type="radio" name="confidence" value="3"/>3
        <input type="radio" name="confidence" value="4" />4
        <input type="radio" name="confidence" value="5" />5
        <br><br>
        <span> <em>03</em> 你觉得图表吸引你么？</span>
        <br>
        <input type="radio" name="engagement" value="1"/>1
        <input type="radio" name="engagement" value="2" />2
        <input type="radio" name="engagement" value="3"/>3
        <input type="radio" name="engagement" value="4" />4
        <input type="radio" name="engagement" value="5" />5`;
    //help
    if(hasCharacter()) 
    questionsHtml += `<br><br>
        <span> <em>04</em> 你觉得小人对你的判断有帮助么？</span>
        <br>
        <input type="radio" name="helpful" value="1"/>1
        <input type="radio" name="helpful" value="2" />2
        <input type="radio" name="helpful" value="3"/>3
        <input type="radio" name="helpful" value="4" />4
        <input type="radio" name="helpful" value="5" />5`;

    document.getElementById('choice').innerHTML = questionsHtml;
}

function showAccurancyQuestion(){
    startTime = new Date();
    document.getElementById('choice').innerHTML = 
        `<span> <em>01</em> 你觉得下面这个图表想要讲述什么内容？</span>
        <br>
        <input type="radio" name="answer" value="Categorization" />Categorization
        <input type="radio" name="answer" value="Difference"/>Difference
        <input type="radio" name="answer" value="Distribution" />Distribution
        <input type="radio" name="answer" value="Proportion"/>Proportion
        <input type="radio" name="answer" value="Value" />Value
        <input type="radio" name="answer" value="Trend" />Trend`;
}

function showNextTask(){
    if(questionState === 2){
        let rand = Math.floor(Math.random() * taskArr.length); 
        let nextTask = taskArr.splice(rand, 1)[0];
        currentTask = nextTask;
        document.getElementById('mainview').src = path + nextTask + ".png";
        document.getElementById('mainview').style.display = 'inherit';
        document.getElementById('choice').innerHTML = '';
        const left = taskType == "task1" ? 45 - taskArr.length :90 - taskArr.length;
        document.getElementById('count').innerHTML = left + " / 90";
        if(taskType == "task1"){
            questionState = 1;
            showAccurancyQuestion();
        }else{
            document.getElementById("next").style.display = 'none';
            questionState = 0;
            setTimeout(function(){
                showNextTask();
                document.getElementById("next").style.display = 'inline-block';
            }, 3000)
        }
    }else if(questionState === 1){
        questionState = 2;
        showFeelingQuestion();
    }else if(questionState === 0){
        document.getElementById('mainview').style.display = 'none';
        questionState = 1;
        showAccurancyQuestion();
    }
}

function getRadioValue(radioName){
    let radios = document.getElementsByName(radioName);
    let value;
    for(let i=0;i<radios.length;i++){
        if(radios[i].checked){
            value = radios[i].value;
            break;
        }
    }
    return value;
}