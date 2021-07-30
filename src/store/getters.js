const step = function (state) {
  return state.step;
};

const groupProfile = function (state) {
  return state.groupProfile;
};

const memberList = function (state) {
  return state.memberList;
};

const formState = function (state) {
  return state.formState;
};

const partyBeginTime = function (state) {
  return state.groupProfile.groupCustomField["partyBeginTime"];
};

const haveMeet = function (state) {
  return state.haveMeet;
};

const getters = {
  step,
  groupProfile,
  memberList,
  formState,
  partyBeginTime,
  haveMeet,
};
export default getters;
