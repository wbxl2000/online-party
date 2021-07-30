import * as types from "./mutation-types";
import { genTestUserSig } from "../user-sig/lib-generate-test-usersig.min.js";
import { ElMessage } from "element-plus";
import TRTC from "trtc-js-sdk";

const actions = {
  loginAction({ dispatch, commit, state }, nextStepType) {
    console.log("login action");
    const userID = state.formState.userID;
    const { userSig } = genTestUserSig(userID);
    commit(types.UPDATE_USER_SIG, userSig);
    let promise = window.tim.login({
      userID,
      userSig,
    });
    promise
      .then(function (imResponse) {
        console.log(imResponse.data); // 登录成功
        ElMessage.success({ message: "登录成功", type: "success" });
        if (imResponse.data.repeatLogin === true) {
          console.warn(imResponse.data.errorInfo);
          ElMessage.warn({ message: "重复登陆，已自动跳转" });
        }
        if (nextStepType == "创建") dispatch("createRoomAction");
        else if (nextStepType == "加入") dispatch("joinRoomAction");
      })
      .catch(function (imError) {
        console.warn("login error:", imError); // 登录失败的相关信息
        ElMessage.error("登录失败，请重试");
      });
  },
  createRoomAction({ dispatch, state }) {
    console.log("createRoomAction action");
    const partyBeginTime = state.formState.dataTimeValue.getTime().toString();
    tim.on(TIM.EVENT.SDK_READY, createRoom);
    function createRoom() {
      tim.off(TIM.EVENT.SDK_READY, createRoom);
      let promise = window.tim.createGroup({
        type: TIM.TYPES.GRP_AVCHATROOM,
        name: state.formState.roomName,
        groupID: state.formState.roomID,
        introduction: state.formState.roomIntro,
        groupCustomField: [{ key: "partyBeginTime", value: partyBeginTime }],
      });
      promise
        .then(function (imResponse) {
          ElMessage.success({
            message: `创建群成功，群号为${state.formState.roomID}`,
            type: "success",
          });
          // 创建成功
          console.log(`创建群成功，群号为${state.formState.roomID}`); // 创建的群的资料
          // console.log(imResponse.data.group); // 创建的群的资料
          // console.log(imResponse.data.overLimitUserIDList); // 超过了“单个用户可加入群组数”限制的用户列表
          dispatch("joinRoomAction"); // 原来直接析构就可以……
        })
        .catch(function (imError) {
          console.warn(state.formState);
          console.warn("createGroup error:", imError); // 创建群组失败的相关信息
          ElMessage.error(imError);
        });
    }
  },
  joinRoomAction({ commit, state }) {
    console.log("joinRoomAction action");
    tim.on(TIM.EVENT.SDK_READY, joinRoom);
    joinRoom();
    function joinRoom() {
      tim.off(TIM.EVENT.SDK_READY, joinRoom);
      let promise = tim.joinGroup({
        groupID: state.formState.roomID,
        type: TIM.TYPES.GRP_AVCHATROOM,
      });
      promise
        .then(function (imResponse) {
          switch (imResponse.data.status) {
            case TIM.TYPES.JOIN_STATUS_SUCCESS: // 加群成功
              // console.log(imResponse.data.group); // 加入的群组资料
              commit(types.UPDATE_GROUP_PROFILE, imResponse.data.group);
              ElMessage.success({
                message: `加群成功，群号为${state.formState.roomID}`,
                type: "success",
              });
              commit(types.SET_STEP_TYPE, 1);
              break;
            case TIM.TYPES.JOIN_STATUS_ALREADY_IN_GROUP: // 已经在群中
              console.warn("已在群中");
              ElMessage.success({ message: `已在群中`, type: "success" });
              commit(types.SET_STEP_TYPE, 1);
              break;
            default:
              console.warn(imResponse.data.status);
              break;
          }
        })
        .catch(function (imError) {
          console.warn("joinGroup error:", imError); // 申请加群失败的相关信息
          ElMessage.error(imError);
        });
    }
  },
  getGroupMemberListAction({ commit, state }) {
    console.log("getGroupMemberList action");
    getGroupMemberList();
    function getGroupMemberList() {
      let promise = tim.getGroupMemberList({
        groupID: state.formState.roomID,
        count: 30,
        offset: 0,
      }); // 从0开始拉取30个群成员
      promise
        .then(function (imResponse) {
          // console.log(imResponse.data.memberList); // 群成员列表
          commit(types.UPDATE_GROUP_MEMBER_LIST, imResponse.data.memberList);
        })
        .catch(function (imError) {
          console.warn("getGroupMemberList error:", imError);
        });
    }
  },
  init1v1RoomAction({ state, dispatch }, roomID) {
    console.log("init1v1Room action");
    const client = TRTC.createClient({
      mode: "rtc",
      sdkAppId: window.options.SDKAppID,
      userId: state.formState.userID,
      userSig: state.userSig,
      useStringRoomId: true,
    });
    window.client = client;

    client.on("stream-added", (event) => {
      const remoteStream = event.stream;
      console.log("远端流增加: " + remoteStream.getId());
      //订阅远端流
      client.subscribe(remoteStream);
    });
    client.on("stream-subscribed", (event) => {
      const remoteStream = event.stream;
      console.log("远端流订阅成功：" + remoteStream.getId());
      // 播放远端流
      remoteStream.play("remote_stream");
    });

    const localStream = TRTC.createStream({
      userId: state.formState.userID,
      audio: true,
      video: true,
    });

    localStream
      .initialize()
      .catch((error) => {
        console.error("初始化本地流失败 " + error);
      })
      .then(() => {
        console.log("初始化本地流成功");
        localStream.play("local_stream");
        dispatch("join1v1StreamAction", roomID);
      });

    window.localStream = localStream;
  },
  join1v1StreamAction({ commit, state }, roomID) {
    console.log("join1v1Stream action");
    window.client
      .join({ roomId: roomID })
      .catch((error) => {
        console.error("进房失败 " + roomID + error);
        console.log(roomID);
      })
      .then(() => {
        console.log("进房成功");
        window.client
          .publish(localStream)
          .catch((error) => {
            console.error("本地流发布失败 " + error);
          })
          .then(() => {
            console.log("本地流发布成功");
          });
      });
  },
  leave1v1RoomAction({ commit, state }) {
    console.log("leave1v1Room Action");
    window.client.unpublish(window.localStream).then(() => {
      console.log("取消推送");
      client
        .leave()
        .then(() => {
          // 退房成功，可再次调用client.join重新进房开启新的通话。
          console.log("leave success");
        })
        .catch((error) => {
          console.error("退房失败 " + error);
          // 错误不可恢复，需要刷新页面。
        });
    });
  },
  unpublish1v1RoomAction({ commit, state }) {
    window.client.unpublish(window.localStream).then(() => {
      console.log("取消推送");
    });
  },
};

export default actions;
