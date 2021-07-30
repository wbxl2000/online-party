<template>
  <!-- <h1>Congratulations!</h1> -->
  <div id="roomPersonShow" :v-model="haveMeet">
    <h2>本次共遇到{{ haveMeet.length }}人</h2>
    <div class="personBox" v-for="member in haveMeet" :key="member">
      <el-avatar
        src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
      ></el-avatar>
      {{ member }}
      <el-divider direction="vertical"></el-divider>
    </div>
  </div>

  <div id="msgBox">
    <el-scrollbar class="box-card">
      <div class="card-header">散场聊天区域 <br /></div>
      <div v-for="text in textList" :key="text" class="text-item">
        <div>{{ text.from + ": " + text.value }} <br /></div>
      </div>
    </el-scrollbar>

    <div id="textArea">
      <el-input v-model="sendText" name="sendText" style="width: 91.2%">
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
  name: "EndingRoom",
  computed: {
    ...mapGetters(["groupProfile", "haveMeet", "partyBeginTime"]),
  },
  setup() {
    const store = useStore();

    let sendText = ref("谢谢大家的参与！");
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
      });
      console.log(textList);
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
          ElMessage.success({
            message: `发送成功，消息为："${sendText.value}"`,
          });
          textList.push({
            from: "我",
            value: sendText.value,
          });
          console.log(imResponse);
        })
        .catch(function (imError) {
          // 发送失败
          console.warn("sendMessage error:", imError);
        });
    }

    return {
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
</style>
