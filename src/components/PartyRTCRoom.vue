<template>
  <!-- <h1>Party 1v1 Room</h1> -->
  <div :v-model="waiting">
    <h1 id="countDown">{{ waiting.countDown }}</h1>
    <h1>{{ waiting.message }}</h1>
  </div>
  <!-- <el-button @click="debugButton"> 发布！ </el-button>
  <el-button @click="leaveRoom"> leaveRoom </el-button>
  <el-button @click="debug3"> debug3 </el-button> -->
  <div id="streamWrapper">
    <div class="streamWrapper">
      <h3>{{ formState.userID }}</h3>
      <div id="local_stream"></div>
    </div>
    <div class="streamWrapper">
      <h3>{{ myPairResult.userID }}</h3>
      <div id="remote_stream"></div>
    </div>
  </div>
</template>

<script>
import { reactive, defineComponent } from "vue";
import { useStore, mapGetters, mapActions } from "vuex";
import * as types from "../store/mutation-types";
import { ElMessage } from "element-plus";

export default defineComponent({
  name: "PartyRTCRoom",
  computed: {
    ...mapGetters(["groupProfile", "memberList", "formState"]),
    ...mapActions([
      "join1v1StreamAction",
      "init1v1RoomAction",
      "getGroupMemberListAction",
      "leave1v1RoomAction",
      "unpublish1v1RoomAction",
    ]),
  },
  setup() {
    const stepTime = [0, 10, 3, 180]; // 分别代表 占位符, 匹配时间, 连接时间, 通话时间

    const store = useStore();

    let inRoom = false;

    let myPairResult = {
      roomID: "",
      userID: "",
    };

    let waiting = reactive({
      countDown: "等待主持人进入...",
    });

    function checkTime(x) {
      if (x < 10) return "0" + x;
      else return x;
    }

    function ownerSendMessage(sendSignal) {
      let message = tim.createTextMessage({
        to: store.state.groupProfile.groupID,
        conversationType: TIM.TYPES.CONV_GROUP,
        payload: {
          text: JSON.stringify(sendSignal),
        },
      });
      let promise = tim.sendMessage(message);
      promise
        .then(function (imResponse) {
          console.warn("send success:" + JSON.stringify(sendSignal));
        })
        .catch(function (imError) {
          console.warn("sendMessage error:", imError);
        });
    }

    function daojishi(succMsg, Time, cb) {
      let CountdownInterval = setInterval(() => {
        if (Time < 0) {
          clearInterval(CountdownInterval);
          // ElMessage.success(succMsg);
          cb();
          return;
        }
        console.log("00:" + Time);
        const mins = parseInt(Time / 60).toFixed(0);
        const seconds = Time % 60;
        waiting.countDown = checkTime(mins) + ":" + checkTime(seconds);
        Time--;
      }, 1000);
    }

    function randomNum(minNum, maxNum) {
      switch (arguments.length) {
        case 1:
          return parseInt(Math.random() * minNum + 1, 10);
        case 2:
          return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        default:
          return 0;
      }
    }

    function leaveRoom() {
      inRoom = false;
      if ((myPairResult.roomID = "-1")) return;
      store.dispatch("leave1v1RoomAction");
      document.getElementById("remote_stream").innerHTML = "";
    }

    function onMessageReceived(event) {
      event.data.forEach((msg) => {
        if (msg.type !== TIM.TYPES.MSG_TEXT) return;
        console.log(msg);
        console.log(msg.payload.text);
        let sendSignal = JSON.parse(msg.payload.text);
        // 控制流程的消息
        if (sendSignal.code === 1) {
          let succMsg = "";
          if (sendSignal.step === 1) {
            // 开始匹配中
            waiting.message = "匹配中~";
            succMsg = "匹配完成!";
            daojishi(succMsg, stepTime[1], () => {});
          } else if (sendSignal.step === 2) {
            // 准备时间 正在连接
            waiting.message = "正在连接...";
            succMsg = "即将开始!";
            daojishi(succMsg, stepTime[2], () => {});
            if (myPairResult.roomID !== "-1" && !inRoom) {
              inRoom = true;
              const actionName =
                sendSignal.tap === 1
                  ? "init1v1RoomAction"
                  : "join1v1StreamAction";
              console.log(
                "join action roomID: " + JSON.stringify(myPairResult)
              );
              store.dispatch(actionName, myPairResult.roomID);
              store.commit(types.ADD_MEET, myPairResult.userID);
            }
          } else if (sendSignal.step === 3) {
            // 通话时间
            waiting.message = "通话中...";
            succMsg = "此轮通话结束，请等待下一轮匹配！";
            daojishi(succMsg, stepTime[3], () => {
              leaveRoom();
            });
          } else if (sendSignal.step === 0) {
            ElMessage.success("全部结束！");
            store.commit(types.SET_STEP_TYPE, 3);
            return;
          }
        } else {
          // else 消息是用来匹配的
          if (sendSignal.to === -1) {
            console.log("all - 匹配完成");
            console.log(JSON.stringify(sendSignal.history));
            for (let pair of sendSignal.history) {
              if (pair.pair2.userID === store.state.formState.userID) {
                myPairResult.userID = pair.pair1.userID;
                myPairResult.roomID = pair.pair1.userID;
                break;
              }
            }
            return;
          }
          // 如果消息不是发给自己的
          if (sendSignal.to !== store.state.formState.userID) return;
          console.log("是我啦！");
          if (sendSignal.list.length === 1) {
            // 就剩自个了 那我就被轮空了
            console.log("我匹配完啦~这次先轮空我");
            myPairResult.userID = "被轮空了";
            myPairResult.roomID = "-1";
            sendSignal.to = -1; // 向所有人发送，表示整完了
          } else {
            // 把自己换到开头
            let newList = [];
            for (let item of sendSignal.list) {
              if (item.userID === store.state.formState.userID) {
                newList.push(JSON.parse(JSON.stringify(item)));
                break;
              }
            }
            for (let item of sendSignal.list) {
              if (item.userID !== store.state.formState.userID) {
                newList.push(JSON.parse(JSON.stringify(item)));
              }
            }
            sendSignal.list = newList;

            let myPair = randomNum(1, sendSignal.list.length - 1);
            // 尝试十次,尽量匹配到跟上一局不一样的人
            function checkHaveMeet(x) {
              return store.state.haveMeet.find((per) => per === x);
            }
            let times = 0;
            while (
              checkHaveMeet(sendSignal.list[myPair].userID) &&
              times < 100
            ) {
              myPair = randomNum(1, sendSignal.list.length - 1);
              times++;
            }

            sendSignal.history.push({
              pair1: sendSignal.list[0],
              pair2: sendSignal.list[myPair],
            });
            myPairResult.userID = sendSignal.list[myPair].userID;
            myPairResult.roomID = sendSignal.list[0].userID;
            sendSignal.list.splice(myPair, 1);
            sendSignal.list.splice(0, 1); // 与上一行顺序不能颠倒

            if (sendSignal.list.length === 0) {
              console.log("我匹配完啦~这里刚好整完啦");
              sendSignal.to = -1; // 向所有人发送，表示整完了
            } else {
              const nextPerson = randomNum(0, sendSignal.list.length - 1);
              sendSignal.to = sendSignal.list[nextPerson].userID;
            }
          }
          ownerSendMessage(sendSignal);
        }
      });
    }
    tim.on(TIM.EVENT.MESSAGE_RECEIVED, onMessageReceived);

    // owner 才执行的部分 owner 的定时任务

    if (store.state.groupProfile.ownerID === store.state.formState.userID) {
      // 要等其他人页面都加载好了
      setTimeout(() => {
        ownerTask();
      }, 3000);
    }

    function ownerTask() {
      tap(1);
      function tap(cnt) {
        // 开始匹配 2轮
        console.log(`第${cnt}轮`);
        let sendSignal = {
          code: 1, // 标识一下这是控制过程的消息，跟匹配的分隔开
          tap: cnt, // 第几轮
          step: 0, // 哪个阶段， 0是全部结束， 1是匹配的5s， 2是准备的 5s, 3 是通话中的 300s
        };
        if (cnt > 2) {
          ownerSendMessage(sendSignal);
          ElMessage.success("全部结束！");
          store.commit(types.SET_STEP_TYPE, 3);
          return;
        }

        let succMsg = "";
        sendSignal.step = 1;
        ownerSendMessage(sendSignal);
        waiting.message = "匹配中~";
        succMsg = "匹配完成!";
        daojishi(succMsg, stepTime[1], () => {
          completePipei();
        });

        store.dispatch("getGroupMemberListAction");
        setTimeout(() => {
          startMatchByOwner();
        }, 3000);

        // 结束匹配，开始准备
        function completePipei() {
          sendSignal.step = 2;
          ownerSendMessage(sendSignal);
          waiting.message = "正在连接...";
          succMsg = "即将开始!";
          daojishi(succMsg, stepTime[2], () => {
            rtc();
          });
          if (myPairResult.roomID !== "-1") {
            const actionName =
              sendSignal.tap === 1
                ? "init1v1RoomAction"
                : "join1v1StreamAction";
            console.log("join action roomID: " + JSON.stringify(myPairResult));
            store.dispatch(actionName, myPairResult.roomID);
            store.commit(types.ADD_MEET, myPairResult.userID);
          }
        }
        // 开始通话
        function rtc() {
          sendSignal.step = 3;
          ownerSendMessage(sendSignal);
          waiting.message = "通话中...";
          succMsg = "此轮通话结束，请等待下一轮匹配！";
          daojishi(succMsg, stepTime[3], () => {
            leaveRoom();
            tap(cnt + 1);
          });
        }
      }

      function startMatchByOwner() {
        console.log("startMatchByOwner function");
        let list = [];
        for (let item of store.state.memberList) {
          if (item.role === "Owner") {
            list.push(JSON.parse(JSON.stringify(item)));
            break;
          }
        }
        for (let item of store.state.memberList) {
          if (item.role !== "Owner") {
            list.push(JSON.parse(JSON.stringify(item)));
          }
        }

        let sendSignal = {
          list,
          to: 0,
          history: [],
        };

        let myPair = randomNum(1, sendSignal.list.length - 1);
        sendSignal.history.push({
          pair1: sendSignal.list[0],
          pair2: sendSignal.list[myPair],
        });
        myPairResult.userID = sendSignal.list[myPair].userID;
        myPairResult.roomID = sendSignal.list[0].userID;
        sendSignal.list.splice(myPair, 1);
        sendSignal.list.splice(0, 1); // 与上一行顺序不能颠倒

        const nextPerson = randomNum(0, sendSignal.list.length - 1);
        sendSignal.to = sendSignal.list[nextPerson].userID;

        ownerSendMessage(sendSignal);
      }
    }

    return {
      waiting,
      myPairResult,
    };
  },
});
</script>

<style scoped>
#countDown {
  font-size: 50px;
  margin: 10px;
}

#streamWrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 0 auto;
}

.streamWrapper {
  margin: 50px;
  width: 500px;
  border: 2px solid black;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h3 {
  margin: 10px;
}
</style>
