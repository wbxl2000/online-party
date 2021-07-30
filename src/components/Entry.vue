<template>
  <h1>Welcome to Online Party</h1>
  <div id="loginWrapper">
    <div class="nameWrapper"></div>
    <el-tabs v-model="activeName" stretch>
      <el-tab-pane label="创建 Party" name="创建">
        <el-form
          label-position="right"
          label-width="100px"
          :model="localFormState"
        >
          <el-form-item
            :model="localFormState.userID"
            label="用户名"
            style="margin-top: 20px"
          >
            <el-input
              v-model="localFormState.userID"
              name="userID"
              placeholder="您想显示的名字，请输入英文字母组合"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="Party 号码">
            <el-input
              v-model="localFormState.roomID"
              name="roomID"
              placeholder="请输入1~6位阿拉伯数字"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="Party 名称">
            <el-input
              v-model="localFormState.roomName"
              name="roomName"
              placeholder="中英文均可"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="localFormState.dataTimeValue"
              type="datetime"
              placeholder="选择日期时间"
              :shortcuts="shortcuts"
              style="width: 100%"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="一句话介绍">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 2 }"
              v-model="localFormState.roomIntro"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="内测邀请码">
            <el-input
              v-model="localFormState.neice"
              name="neice"
              placeholder="填写正确的邀请码以获得创建权限"
            >
            </el-input>
          </el-form-item>
          <el-button type="primary" @click="() => handleButtons()">
            创建 Party
          </el-button>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="加入 Party" name="加入">
        <el-form
          label-position="right"
          label-width="100px"
          :model="localFormState"
        >
          <el-form-item
            :model="localFormState.userID"
            label="用户名"
            style="margin-top: 20px"
          >
            <el-input
              v-model="localFormState.userID"
              name="userID"
              placeholder="您想显示的名字，请输入英文字母组合"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="Party 号码">
            <el-input
              v-model="localFormState.roomID"
              name="roomID"
              placeholder="请填入 Party 创建者发给您的号码"
            >
            </el-input>
          </el-form-item>
          <el-button type="primary" @click="() => handleButtons()">
            加入 Party
          </el-button>
        </el-form></el-tab-pane
      >
    </el-tabs>
  </div>
</template>

<script>
import { ref, reactive, defineComponent } from "vue";
import { useStore, mapActions, mapMutations, mapGetters } from "vuex";
import * as types from "../store/mutation-types";
import { ElMessage } from "element-plus";

export default defineComponent({
  name: "Entry",
  computed: {
    ...mapActions(["loginAction", "createRoomAction", "joinRoomAction"]),
    ...mapMutations([types.UPDATE_FORM_STATE]),
    ...mapGetters(["formState"]),
  },
  setup() {
    const store = useStore();
    let activeName = ref("创建");
    let localFormState = reactive({
      userID: "",
      roomID: "",
      roomName: "",
      dataTimeValue: new Date(new Date().getTime() + 60 * 1000),
      roomIntro: "Hi~Friends，Let's talk together.",
      neice: "",
    });

    function handleButtons() {
      if (activeName.value === "创建" && localFormState.neice != "qer233") {
        ElMessage.error("邀请码错误，无权限创建，请联系qer");
        return;
      }
      store.commit(types.UPDATE_FORM_STATE, localFormState);
      store.dispatch("loginAction", activeName.value);
    }

    return {
      activeName,
      localFormState,
      handleButtons,
      shortcuts: [
        {
          text: "今天",
          value: new Date(),
        },
        {
          text: "1min后",
          value: new Date(new Date().getTime() + 60 * 1000), // 1min后
        },
      ],
    };
  },
});
</script>

<style scoped>
h1 {
  font-family: douyu;
  width: 100%;
}

#LoginWrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 500px;
}

.nameWrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 500px;
}
</style>
