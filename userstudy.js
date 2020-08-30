const path = 'https://cxxxxxn.github.io/userstudy/img/';
// const path = './img/';
window.onload = function(){
    initTasks();

    if(secondDetected())
        document.getElementById("next").onclick = next;

    let checkbox = document.getElementsByClassName("checkbox");
    for (let i=0; i < checkbox.length; i++) {
        checkbox[i].onclick = function(){ choose(i+1, checkbox[i]) };
    };
    addRow(["id", "answer", "time", "confidence", "engagement", "helpful"]);
} 
let taskArr = [];
let taskArr2 = [];
let taskIndex2 = 0;
let report = [];
let startTime, endTime;
let currentTask;
let questionState = 9;
let taskType = 'task1';
let checkedArray = new Set();
//9:pre
//task1:1显示图片和fact问题，2显示感觉问题
//task2:3, -1:还在显示文字信息

let _answer, _time;

function saveCsv(){
    let blob = new Blob(report, {type: "text/plain;charset=utf-8"});
    saveAs(blob, "result.csv");
}

function addRow(elements){
    report.push(elements.join()+"\n");
}

function initTasks(){
    for(let i = 1; i <= 45; i++){//TODO:
        taskArr.push("task1" + "-" + i);
    }
    for(let i = 1; i <= 45; i++){
        taskArr2.push("task2" + "-" + i);
    }
    partition();
}

function shuffle(arr) {
    let newArr = arr.map(item=>({val:item,ram:Math.random()}));
    newArr.sort((a,b)=>a.ram-b.ram);
    arr.splice(0,arr.length,...newArr.map(i=>i.val));
    return arr;
}

function partition(){
    shuffle(taskArr2);
    
    let res = [];
    for(let i = 0; i < 9; i++){
        let temp = taskArr2.slice(i*5, (i+1)*5);
        res.push(temp);
        let index = detecteRepetive(temp);
        let count = 0;
        while(index+1){//有重复
            if(i === 8){
                let d = res[count][4 - count];
                res[count][4 - count] = temp[index];
                if(detecteRepetive(res[count])+1){//不能交换
                    res[count][4 - count] = d;
                    index = 0;
                }else{//交换
                    temp[index] = d;
                }
            }else{
                //swap
                let d = taskArr2[taskArr2.length - 1 - count];
                taskArr2[taskArr2.length -1 - count] = temp[index];
                temp[index] = d;
            }
            count ++;
            index = detecteRepetive(temp);
        }
    }

    taskArr2 = res;
}

function secondDetected(){
    //2次检查
    for(let i = 0; i < 9; i++){
        let temp = taskArr2[i];
        let index = detecteRepetive(temp);
        if(index+1) return false;
    }
    let set = new Set([].concat.apply([], taskArr2));
    if(set.size !== 45) return false;
    return true;
}

function detecteRepetive(arr){
    let temp = [...arr].map(d => parseInt(d.split("-")[1])%15);
    let has = new Set();
    for(let i = 0; i < 5; i++){
        if(!has.has(temp[i])) has.add(temp[i]);
        else return i;
    }
    return -1;
}


function hasCharacter(){
    let id = parseInt(currentTask.split("-")[1]);
    if(id < 16) return false;
    return true;
}

function next(){
    if(questionState === 9){//个人信息
        let name = document.getElementById("name").value;
        let age = document.getElementById("age").value;
        let sex = getRadioValue("sex");
        let occupation_s = document.getElementById("occupation");
        let occupation = occupation_s.options[occupation_s.selectedIndex].text;
        let education_s = document.getElementById("education");
        let education = education_s.options[education_s.selectedIndex].text;
        if(!name || !age || !sex || !occupation || !education) return;
        let elements = ["pre-usestudy", name, age, sex, occupation, education];

        for(let i = 6; i <= 6; i++){
            let p = getRadioValue("pre" + i);
            if(!p) return;
            elements.push(p);
        }
        addRow(elements);
        //yes
        questionState = 2;
        document.getElementById("pre").style.display = "none"; 
        document.getElementById("message").style.display = "block";
        document.getElementById("count").style.display = "block";

    }else if(!startTime){//first
        document.getElementById("next").innerHTML = "Next"; 
        document.getElementById("message").innerHTML = "";
        document.getElementById('mainview').style.display = 'inherit';
        startTime = new Date();
        showNextTask();
    }else{
        if(questionState === -1){//第二任务介绍
            document.getElementById("message").innerHTML = "";
            document.getElementById('mainview').style.display = 'inherit';
            questionState = 3;
            document.getElementById('mainview').src = '';
            showNextTask();
        }else if(questionState === 1){
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
            if(!hasCharacter()) helpful = "null"
            if(!confidence || !engagement || !helpful) return;
            addRow([currentTask, _answer, _time, confidence, engagement, helpful]);
            
            if(taskArr.length) {
                showNextTask();
            }else if(taskType === "task1"){//要开始第二个任务了
                taskType = "task2";
                document.getElementById('mainview').style.display = 'none';
                document.getElementById("choice").innerHTML = '';
                document.getElementById("message").innerHTML = `
                    <h2>Task2</h2>
                    <p>接下来，你将分9批阅读一组图表，每一组中有5张可视化图标，每张图表的展示时间3秒钟。</p>
                    <p>在看完5张图表后，有30秒钟的休息时间。</p>
                    <p>之后请回忆你刚刚看过的图表，如不确定可跳过，<em>但请不要随机选择哦！</em>。</p>
                `;
                questionState = -1;
            }
        }else if(questionState === 3){
            if(taskIndex2 < 9){
                taskArr2[taskIndex2].forEach((d) => {
                    let t = parseInt(d.split("-")[1]) % 15;
                    addRow([d, checkedArray.has(t)]);
                });

                document.getElementById('mainview').style.display = 'inherit';
                document.getElementById('mainview').src = '';
                if(taskIndex2 < 8){
                    taskIndex2++;
                    showNextTask();
                }else{//结束
                    document.getElementById("choice").innerHTML = '';
                    document.getElementById("count").style.display = "none";
                    document.getElementById('mainview').style.display = 'none';
                    document.getElementById('task2').style.display = 'none';
                    saveCsv();
                    //finish
                    document.getElementById("message").innerHTML = `
                        <h2>感谢参与！</h2>
                        <p>麻烦将下载的result.csv发送给我们。</p>
                        <p>接下来，我们还将与您进行一小段访谈。</p>
                    `;
                    document.getElementById("next").style.display = "none";
                }
            }
        }
    }
}

function showFeelingQuestion(){
    //confidence
    let questionsHtml = `<span> <em>02</em> 请问您对上题选择的自信程度是多少？</span>
        <div class="tag-container"><div class="tag">非常不认同</div><div class="tag">非常认同</div></div>
        <input type="radio" name="confidence" value="1" id="confidence1"/><label for="confidence1">1</label> 
        <input type="radio" name="confidence" value="2" id="confidence2"/><label for="confidence2">2</label> 
        <input type="radio" name="confidence" value="3" id="confidence3"/><label for="confidence3">3</label> 
        <input type="radio" name="confidence" value="4" id="confidence4"/><label for="confidence4">4</label> 
        <input type="radio" name="confidence" value="5" id="confidence5"/><label for="confidence5">5</label> 
        <input type="radio" name="confidence" value="6" id="confidence6"/><label for="confidence6">6</label> 
        <input type="radio" name="confidence" value="7" id="confidence7"/><label for="confidence7">7</label> `
    //engagement
    questionsHtml +=`<br><br>
        <span> <em>03</em> 请问您认为该图表的有趣程度以及对你的吸引程度是多少？</span>
        <div class="tag-container"><div class="tag">非常不认同</div><div class="tag">非常认同</div></div>
        <input type="radio" name="engagement" value="1" id="engagement1"/><label for="confidence1">1</label> 
        <input type="radio" name="engagement" value="2" id="engagement2"/><label for="engagement2">2</label> 
        <input type="radio" name="engagement" value="3" id="engagement3"/><label for="engagement3">3</label> 
        <input type="radio" name="engagement" value="4" id="engagement4"/><label for="engagement4">4</label> 
        <input type="radio" name="engagement" value="5" id="engagement5"/><label for="engagement5">5</label> 
        <input type="radio" name="engagement" value="6" id="engagement6"/><label for="engagement6">6</label> 
        <input type="radio" name="engagement" value="7" id="engagement7"/><label for="engagement7">7</label> `;
    //help
    if(hasCharacter()){
        questionsHtml += `<br><br>`
        questionsHtml += `<span> <em>04</em> 请问相比传统数据图表，增加了漫画小人元素的数据图表在“帮助理解洞察数据信息”方面是否有正面影响?</span>`
        questionsHtml += `<div class="tag-container"><div class="tag">非常不认同</div><div class="tag">非常认同</div></div>
            <input type="radio" name="helpful" value="1" id="helpful1"/><label for="helpful1">1</label> 
            <input type="radio" name="helpful" value="2" id="helpful2"/><label for="helpful2">2</label> 
            <input type="radio" name="helpful" value="3" id="helpful3"/><label for="helpful3">3</label> 
            <input type="radio" name="helpful" value="4" id="helpful4"/><label for="helpful4">4</label> 
            <input type="radio" name="helpful" value="5" id="helpful5"/><label for="helpful5">5</label> 
            <input type="radio" name="helpful" value="6" id="helpful6"/><label for="helpful6">6</label> 
            <input type="radio" name="helpful" value="7" id="helpful7"/><label for="helpful7">7</label> `;
    }

    document.getElementById('choice').innerHTML = questionsHtml;
}

function showAccurancyQuestion(){
    startTime = new Date();
    document.getElementById('choice').innerHTML = 
        `<span> <em>01</em> 请问该图表表示的语义是以下6种facts中的哪种fact？</span>
        <br>
        <input type="radio" name="answer" value="Categorization" id="answer1"/><label for="answer1">Categorization(分类)</label>
        <input type="radio" name="answer" value="Difference" id="answer2"/><label for="answer2">Difference(差异)</label>
        <input type="radio" name="answer" value="Distribution" id="answer3"/><label for="answer3">Distribution(分布)</label>
        <br>
        <input type="radio" name="answer" value="Proportion" id="answer4"/><label for="answer4">Proportion(占比)</label>
        <input type="radio" name="answer" value="Value" id="answer5"/><label for="answer5">Value(数值)</label>
        <input type="radio" name="answer" value="Trend" id="answer6"/><label for="answer6">Trend(趋势)</label>`;
}

function showNextTask(){
    if(questionState === 2){
        let rand = Math.floor(Math.random() * taskArr.length); 
        let nextTask = taskArr.splice(rand, 1)[0];
        currentTask = nextTask;
        document.getElementById('mainview').src = "";
        document.getElementById('mainview').src = path + nextTask + ".jpg";
        document.getElementById('choice').innerHTML = '';
        const left = 45 - taskArr.length;
        document.getElementById('count').innerHTML = left + " / 90";

        questionState = 1;
        showAccurancyQuestion();
    }else if(questionState === 1){
        questionState = 2;
        showFeelingQuestion();
    }else if(questionState === 3){
        document.getElementById("next").style.display = 'none';
        document.getElementById("task2").style.display = 'none';
        for(let i = 0; i < 5; i++){
            setTimeout(function(){
                document.getElementById('mainview').src = path + taskArr2[taskIndex2][i] + ".jpg";
            }, 3000*i);
        }
        setTimeout(function(){//
            //问题
            document.getElementById("message").innerHTML = "<h2>休息30秒钟先吧！</h2>";
            document.getElementById('mainview').style.display = 'none';
        }, 3000*5);
        setTimeout(function(){//1min
            displayTable();
            document.getElementById('count').innerHTML = 50 + taskIndex2*5 + " / 90";
            document.getElementById("message").innerHTML = "";
            document.getElementById("next").style.display = 'inline-block';
        }, 3000*15);//todo:
    }
}

function displayTable(){
    let checkbox = document.getElementsByClassName("checkbox");
    for (let i=0; i < checkbox.length; i++) {
        checkbox[i].classList.remove("choosed");
    };
    checkedArray = new Set();
    document.getElementById("task2").style.display = 'block';
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


function choose(id, element){
    if(checkedArray.has(id)){//delete
        checkedArray.delete(id);
        element.classList.remove("choosed");
    }else{//add
        if(checkedArray.size ===5){
            alert("最多只能选择5个哦！")
            return;
        }
        element.classList.add("choosed");
        checkedArray.add(id);
    }
}