<template>
  <!-- <h1>Waiting Room</h1> -->
  <div :v-model="waiting" id="subHeader">
    <h1 id="countDown">{{ waiting.countDown }}</h1>
    <span id="tip"> Party will begin at {{ waiting.startTime }} </span>
  </div>

  <div id="roomPersonShow" :v-model="memberList">
    <h2>{{ memberList.length }} 人已加入</h2>
    <div class="personBox" v-for="member in memberList" :key="member.userID">
      <el-avatar
        src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
      ></el-avatar>
      {{ member.userID }}
      <el-divider direction="vertical"></el-divider>
    </div>
  </div>

  <div id="msgBox">
    <el-scrollbar class="box-card" id="msgArea">
      <div class="card-header">聊天区 <br /></div>
      <div v-for="text in textList" :key="text" class="text-item">
        <div>{{ text.from + ": " + text.value }} <br /></div>
      </div>
    </el-scrollbar>

    <div id="textArea">
      <el-input
        v-model="sendText"
        name="sendText"
        style="width: 91.2%"
        @keydown.enter="handleSendText"
      >
      </el-input>
      <el-button
        type="primary"
        @click="handleSendText"
        style="margin-left: 10px"
      >
        send
      </el-button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, defineComponent, computed } from "vue";
import { useStore, mapGetters, mapActions } from "vuex";
import * as types from "../store/mutation-types";
import { ElMessage } from "element-plus";

export default defineComponent({
  name: "WaitingRoom",
  computed: {
    ...mapGetters(["groupProfile", "memberList", "partyBeginTime"]),
    ...mapActions(["getGroupMemberListAction"]),
  },
  setup() {
    const store = useStore();

    store.dispatch("getGroupMemberListAction");
    setInterval(() => {
      store.dispatch("getGroupMemberListAction");
    }, 3000);

    const targetTime = new Date(
      parseInt(store.state.groupProfile.groupCustomField["0"].value)
    );
    function checkTime(x) {
      if (parseInt(x) < 10) return "0" + x;
      else return x;
    }
    let waiting = reactive({
      countDown: "倒计时开始",
      startTime: `${targetTime.toLocaleDateString()} ${targetTime.getHours()}:${checkTime(
        targetTime.getMinutes()
      )}:${checkTime(targetTime.getSeconds())}`,
    });

    const CountdownInterval = setInterval(() => {
      const mss =
        parseInt(store.state.groupProfile.groupCustomField["0"].value) -
        new Date().getTime();
      if (mss <= 0) {
        store.commit(types.SET_STEP_TYPE, 2);
        clearInterval(CountdownInterval);
      }
      var days = parseInt(mss / (1000 * 60 * 60 * 24));
      var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = parseInt((mss % (1000 * 60)) / 1000).toFixed(0);
      console.log(
        days + " 天 " + hours + " 小时 " + minutes + " 分钟 " + seconds + " 秒 "
      );
      waiting.countDown = "";
      if (days) waiting.countDown = days + " 天 ";
      if (hours) waiting.countDown += hours + " 小时 ";
      if (minutes) waiting.countDown += minutes + " 分钟 ";
      waiting.countDown += seconds + " 秒 ";
    }, 1000);

    let sendText = ref("qer的测试消息1");
    let textList = reactive([]);
    function onMessageReceived(event) {
      // console.log(event.data);
      event.data.forEach((msg) => {
        if (msg.type !== TIM.TYPES.MSG_TEXT) return;
        textList.push({
          from: msg.from,
          value: msg.payload.text,
          time: msg.time,
        });
        if (textList.length > 7) {
          textList.splice(0, 1);
        }
      });
      console.log(textList);
      document.getElementById("msgArea").scrollTop =
        document.getElementById("msgArea").scrollHeight;
    }
    tim.on(TIM.EVENT.MESSAGE_RECEIVED, onMessageReceived);

    function handleSendText() {
      let message = tim.createTextMessage({
        to: store.state.groupProfile.groupID,
        conversationType: TIM.TYPES.CONV_GROUP,
        payload: {
          text: sendText.value,
        },
      });

      let promise = tim.sendMessage(message);
      promise
        .then(function (imResponse) {
          ElMessage.success(`发送成功，消息为："${sendText.value}"`);
          textList.push({
            from: "我",
            value: sendText.value,
          });
          if (textList.length > 7) {
            textList.splice(0, 1);
          }
          sendText.value = "";
          console.log(imResponse);
        })
        .catch(function (imError) {
          // 发送失败
          console.warn("sendMessage error:", imError);
        });
    }

    return {
      waiting,
      handleSendText,
      textList,
      sendText,
    };
  },
});
</script>

<style scoped>
#msgBox {
  width: 1000px;
  margin: 0px auto;
}

.personBox {
  /* border: 1px solid green; */
  display: inline;
  width: 50px;
  height: 100px;
}

#roomPersonShow {
  width: 1000px;
  height: 300px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  margin: 20px auto;
  margin-top: 50px;
  /* box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1) */
}

#countDown {
  font-size: 40px;
  margin: 10px auto;
  margin-bottom: 20px;
  /* display: inline; */
  /* text-align: center;
  position: absolute;
  left: 50%; 
  transform: translate(-50%, 0);  */
}

#textArea {
  width: 100%;
  margin: 10px auto;
}

.box-card {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border: 1px solid #dddddd;
  border-radius: 4px;
  height: 200px;
}

.text-item {
  text-align: left;
  margin: 5px;
  margin-left: 20px;
}
/* 
#tip {
  position: absolute;
  bottom: 0px;
}

#subHeader {
  position: absolute;
} */
</style>
