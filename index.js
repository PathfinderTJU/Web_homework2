$(function() {
    var steps = 0;
    var minute = $("#minute").html();
    var second = $("#minute").html();
    var timer = setInterval(updateTime, 1000);
    var random = 0; //缺少的块  
    var empty = 0; //缺少的位置  
    var pictures = new Array(9); //存放九张图片的位置，为空时为0，位置为0-8

    //初始化拼图
    resetPicture();

    //移动块操作
    $(".grid div").click(function() {
        let position = parseInt($(this).attr("id").substring(1));
        let canMove = moveCheck(position); //是否可以移动
        if (canMove.checked) {
            steps++; //计步
            $("#step").html(steps);

            //交换src，更新enpty和pictures
            let oldsrc = pictures.indexOf(position);
            let target = canMove.moveTo;
            pictures[oldsrc] = target;
            empty = position;
            $("#p" + position + " img").attr("src", "");
            $("#p" + target + " img").attr("src", "./image/" + oldsrc + ".jpg");
        }
    })

    //重新开始
    $("#reset").click(function() {
        //清空棋盘中图片src
        for (let i = 0; i < 9; i++) {
            let position = pictures[i].toString();
            $("#p" + position + " img").attr("src", "")
        }

        //打乱顺序
        resetPicture();

        //重置时间、计步、重启定时器
        $("#minute").html("00");
        $("#second").html("00");

        steps = 0;
        $("#step").html("0");
        $("#over_img").attr("src", "");
        clearInterval(timer);
        timer = setInterval(updateTime, 1000);
    })

    //添加最后一张图片
    $("#win").click(function() {
        //检查是否满足胜利条件
        let check = true;
        for (let i = 0; i < 9; i++) {
            if (i === random) {
                continue;
            } else {
                if (pictures[i] !== i) {
                    check = false;
                    break;
                }
            }
        }

        //胜利，添加图片src，中断计时器，更新pictures（使得不能在移动），显示对勾
        if (check) {
            $("#p" + random + " img").attr("src", "./image/" + random + ".jpg")
            clearInterval(timer);
            $("#over_img").attr("src", "./image/ok.svg");
            pictures[random] = random;
        } else { //未达到胜利条件，显示叉号
            $("#over_img").attr("src", "./image/no.svg");
        }
    })

    //检查是否能够移动，返回checked为是否能移动，moveTo为目标方块编号
    function moveCheck(position) {
        var result = {
            "checked": false,
            "moveTo": -1
        }

        //空位置不可移动
        if (position === empty) {
            return result;
        } else {
            //非空位置，求其上下左右块编号（若为边界，则值为-1），将不为-1的块移入temp数组
            let temp = [];

            let up = position - 3;
            if (up < 0) {
                up = -1;
            } else {
                temp.push(up);
            }

            let down = position + 3;
            if (down >= 9) {
                down = -1;
            } else {
                temp.push(down);
            }

            let left = position - 1;
            if (left === 2 || left === 5 || left === -1) {
                left = -1;
            } else {
                temp.push(left);
            }

            let right = position + 1;
            if (right === 9 || right === 6 || right === 3) {
                right = -1;
            } else {
                temp.push(right);
            }

            //寻找temp数组中是否有块是空白块，有则返回true及该块编号
            for (let i = 0; i < temp.length; i++) {
                if (pictures.indexOf(temp[i]) === -1) {
                    result.moveTo = temp[i];
                    result.checked = true;
                    return result;
                }
            }

            //四周未找到空白块，无法移动
            return result;
        }
    }

    //打乱
    function resetPicture() {
        //位置初始化为正确位置
        for (let i = 0; i < 9; i++) {
            pictures[i] = i;
        }

        //打乱数组
        shuffle(pictures);

        //随机选择一块不能被填入，初始位置为0
        random = parseInt((Math.random() * 8));
        empty = pictures[random];
        pictures[random] = -1;

        //检查是否有解
        checkPossible(pictures);

        //设置图片src
        for (let i = 0; i < 9; i++) {
            if (i === random) {
                continue;
            }
            let number = (i).toString();
            let position = pictures[i].toString();
            $("#p" + position + " img").attr("src", "./image/" + number + ".jpg")
        }

        //随机交换法打乱数组
        function shuffle(pirctures) {
            for (let i = 0; i < 9; i++) {
                let currentRandom = parseInt(Math.random() * 8);
                let current = pictures[i];
                pictures[i] = pictures[currentRandom];
                pictures[currentRandom] = current;
            }
        }
    }

    //使用 下标【图片编号】数组代表方块中存放的图片（-1为空），原数组和打乱数组逆序数奇偶相同则有解
    function checkPossible(pictures) {
        var origin = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        origin[origin.indexOf(random)] = -1;
        var now = [-1, -1, -1, -1, -1, -1, -1, -1, -1];

        //根据pictures数组构建now数组
        for (let i = 0; i < 9; i++) {
            if (i === random) {
                continue;
            }
            now[pictures[i]] = i;
        }

        //不相同，通过交换打乱数组倒数2、3位顺序，变为相同（注意-1时的特殊情况）
        if ((reverseCount(origin) % 2) !== (reverseCount(now) % 2)) {
            let temp = now[7];
            let temp2 = now[6];
            if (temp === -1) {
                pictures[temp2] = 7;
            } else if (temp2 === -1) {
                pictures[temp] = 6;
            } else {
                pictures[temp] = 6;
                pictures[temp2] = 7;
            }
        }
    }

    //求逆序数
    function reverseCount(arr) {
        var result = 0;
        for (let i = 0; i < arr.length; i++) {
            let temp = arr[i];
            for (let j = i + 1; j < 9; j++) {
                let compared = arr[j];
                if (compared < temp) {
                    result++;
                }
            }
        }

        return result;
    }

    //更新计时器时间，进位和补0
    function updateTime() {
        minute = parseInt($("#minute").html());
        second = parseInt($("#second").html());
        second++;

        //秒数进位
        if (second >= 60) {
            minute++;
            second -= 60;
        }

        //秒数为一位时自动补0
        if (second >= 0 && second < 10) {
            second = "0" + second.toString();
        } else if (second >= 10 && second < 60) {
            second = second.toString();
        } else {
            console.log("time error");
        }

        //分钟数为一位时自动补0
        if (minute >= 0 && minute < 10) {
            minute = "0" + minute.toString();
        } else if (minute >= 10) {
            minute = minute.toString();
        } else {
            console.log("time error");
        }

        //更新DOM
        $("#minute").html(minute);
        $("#second").html(second);
    }
})