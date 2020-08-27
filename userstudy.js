const path = 'https://cxxxxxn.github.io/userstudy/img/';
// const path = 'img/';
window.onload = function(){
    document.getElementById("next").onclick = next;
    initTasks();
    addRow(["id", "answer", "time", "confidence", "engagement", "helpful"]);
} 
let taskArr = [];
let report = [];
let startTime, endTime;
let currentTask;
let questionState = 9;
let taskType = 'task1';
//9:pre
//task1:1显示图片和fact问题，2显示感觉问题
//task2:0显示图片, 1显示fact问题，2显示感觉问题, -1:还在显示文字信息
//5:post
let _answer, _time;

function saveCsv(){
    let blob = new Blob(report, {type: "text/plain;charset=utf-8"});
    saveAs(blob, "result.csv");
}

function addRow(elements){
    report.push(elements.join()+"\n");
}

function initTasks(){
    for(let i = 1; i <= 1; i++){
        taskArr.push(taskType + "-" + i);
    }
}

function hasCharacter(){
    let id = parseInt(currentTask.split("-")[1]);
    if(id < 16) return false;
    return true;
}

function next(){
    if(questionState === 9){
        let name = document.getElementById("name").value;
        let age = document.getElementById("age").value;
        let sex = getRadioValue("sex");
        let occupation_s = document.getElementById("occupation");
        let occupation = occupation_s.options[occupation_s.selectedIndex].text;
        let education_s = document.getElementById("education");
        let education = education_s.options[education_s.selectedIndex].text;
        if(!name || !age || !sex || !occupation || !education) return;
        let elements = ["pre-usestudy", name, age, sex, occupation, education];

        for(let i = 6; i <= 8; i++){
            let p = getRadioValue("pre" + i);
            if(!p) return;
            elements.push(p);
        }
        addRow(elements);
        //yes
        questionState = 2;
        document.getElementById("pre").style.display = "none"; 
        document.getElementById("message").style.display = "block";
        document.getElementById("next").style.position = "fixed"; 
        document.getElementById("count").style.display = "block";

    }else if(!startTime){//first
        document.getElementById("next").innerHTML = "Next"; 
        document.getElementById("message").innerHTML = "";
        startTime = new Date();
        showNextTask();
    }else{
        if(questionState === -1){
            document.getElementById("message").innerHTML = "";
            questionState = 2;
            showNextTask();
        }else if(questionState === 5){//提交
            let postQuestion = 2;//问题个数
            let elements = ["post-usestudy"];
            for(let i = 1; i <= postQuestion; i++){
                let p = getRadioValue("post" + i);
                console.log(p)
                if(!p) return;
                elements.push(p);
            }
            addRow(elements);
            saveCsv();
            //finish
            document.getElementById("message").innerHTML = `
                <h2>感谢参与！</h2>
                <p>麻烦将下载的result.csv发送给我们。</p>
                <p>接下来，我们还将与您进行一小段访谈。</p>
            `;
            document.getElementById("post").style.display = 'none'; 
            document.getElementById("next").style.display = "none";
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
                engagement = getRadioValue("engagement"),
                helpful = getRadioValue("helpful");
            if(taskType === "task2") engagement = "null";
            if(!hasCharacter()) helpful = "null"
            if(!confidence || !engagement || !helpful) return;
            addRow([currentTask, _answer, _time, confidence, engagement, helpful]);
            
            if(taskArr.length) {
                showNextTask();
            }else if(taskType === "task1"){
                taskType = "task2";
                initTasks();
                document.getElementById("choice").innerHTML = '';
                document.getElementById("message").innerHTML = `
                    <h2>Task2</h2>
                    <p>接下来你将看到一张图表，图表展示时间3秒钟，之后请回答相关的问题。回答第一题的时间，将会被记录下来。</p>
                `;
                questionState = -1;
            }else {
                document.getElementById("choice").innerHTML = '';
                document.getElementById("count").style.display = "none";
                document.getElementById("post").style.display = 'block'; 
                document.getElementById("next").innerHTML = "Submit"; 
                questionState = 5;
            }
        }
    }
}

function showFeelingQuestion(){
    document.getElementById('mainview').style.display = 'none';
    //confidence//engagement
    let questionsHtml = `<span> <em>02</em> 请问您对上题选择的自信程度是多少？</span>
        <div class="tag-container"><div class="tag">非常不认同</div><div class="tag">非常认同</div></div>
        <input type="radio" name="confidence" value="1"/>1
        <input type="radio" name="confidence" value="2" />2
        <input type="radio" name="confidence" value="3"/>3
        <input type="radio" name="confidence" value="4" />4
        <input type="radio" name="confidence" value="5" />5
        <input type="radio" name="confidence" value="6" />6
        <input type="radio" name="confidence" value="7" />7`
    
    if(taskType === "task1")
        questionsHtml +=`<br><br>
        <span> <em>03</em> 请问您认为该图表的有趣程度以及对你的吸引程度是多少？</span>
        <div class="tag-container"><div class="tag">非常不认同</div><div class="tag">非常认同</div></div>
        <input type="radio" name="engagement" value="1"/>1
        <input type="radio" name="engagement" value="2" />2
        <input type="radio" name="engagement" value="3"/>3
        <input type="radio" name="engagement" value="4" />4
        <input type="radio" name="engagement" value="5" />5
        <input type="radio" name="engagement" value="6" />6
        <input type="radio" name="engagement" value="7" />7`;
    //help
    if(hasCharacter()){
        questionsHtml += `<br><br>`
        if(taskType === "task1"){
            questionsHtml += `<span> <em>04</em> 请问相比传统数据图表，增加了漫画小人元素的数据图表在“帮助理解洞察数据信息”方面是否有正面影响?</span>`
        }else{
            questionsHtml += `<span> <em>03</em> 请问相比传统数据图表，增加了漫画小人元素的数据图表在“帮助记忆洞察数据信息”方面是否有正面影响?</span>`
        }
        questionsHtml += `<div class="tag-container"><div class="tag">非常不认同</div><div class="tag">非常认同</div></div>
            <input type="radio" name="helpful" value="1"/>1
            <input type="radio" name="helpful" value="2" />2
            <input type="radio" name="helpful" value="3"/>3
            <input type="radio" name="helpful" value="4" />4
            <input type="radio" name="helpful" value="5" />5
            <input type="radio" name="helpful" value="6" />6
            <input type="radio" name="helpful" value="7" />7`;
    }

    document.getElementById('choice').innerHTML = questionsHtml;
}

function showAccurancyQuestion(){
    startTime = new Date();
    document.getElementById('choice').innerHTML = 
        `<span> <em>01</em> 请问该图表表示的语义是以下6种facts中的哪种fact？</span>
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
        document.getElementById('mainview').src = path + nextTask + ".jpg";
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