<template>
  <div id="header">
    <div id="logo">
      <Logo> </Logo>
    </div>
    <div id="roomName">
      <h1 v-if="step == 1">Waiting Room</h1>
      <h1 v-if="step == 2">Party 1v1 Room</h1>
      <h1 v-if="step == 3">Congratulations!</h1>
    </div>
    <div class="buttonsWrapper">
      <el-button v-if="step != 0" plain @click="() => quitRoom()">
        退出 Party
      </el-button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import Logo from "./Logo.vue";
import { useStore, mapMutations, mapGetters } from "vuex";
import * as types from "../store/mutation-types";
import { ElMessage } from "element-plus";

export default defineComponent({
  name: "Header",
  computed: {
    ...mapGetters(["step"]),
    ...mapMutations([types.SET_STEP_TYPE]),
  },
  setup() {
    const store = useStore();
    function quitRoom() {
      store.commit(types.SET_STEP_TYPE, 0);
      // todo 退群
      let promise = tim.quitGroup(store.state.formState.roomID);
      promise
        .then(function (imResponse) {
          console.log(imResponse.data.groupID); // 退出成功的群 ID
          // 退出账号
          tim
            .logout()
            .then(function (imResponse) {
              console.log(imResponse.data); // 登出成功
              ElMessage.success(`退出成功`);
            })
            .catch(function (imError) {
              console.warn("logout error:", imError);
              ElMessage.success(`退出失败，请直接刷新页面`);
            });
        })
        .catch(function (imError) {
          console.warn("quitGroup error:", imError); // 退出群组失败的相关信息
        });
    }
    return {
      quitRoom,
    };
  },
  components: {
    Logo,
  },
});
</script>

<style scoped>
#header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 80px;
}

.buttonsWrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

#roomName {
  width: 300px;
  text-align: center;
  position: absolute;
  left: 50%; /* 定位父级的50% */
  transform: translate(-50%, 0); /*自己的50% */
}
</style>
