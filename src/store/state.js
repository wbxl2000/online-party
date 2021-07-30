const state = {
  step: 0, // 0: is not login, 1: login & waiting room, 2: 1v1, 3: ending room
  groupProfile: {},
  memberList: [],
  haveMeet: [],
  userSig: "",
  formState: {
    userID: "qer",
    roomID: "123",
    roomName: "我的聚会（1）",
    dataTimeValue: new Date(new Date().getTime() + 60 * 1000),
    roomIntro: "Hi~Friends，Let's talk together.",
  },
};

export default state;
